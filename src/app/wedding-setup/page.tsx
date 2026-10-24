import type { Metadata } from "next";
import { redirect } from "next/navigation";
import WeddingSetup, { type CoverPreset, type WeddingSummary } from "@/modules/wedding/components/WeddingSetup";
import { getAuthenticatedUser } from "@/server/auth/current-user";
import { Wedding, WeddingMembership } from "@/server/wedding/models";

export const metadata: Metadata = {
  title: "Set up your wedding | Make My Marriage",
  description: "Create your private wedding workspace and start planning together.",
};

export default async function WeddingSetupPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in?returnTo=/wedding-setup");

  const membership = await WeddingMembership.findOne({ userId: user.id }).lean();
  let existingWedding: WeddingSummary | null = null;
  let membershipUnavailable = false;
  if (membership) {
    const wedding = await Wedding.findOne({ _id: membership.weddingId, deletedAt: null }).lean();
    if (wedding) {
      existingWedding = {
        id: String(wedding._id),
        brideName: wedding.brideName,
        groomName: wedding.groomName,
        title: wedding.title || `${wedding.brideName} & ${wedding.groomName}'s Wedding`,
        weddingDate: wedding.weddingDate,
        location: wedding.location.formattedAddress,
        coverImagePreset: (wedding.coverImagePreset || "palatial-arch") as CoverPreset,
        coverImageUrl: wedding.coverImageObjectKey && process.env.R2_PUBLIC_BASE_URL
          ? `${process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${wedding.coverImageObjectKey}`
          : undefined,
      };
    } else {
      membershipUnavailable = true;
    }
  }

  return <WeddingSetup
    user={{ name: user.name, email: user.email }}
    existingWedding={existingWedding}
    membershipUnavailable={membershipUnavailable}
  />;
}
