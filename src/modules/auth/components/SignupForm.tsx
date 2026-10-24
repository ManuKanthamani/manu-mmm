"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type SignupResponse = {
  data?: { user?: { name?: string; email?: string } };
  error?: { message?: string };
};

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  const passwordRules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "At least one number", valid: /[0-9]/.test(password) },
    { label: "At least one symbol", valid: /[^A-Za-z0-9\s]/.test(password) },
    { label: "No more than 72 UTF-8 bytes", valid: password.length > 0 && new TextEncoder().encode(password).length <= 72 },
  ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (passwordRules.some((rule) => !rule.valid)) {
      setError("Your password must meet all requirements before you continue.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ name, email, password }),
      });
      const payload = await response.json().catch(() => ({})) as SignupResponse;
      if (!response.ok) {
        setError(payload.error?.message ?? "Account creation failed. Please try again.");
        return;
      }
      setCreated(true);
      router.replace("/wedding-setup");
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (created) {
    return <div className="signup-success" role="status" aria-live="polite">
      <span className="signup-success-icon" aria-hidden="true">✓</span>
      <h2>Your account is ready, {name.split(" ")[0]}.</h2>
      <p>We’ve created your account for <strong>{email}</strong>.</p>
      <a className="signup-button" href="/">Return to homepage</a>
    </div>;
  }

  return <form className="signup-form" onSubmit={submit}>
    <label htmlFor="signup-name">Full name</label>
    <input id="signup-name" name="name" type="text" autoComplete="name" placeholder="e.g. Priya Patel" maxLength={120} required value={name} onChange={(event) => setName(event.target.value)} />

    <label htmlFor="signup-email">Email address</label>
    <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} />

    <div className="signup-password-label"><label htmlFor="signup-password">Password</label><button type="button" className="signup-show-password" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button></div>
    <input id="signup-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" maxLength={72} required value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="signup-password-rules" />
    <ul className="signup-password-rules" id="signup-password-rules" aria-label="Password requirements">
      {passwordRules.map((rule) => <li className={rule.valid ? "is-valid" : ""} key={rule.label}><span aria-hidden="true">{rule.valid ? "✓" : "○"}</span>{rule.label}</li>)}
    </ul>

    {error && <p className="signup-error" role="alert">{error}</p>}
    <button className="signup-button" type="submit" disabled={pending}>{pending ? "Creating your account…" : "Create account"}<span aria-hidden="true">→</span></button>
  </form>;
}
