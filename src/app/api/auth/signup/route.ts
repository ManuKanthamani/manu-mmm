import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/server/db/connect";
import { Session, User } from "@/server/auth/models";
import { createSessionToken, setSessionCookie } from "@/server/auth/session";
import { enforceAuthRateLimit } from "@/server/auth/rate-limit";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120, "Name must be 120 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Use no more than 72 characters.")
    .regex(/[0-9]/, "Include at least one number.")
    .regex(/[^A-Za-z0-9\s]/, "Include at least one symbol.")
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must be no more than 72 UTF-8 bytes."),
});

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ error: { code: "INVALID_ORIGIN", message: "Refresh the page and try again." } }, 403);
  }

  const rateLimitResponse = await enforceAuthRateLimit(request, "signup");
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: { code: "VALIDATION_ERROR", message: "Enter your details and try again." } }, 400);
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Check your details." } }, 400);
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim();
  const emailNormalized = email.toLowerCase();

  try {
    await connectToDatabase();

    const existingUser = await User.exists({ emailNormalized });
    if (existingUser) {
      return json({ error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists." } }, 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const sessionToken = createSessionToken();
    const mongoSession = await mongoose.startSession();
    let createdUser: { _id: mongoose.Types.ObjectId; name: string; email: string } | undefined;

    try {
      await mongoSession.withTransaction(async () => {
        const user = new User({ name, email, emailNormalized, passwordHash });
        await user.save({ session: mongoSession });
        const authSession = new Session({
          userId: user._id,
          tokenHash: sessionToken.tokenHash,
          expiresAt: sessionToken.expiresAt,
        });
        await authSession.save({ session: mongoSession });
        createdUser = { _id: user._id, name: user.name, email: user.email };
      });
    } finally {
      await mongoSession.endSession();
    }

    if (!createdUser) throw new Error("Signup transaction did not create a user.");
    await setSessionCookie(sessionToken.token, sessionToken.expiresAt);

    return json({
      data: {
        user: { id: String(createdUser._id), name: createdUser.name, email: createdUser.email },
        hasWedding: false,
      },
    }, 201);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return json({ error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists." } }, 409);
    }

    const failure = error instanceof Error ? error : new Error("Unknown signup error.");
    console.error("Signup failed", { name: failure.name, message: failure.message });
    return json({ error: { code: "AUTH_SERVICE_UNAVAILABLE", message: "Account creation is temporarily unavailable. Please try again." } }, 503);
  }
}
