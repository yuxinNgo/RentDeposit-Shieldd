import { Buffer } from "buffer";

export async function sha256Buffer(value: string) {
  const content = value.trim();
  const payload = new TextEncoder().encode(content);

  if (globalThis.crypto?.subtle) {
    const input = payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength) as ArrayBuffer;
    const digest = await globalThis.crypto.subtle.digest("SHA-256", input);
    return Buffer.from(digest);
  }

  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(payload).digest();
}
