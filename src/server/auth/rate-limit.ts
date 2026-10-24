import { createHash, createHmac } from "node:crypto";
import { AuthRateLimit } from "@/server/auth/models";
import { connectToDatabase } from "@/server/db/connect";

const minute = 60_000;
const hour = 60 * minute;

const limits = {
  login: { maximum: 10, windowMs: 15 * minute },
  signup: { maximum: 5, windowMs: hour },
  forgotPassword: { maximum: 5, windowMs: hour },
  resetPassword: { maximum: 10, windowMs: 15 * minute },
} as const;

export type AuthRateLimitAction = keyof typeof limits;

function getClientAddress(request: Request) {
  const directAddress = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip");
  if (directAddress?.trim()) return directAddress.trim();

  const forwardedAddress = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  return forwardedAddress || "unknown";
}

function createRateLimitKey(action: AuthRateLimitAction, address: string, bucket: number) {
  const keyMaterial = process.env.SESSION_SECRET || process.env.MONGODB_URI;
  if (!keyMaterial) throw new Error("Rate limit key material is not configured.");

  const addressHash = createHmac("sha256", keyMaterial).update(address).digest("hex");
  return createHash("sha256").update(`${action}:${addressHash}:${bucket}`).digest("hex");
}

export async function enforceAuthRateLimit(request: Request, action: AuthRateLimitAction) {
  try {
    await connectToDatabase();

    const { maximum, windowMs } = limits[action];
    const now = Date.now();
    const bucket = Math.floor(now / windowMs);
    const key = createRateLimitKey(action, getClientAddress(request), bucket);
    const bucketEndsAt = new Date((bucket + 1) * windowMs);
    let record: { count: number } | null;
    try {
      record = await AuthRateLimit.findOneAndUpdate(
        { _id: key },
        {
          $inc: { count: 1 },
          $setOnInsert: { expiresAt: new Date(bucketEndsAt.getTime() + hour) },
        },
        { upsert: true, new: true },
      ).lean();
    } catch (error) {
      if (typeof error !== "object" || error === null || !("code" in error) || error.code !== 11000) throw error;
      record = await AuthRateLimit.findOneAndUpdate(
        { _id: key },
        { $inc: { count: 1 } },
        { new: true },
      ).lean();
    }

    if (!record || record.count <= maximum) return null;

    const retryAfterSeconds = Math.max(1, Math.ceil((bucketEndsAt.getTime() - now) / 1000));
    return Response.json(
      { error: { code: "RATE_LIMITED", message: "Too many attempts. Please wait and try again." } },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Retry-After": String(retryAfterSeconds),
        },
      },
    );
  } catch (error) {
    const failure = error instanceof Error ? error : new Error("Unknown authentication rate limit error.");
    console.error("Authentication rate limit unavailable", { name: failure.name });
    return Response.json(
      { error: { code: "AUTH_SERVICE_UNAVAILABLE", message: "Authentication is temporarily unavailable. Please try again." } },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
