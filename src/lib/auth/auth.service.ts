/**
 * Authentication service — server-side only.
 *
 * Verifies credentials and returns a session user.
 * Never exposes passwordHash to the client.
 */

import "server-only";

import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import type { SessionUser } from "@/modules/auth/auth.types";

export async function verifyLogin(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) return null;
  if (!user.isActive) return null;

  const valid = await compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}