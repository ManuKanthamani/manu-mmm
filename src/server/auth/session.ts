import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "mmm_session";
export const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 30;

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_SECONDS * 1000);
  return { token, tokenHash: hashSessionToken(token), expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
