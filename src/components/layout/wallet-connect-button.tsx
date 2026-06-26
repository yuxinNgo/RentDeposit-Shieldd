"use client";

import { useState } from "react";
import { LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";
import { connectWalletApi } from "@/lib/api/client";
import { connectWallet as connectBrowserWallet, disconnectWallet as disconnectBrowserWallet } from "@/lib/stellar/wallet";
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
      const payload: Record<string, unknown> = {
        role: session.role,
        walletAddress: connection.walletAddress,
      };

      if (session.name.trim().length >= 2) {
        payload.name = session.name;
      }

      if (session.email.includes("@")) {
        payload.email = session.email;
      }

      await connectWalletApi(payload);
      setSession({ walletAddress: connection.walletAddress, walletProvider: connection.source });
      toast.success(`Wallet connected via ${connection.source}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wallet connection failed.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDisconnect() {
    setIsPending(true);

    try {
      await disconnectBrowserWallet();
      setSession({
        walletAddress: "",
        walletProvider: "",
      });
      toast.success("Wallet disconnected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wallet disconnect failed.");
    } finally {
      setIsPending(false);
    }
  }

  if (session.walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled>
          <Wallet className="h-4 w-4" />
          {`${session.walletProvider || "wallet"} ${shortHash(session.walletAddress, 6)}`}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDisconnect} disabled={isPending}>
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button variant="primary" onClick={handleConnect} disabled={isPending}>
      <Wallet className="h-4 w-4" />
      {isPending ? "Connecting..." : "Connect wallet"}
    </Button>
  );
}
