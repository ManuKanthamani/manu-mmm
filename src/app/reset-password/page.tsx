import { ResetPasswordForm } from "@/modules/auth/components/AuthForms";

export const metadata = {
  title: "Reset password | Make My Marriage",
  description: "Choose a new password for your Make My Marriage account.",
  referrer: "no-referrer" as const,
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";

  return <main className="signup-page">
    <header className="signup-header">
      <a className="signup-brand" href="/" aria-label="Make My Marriage home"><span className="signup-brand-mark" aria-hidden="true">♥</span><span>Make My Marriage</span></a>
      <a className="signup-back-link" href="/sign-in">Back to sign in</a>
    </header>
    <section className="signup-card" aria-labelledby="reset-title">
      <div className="signup-intro"><span className="signup-eyebrow">ACCOUNT RECOVERY</span><h1 id="reset-title">Choose a new password</h1><p>Set a new password for your account.</p></div>
      <ResetPasswordForm token={token} />
    </section>
    <footer className="signup-footer">© 2026 Make My Marriage · Safe and private wedding coordination</footer>
  </main>;
}
