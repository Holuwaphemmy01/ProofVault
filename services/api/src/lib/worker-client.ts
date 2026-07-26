export async function requestWorkerVerification(proofId: string) {
  return {
    proofId,
    status: "passed",
    requiredThreshold: 1_000_000,
    simulatedReserveValue: 1_240_000,
    proofHash: "0xmockworkerproofhash",
    timestamp: new Date().toISOString(),
  };
}
