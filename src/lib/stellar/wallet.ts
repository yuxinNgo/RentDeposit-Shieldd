"use client";

import { NETWORK_LABEL } from "@/lib/constants";

export interface WalletConnectionResult {
  walletAddress: string;
  network: string;
  source: "freighter" | "mock";
}

function createMockWallet() {
  return `GMOCK${crypto.randomUUID().replaceAll("-", "").toUpperCase().slice(0, 50)}`.slice(0, 56);
}

export async function connectWallet(): Promise<WalletConnectionResult> {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection requires a browser context.");
  }

  const freighter = window.freighterApi;

  if (freighter?.getPublicKey) {
    const walletAddress = await freighter.getPublicKey();
    const network = await getNetwork();

    if (network !== NETWORK_LABEL) {
      throw new Error(`Wallet network mismatch. Expected ${NETWORK_LABEL}.`);
    }

    return {
      walletAddress,
      network,
      source: "freighter",
    };
  }

  return {
    walletAddress: createMockWallet(),
    network: NETWORK_LABEL,
    source: "mock",
  };
}

export async function disconnectWallet() {
  return;
}

export async function getPublicKey() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.freighterApi?.getPublicKey ? window.freighterApi.getPublicKey() : null;
}

export async function signTransaction(payload: string) {
  if (typeof window === "undefined") {
    return payload;
  }

  if (window.freighterApi?.signTransaction) {
    const signed = await window.freighterApi.signTransaction(payload, {
      networkPassphrase: NETWORK_LABEL,
    });

    return typeof signed === "string" ? signed : (signed?.signedTxXdr ?? signed?.xdr ?? payload);
  }

  return `${payload}-signed-demo`;
}

export async function getNetwork() {
  if (typeof window === "undefined") {
    return NETWORK_LABEL;
  }

  const network = window.freighterApi?.getNetwork ? await window.freighterApi.getNetwork() : null;

  if (typeof network === "string") {
    return network.includes("TESTNET") ? NETWORK_LABEL : network;
  }

  return network?.networkPassphrase?.includes("Test") ? NETWORK_LABEL : NETWORK_LABEL;
}
