import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/server/db/connect";
import { Session, User } from "@/server/auth/models";
import { createSessionToken, setSessionCookie } from "@/server/auth/session";
import { enforceAuthRateLimit } from "@/server/auth/rate-limit";
import { WeddingMembership } from "@/server/wedding/models";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(1, "Enter your password.").max(72),
}).refine(({ password }) => Buffer.byteLength(password, "utf8") <= 72, "Password is invalid.");

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ error: { code: "INVALID_ORIGIN", message: "Refresh the page and try again." } }, 403);
  }

  const rateLimitResponse = await enforceAuthRateLimit(request, "login");
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: { code: "VALIDATION_ERROR", message: "Enter your email and password." } }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Check your details." } }, 400);
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({ emailNormalized: parsed.data.email.toLowerCase() }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } }, 401);
    }

    const hasWedding = Boolean(await WeddingMembership.exists({ userId: user._id }));
    const sessionToken = createSessionToken();
    await Session.create({ userId: user._id, tokenHash: sessionToken.tokenHash, expiresAt: sessionToken.expiresAt });
    await setSessionCookie(sessionToken.token, sessionToken.expiresAt);

    return json({
      data: {
        user: { id: String(user._id), name: user.name, email: user.email },
        hasWedding,
      },
    });
  } catch (error) {
    const failure = error instanceof Error ? error : new Error("Unknown sign-in error.");
    console.error("Sign-in failed", { name: failure.name, message: failure.message });
    return json({ error: { code: "AUTH_SERVICE_UNAVAILABLE", message: "Sign in is temporarily unavailable. Please try again." } }, 503);
  }
}
