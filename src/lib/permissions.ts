/**
 * Permissions — role-based permission helper.
 *
 * Roles:
 *   OWNER     — full access
 *   ACCOUNTANT — can create/view transactions, view statements/reports
 *   VIEWER    — read-only access
 *
 * Permissions:
 *   party.view
 *   party.create
 *   party.update
 *   transaction.view
 *   transaction.create
 *   transaction.reverse
 *   statement.view
 *   report.view
 */

import { UserRole } from "@/generated/prisma";

export type Permission =
  | "party.view"
  | "party.create"
  | "party.update"
  | "transaction.view"
  | "transaction.create"
  | "transaction.reverse"
  | "statement.view"
  | "report.view";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    "party.view",
    "party.create",
    "party.update",
    "transaction.view",
    "transaction.create",
    "transaction.reverse",
    "statement.view",
    "report.view",
  ],
  ACCOUNTANT: [
    "party.view",
    "party.create",
    "party.update",
    "transaction.view",
    "transaction.create",
    "transaction.reverse",
    "statement.view",
    "report.view",
  ],
  VIEWER: ["party.view", "transaction.view", "statement.view", "report.view"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canCreateParty(role: UserRole): boolean {
  return hasPermission(role, "party.create");
}

export function canUpdateParty(role: UserRole): boolean {
  return hasPermission(role, "party.update");
}

export function canCreateTransaction(role: UserRole): boolean {
  return hasPermission(role, "transaction.create");
}

export function canReverseTransaction(role: UserRole): boolean {
  return hasPermission(role, "transaction.reverse");
}

export function canViewStatement(role: UserRole): boolean {
  return hasPermission(role, "statement.view");
}

export function canViewReport(role: UserRole): boolean {
  return hasPermission(role, "report.view");
}