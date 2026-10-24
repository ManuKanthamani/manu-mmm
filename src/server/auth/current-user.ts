import { cookies } from "next/headers";
import { connectToDatabase } from "@/server/db/connect";
import { Session, User } from "@/server/auth/models";
import { SESSION_COOKIE, hashSessionToken } from "@/server/auth/session";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  await connectToDatabase();
  const session = await Session.findOne({
    tokenHash: hashSessionToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!session) return null;

  const user = await User.findById(session.userId).select("name email").lean();
  if (!user) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
  };
}
