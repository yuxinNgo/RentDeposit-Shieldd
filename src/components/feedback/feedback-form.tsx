"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitFeedbackApi } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppSession } from "@/components/providers/app-client-provider";

export function FeedbackForm({ onSubmitted }: { onSubmitted: () => Promise<unknown> }) {
  const { session } = useAppSession();
  const [workedWell, setWorkedWell] = useState("Audit trail and wallet proof were easy to understand.");
  const [confusing, setConfusing] = useState("Clarify when to upload move-out evidence versus when to request refund.");
  const [comment, setComment] = useState("Clean and demo-friendly flow.");
  const [contact, setContact] = useState(session.email);
  const [rating, setRating] = useState(5);
  const [wouldUse, setWouldUse] = useState("yes");
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await submitFeedbackApi({
          role: session.role,
          walletAddress: session.walletAddress,
          rating,
          workedWell,
          confusing,
          wouldUse: wouldUse === "yes",
          comment,
          contact,
        });
        toast.success("Feedback submitted.");
        await onSubmitted();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not submit feedback.");
      }
    });
  }

  return (
    <Card>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <Select value={session.role} disabled>
          <option>{session.role}</option>
        </Select>
        <Input type="number" min={1} max={5} value={rating} onChange={(event) => setRating(Number(event.target.value))} />
        <div className="md:col-span-2">
          <Textarea value={workedWell} onChange={(event) => setWorkedWell(event.target.value)} placeholder="What worked well" />
        </div>
        <div className="md:col-span-2">
          <Textarea value={confusing} onChange={(event) => setConfusing(event.target.value)} placeholder="What was confusing" />
        </div>
        <Select value={wouldUse} onChange={(event) => setWouldUse(event.target.value)}>
          <option value="yes">Would use for a real rental deposit</option>
          <option value="no">Would not use yet</option>
        </Select>
        <Input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Optional contact" />
        <div className="md:col-span-2">
          <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Extra comments" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isPending || !session.walletAddress}>
            {isPending ? "Submitting..." : "Submit feedback"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
