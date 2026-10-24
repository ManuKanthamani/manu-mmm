import { SignInForm } from "@/modules/auth/components/AuthForms";

export const metadata = {
  title: "Sign in | Make My Marriage",
  description: "Sign in to your Make My Marriage account.",
};

export default function SignInPage() {
  return <main className="signup-page">
    <header className="signup-header">
      <a className="signup-brand" href="/" aria-label="Make My Marriage home"><span className="signup-brand-mark" aria-hidden="true">♥</span><span>Make My Marriage</span></a>
      <a className="signup-back-link" href="/">Back to homepage</a>
    </header>
    <section className="signup-card" aria-labelledby="signin-title">
      <div className="signup-intro"><span className="signup-eyebrow">WELCOME BACK</span><h1 id="signin-title">Sign in</h1><p>Access your shared wedding workspace.</p></div>
      <SignInForm />
      <p className="signup-terms">New to Make My Marriage? <a className="signup-inline-link" href="/create-account">Create an account</a></p>
    </section>
    <footer className="signup-footer">© 2026 Make My Marriage · Safe and private wedding coordination</footer>
  </main>;
}
