/**
 * Money utilities — all money values use Decimal internally.
 * NEVER use float for money calculations.
 *
 * IMPORTANT: This file does NOT import from @/generated/prisma
 * to avoid leaking Prisma runtime into the client bundle.
 * All domain types are imported from local module types.
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
 * IMPORTANT: Callers must filter to status=POSTED before passing.
 * REVERSED transactions must be excluded — they do not affect balance.
 *
 * Returns:
 *   Positive balance → party owes us (PAYABLE / عليه)
 *   Negative balance → we owe party (RECEIVABLE / له)
 *   Zero              → fully settled (ZERO / متوازن)
 *
 * @example
 * // Customer: paid 1000 then reversed
 * const txs = [
 *   { direction: "PARTY_OWES_US", amount: 1000 }, // POSTED
 *   { direction: "WE_OWE_PARTY", amount: 1000 },  // reversal, POSTED
 * ]
 * calculateBalance(txs) // = 0 → متوازن ✓
 *
 * @example
 * // Supplier: له 5000 then reversed
 * const txs = [
 *   { direction: "WE_OWE_PARTY", amount: 5000 },    // POSTED
 *   { direction: "PARTY_OWES_US", amount: 5000 },  // reversal, POSTED
 * ]
 * calculateBalance(txs) // = 0 → متوازن ✓
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
 * Determine the BalanceSide from a net balance Decimal.
 *
 * balance > 0 → PAYABLE (عليه) — party owes us
 * balance < 0 → RECEIVABLE (له) — we owe party
 * balance = 0 → ZERO (متوازن)
 */
export function getBalanceSide(balance: Decimal): BalanceSide {
  if (balance.isPositive()) return "PAYABLE";
  if (balance.isNegative()) return "RECEIVABLE";
  return "ZERO";
}

/**
 * Get display label for a balance.
 * PAYABLE   = عليه (party owes us)
 * RECEIVABLE = له (we owe party)
 * ZERO      = متوازن (settled)
 */
export function getBalanceLabel(side: BalanceSide): string {
  if (side === "PAYABLE") return "عليه";
  if (side === "RECEIVABLE") return "له";
  return "متوازن";
}

/**
 * Full balance display with amount and label.
 *
 * @example
 * displayBalance(new Decimal(600))   // { label: "عليه", side: "PAYABLE", amount: 600 }
 * displayBalance(new Decimal(-300))  // { label: "له",   side: "RECEIVABLE", amount: 300 }
 * displayBalance(new Decimal(0))     // { label: "متوازن", side: "ZERO", amount: 0 }
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
 * Calculate running balance for a statement (ordered by date then createdAt).
 * Returns array with running balance after each transaction.
 *
 * IMPORTANT: Only POSTED transactions should be included in this array.
 * REVERSED transactions should be filtered out before calling.
 *
 * @example
 * // Customer statement with reversal:
 * // Row 1: PARTY_OWES_US 1000  → running = 1000 (عليه)
 * // Row 2: WE_OWE_PARTY 1000  → running = 0   (متوازن)  [reversal of row 1]
 * // Both appear in statement; net = 0 ✓
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