import { cookies } from "next/headers";
import { connectToDatabase } from "@/server/db/connect";
import { Session } from "@/server/auth/models";
import { clearSessionCookie, hashSessionToken, SESSION_COOKIE } from "@/server/auth/session";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: { code: "INVALID_ORIGIN", message: "Refresh the page and try again." } }, { status: 403 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await connectToDatabase();
      await Session.deleteOne({ tokenHash: hashSessionToken(token) });
    } catch (failure) {
      console.error("Sign-out session cleanup failed", { name: failure instanceof Error ? failure.name : "UnknownError" });
    }
  }

  await clearSessionCookie();
  return Response.json({ success: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
