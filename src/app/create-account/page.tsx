import SignupForm from "@/modules/auth/components/SignupForm";

export const metadata = {
  title: "Create your account | Make My Marriage",
  description: "Create a Make My Marriage account to start bringing your wedding plans together.",
};

export default function CreateAccountPage() {
  return <main className="signup-page">
    <header className="signup-header">
      <a className="signup-brand" href="/" aria-label="Make My Marriage home">
        <span className="signup-brand-mark" aria-hidden="true">♥</span>
        <span>Make My Marriage</span>
      </a>
      <a className="signup-back-link" href="/">Back to homepage</a>
    </header>
    <section className="signup-card" aria-labelledby="signup-title">
      <div className="signup-intro">
        <span className="signup-eyebrow">YOUR WEDDING, TOGETHER</span>
        <h1 id="signup-title">Create your account</h1>
        <p>Bring your wedding plans and people into one shared space.</p>
      </div>
      <SignupForm />
      <p className="signup-terms">Already have an account? <a className="signup-inline-link" href="/sign-in">Sign in</a></p>
      <p className="signup-terms">By creating an account, you agree to use Make My Marriage for your wedding planning.</p>
    </section>
    <footer className="signup-footer">© 2026 Make My Marriage · Safe and private wedding coordination</footer>
  </main>;
}
