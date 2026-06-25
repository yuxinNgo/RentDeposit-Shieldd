export {};

declare global {
  interface Window {
    freighterApi?: {
      getPublicKey?: () => Promise<string>;
      getNetwork?: () => Promise<string | { networkPassphrase?: string }>;
      signTransaction?: (
        xdr: string,
        options?: { networkPassphrase?: string },
      ) => Promise<string | { signedTxXdr?: string; xdr?: string }>;
    };
  }
}
