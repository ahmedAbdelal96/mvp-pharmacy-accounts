/**
 * Party mappers — map between Prisma DB types and domain types.
 *
 * Party has NO balance field — balance is always calculated from AccountTransactions.
 */

import type { Party } from "@/generated/prisma";
import type {
  PartyType,
  PartyStatus,
  PartySummary,
  CreatePartyInput,
  UpdatePartyInput,
} from "./party.types";
import { PARTY_STATUS } from "./party.types";

// ─── DB → Domain ─────────────────────────────────────────────

function mapDbType(type: Party["type"]): PartyType {
  return type as PartyType;
}

function mapDbStatus(status: Party["status"]): PartyStatus {
  return status as PartyStatus;
}

/**
 * Map a Prisma Party to PartySummary (for list views).
 * Does NOT include balance — balance must be fetched separately from transactions.
 */
export function toPartySummary(party: Party): PartySummary {
  return {
    id: party.id,
    name: party.name,
    type: mapDbType(party.type),
    phone: party.phone,
    status: mapDbStatus(party.status),
    createdAt: party.createdAt,
  };
}

/**
 * Map a Prisma Party to a full details object.
 * Does NOT include balance.
 */
export function toPartyDetails(party: Party): PartyDetails {
  return {
    id: party.id,
    name: party.name,
    type: mapDbType(party.type),
    phone: party.phone,
    address: party.address,
    contactPerson: party.contactPerson,
    notes: party.notes,
    status: mapDbStatus(party.status),
    createdAt: party.createdAt,
    updatedAt: party.updatedAt,
    createdById: party.createdById,
  };
}

// ─── Domain Types for Details ────────────────────────────────

export interface PartyDetails {
  id: string;
  name: string;
  type: PartyType;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  notes: string | null;
  status: PartyStatus;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
}

// ─── Input → DB Create ──────────────────────────────────────

/**
 * Map CreatePartyInput (from Zod validation) to Prisma create input.
 * Sets createdById from the trusted server user context.
 */
export function toPrismaCreate(
  input: CreatePartyInput,
  createdById: string
): Omit<Party, "id" | "createdAt" | "updatedAt" | "createdBy"> {
  return {
    name: input.name.trim(),
    type: input.type,
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    contactPerson: input.contactPerson?.trim() || null,
    notes: input.notes?.trim() || null,
    status: (input.status ?? PARTY_STATUS.ACTIVE) as PartyStatus,
    createdById,
  };
}

/**
 * Map UpdatePartyInput (from Zod validation) to Prisma update input.
 * Only includes fields that are defined (not undefined).
 */
export function toPrismaUpdate(
  input: UpdatePartyInput
): Partial<Omit<Party, "id" | "createdAt" | "updatedAt" | "createdBy">> {
  const result: Record<string, unknown> = {};

  if (input.name !== undefined) result.name = (input.name ?? "").trim() || null;
  if (input.type !== undefined) result.type = input.type;
  if (input.phone !== undefined) result.phone = input.phone?.trim() ?? null;
  if (input.address !== undefined)
    result.address = input.address?.trim() ?? null;
  if (input.contactPerson !== undefined)
    result.contactPerson = input.contactPerson?.trim() ?? null;
  if (input.notes !== undefined) result.notes = input.notes?.trim() ?? null;
  if (input.status !== undefined) result.status = input.status;

  return result as Partial<Omit<Party, "id" | "createdAt" | "updatedAt" | "createdBy">>;
}