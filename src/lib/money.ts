/**
 * Money utilities — all money values use Decimal internally.
 * NEVER use float for money calculations.
 *
 * IMPORTANT: This file does NOT import from @/generated/prisma
 * to avoid leaking Prisma runtime into the client bundle.
 * All domain types are imported from local module types.
 */

import { Decimal } from "decimal.js";
import type { AccountTransactionDirection } from "@/modules/account-transactions/account-transaction.types";

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
});

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

/**
 * Calculate net balance for a party from transaction rows.
 *
 * Balance = sum(PARTY_OWES_US) - sum(WE_OWE_PARTY)
 * Positive = party owes us (عليه)
 * Negative = we owe party (له)
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
 * Get display label for a balance.
 * عليه = positive (party owes us)
 * له = negative (we owe party)
 * متوازن = zero
 */
export type BalanceDisplay =
  | { label: "عليه"; amount: Decimal }
  | { label: "له"; amount: Decimal }
  | { label: "متوازن"; amount: Decimal };

export function displayBalance(balance: Decimal): BalanceDisplay {
  if (balance.isPositive()) {
    return { label: "عليه", amount: balance };
  } else if (balance.isNegative()) {
    return { label: "له", amount: balance.abs() };
  } else {
    return { label: "متوازن", amount: new Decimal(0) };
  }
}

/**
 * Calculate running balance for a statement (ordered by date then createdAt).
 * Returns array with running balance after each transaction.
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