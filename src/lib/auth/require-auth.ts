/**
 * Server-side auth helpers for route protection.
 *
 * requireAuth()       — throws redirect if not authenticated (returns SessionUser)
 * requirePermission() — throws if authenticated but lacks permission
 *
 * SECURITY:
 * - Server-side only
 * - Never trusts userId from client
 * - Always fetches fresh user from database
 */

import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "./get-current-user";
import { hasPermission } from "@/lib/permissions";
import type { SessionUser, Permission } from "@/modules/auth/auth.types";

/**
 * Require authentication. Redirects to /login if not authenticated.
 * Returns the current user if authenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require a specific permission. Calls requireAuth() first.
 * Throws an Error (with Arabic message) if permission is missing.
 * The calling Server Action should handle the error gracefully.
 */
export async function requirePermission(
  permission: Permission
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    throw new Error(`ليس لديك صلاحية: ${permission}`);
  }
  return user;
}

/**
 * Get current user or null (no redirect).
 */
export async function getOptionalUser(): Promise<SessionUser | null> {
  return getCurrentUser();
}