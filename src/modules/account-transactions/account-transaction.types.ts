/**
 * Account Transaction Domain Types
 *
 * These are LOCAL domain types — NOT generated from Prisma.
 * They decouple the domain from Prisma's generated runtime types.
 *
 * Use these in:
 * - Server Actions (where you pass data around)
 * - Service layer (business logic)
 * - Client components (via serialization)
 *
 * For Prisma operations, use the generated client types from `@/generated/prisma`.
 */

// ─── Local Enums (string literals) ────────────────────────────
// These match the Prisma enums but are defined as const objects
// so they can be used without importing Prisma runtime.

export const ACCOUNT_TRANSACTION_DIRECTION = {
  PARTY_OWES_US: "PARTY_OWES_US",
  WE_OWE_PARTY: "WE_OWE_PARTY",
} as const;

export type AccountTransactionDirection =
  (typeof ACCOUNT_TRANSACTION_DIRECTION)[keyof typeof ACCOUNT_TRANSACTION_DIRECTION];

export const ACCOUNT_TRANSACTION_TYPE = {
  OPENING_BALANCE: "OPENING_BALANCE",
  DEBT: "DEBT",
  PAYMENT_OUT: "PAYMENT_OUT",
  COLLECTION_IN: "COLLECTION_IN",
  ADJUSTMENT: "ADJUSTMENT",
  DISCOUNT: "DISCOUNT",
} as const;

export type AccountTransactionType =
  (typeof ACCOUNT_TRANSACTION_TYPE)[keyof typeof ACCOUNT_TRANSACTION_TYPE];

export const ACCOUNT_TRANSACTION_STATUS = {
  POSTED: "POSTED",
  REVERSED: "REVERSED",
} as const;

export type AccountTransactionStatus =
  (typeof ACCOUNT_TRANSACTION_STATUS)[keyof typeof ACCOUNT_TRANSACTION_STATUS];

// ─── Domain Types ─────────────────────────────────────────────

export interface PartyBalance {
  partyId: string;
  partyName: string;
  partyType: string;
  netBalance: string; // Decimal as string for safe serialization
  direction: AccountTransactionDirection;
  totalOwed: string;  // sum of PARTY_OWES_US
  totalCredit: string; // sum of WE_OWE_PARTY
}

export interface StatementRow {
  transactionId: string;
  transactionNumber: string;
  transactionDate: Date;
  type: AccountTransactionType;
  description: string;
  referenceNumber: string | null;
  notes: string | null;
  direction: AccountTransactionDirection;
  amount: string; // Decimal as string
  runningBalance: string; // Decimal as string
  status: AccountTransactionStatus;
}

export interface StatementSummary {
  partyId: string;
  partyName: string;
  partyType: string;
  totalOwed: string;    // sum of PARTY_OWES_US
  totalCredit: string;  // sum of WE_OWE_PARTY
  netBalance: string;   // net = totalOwed - totalCredit
  transactionCount: number;
}

// ─── Balance Display Helpers ─────────────────────────────────

export type BalanceLabel = "عليه" | "له" | "متوازن";

export function getBalanceLabel(direction: AccountTransactionDirection | null): BalanceLabel {
  if (direction === "PARTY_OWES_US") return "عليه";
  if (direction === "WE_OWE_PARTY") return "له";
  return "متوازن";
}

export function isReceivable(direction: AccountTransactionDirection | null): boolean {
  return direction === "PARTY_OWES_US";
}

export function isPayable(direction: AccountTransactionDirection | null): boolean {
  return direction === "WE_OWE_PARTY";
}