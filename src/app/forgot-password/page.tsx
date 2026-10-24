import { ForgotPasswordForm } from "@/modules/auth/components/AuthForms";

export const metadata = {
  title: "Forgot password | Make My Marriage",
  description: "Request a secure password reset link for your Make My Marriage account.",
};

export default function ForgotPasswordPage() {
  return <main className="signup-page">
    <header className="signup-header">
      <a className="signup-brand" href="/" aria-label="Make My Marriage home"><span className="signup-brand-mark" aria-hidden="true">♥</span><span>Make My Marriage</span></a>
      <a className="signup-back-link" href="/sign-in">Back to sign in</a>
    </header>
    <section className="signup-card" aria-labelledby="forgot-title">
      <div className="signup-intro"><span className="signup-eyebrow">ACCOUNT RECOVERY</span><h1 id="forgot-title">Forgot your password?</h1><p>Enter the email address for your account and we’ll send a reset link.</p></div>
      <ForgotPasswordForm />
      <p className="signup-terms">Remembered your password? <a className="signup-inline-link" href="/sign-in">Sign in</a></p>
    </section>
    <footer className="signup-footer">© 2026 Make My Marriage · Safe and private wedding coordination</footer>
  </main>;
}
