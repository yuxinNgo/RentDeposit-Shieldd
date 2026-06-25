import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(amount: number, assetCode = "USDC") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount) + ` ${assetCode}`;
}

export function shortHash(value?: string | null, size = 8) {
  if (!value) {
    return "Pending";
  }

  if (value.length <= size * 2) {
    return value;
  }

  return `${value.slice(0, size)}...${value.slice(-size)}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function createMockHash(prefix: string) {
  const raw = `${prefix}-${crypto.randomUUID().replaceAll("-", "")}`;
  return raw.slice(0, 64).toUpperCase().padEnd(64, "A");
}
