/**
 * Party service — business logic layer for Party.
 *
 * All functions enforce permissions via requirePermission.
 * createdById always comes from the authenticated server user.
 *
 * IMPORTANT: Party has NO balance field.
 * Balance must be fetched from AccountTransactions separately.
 */

import { requirePermission } from "@/lib/auth/require-auth";
import type {
  PartyFilters,
  PartySummary,
  CreatePartyInput,
  UpdatePartyInput,
} from "./party.types";
import { toPartySummary, toPartyDetails } from "./party.mappers";
import type { PartyDetails } from "./party.mappers";
import * as repo from "./party.repository";

// ─── Create ─────────────────────────────────────────────────

export async function createParty(
  input: CreatePartyInput
): Promise<{ party: PartySummary; id: string }> {
  const user = await requirePermission("party.create");

  const created = await repo.createParty(input, user.id);

  return {
    party: toPartySummary(created),
    id: created.id,
  };
}

// ─── Read ──────────────────────────────────────────────────

export async function getParty(
  id: string
): Promise<{ party: PartyDetails; balancePending: boolean }> {
  await requirePermission("party.view");

  const party = await repo.getPartyByIdOrThrow(id);

  return {
    party: toPartyDetails(party),
    balancePending: true, // Balance will be implemented in Statements module
  };
}

export async function listParties(
  filters: PartyFilters
): Promise<{
  parties: PartySummary[];
  total: number;
  countsByType: Array<{ type: string; count: number }>;
}> {
  await requirePermission("party.view");

  const [parties, total, countsByType] = await Promise.all([
    repo.listParties(filters),
    repo.countParties(filters),
    repo.countPartiesByType(),
  ]);

  return {
    parties: parties.map(toPartySummary),
    total,
    countsByType,
  };
}

// ─── Update ─────────────────────────────────────────────────

export async function updateParty(
  id: string,
  input: UpdatePartyInput
): Promise<PartySummary> {
  await requirePermission("party.update");

  // Verify party exists
  await repo.getPartyByIdOrThrow(id);

  const updated = await repo.updateParty(id, input);

  return toPartySummary(updated);
}

// ─── Status ─────────────────────────────────────────────────

export async function activateParty(id: string): Promise<PartySummary> {
  await requirePermission("party.update");
  await repo.getPartyByIdOrThrow(id);
  const updated = await repo.setPartyStatus(id, "ACTIVE");
  return toPartySummary(updated);
}

export async function deactivateParty(id: string): Promise<PartySummary> {
  await requirePermission("party.update");
  await repo.getPartyByIdOrThrow(id);
  const updated = await repo.setPartyStatus(id, "INACTIVE");
  return toPartySummary(updated);
}

// ─── Dashboard Summary ──────────────────────────────────────
// These are called from the dashboard page server component.

export async function getPartySummaryForDashboard(): Promise<{
  totalCustomers: number;
  totalSuppliers: number;
  totalMedicineCompanies: number;
  totalParties: number;
}> {
  const [counts] = await Promise.all([repo.countPartiesByType()]);

  const countFor = (type: string) =>
    counts.find((c) => c.type === type)?.count ?? 0;

  return {
    totalCustomers: countFor("CUSTOMER"),
    totalSuppliers: countFor("SUPPLIER"),
    totalMedicineCompanies: countFor("MEDICINE_COMPANY"),
    totalParties: counts.reduce((sum, c) => sum + c.count, 0),
  };
}