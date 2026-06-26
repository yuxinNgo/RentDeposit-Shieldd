"use client";

import {
  getAddress as getFreighterAddress,
  getNetwork as getFreighterNetwork,
  isConnected as isFreighterConnected,
  requestAccess as requestFreighterAccess,
  signTransaction as signFreighterTransaction,
} from "@stellar/freighter-api";
import type { SignTransaction } from "@stellar/stellar-sdk/contract";
import { LOCAL_STORAGE_SESSION_KEY, NETWORK_LABEL } from "@/lib/constants";
import { STELLAR_NETWORK_PASSPHRASE, isTestnetPassphrase } from "@/lib/stellar/network";

export interface WalletConnectionResult {
  walletAddress: string;
  network: string;
  source: SupportedWalletId;
}

export interface SupportedWallet {
  id: SupportedWalletId;
  label: string;
  isAvailable: boolean;
}

export type SupportedWalletId = "freighter" | "rabet";

const SUPPORTED_WALLETS: readonly SupportedWalletId[] = ["freighter", "rabet"];

let activeWalletId: SupportedWalletId | null = null;

function isSupportedWalletId(value: unknown): value is SupportedWalletId {
  return value === "freighter" || value === "rabet";
}

function rememberWalletProvider(provider: SupportedWalletId) {
  activeWalletId = provider;
}

function clearWalletProvider() {
  activeWalletId = null;
}

function readStoredWalletProvider() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { walletProvider?: unknown };
    return isSupportedWalletId(parsed.walletProvider) ? parsed.walletProvider : null;
  } catch {
    return null;
  }
}

function prioritizedWallets(preferred?: SupportedWalletId) {
  const first = preferred ?? activeWalletId ?? readStoredWalletProvider();
  return first ? [first, ...SUPPORTED_WALLETS.filter((entry) => entry !== first)] : [...SUPPORTED_WALLETS];
}

async function isFreighterAvailable() {
  const status = await isFreighterConnected();
  return !status.error && Boolean(status.isConnected);
}

function isRabetAvailable() {
  return typeof window !== "undefined" && Boolean(window.rabet);
}

async function ensureFreighterTestnet() {
  const network = await getFreighterNetwork();

  if (network.error) {
    throw new Error(network.error.message || "Could not read the active Freighter network.");
  }

  if (!isTestnetPassphrase(network.networkPassphrase ?? "")) {
    throw new Error("Switch Freighter to Stellar Testnet before continuing.");
  }
}

async function getFreighterPublicKey() {
  const result = await getFreighterAddress();
  return result.error || !result.address ? null : result.address;
}

async function getRabetPublicKey() {
  if (!isRabetAvailable()) {
    return null;
  }

  try {
    const rabet = window.rabet;

    if (!rabet) {
      return null;
    }

    const result = await rabet.connect();
    return result.publicKey?.trim() || null;
  } catch {
    return null;
  }
}

async function getPublicKeyFor(provider: SupportedWalletId) {
  if (provider === "freighter") {
    return getFreighterPublicKey();
  }

  return getRabetPublicKey();
}

async function connectFreighter(): Promise<WalletConnectionResult> {
  if (!(await isFreighterAvailable())) {
    throw new Error("Install Freighter, unlock it, then try again.");
  }

  const access = await requestFreighterAccess();

  if (access.error) {
    throw new Error(access.error.message || "Freighter access request failed.");
  }

  const address = access.address || (await getFreighterPublicKey());

  if (!address) {
    throw new Error("Freighter did not return a wallet address.");
  }

  await ensureFreighterTestnet();
  rememberWalletProvider("freighter");

  return {
    walletAddress: address,
    network: NETWORK_LABEL,
    source: "freighter",
  };
}

async function connectRabet(): Promise<WalletConnectionResult> {
  if (!isRabetAvailable()) {
    throw new Error("Install Rabet, unlock it, then try again.");
  }

  try {
    const rabet = window.rabet;

    if (!rabet) {
      throw new Error("Rabet is not available in this browser.");
    }

    const result = await rabet.connect();
    const address = result.publicKey?.trim();

    if (!address) {
      throw new Error("Rabet did not return a wallet address.");
    }

    rememberWalletProvider("rabet");

    return {
      walletAddress: address,
      network: NETWORK_LABEL,
      source: "rabet",
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Rabet connection failed.");
  }
}

async function resolveWalletProvider(expectedAddress?: string) {
  for (const provider of prioritizedWallets()) {
    const address = await getPublicKeyFor(provider);

    if (!address) {
      continue;
    }

    if (expectedAddress && address !== expectedAddress) {
      continue;
    }

    rememberWalletProvider(provider);
    return provider;
  }

  return null;
}

export async function getSupportedWallets() {
  if (typeof window === "undefined") {
    return [] as SupportedWallet[];
  }

  const freighterAvailable = await isFreighterAvailable();

  return [
    { id: "freighter", label: "Freighter", isAvailable: freighterAvailable },
    { id: "rabet", label: "Rabet", isAvailable: isRabetAvailable() },
  ] satisfies SupportedWallet[];
}

export async function connectWallet(preferred?: SupportedWalletId): Promise<WalletConnectionResult> {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection requires a browser context.");
  }

  if (preferred === "freighter") {
    return connectFreighter();
  }

  if (preferred === "rabet") {
    return connectRabet();
  }

  const wallets = await getSupportedWallets();
  const firstAvailable = prioritizedWallets().find((provider) => wallets.some((wallet) => wallet.id === provider && wallet.isAvailable));

  if (!firstAvailable) {
    throw new Error("Install Freighter or Rabet, switch to Stellar Testnet, then try again.");
  }

  return firstAvailable === "freighter" ? connectFreighter() : connectRabet();
}

export async function disconnectWallet() {
  clearWalletProvider();
}

export async function getPublicKey() {
  if (typeof window === "undefined") {
    return null;
  }

  const provider = await resolveWalletProvider();

  if (!provider) {
    return null;
  }

  return getPublicKeyFor(provider);
}

export const signTransaction: SignTransaction = async (payload, options) => {
  if (typeof window === "undefined") {
    throw new Error("Wallet signing requires a browser context.");
  }

  const provider = await resolveWalletProvider(options?.address);

  if (!provider) {
    throw new Error("Connect the matching Freighter or Rabet wallet before signing this transaction.");
  }

  if (provider === "freighter") {
    await ensureFreighterTestnet();

    const result = await signFreighterTransaction(payload, {
      address: options?.address,
      networkPassphrase: options?.networkPassphrase ?? STELLAR_NETWORK_PASSPHRASE,
    });

    if (result.error || !result.signedTxXdr) {
      throw new Error(result.error?.message || "Freighter did not return a signed transaction.");
    }

    return {
      signedTxXdr: result.signedTxXdr,
      signerAddress: result.signerAddress,
    };
  }

  const rabet = window.rabet;

  if (!rabet) {
    throw new Error("Rabet is not available in this browser.");
  }

  const result = await rabet.sign(payload, "testnet");

  if (!result?.xdr) {
    throw new Error("Rabet did not return a signed transaction.");
  }

  return {
    signedTxXdr: result.xdr,
  };
};

export async function getNetwork() {
  if (typeof window === "undefined") {
    return NETWORK_LABEL;
  }

  const provider = activeWalletId ?? readStoredWalletProvider();

  if (provider !== "freighter") {
    return NETWORK_LABEL;
  }

  const network = await getFreighterNetwork();
  return !network.error && isTestnetPassphrase(network.networkPassphrase ?? "") ? NETWORK_LABEL : network.network || NETWORK_LABEL;
}
