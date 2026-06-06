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

/** Direction of a single transaction (not the balance). */
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

/**
 * Status of a transaction.
 * Only POSTED transactions affect balance calculations.
 * REVERSED transactions are excluded from balance.
 * Both POSTED and REVERSED appear in the statement for audit.
 */
export type AccountTransactionStatus =
  (typeof ACCOUNT_TRANSACTION_STATUS)[keyof typeof ACCOUNT_TRANSACTION_STATUS];

// ─── Balance Side ─────────────────────────────────────────────
// Balance side is derived from the net balance, NOT from any single transaction.
// It represents the party's position relative to us.

export const BALANCE_SIDE = {
  /** Party owes us — netBalance > 0 — عليه */
  PAYABLE: "PAYABLE",
  /** We owe party — netBalance < 0 — له */
  RECEIVABLE: "RECEIVABLE",
  /** Fully settled — netBalance = 0 — متوازن */
  ZERO: "ZERO",
} as const;

export type BalanceSide = (typeof BALANCE_SIDE)[keyof typeof BALANCE_SIDE];

export const BALANCE_SIDE_LABEL: Record<BalanceSide, string> = {
  PAYABLE: "عليه",
  RECEIVABLE: "له",
  ZERO: "متوازن",
};

// ─── Domain Types ─────────────────────────────────────────────

export interface PartyBalance {
  partyId: string;
  partyName: string;
  partyType: string;
  /** Net balance as decimal string. Positive = PAYABLE, Negative = RECEIVABLE, Zero = ZERO */
  netBalance: string;
  /** Balance side — derived from netBalance */
  side: BalanceSide;
  totalOwed: string;    // sum of PARTY_OWES_US POSTED
  totalCredit: string; // sum of WE_OWE_PARTY POSTED
}

export interface StatementRow {
  transactionId: string;
  transactionNumber: string;
  transactionDate: Date;
  type: AccountTransactionType;
  description: string;
  referenceNumber: string | null;
  notes: string | null;
  /** Direction of this specific transaction */
  direction: AccountTransactionDirection;
  amount: string;          // Decimal as string
  runningBalance: string;  // Decimal as string
  status: AccountTransactionStatus;
}

export interface StatementSummary {
  partyId: string;
  partyName: string;
  partyType: string;
  totalOwed: string;      // sum of PARTY_OWES_US POSTED
  totalCredit: string;    // sum of WE_OWE_PARTY POSTED
  netBalance: string;     // net = totalOwed - totalCredit
  side: BalanceSide;      // derived from netBalance
  transactionCount: number;
}

// ─── Helper Functions ─────────────────────────────────────────

/**
 * Determine BalanceSide from a net balance Decimal.
 *
 * balance > 0 → PAYABLE (عليه) — party owes us
 * balance < 0 → RECEIVABLE (له) — we owe party
 * balance = 0 → ZERO (متوازن)
 *
 * NOTE: The balance passed here must already exclude REVERSED transactions
 * (i.e., it must be calculated from POSTED transactions only).
 */
export function deriveBalanceSide(
  netBalance: string | number
): BalanceSide {
  const n = Number(netBalance);
  if (n > 0) return BALANCE_SIDE.PAYABLE;
  if (n < 0) return BALANCE_SIDE.RECEIVABLE;
  return BALANCE_SIDE.ZERO;
}

/**
 * Determine if a transaction's direction means it increases what the party owes us.
 */
export function isOwedByParty(direction: AccountTransactionDirection): boolean {
  return direction === "PARTY_OWES_US";
}

/**
 * Determine if a transaction's direction means we owe the party.
 */
export function isOwedToParty(direction: AccountTransactionDirection): boolean {
  return direction === "WE_OWE_PARTY";
}