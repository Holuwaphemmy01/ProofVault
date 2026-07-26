import { createHash } from "node:crypto";

export function generateProofHash(input: unknown) {
  const payload = JSON.stringify(input);
  return `0x${createHash("sha256").update(payload).digest("hex")}`;
}
