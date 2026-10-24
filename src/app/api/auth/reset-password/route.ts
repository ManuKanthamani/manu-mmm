import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/server/db/connect";
import { PasswordResetToken, Session, User } from "@/server/auth/models";
import { clearSessionCookie, hashPasswordResetToken } from "@/server/auth/session";
import { enforceAuthRateLimit } from "@/server/auth/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "This reset link is invalid or expired."),
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

  const rateLimitResponse = await enforceAuthRateLimit(request, "resetPassword");
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: { code: "VALIDATION_ERROR", message: "Check your new password and try again." } }, 400);
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Check your new password." } }, 400);
  }

  try {
    await connectToDatabase();
    const tokenHash = hashPasswordResetToken(parsed.data.token);
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const mongoSession = await mongoose.startSession();
    let passwordChanged = false;

    try {
      await mongoSession.withTransaction(async () => {
        passwordChanged = false;
        const resetToken = await PasswordResetToken.findOne({
          tokenHash,
          usedAt: null,
          expiresAt: { $gt: new Date() },
        }).session(mongoSession);

        if (!resetToken) return;

        const userUpdate = await User.updateOne(
          { _id: resetToken.userId },
          { $set: { passwordHash: passwordHash } },
          { session: mongoSession },
        );
        if (userUpdate.matchedCount !== 1) return;

        await PasswordResetToken.updateMany(
          { userId: resetToken.userId, usedAt: null },
          { $set: { usedAt: new Date() } },
          { session: mongoSession },
        );
        await Session.deleteMany({ userId: resetToken.userId }, { session: mongoSession });
        passwordChanged = true;
      });
    } finally {
      await mongoSession.endSession();
    }

    if (!passwordChanged) {
      return json({ error: { code: "INVALID_TOKEN", message: "This reset link is invalid or expired. Request a new one." } }, 400);
    }

    await clearSessionCookie();
    return json({ success: true });
  } catch (error) {
    const failure = error instanceof Error ? error : new Error("Unknown password reset error.");
    console.error("Password reset failed", { name: failure.name, message: failure.message });
    return json({ error: { code: "AUTH_SERVICE_UNAVAILABLE", message: "Your password could not be updated. Please try again." } }, 503);
  }
}
