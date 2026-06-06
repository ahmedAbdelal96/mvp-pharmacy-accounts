/**
 * Party repository — database operations for Party.
 *
 * All operations use Prisma directly.
 * createdById is always passed in (never trusted from client).
 * Party has NO balance field — balance is calculated from transactions.
 */

import prisma from "@/lib/prisma";
import type { Party } from "@/generated/prisma";
import type {
  PartyType,
  PartyStatus,
  PartyFilters,
  CreatePartyInput,
  UpdatePartyInput,
} from "./party.types";
import { toPrismaCreate, toPrismaUpdate } from "./party.mappers";

// ─── Create ─────────────────────────────────────────────────

export async function createParty(
  input: CreatePartyInput,
  createdById: string
): Promise<Party> {
  const data = toPrismaCreate(input, createdById);
  return prisma.party.create({ data });
}

// ─── Read ──────────────────────────────────────────────────

export async function getPartyById(id: string): Promise<Party | null> {
  return prisma.party.findUnique({ where: { id } });
}

export async function getPartyByIdOrThrow(id: string): Promise<Party> {
  const party = await getPartyById(id);
  if (!party) {
    throw new Error(`الطرف برقم ${id} غير موجود`);
  }
  return party;
}

// ─── List ──────────────────────────────────────────────────

export async function listParties(
  filters: PartyFilters = {}
): Promise<Party[]> {
  const where: Record<string, unknown> = {};

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search && filters.search.trim()) {
    const search = filters.search.trim();
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.party.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

// ─── Update ─────────────────────────────────────────────────

export async function updateParty(
  id: string,
  input: UpdatePartyInput
): Promise<Party> {
  const data = toPrismaUpdate(input);
  return prisma.party.update({ where: { id }, data });
}

// ─── Status ─────────────────────────────────────────────────

export async function setPartyStatus(
  id: string,
  status: PartyStatus
): Promise<Party> {
  return prisma.party.update({
    where: { id },
    data: { status },
  });
}

// ─── Count ──────────────────────────────────────────────────

export async function countParties(
  filters: PartyFilters = {}
): Promise<number> {
  const where: Record<string, unknown> = {};

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search && filters.search.trim()) {
    const search = filters.search.trim();
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.party.count({ where });
}

// ─── Type Counts ─────────────────────────────────────────────

export async function countPartiesByType(): Promise<
  Array<{ type: PartyType; count: number }>
> {
  const result = await prisma.party.groupBy({
    by: ["type"],
    _count: { id: true },
  });
  return result.map((r) => ({
    type: r.type as PartyType,
    count: r._count.id,
  }));
}