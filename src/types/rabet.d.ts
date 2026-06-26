export {};

declare global {
  interface Window {
    rabet?: {
      connect: () => Promise<{
        publicKey?: string;
      }>;
      sign: (
        xdr: string,
        network: "testnet" | "mainnet",
      ) => Promise<{
        xdr?: string;
      }>;
    };
  }
}
