"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { connectWalletApi } from "@/lib/api/client";
import { connectWallet as connectBrowserWallet } from "@/lib/stellar/wallet";
import { Button } from "@/components/ui/button";
import { useAppSession } from "@/components/providers/app-client-provider";
import { shortHash } from "@/lib/utils";

export function WalletConnectButton() {
  const { session, setSession } = useAppSession();
  const [isPending, setIsPending] = useState(false);

  async function handleConnect() {
    setIsPending(true);

    try {
      const connection = await connectBrowserWallet();
      await connectWalletApi({
        role: session.role,
        walletAddress: connection.walletAddress,
        name: session.name,
        email: session.email,
      });
      setSession({ walletAddress: connection.walletAddress });
      toast.success(`Wallet connected via ${connection.source}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wallet connection failed.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button variant={session.walletAddress ? "secondary" : "primary"} onClick={handleConnect} disabled={isPending}>
      <Wallet className="h-4 w-4" />
      {session.walletAddress ? shortHash(session.walletAddress, 6) : isPending ? "Connecting..." : "Connect wallet"}
    </Button>
  );
}
