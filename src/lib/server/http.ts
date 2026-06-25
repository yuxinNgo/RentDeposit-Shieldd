import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logError } from "@/lib/server/repository";

export function jsonOk<T>(payload: T) {
  return NextResponse.json(payload, { status: 200 });
}

export async function jsonError(error: unknown, scope: "wallet" | "contract" | "api" | "ui", caseId?: string) {
  const message =
    error instanceof ZodError
      ? error.issues.map((issue) => issue.message).join(", ")
      : error instanceof Error
        ? error.message
        : "Unexpected error";

  await logError(scope, message, error instanceof Error ? error.stack : undefined, caseId);
  return NextResponse.json({ error: message }, { status: 400 });
}
