import type { BalanceAdapter } from "./balance-adapter.interface.js";
import { MockBalanceAdapter } from "./mock-balance.adapter.js";

export function getBalanceAdapter(_chain: string): BalanceAdapter {
  return new MockBalanceAdapter();
}
