/**
 * Session management using HTTP-only signed cookies.
 *
 * Session token contains: { userId, expiresAt }
 * Signed with HMAC-SHA256 using AUTH_SECRET env var.
 *
 * SECURITY:
 * - Cookie is HTTP-only (not accessible from JS)
 * - Cookie is SameSite=Strict
 * - Token is signed — tamper-proof
 * - No sensitive data stored in the cookie itself
 */

import { cookies } from "next/headers";
import { createHmac } from "crypto";

const SESSION_COOKIE = "pa_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-in-production";
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function verify(payload: string, signature: string): boolean {
  const expected = sign(payload);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

function encode(payload: { userId: string; expiresAt: number }): string {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json).toString("base64url");
  const sig = sign(base64);
  return `${base64}.${sig}`;
}

function decode(token: string): { userId: string; expiresAt: number } | null {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    const base64 = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    if (!verify(base64, sig)) return null;
    const json = Buffer.from(base64, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as { userId: string; expiresAt: number };
    return payload;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────

export async function setSession(userId: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const token = encode({ userId, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = decode(token);
  if (!payload) return null;

  // Check expiration
  if (Date.now() > payload.expiresAt) {
    return null;
  }

  return { userId: payload.userId };
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}