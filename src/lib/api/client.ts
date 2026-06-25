import type {
  BootstrapPayload,
  CaseRecord,
  Feedback,
  User,
} from "@/lib/types";

async function safeJson<T>(response: Response): Promise<T> {
  const body = await response.json();

  if (!response.ok) {
    const message = typeof body?.error === "string" ? body.error : "Request failed.";
    throw new Error(message);
  }

  return body as T;
}

export async function fetchBootstrap() {
  const response = await fetch("/api/bootstrap", {
    method: "GET",
    cache: "no-store",
  });
  return safeJson<BootstrapPayload>(response);
}

export async function createCaseApi(payload: Record<string, unknown>) {
  const response = await fetch("/api/cases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return safeJson<CaseRecord>(response);
}

export async function performCaseActionApi(caseId: string, payload: Record<string, unknown>) {
  const response = await fetch(`/api/cases/${caseId}/actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return safeJson<{ case: CaseRecord; txHash?: string }>(response);
}

export async function connectWalletApi(payload: Record<string, unknown>) {
  const response = await fetch("/api/wallet/connect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return safeJson<User>(response);
}

export async function completeOnboardingApi(payload: Record<string, unknown>) {
  const response = await fetch("/api/onboarding", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return safeJson<User>(response);
}

export async function submitFeedbackApi(payload: Record<string, unknown>) {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return safeJson<Feedback>(response);
}
