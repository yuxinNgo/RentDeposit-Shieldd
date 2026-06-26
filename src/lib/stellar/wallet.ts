"use client";

import {
  StellarWalletsKit,
  type ISupportedWallet,
  Networks as WalletKitNetworks,
} from "@creit.tech/stellar-wallets-kit";
import { FREIGHTER_ID, FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { RABET_ID, RabetModule } from "@creit.tech/stellar-wallets-kit/modules/rabet";
import type { SignTransaction } from "@stellar/stellar-sdk/contract";
import { NETWORK_LABEL } from "@/lib/constants";
import { STELLAR_NETWORK_PASSPHRASE, isTestnetPassphrase } from "@/lib/stellar/network";

export interface WalletConnectionResult {
  walletAddress: string;
  network: string;
  source: SupportedWalletId;
}

export type SupportedWalletId = typeof FREIGHTER_ID | typeof RABET_ID;

let kitInitialized = false;

function ensureWalletKit() {
  if (kitInitialized || typeof window === "undefined") {
    return;
  }

  StellarWalletsKit.init({
    modules: [new FreighterModule(), new RabetModule()],
    network: WalletKitNetworks.TESTNET,
  });
  kitInitialized = true;
}

export async function getSupportedWallets() {
  if (typeof window === "undefined") {
    return [] as ISupportedWallet[];
  }

  ensureWalletKit();
  const wallets = await StellarWalletsKit.refreshSupportedWallets();
  return wallets.filter((wallet) => wallet.id === FREIGHTER_ID || wallet.id === RABET_ID);
}

async function ensureWalletReady() {
  const wallets = await getSupportedWallets();

  if (wallets.some((wallet) => wallet.isAvailable)) {
    return wallets;
  }

  throw new Error("Install Freighter or Rabet, switch to Stellar Testnet, then try again.");
}

async function assertTestnetConnection() {
  const network = await StellarWalletsKit.getNetwork();

  if (!isTestnetPassphrase(network.networkPassphrase)) {
    await StellarWalletsKit.disconnect().catch(() => undefined);
    throw new Error("Switch the selected wallet to Stellar Testnet before continuing.");
  }
}

export async function connectWallet(): Promise<WalletConnectionResult> {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection requires a browser context.");
  }

  ensureWalletKit();
  await ensureWalletReady();
  const { address } = await StellarWalletsKit.authModal();
  await assertTestnetConnection();

  return {
    walletAddress: address,
    network: NETWORK_LABEL,
    source: StellarWalletsKit.selectedModule.productId as SupportedWalletId,
  };
}

export async function disconnectWallet() {
  if (typeof window === "undefined") {
    return;
  }

  ensureWalletKit();
  await StellarWalletsKit.disconnect().catch(() => undefined);
}

export async function getPublicKey() {
  if (typeof window === "undefined") {
    return null;
  }

  ensureWalletKit();

  try {
    const { address } = await StellarWalletsKit.getAddress();
    return address;
  } catch {
    return null;
  }
}

export const signTransaction: SignTransaction = async (payload, options) => {
  if (typeof window === "undefined") {
    throw new Error("Wallet signing requires a browser context.");
  }

  ensureWalletKit();
  await assertTestnetConnection();
  return StellarWalletsKit.signTransaction(payload, {
    networkPassphrase: options?.networkPassphrase ?? STELLAR_NETWORK_PASSPHRASE,
    address: options?.address,
  });
};

export async function getNetwork() {
  if (typeof window === "undefined") {
    return NETWORK_LABEL;
  }

  ensureWalletKit();
  const network = await StellarWalletsKit.getNetwork();
  return isTestnetPassphrase(network.networkPassphrase) ? NETWORK_LABEL : network.network;
}
