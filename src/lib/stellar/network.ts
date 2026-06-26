import { Networks, StrKey } from "@stellar/stellar-sdk";

export const STELLAR_NETWORK_LABEL = "Stellar Testnet";
export const STELLAR_NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
  process.env.STELLAR_NETWORK_PASSPHRASE ??
  Networks.TESTNET;
export const STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
  process.env.STELLAR_RPC_URL ??
  "https://soroban-testnet.stellar.org";
export const STELLAR_HORIZON_URL =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ??
  process.env.STELLAR_HORIZON_URL ??
  "https://horizon-testnet.stellar.org";
export const STELLAR_FRIENDBOT_URL =
  process.env.NEXT_PUBLIC_STELLAR_FRIENDBOT_URL ??
  process.env.STELLAR_FRIENDBOT_URL ??
  "https://friendbot.stellar.org";
export const STELLAR_CONTRACT_WASM_HASH =
  process.env.NEXT_PUBLIC_STELLAR_CONTRACT_WASM_HASH ??
  process.env.STELLAR_CONTRACT_WASM_HASH ??
  "8ee4b8a385e881101f3e65074043a9b5e6e06fe5b962a30338181b8f7ebe4b8e";

export function isTestnetPassphrase(passphrase: string) {
  return passphrase === Networks.TESTNET;
}

export function isValidPublicKey(value: string) {
  return StrKey.isValidEd25519PublicKey(value);
}

export function isValidContractAddress(value: string) {
  return StrKey.isValidContract(value);
}
