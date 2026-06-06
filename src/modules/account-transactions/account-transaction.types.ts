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

/**
 * Direction of a single transaction.
 * - PARTY_OWES_US: The party owes us money (they are in debt to us) → عليه
 * - WE_OWE_PARTY: We owe the party money (they have a credit with us) → له
 */
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
 * - POSTED: Active transaction. Affects balance and running balance.
 * - REVERSED: Cancelled transaction. Does NOT affect balance.
 *   Visible in statement for audit trail with a REVERSED badge.
 *
 * IMPORTANT: Only status=POSTED transactions are included in balance calculation.
 * The reversalTransactionId field is NOT used in balance calculation.
 */
export type AccountTransactionStatus =
  (typeof ACCOUNT_TRANSACTION_STATUS)[keyof typeof ACCOUNT_TRANSACTION_STATUS];

// ─── Balance Side ─────────────────────────────────────────────
// Balance side represents the NET position of a party after all transactions.
// It is derived from netBalance, NOT from any single transaction direction.
//
// netBalance > 0 → PARTY_OWES_US (عليه)  — party owes us
// netBalance < 0 → WE_OWE_PARTY (له)    — we owe party
// netBalance = 0 → ZERO (متوازن)        — settled

export const BALANCE_SIDE = {
  /** Party owes us — netBalance > 0 — عليه */
  PARTY_OWES_US: "PARTY_OWES_US",
  /** We owe party — netBalance < 0 — له */
  WE_OWE_PARTY: "WE_OWE_PARTY",
  /** Fully settled — netBalance = 0 — متوازن */
  ZERO: "ZERO",
} as const;

export type BalanceSide = (typeof BALANCE_SIDE)[keyof typeof BALANCE_SIDE];

export const BALANCE_SIDE_LABEL: Record<BalanceSide, string> = {
  PARTY_OWES_US: "عليه",
  WE_OWE_PARTY: "له",
  ZERO: "متوازن",
};

// ─── Domain Types ─────────────────────────────────────────────

export interface PartyBalance {
  partyId: string;
  partyName: string;
  partyType: string;
  /**
   * Net balance as decimal string.
   * Positive = party owes us (PARTY_OWES_US / عليه)
   * Negative = we owe party (WE_OWE_PARTY / له)
   * Zero     = settled (ZERO / متوازن)
   */
  netBalance: string;
  side: BalanceSide;
  totalOwed: string;    // sum of PARTY_OWES_US where status=POSTED
  totalCredit: string; // sum of WE_OWE_PARTY where status=POSTED
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
  amount: string;          // Decimal as string
  runningBalance: string;  // Decimal as string — REVERSED rows contribute 0
  status: AccountTransactionStatus;
}

export interface StatementSummary {
  partyId: string;
  partyName: string;
  partyType: string;
  totalOwed: string;      // sum of PARTY_OWES_US where status=POSTED
  totalCredit: string;    // sum of WE_OWE_PARTY where status=POSTED
  netBalance: string;     // net = totalOwed - totalCredit
  side: BalanceSide;      // derived from netBalance
  transactionCount: number;
}

// ─── Helper Functions ─────────────────────────────────────────

/**
 * Determine BalanceSide from a net balance value.
 *
 * Requires netBalance as a signed number:
 *   > 0 → PARTY_OWES_US (عليه)  — party owes us
 *   < 0 → WE_OWE_PARTY (له)    — we owe party
 *   = 0 → ZERO (متوازن)
 *
 * NOTE: The netBalance must already exclude REVERSED transactions
 * (calculated from status=POSTED transactions only).
 */
export function deriveBalanceSide(netBalance: string | number): BalanceSide {
  const n = Number(netBalance);
  if (n > 0) return BALANCE_SIDE.PARTY_OWES_US;
  if (n < 0) return BALANCE_SIDE.WE_OWE_PARTY;
  return BALANCE_SIDE.ZERO;
}

/**
 * Determine if a transaction's direction means it increases what the party owes us.
 * (i.e., direction = PARTY_OWES_US)
 */
export function isOwedByParty(direction: AccountTransactionDirection): boolean {
  return direction === "PARTY_OWES_US";
}

/**
 * Determine if a transaction's direction means we owe the party.
 * (i.e., direction = WE_OWE_PARTY)
 */
export function isOwedToParty(direction: AccountTransactionDirection): boolean {
  return direction === "WE_OWE_PARTY";
}