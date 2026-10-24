import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { z } from "zod";
import { connectToDatabase } from "@/server/db/connect";
import { PasswordResetToken, User } from "@/server/auth/models";
import { hashPasswordResetToken } from "@/server/auth/session";
import { enforceAuthRateLimit } from "@/server/auth/rate-limit";

const forgotPasswordSchema = z.object({ email: z.string().trim().email("Enter a valid email address.").max(254) });
const genericSuccess = { success: true, message: "If an account uses that email, a reset link will be sent shortly." };

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ error: { code: "INVALID_ORIGIN", message: "Refresh the page and try again." } }, 403);
  }

  const rateLimitResponse = await enforceAuthRateLimit(request, "forgotPassword");
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: { code: "VALIDATION_ERROR", message: "Enter a valid email address." } }, 400);
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: { code: "VALIDATION_ERROR", message: "Enter a valid email address." } }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return json({ error: { code: "EMAIL_SERVICE_UNAVAILABLE", message: "Password recovery is temporarily unavailable. Please try again later." } }, 503);
  }

  try {
    await connectToDatabase();
    const emailNormalized = parsed.data.email.toLowerCase();
    const user = await User.findOne({ emailNormalized }).select("_id email");
    if (!user) return json(genericSuccess);

    await PasswordResetToken.deleteMany({ userId: user._id });
    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt });

    const originUrl = process.env.APP_URL ? new URL(process.env.APP_URL).origin : new URL(request.url).origin;
    const resetUrl = new URL("/reset-password", originUrl);
    resetUrl.searchParams.set("token", token);
    const resend = new Resend(apiKey);
    try {
      const result = await resend.emails.send({
        from,
        to: user.email,
        subject: "Reset your Make My Marriage password",
        text: `Use this link to reset your password. It expires in one hour.\n\n${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>Use the link below to reset your password. It expires in one hour.</p><p><a href="${resetUrl.toString()}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      });

      if (result.error) throw result.error;
    } catch (error) {
      await PasswordResetToken.deleteOne({ tokenHash });
      const failure = error instanceof Error ? error : new Error("Unknown email delivery error.");
      console.error("Password reset email delivery failed", { name: failure.name });
    }

    return json(genericSuccess);
  } catch (error) {
    const failure = error instanceof Error ? error : new Error("Unknown password recovery error.");
    console.error("Password recovery failed", { name: failure.name, message: failure.message });
    return json({ error: { code: "AUTH_SERVICE_UNAVAILABLE", message: "Password recovery is temporarily unavailable. Please try again later." } }, 503);
  }
}
