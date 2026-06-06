/**
 * Party validators — Zod schemas for Party CRUD.
 *
 * All schemas are for SERVER-SIDE validation only.
 * Client forms use these via Server Actions.
 */

import { z } from "zod";
import {} from "./party.types";

// ─── Enums as Zod enums ─────────────────────────────────────

export const PartyTypeSchema = z.enum([
  "SUPPLIER",
  "CUSTOMER",
  "MEDICINE_COMPANY",
  "OTHER",
]);

export const PartyStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

// ─── Create Party ────────────────────────────────────────────

export const createPartySchema = z.object({
  name: z
    .string()
    .min(1, "اسم الطرف مطلوب")
    .max(200, "اسم الطرف طويل جداً"),
  type: PartyTypeSchema,
  phone: z.string().max(50, "رقم الهاتف طويل جداً").optional(),
  address: z.string().max(300, "العنوان طويل جداً").optional(),
  contactPerson: z.string().max(200, "اسم المسؤول طويل جداً").optional(),
  notes: z.string().max(1000, "الملاحظات طويلة جداً").optional(),
  status: PartyStatusSchema.optional().default("ACTIVE"),
});

export type CreatePartyInput = z.infer<typeof createPartySchema>;

// ─── Update Party ─────────────────────────────────────────────

export const updatePartySchema = z.object({
  name: z.string().min(1, "اسم الطرف مطلوب").max(200).optional(),
  type: PartyTypeSchema.optional(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  contactPerson: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  status: PartyStatusSchema.optional(),
});

export type UpdatePartyInput = z.infer<typeof updatePartySchema>;

// ─── Party Filters ───────────────────────────────────────────

export const partyFiltersSchema = z.object({
  search: z.string().optional(),
  type: PartyTypeSchema.optional(),
  status: PartyStatusSchema.optional(),
});

export type PartyFiltersInput = z.infer<typeof partyFiltersSchema>;

// ─── ID Param ────────────────────────────────────────────────

export const partyIdSchema = z.object({
  id: z.string().min(1, "معرف الطرف مطلوب"),
});

export type PartyIdParam = z.infer<typeof partyIdSchema>;