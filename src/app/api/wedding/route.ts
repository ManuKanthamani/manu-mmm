import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { getAuthenticatedUser } from "@/server/auth/current-user";
import { connectToDatabase } from "@/server/db/connect";
import { Wedding, WeddingMembership } from "@/server/wedding/models";
import { hashSessionToken } from "@/server/auth/session";

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const TIME_ZONE = "Asia/Kolkata";

const locationSchema = z.object({
  formattedAddress: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  googlePlaceId: z.string().trim().max(200).optional(),
});

const weddingSchema = z.object({
  brideName: z.string().trim().min(1, "Enter the bride’s name.").max(120),
  groomName: z.string().trim().min(1, "Enter the groom’s name.").max(120),
  title: z.string().trim().max(160).optional(),
  description: z.string().trim().max(1000).optional(),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid wedding date."),
  timeZone: z.string().trim().min(1).max(100).default(TIME_ZONE).refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Choose a valid time zone."),
  location: locationSchema,
  coverImagePreset: z.enum(["palatial-arch", "lotus-motif", "marigold-modern", "custom"]).default("palatial-arch"),
});

type CoverMime = "image/jpeg" | "image/png" | "image/webp";

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
}

function error(code: string, message: string, status: number) {
  return json({ error: { code, message } }, status);
}

function slugPart(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

function weddingSlug(brideName: string, groomName: string, date: string, suffix: number) {
  const [year, month, day] = date.split("-");
  const base = [slugPart(brideName), slugPart(groomName), `${day}${month}${year}`].filter(Boolean).join("-");
  return `${base}${suffix > 1 ? `-${suffix}` : ""}`;
}

function validImageSignature(type: CoverMime, bytes: Buffer) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
}

function getCoverStorage() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) return null;

  return {
    bucket,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/, ""),
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

async function readPayload(request: Request) {
  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const form = await request.formData();
    let location: unknown;
    try {
      location = JSON.parse(String(form.get("location") ?? ""));
    } catch {
      location = null;
    }
    const fileEntry = form.get("coverFile");
    return {
      body: {
        brideName: form.get("brideName"),
        groomName: form.get("groomName"),
        title: form.get("title"),
        description: form.get("description"),
        weddingDate: form.get("weddingDate"),
        timeZone: form.get("timeZone") || undefined,
        location,
        coverImagePreset: form.get("coverImagePreset") || undefined,
      },
      file: fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null,
    };
  }

  return { body: await request.json(), file: null as File | null };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return error("INVALID_ORIGIN", "Refresh the page and try again.", 403);
  }

  const user = await getAuthenticatedUser();
  if (!user) return error("UNAUTHENTICATED", "Sign in to set up your wedding.", 401);

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_COVER_BYTES + 64 * 1024) {
    return error("UPLOAD_ERROR", "Choose a cover image smaller than 5 MB.", 413);
  }

  let submitted: Awaited<ReturnType<typeof readPayload>>;
  try {
    submitted = await readPayload(request);
  } catch {
    return error("VALIDATION_ERROR", "Enter your wedding details and try again.", 400);
  }

  const parsed = weddingSchema.safeParse(submitted.body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return json({
      error: {
        code: "VALIDATION_ERROR",
        message: firstIssue?.message ?? "Check the wedding details and try again.",
        field: firstIssue?.path[0],
      },
    }, 400);
  }

  if (parsed.data.coverImagePreset === "custom" && !submitted.file) {
    return error("VALIDATION_ERROR", "Choose a custom cover image or select one of the presets.", 400);
  }
  if (parsed.data.coverImagePreset !== "custom" && submitted.file) {
    return error("VALIDATION_ERROR", "Select Custom Image to upload a cover file.", 400);
  }

  let coverImageObjectKey: string | undefined;
  let uploadedKey: string | undefined;
  let storage: ReturnType<typeof getCoverStorage> = null;
  if (submitted.file) {
    if (submitted.file.size > MAX_COVER_BYTES) return error("UPLOAD_ERROR", "Choose a cover image smaller than 5 MB.", 413);
    if (!["image/jpeg", "image/png", "image/webp"].includes(submitted.file.type)) {
      return error("UPLOAD_ERROR", "Use a JPG, PNG, or WebP image for the wedding cover.", 400);
    }
    storage = getCoverStorage();
    if (!storage) return error("STORAGE_UNAVAILABLE", "Custom cover uploads are not configured yet. Choose a cover preset instead.", 503);
  }

  try {
    await connectToDatabase();

    const currentMembership = await WeddingMembership.findOne({ userId: user.id }).lean();
    if (currentMembership) {
      return error("ALREADY_HAS_WEDDING", "Your account already belongs to a wedding workspace.", 409);
    }

    const dateIsReal = !Number.isNaN(Date.parse(`${parsed.data.weddingDate}T00:00:00.000Z`))
      && new Date(`${parsed.data.weddingDate}T00:00:00.000Z`).toISOString().slice(0, 10) === parsed.data.weddingDate;
    if (!dateIsReal) return error("VALIDATION_ERROR", "Choose a valid wedding date.", 400);

    const weddingId = new mongoose.Types.ObjectId();
    if (submitted.file && storage) {
      const contentType = submitted.file.type as CoverMime;
      const bytes = Buffer.from(await submitted.file.arrayBuffer());
      if (!validImageSignature(contentType, bytes)) {
        return error("UPLOAD_ERROR", "That file does not look like a valid JPG, PNG, or WebP image.", 400);
      }
      const extension = contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp";
      uploadedKey = `weddings/${weddingId.toString()}/cover/${randomUUID()}.${extension}`;
      await storage.client.send(new PutObjectCommand({
        Bucket: storage.bucket,
        Key: uploadedKey,
        Body: bytes,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }));
      coverImageObjectKey = uploadedKey;
    }

    const mongoSession = await mongoose.startSession();
    let created: { id: string; brideName: string; groomName: string; title?: string; weddingDate: string; location: string; coverImagePreset: string; coverImageUrl?: string; website: { slug: string } } | undefined;
    let suffix = 1;
    try {
      for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
        try {
          await mongoSession.withTransaction(async () => {
            const existingMembership = await WeddingMembership.findOne({ userId: user.id }).session(mongoSession).lean();
            if (existingMembership) throw new Error("ALREADY_HAS_WEDDING");

            let slug = weddingSlug(parsed.data.brideName, parsed.data.groomName, parsed.data.weddingDate, suffix);
            while (await Wedding.exists({ "website.slug": slug }).session(mongoSession)) {
              suffix += 1;
              slug = weddingSlug(parsed.data.brideName, parsed.data.groomName, parsed.data.weddingDate, suffix);
            }

            const wedding = new Wedding({
              _id: weddingId,
              brideName: parsed.data.brideName,
              groomName: parsed.data.groomName,
              title: parsed.data.title || `${parsed.data.brideName} & ${parsed.data.groomName}'s Wedding`.slice(0, 160),
              description: parsed.data.description || undefined,
              weddingDate: parsed.data.weddingDate,
              timeZone: parsed.data.timeZone,
              coverImageObjectKey,
              coverImagePreset: parsed.data.coverImagePreset,
              location: parsed.data.location,
              website: { slug, theme: "CLASSIC_INDIAN", isPublished: false },
              gallery: {
                // This unissued hash is replaced when gallery settings first enable sharing.
                tokenHash: hashSessionToken(randomBytes(32).toString("base64url")),
                isEnabled: false,
                guestUploadsEnabled: false,
              },
              livestream: { youtubeUrl: null, isEnabled: false },
              createdByUserId: user.id,
            });
            await wedding.save({ session: mongoSession });

            const membership = new WeddingMembership({ userId: user.id, weddingId: wedding._id, role: "ADMIN" });
            await membership.save({ session: mongoSession });

            created = {
              id: String(wedding._id),
              brideName: wedding.brideName,
              groomName: wedding.groomName,
              title: wedding.title,
              weddingDate: wedding.weddingDate,
              location: wedding.location.formattedAddress,
              coverImagePreset: wedding.coverImagePreset,
              coverImageUrl: coverImageObjectKey ? `${storage?.publicBaseUrl}/${coverImageObjectKey}` : undefined,
              website: { slug: wedding.website.slug },
            };
          });
        } catch (transactionError) {
          if (transactionError instanceof Error && transactionError.message === "ALREADY_HAS_WEDDING") {
            throw transactionError;
          }

          const duplicate = typeof transactionError === "object" && transactionError !== null
            && "code" in transactionError && transactionError.code === 11000;
          if (!duplicate || attempt === 4) throw transactionError;

          const membershipCreated = await WeddingMembership.exists({ userId: user.id });
          if (membershipCreated) throw new Error("ALREADY_HAS_WEDDING");
          suffix += 1;
        }
      }
    } finally {
      await mongoSession.endSession();
    }

    if (!created) throw new Error("Wedding creation transaction did not return a wedding.");
    return json({ data: created }, 201);
  } catch (failure) {
    if (uploadedKey && storage) {
      try {
        await storage.client.send(new DeleteObjectCommand({ Bucket: storage.bucket, Key: uploadedKey }));
      } catch (cleanupError) {
        console.error("Wedding cover cleanup failed", {
          name: cleanupError instanceof Error ? cleanupError.name : "UnknownError",
        });
      }
    }

    const problem = failure instanceof Error ? failure : new Error("Unknown wedding setup error.");
    if (problem.message === "ALREADY_HAS_WEDDING") {
      return error("ALREADY_HAS_WEDDING", "Your account already belongs to a wedding workspace.", 409);
    }
    console.error("Wedding setup failed", { name: problem.name, message: problem.message });
    return error("WEDDING_SETUP_UNAVAILABLE", "We could not create your wedding workspace. Please try again.", 503);
  }
}
