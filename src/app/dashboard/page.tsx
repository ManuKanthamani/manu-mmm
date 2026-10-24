import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedUser } from "@/server/auth/current-user";
import { Wedding, WeddingMembership } from "@/server/wedding/models";

export const metadata: Metadata = {
  title: "Wedding workspace | Make My Marriage",
  description: "Your shared wedding planning workspace.",
};

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in");

  const membership = await WeddingMembership.findOne({ userId: user.id }).lean();
  if (!membership) redirect("/wedding-setup");

  const wedding = await Wedding.findOne({ _id: membership.weddingId, deletedAt: null }).lean();
  if (!wedding) redirect("/wedding-setup");

  const weddingTitle = wedding.title || `${wedding.brideName} & ${wedding.groomName}'s Wedding`;
  const weddingDate = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "UTC" })
    .format(new Date(`${wedding.weddingDate}T00:00:00.000Z`));

  return <main className="wedding-dashboard-page">
    <header className="wedding-setup-header"><div className="wedding-setup-header-inner">
      <Link className="wedding-brand" href="/" aria-label="Make My Marriage home"><span className="wedding-brand-mark" aria-hidden="true">∞</span><span className="wedding-brand-copy"><strong>Make My Marriage</strong><small>WEDDING WORKSPACE</small></span></Link>
      <Link className="wedding-signout" href="/wedding-setup">Wedding details</Link>
    </div></header>
    <section className="wedding-dashboard-content">
      <span className="wedding-eyebrow">YOUR SHARED CELEBRATION</span>
      <h1>Welcome to your wedding workspace</h1>
      <p className="wedding-dashboard-description">Your wedding details are ready. This is where you’ll bring your events, family plans, guests, and wedding memories together.</p>
      <article className="wedding-dashboard-hero">
        <span className={`wedding-cover-art wedding-cover-art-${wedding.coverImagePreset || "palatial-arch"}`} style={wedding.coverImageObjectKey && process.env.R2_PUBLIC_BASE_URL ? { backgroundImage: `url(${process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${wedding.coverImageObjectKey})` } : undefined} aria-hidden="true"><span /></span>
        <div><span className="wedding-role-badge">{membership.role === "ADMIN" ? "WEDDING ADMIN" : "WEDDING MEMBER"}</span><h2>{weddingTitle}</h2><p>{weddingDate} <span aria-hidden="true">·</span> {wedding.location.formattedAddress}</p></div>
      </article>
      <div className="wedding-dashboard-next">
        <span className="wedding-dashboard-next-icon">✦</span>
        <div><strong>Your wedding workspace is ready</strong><p>Start by adding the celebrations and people who will help make the day yours.</p></div>
        <span className="wedding-dashboard-next-label">More planning tools are on the way</span>
      </div>
    </section>
  </main>;
}
