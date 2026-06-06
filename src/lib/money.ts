/**
 * Money utilities — all money values use Decimal internally.
 * NEVER use float for money calculations.
 *
 * IMPORTANT: This file does NOT import from @/generated/prisma
 * to avoid leaking Prisma runtime into the client bundle.
 * All domain types are imported from local module types.
 *
 * Balance Convention:
 *   Balance > 0 (positive)  → PARTY_OWES_US (عليه)  — party owes us
 *   Balance < 0 (negative)  → WE_OWE_PARTY (له)    — we owe party
 *   Balance = 0             → ZERO (متوازن)
 *
 * Reversal Convention (V1):
 *   Reversal changes status POSTED → REVERSED.
 *   No new transaction is created.
 *   REVERSED transactions are excluded from balance.
 *   REVERSED transactions appear in statement for audit but do not affect running balance.
 */

import { Decimal } from "decimal.js";
import type {
  AccountTransactionDirection,
  BalanceSide,
} from "@/modules/account-transactions/account-transaction.types";

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
});

// ─── Formatting ───────────────────────────────────────────────

/**
 * Format a Decimal amount as Arabic formatted currency string.
 * Example: 5000.5 -> "٥٬٠٠٠٫٥٠"
 */
export function formatMoney(amount: Decimal | number | string): string {
  const num = new Decimal(amount);
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
}

/**
 * Format amount for display with currency symbol
 */
export function formatCurrency(amount: Decimal | number | string): string {
  return `${formatMoney(amount)} ج.م`;
}

/**
 * Parse a string to Decimal safely
 */
export function parseMoney(value: string): Decimal {
  // Remove Arabic comma separators and spaces
  const cleaned = value.replace(/[٬,\s]/g, "");
  return new Decimal(cleaned);
}

// ─── Balance Calculation ─────────────────────────────────────

/**
 * Calculate net balance for a party from POSTED transactions only.
 *
 * Balance = sum(PARTY_OWES_US where status=POSTED)
 *         - sum(WE_OWE_PARTY where status=POSTED)
 *
 * IMPORTANT:
 * - Callers MUST filter to status=POSTED before passing transactions.
 * - REVERSED transactions must be excluded — they do not affect balance.
 * - No new opposite transaction is created during reversal in V1.
 *
 * Returns a Decimal (can be positive, negative, or zero):
 *   Positive → PARTY_OWES_US (عليه) — party owes us
 *   Negative → WE_OWE_PARTY (له)   — we owe party
 *   Zero     → ZERO (متوازن)
 *
 * @example
 * // Customer owes 1000, then reversed
 * const txs = [
 *   { direction: "PARTY_OWES_US", amount: 1000 }, // status=POSTED
 * ]
 * calculateBalance(txs) // = 1000 → عليه 1000
 *
 * // Same transaction now reversed (excluded from query)
 * const posted = [] // empty — the reversed one was filtered out
 * calculateBalance(posted) // = 0 → متوازن
 */
export function calculateBalance(
  transactions: Array<{
    direction: AccountTransactionDirection;
    amount: Decimal;
  }>
): Decimal {
  return transactions.reduce((balance, tx) => {
    if (tx.direction === "PARTY_OWES_US") {
      return balance.plus(tx.amount);
    } else {
      return balance.minus(tx.amount);
    }
  }, new Decimal(0));
}

/**
 * Determine BalanceSide from a net balance Decimal.
 *
 * balance > 0 → PARTY_OWE_US (عليه)  — party owes us
 * balance < 0 → WE_OWE_PARTY (له)   — we owe party
 * balance = 0 → ZERO (متوازن)
 */
export function getBalanceSide(balance: Decimal): BalanceSide {
  if (balance.isPositive()) return "PARTY_OWES_US";
  if (balance.isNegative()) return "WE_OWE_PARTY";
  return "ZERO";
}

/**
 * Get Arabic display label from BalanceSide.
 */
export function getBalanceLabel(side: BalanceSide): string {
  if (side === "PARTY_OWES_US") return "عليه";
  if (side === "WE_OWE_PARTY") return "له";
  return "متوازن";
}

/**
 * Full balance display object.
 *
 * @example
 * displayBalance(new Decimal(600))
 * // { label: "عليه", side: "PARTY_OWES_US", amount: 600 }
 *
 * displayBalance(new Decimal(-300))
 * // { label: "له", side: "WE_OWE_PARTY", amount: 300 }
 *
 * displayBalance(new Decimal(0))
 * // { label: "متوازن", side: "ZERO", amount: 0 }
 */
export type BalanceDisplay = {
  label: string;
  side: BalanceSide;
  amount: Decimal;
};

export function displayBalance(balance: Decimal): BalanceDisplay {
  const side = getBalanceSide(balance);
  const label = getBalanceLabel(side);

  if (balance.isNegative()) {
    return { label, side, amount: balance.abs() };
  }

  return { label, side, amount: balance };
}

// ─── Running Balance ──────────────────────────────────────────

/**
 * Calculate running balance for a statement.
 *
 * IMPORTANT:
 * - Only POSTED transactions should be included in this function.
 * - REVERSED transactions must be filtered out BEFORE calling.
 * - REVERSED rows appear in the statement UI (for audit) but do NOT
 *   contribute to the running balance column.
 *
 * The sorted array should already exclude REVERSED transactions.
 * If a REVERSED row needs to appear in the statement display, it should
 * be merged in after running balance is calculated, with running balance
 * unchanged from the previous POSTED row.
 *
 * @example
 * // Customer statement:
 * // POSTED: PARTY_OWES_US 1000  → running = 1000 (عليه)
 * // REVERSED: ...[REVERSED badge]... ← excluded; running stays 1000
 * // POSTED: WE_OWE_PARTY 1000   → running = 0 (متوازن)
 */
export function calculateRunningBalance(
  transactions: Array<{
    direction: AccountTransactionDirection;
    amount: Decimal;
    transactionDate: Date;
    createdAt: Date;
  }>
): Array<{ runningBalance: Decimal; index: number }> {
  const sorted = [...transactions].sort((a, b) => {
    const dateCompare =
      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
    if (dateCompare !== 0) return dateCompare;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  let running = new Decimal(0);
  return sorted.map((tx, i) => {
    if (tx.direction === "PARTY_OWES_US") {
      running = running.plus(tx.amount);
    } else {
      running = running.minus(tx.amount);
    }
    return { runningBalance: running, index: i };
  });
}