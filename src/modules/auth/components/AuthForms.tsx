"use client";

import { useState, type FormEvent } from "react";

type AuthPayload = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
  data?: { user?: { name?: string; email?: string } };
};

async function postJson(path: string, body: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as AuthPayload;
  return { response, payload };
}

function PasswordInput({ id, label, value, onChange, autoComplete }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return <>
    <div className="signup-password-label"><label htmlFor={id}>{label}</label><button type="button" className="signup-show-password" aria-pressed={visible} onClick={() => setVisible((current) => !current)}>{visible ? "Hide" : "Show"}</button></div>
    <input id={id} name={id} type={visible ? "text" : "password"} autoComplete={autoComplete} required value={value} onChange={(event) => onChange(event.target.value)} />
  </>;
}

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [signedInName, setSignedInName] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const { response, payload } = await postJson("/api/auth/login", { email, password });
      if (!response.ok) {
        setError(payload.error?.message ?? "Sign in failed. Please try again.");
        return;
      }
      setSignedInName(payload.data?.user?.name ?? "your account");
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (signedInName) {
    return <div className="signup-success" role="status" aria-live="polite">
      <span className="signup-success-icon" aria-hidden="true">✓</span>
      <h2>Welcome back, {signedInName.split(" ")[0]}.</h2>
      <p>You’re signed in. Your wedding workspace is ready for the next step.</p>
      <a className="signup-button" href="/">Return to homepage</a>
    </div>;
  }

  return <form className="signup-form" onSubmit={submit}>
    <label htmlFor="signin-email">Email address</label>
    <input id="signin-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} />
    <PasswordInput id="signin-password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
    <div className="signup-form-links"><a href="/forgot-password">Forgot password?</a></div>
    {error && <p className="signup-error" role="alert">{error}</p>}
    <button className="signup-button" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}<span aria-hidden="true">→</span></button>
  </form>;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const { response, payload } = await postJson("/api/auth/forgot-password", { email });
      if (!response.ok) {
        setError(payload.error?.message ?? "Password recovery is temporarily unavailable. Please try again later.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return <div className="signup-success" role="status" aria-live="polite">
      <span className="signup-success-icon" aria-hidden="true">✓</span>
      <h2>Check your inbox</h2>
      <p>If an account uses <strong>{email}</strong>, a reset link will arrive shortly. Check your spam folder too.</p>
      <a className="signup-button" href="/sign-in">Return to sign in</a>
    </div>;
  }

  return <form className="signup-form" onSubmit={submit}>
    <label htmlFor="forgot-email">Email address</label>
    <input id="forgot-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} />
    {error && <p className="signup-error" role="alert">{error}</p>}
    <button className="signup-button" type="submit" disabled={pending}>{pending ? "Sending…" : "Send reset link"}<span aria-hidden="true">→</span></button>
  </form>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState(!token);
  const [updated, setUpdated] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8 || !/[0-9]/.test(password) || !/[^A-Za-z0-9\s]/.test(password) || new TextEncoder().encode(password).length > 72) {
      setError("Use at least 8 characters, a number, a symbol, and no more than 72 UTF-8 bytes.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Check both entries and try again.");
      return;
    }

    setPending(true);
    try {
      const { response, payload } = await postJson("/api/auth/reset-password", { token, password });
      if (!response.ok) {
        if (payload.error?.code === "INVALID_TOKEN") setInvalid(true);
        else setError(payload.error?.message ?? "Your password could not be updated. Please try again.");
        return;
      }
      setUpdated(true);
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (invalid) {
    return <div className="signup-reset-invalid" role="alert">
      <p>This reset link is invalid or has expired.</p>
      <a href="/forgot-password">Request a new link</a>
    </div>;
  }

  if (updated) {
    return <div className="signup-success" role="status" aria-live="polite">
      <span className="signup-success-icon" aria-hidden="true">✓</span>
      <h2>Password updated</h2>
      <p>Your password has been changed. Sign in with your new password.</p>
      <a className="signup-button" href="/sign-in">Go to sign in</a>
    </div>;
  }

  return <form className="signup-form" onSubmit={submit}>
    <PasswordInput id="reset-password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" />
    <PasswordInput id="reset-confirm-password" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
    {error && <p className="signup-error" role="alert">{error}</p>}
    <button className="signup-button" type="submit" disabled={pending}>{pending ? "Updating password…" : "Update password"}<span aria-hidden="true">→</span></button>
  </form>;
}
