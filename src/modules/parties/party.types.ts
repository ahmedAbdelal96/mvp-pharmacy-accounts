/**
 * Party Domain Types
 *
 * Local domain types for Party entity.
 * Party has NO balance field — balance is calculated from AccountTransactions.
 */

// ─── Local PartyType Enum ────────────────────────────────────

export const PARTY_TYPE = {
  SUPPLIER: "SUPPLIER",
  CUSTOMER: "CUSTOMER",
  MEDICINE_COMPANY: "MEDICINE_COMPANY",
  OTHER: "OTHER",
} as const;

export type PartyType = (typeof PARTY_TYPE)[keyof typeof PARTY_TYPE];

// ─── Local PartyStatus Enum ─────────────────────────────────

export const PARTY_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type PartyStatus = (typeof PARTY_STATUS)[keyof typeof PARTY_STATUS];

// ─── Arabic Labels ────────────────────────────────────────────

export const PARTY_TYPE_LABELS: Record<PartyType, string> = {
  SUPPLIER: "مورد",
  CUSTOMER: "عميل",
  MEDICINE_COMPANY: "شركة أدوية",
  OTHER: "طرف آخر",
};

export const PARTY_STATUS_LABELS: Record<PartyStatus, string> = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
};

// ─── Party Summary (for lists) ────────────────────────────────

export interface PartySummary {
  id: string;
  name: string;
  type: PartyType;
  phone: string | null;
  status: PartyStatus;
  createdAt: Date;
  // Balance is NOT included here — it must be fetched separately
  // from the statement service
}

// ─── Create / Update DTOs ────────────────────────────────────

export interface CreatePartyInput {
  name: string;
  type: PartyType;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  status?: PartyStatus;
}

export interface UpdatePartyInput {
  name?: string;
  type?: PartyType;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  status?: PartyStatus;
}

// ─── Filter / Search ─────────────────────────────────────────

export interface PartyFilters {
  search?: string;
  type?: PartyType;
  status?: PartyStatus;
}