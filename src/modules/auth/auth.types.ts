/**
 * Auth Domain Types
 *
 * Local types for authentication and authorization.
 * Decouples auth domain from Prisma-generated User model.
 */

// ─── Local UserRole Enum ─────────────────────────────────────

export const USER_ROLE = {
  OWNER: "OWNER",
  ACCOUNTANT: "ACCOUNTANT",
  VIEWER: "VIEWER",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// ─── Session ─────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// ─── Permission Types ────────────────────────────────────────

/**
 * Available permissions in the system.
 *
 * settings.view — read-only access to general settings.
 *                 Does NOT include: settings.update, user management,
 *                 role changes, or any write operations.
 */
export type Permission =
  | "party.view"
  | "party.create"
  | "party.update"
  | "transaction.view"
  | "transaction.create"
  | "transaction.reverse"
  | "statement.view"
  | "report.view"
  | "settings.view";

// ─── Login Credentials ────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: SessionUser;
  error?: string;
}