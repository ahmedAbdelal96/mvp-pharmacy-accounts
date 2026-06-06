/**
 * Get the current authenticated user from the session cookie.
 * Returns null if not authenticated.
 *
 * SECURITY:
 * - Server-side only — reads from HTTP-only session cookie
 * - Never trusts userId from client
 * - Falls back to null if no valid session
 */

import "server-only";

import prisma from "@/lib/prisma";
import { getSession } from "./session";
import type { SessionUser } from "@/modules/auth/auth.types";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as SessionUser["role"],
    isActive: user.isActive,
  };
}