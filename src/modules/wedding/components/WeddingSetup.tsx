"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type CoverPreset = "palatial-arch" | "lotus-motif" | "marigold-modern" | "custom";

export type WeddingSummary = {
  id: string;
  brideName: string;
  groomName: string;
  title: string;
  weddingDate: string;
  location: string;
  coverImagePreset: CoverPreset;
  coverImageUrl?: string;
};

type SetupError = {
  code?: string;
  message?: string;
  field?: string;
};

type ApiResponse = {
  data?: WeddingSummary;
  error?: SetupError;
};

type UserSummary = { name: string; email: string };

const COVER_PRESETS: { id: Exclude<CoverPreset, "custom">; label: string }[] = [
  { id: "palatial-arch", label: "Palatial Arch" },
  { id: "lotus-motif", label: "Lotus Motif" },
  { id: "marigold-modern", label: "Marigold Modern" },
];

function Icon({ name, size = 18 }: { name: "person" | "calendar" | "pin" | "shield" | "spark" | "arrow" | "check" | "logout" | "chevron" | "lock" | "upload"; size?: number }) {
  const paths: Record<string, ReactNode> = {
    person: <><circle cx="12" cy="8" r="3.3" /><path d="M5.5 20c.5-3.4 2.7-5.2 6.5-5.2s6 1.8 6.5 5.2" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4M16.5 3v4M3.5 10h17M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    shield: <><path d="M12 3 19 6v5.1c0 4.7-3 8-7 9.9-4-1.9-7-5.2-7-9.9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
    arrow: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
    check: <path d="m5 12 4.3 4.3L19 6.8" />,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    lock: <><rect x="4.5" y="10" width="15" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></>,
  upload: <><path d="M12 16V4m-4 4 4-4 4 4" /><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></>,
  };

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function defaultTitle(bride: string, groom: string) {
  const names = [bride.trim(), groom.trim()].filter(Boolean);
  return (names.length === 2 ? `${names[0]} & ${names[1]}'s Wedding` : names[0] ? `${names[0]}'s Wedding` : "").slice(0, 160);
}

function formatDate(date: string) {
  if (!date) return "Date not set";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00.000Z`));
}

function ProfileMark({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "M";
  return <span className="wedding-profile-mark" aria-label={`Signed in as ${name}`}>{initials}</span>;
}

function PageHeader({ user, onSignOut, signingOut }: { user: UserSummary; onSignOut: () => void; signingOut: boolean }) {
  return <header className="wedding-setup-header">
    <div className="wedding-setup-header-inner">
      <Link className="wedding-brand" href="/" aria-label="Make My Marriage home">
        <span className="wedding-brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M8.2 7.1h-1a4.9 4.9 0 0 0 0 9.8h1.5c2.1 0 3.7-1.3 5.3-4.9 1.6-3.6 3.2-4.9 5.3-4.9h.5a4.9 4.9 0 0 1 0 9.8h-1" /></svg></span>
        <span className="wedding-brand-copy"><strong>Make My Marriage</strong><small>WEDDING COORDINATION</small></span>
      </Link>
      <div className="wedding-header-actions">
        <span className="wedding-session-badge"><Icon name="shield" size={16} /> Setup session</span>
        <button className="wedding-signout" type="button" onClick={onSignOut} disabled={signingOut}>
          <Icon name="logout" size={16} /> {signingOut ? "Signing out…" : "Sign out"}
        </button>
        <ProfileMark name={user.name} />
      </div>
    </div>
  </header>;
}

function CoverArtwork({ preset, customPreview }: { preset: CoverPreset; customPreview?: string | null }) {
  if (preset === "custom" && customPreview) return <span className="wedding-cover-art wedding-cover-art-custom" style={{ backgroundImage: `url(${customPreview})` }} />;
  return <span className={`wedding-cover-art wedding-cover-art-${preset}`} aria-hidden="true"><span /></span>;
}

export default function WeddingSetup({ user, existingWedding, membershipUnavailable }: {
  user: UserSummary;
  existingWedding: WeddingSummary | null;
  membershipUnavailable: boolean;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [locationText, setLocationText] = useState("");
  const [title, setTitle] = useState("");
  const [titleWasEdited, setTitleWasEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [coverPreset, setCoverPreset] = useState<CoverPreset>("palatial-arch");
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [customPreview, setCustomPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [showInviteInfo, setShowInviteInfo] = useState(false);
  const [pending, setPending] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [createdWedding, setCreatedWedding] = useState<WeddingSummary | null>(null);

  useEffect(() => {
    if (!customImage) {
      setCustomPreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(customImage);
    setCustomPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [customImage]);

  function updateBrideName(value: string) {
    setBrideName(value);
    if (!titleWasEdited) setTitle(defaultTitle(value, groomName));
    setFieldErrors((current) => ({ ...current, brideName: "" }));
  }

  function updateGroomName(value: string) {
    setGroomName(value);
    if (!titleWasEdited) setTitle(defaultTitle(brideName, value));
    setFieldErrors((current) => ({ ...current, groomName: "" }));
  }

  function updateCustomImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose a cover image smaller than 5 MB.");
      event.currentTarget.value = "";
      return;
    }
    setError("");
    setCustomImage(file);
    setCoverPreset("custom");
    setFieldErrors((current) => ({ ...current, coverImagePreset: "" }));
  }

  function selectPreset(preset: CoverPreset) {
    setCoverPreset(preset);
    if (preset !== "custom") setCustomImage(null);
    if (preset !== "custom") setError("");
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", cache: "no-store" });
    } catch {
      // Clear local navigation even if the session endpoint cannot be reached.
    } finally {
      router.replace("/sign-in");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const nextErrors: Record<string, string> = {};
    if (!brideName.trim()) nextErrors.brideName = "Enter the bride’s name.";
    if (!groomName.trim()) nextErrors.groomName = "Enter the groom’s name.";
    if (!weddingDate) nextErrors.weddingDate = "Choose the wedding date.";
    if (!locationText.trim()) nextErrors.location = "Enter the wedding city or location.";
    if (coverPreset === "custom" && !customImage) nextErrors.coverImagePreset = "Choose a cover image file.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setError("A few details need your attention before we can create the workspace.");
      return;
    }

    const locationParts = locationText.split(",").map((part) => part.trim()).filter(Boolean);
    const city = locationParts[0] ?? locationText.trim();
    const location = {
      formattedAddress: locationText.trim(),
      city,
      ...(locationParts.length > 2 ? { state: locationParts.slice(1, -1).join(","), country: locationParts.at(-1) } : {}),
      ...(locationParts.length === 2 ? { state: locationParts[1] } : {}),
    };

    const form = new FormData();
    form.set("brideName", brideName.trim());
    form.set("groomName", groomName.trim());
    form.set("title", title.trim() || defaultTitle(brideName, groomName));
    form.set("description", description.trim());
    form.set("weddingDate", weddingDate);
    form.set("timeZone", "Asia/Kolkata");
    form.set("location", JSON.stringify(location));
    form.set("coverImagePreset", coverPreset);
    if (coverPreset === "custom" && customImage) form.set("coverFile", customImage);

    setPending(true);
    try {
      const response = await fetch("/api/wedding", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        body: form,
      });
      const payload = await response.json().catch(() => ({})) as ApiResponse;
      if (!response.ok) {
        if (payload.error?.code === "ALREADY_HAS_WEDDING") {
          router.replace("/dashboard");
          return;
        }
        const field = payload.error?.field;
        if (field) setFieldErrors((current) => ({ ...current, [field]: payload.error?.message ?? "Check this field." }));
        setError(payload.error?.message ?? "Your wedding workspace could not be created. Please try again.");
        return;
      }
      if (!payload.data) {
        setError("Your wedding was saved, but we could not load its confirmation. Refresh the page to continue.");
        return;
      }
      setCreatedWedding(payload.data);
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return <div className="wedding-setup-page">
    <PageHeader user={user} onSignOut={signOut} signingOut={signingOut} />
    <main className="wedding-setup-main">
      {!createdWedding && !existingWedding && !membershipUnavailable && <div className="wedding-setup-note">
        <span><Icon name="person" size={19} /> Joining an existing celebration instead?</span>
        <button className="wedding-invite-link" type="button" aria-expanded={showInviteInfo} onClick={() => setShowInviteInfo((visible) => !visible)}>I have an invitation link <Icon name="arrow" size={15} /></button>
      </div>}
      {showInviteInfo && !membershipUnavailable && <p className="wedding-invite-info" role="status">Invitation acceptance is planned with wedding member management. You can create a new wedding workspace below.</p>}

      {createdWedding ? <section className="wedding-state-card wedding-success-card" aria-labelledby="wedding-success-title" role="status">
        <span className="wedding-success-mark"><Icon name="check" size={32} /></span>
        <span className="wedding-eyebrow">WEDDING WORKSPACE CREATED</span>
        <h1 id="wedding-success-title">You’re ready to plan together</h1>
        <p className="wedding-state-copy">Your wedding details are saved. Your workspace is ready, and more planning tools are on the way.</p>
        <div className="wedding-preview-card">
          <div className="wedding-preview-cover"><CoverArtwork preset={createdWedding.coverImagePreset} customPreview={customPreview} /><div className="wedding-preview-cover-overlay"><strong>{createdWedding.title}</strong><span>WEDDING WORKSPACE</span></div></div>
          <div className="wedding-preview-meta">
            <div><span>Date</span><strong><Icon name="calendar" size={15} />{formatDate(createdWedding.weddingDate)}</strong></div>
            <div><span>Location</span><strong><Icon name="pin" size={15} />{createdWedding.location}</strong></div>
            <div><span>Time zone</span><strong>IST (UTC+5:30)</strong></div>
          </div>
        </div>
        <button className="wedding-primary-button wedding-success-button" type="button" onClick={() => router.replace("/dashboard")}>
          Continue to your workspace <Icon name="arrow" size={19} />
        </button>
      </section> : existingWedding ? <section className="wedding-state-card wedding-existing-card" aria-labelledby="existing-wedding-title">
        <span className="wedding-success-mark"><Icon name="shield" size={30} /></span>
        <span className="wedding-eyebrow">WORKSPACE ALREADY SET UP</span>
        <h1 id="existing-wedding-title">You already belong to a wedding workspace</h1>
        <p className="wedding-state-copy">Your account is connected to this celebration. In V1, each account can belong to one wedding workspace.</p>
        <div className="wedding-existing-summary">
          <CoverArtwork preset={existingWedding.coverImagePreset} customPreview={existingWedding.coverImageUrl} />
          <div><strong>{existingWedding.title}</strong><span><Icon name="calendar" size={14} /> {formatDate(existingWedding.weddingDate)} <span aria-hidden="true">·</span> {existingWedding.location}</span></div>
          <small>{existingWedding.id ? "Wedding member" : ""}</small>
        </div>
        <button className="wedding-primary-button wedding-success-button" type="button" onClick={() => router.replace("/dashboard")}>
          Open your workspace <Icon name="arrow" size={19} />
        </button>
      </section> : membershipUnavailable ? <section className="wedding-state-card wedding-existing-card" aria-labelledby="unavailable-wedding-title" role="status">
        <span className="wedding-success-mark"><Icon name="shield" size={30} /></span>
        <span className="wedding-eyebrow">WORKSPACE UNAVAILABLE</span>
        <h1 id="unavailable-wedding-title">We couldn’t find your wedding workspace</h1>
        <p className="wedding-state-copy">Your account is still connected to a wedding membership, but that workspace is no longer available. Sign out from the header, or contact support if you think this is a mistake.</p>
      </section> : <section className="wedding-setup-card" aria-labelledby="wedding-setup-title">
        <header className="wedding-card-intro">
          <span className="wedding-eyebrow"><span className="wedding-eyebrow-icon"><Icon name="spark" size={14} /></span> STEP 1 OF 1 · WEDDING DETAILS</span>
          <h1 id="wedding-setup-title">Let’s set up your wedding</h1>
          <p>Create a shared space for the people, plans, and celebrations that make your wedding yours. More planning tools will be added to your workspace.</p>
        </header>

        <form className="wedding-setup-form" onSubmit={submit} noValidate>
          <section className="wedding-form-section" aria-labelledby="couple-section-title">
            <div className="wedding-section-label-row"><h2 id="couple-section-title">THE COUPLE</h2><span>Required</span></div>
            <div className="wedding-form-grid">
              <div className="wedding-field">
                <label htmlFor="bride-name">Bride’s full name <b aria-hidden="true">*</b></label>
                <div className={`wedding-input-wrap ${fieldErrors.brideName ? "has-error" : ""}`}><Icon name="person" /><input id="bride-name" name="brideName" autoComplete="off" placeholder="e.g. Priya Patel" maxLength={120} value={brideName} onChange={(event) => updateBrideName(event.target.value)} aria-invalid={Boolean(fieldErrors.brideName)} aria-describedby={fieldErrors.brideName ? "bride-error" : undefined} /></div>
                {fieldErrors.brideName && <small className="wedding-field-error" id="bride-error">{fieldErrors.brideName}</small>}
              </div>
              <div className="wedding-field">
                <label htmlFor="groom-name">Groom’s full name <b aria-hidden="true">*</b></label>
                <div className={`wedding-input-wrap ${fieldErrors.groomName ? "has-error" : ""}`}><Icon name="person" /><input id="groom-name" name="groomName" autoComplete="off" placeholder="e.g. Rohan Shah" maxLength={120} value={groomName} onChange={(event) => updateGroomName(event.target.value)} aria-invalid={Boolean(fieldErrors.groomName)} aria-describedby={fieldErrors.groomName ? "groom-error" : undefined} /></div>
                {fieldErrors.groomName && <small className="wedding-field-error" id="groom-error">{fieldErrors.groomName}</small>}
              </div>
              <div className="wedding-field">
                <label htmlFor="wedding-date">Primary celebration date <b aria-hidden="true">*</b></label>
                <div className={`wedding-input-wrap ${fieldErrors.weddingDate ? "has-error" : ""}`}><Icon name="calendar" /><input id="wedding-date" name="weddingDate" type="date" value={weddingDate} onChange={(event) => { setWeddingDate(event.target.value); setFieldErrors((current) => ({ ...current, weddingDate: "" })); }} aria-invalid={Boolean(fieldErrors.weddingDate)} aria-describedby="wedding-date-hint" /></div>
                {fieldErrors.weddingDate ? <small className="wedding-field-error">{fieldErrors.weddingDate}</small> : <small className="wedding-field-hint" id="wedding-date-hint">Haldi, Mehendi, Sangeet, and other events can be added later.</small>}
              </div>
              <div className="wedding-field">
                <div className="wedding-label-with-chip"><label htmlFor="wedding-location">Wedding city or location <b aria-hidden="true">*</b></label><span className="wedding-timezone-chip">◷ IST (UTC+5:30)</span></div>
                <div className={`wedding-input-wrap ${fieldErrors.location ? "has-error" : ""}`}><Icon name="pin" /><input id="wedding-location" name="location" autoComplete="address-level2" placeholder="e.g. Udaipur, Rajasthan, India" maxLength={300} value={locationText} onChange={(event) => { setLocationText(event.target.value); setFieldErrors((current) => ({ ...current, location: "" })); }} aria-invalid={Boolean(fieldErrors.location)} aria-describedby={fieldErrors.location ? "location-error" : undefined} /></div>
                {fieldErrors.location ? <small className="wedding-field-error" id="location-error">{fieldErrors.location}</small> : <small className="wedding-field-hint">You can add venue names and street addresses to each event.</small>}
              </div>
            </div>
          </section>

          <details className="wedding-optional-details" open>
            <summary><span className="wedding-optional-title"><span className="wedding-optional-icon">☷</span><span><strong>Workspace details</strong><small>Optional · Add a title, welcome note, and cover</small></span></span><Icon name="chevron" /></summary>
            <div className="wedding-optional-body">
              <div className="wedding-field">
                <div className="wedding-field-heading"><label htmlFor="wedding-title">Workspace title</label><span>Suggested from your names</span></div>
                <input className="wedding-text-input" id="wedding-title" name="title" maxLength={160} placeholder="e.g. Priya & Rohan’s Wedding" value={title} onChange={(event) => { setTitleWasEdited(true); setTitle(event.target.value); }} />
              </div>
              <div className="wedding-field">
                <label htmlFor="wedding-description">Family welcome note</label>
                <textarea className="wedding-text-input wedding-description-input" id="wedding-description" name="description" maxLength={1000} placeholder="Share a short note with the family helping plan your celebration." value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
              <div className="wedding-field">
                <div className="wedding-field-heading"><span className="wedding-field-title">Cover image</span><span>Optional · You can change this later</span></div>
                <div className="wedding-cover-options" role="group" aria-label="Choose a wedding cover">
                  {COVER_PRESETS.map((preset) => <button className={`wedding-cover-option ${coverPreset === preset.id ? "is-selected" : ""}`} type="button" aria-pressed={coverPreset === preset.id} key={preset.id} onClick={() => selectPreset(preset.id)}>
                    <CoverArtwork preset={preset.id} />
                    <span>{preset.label}</span>
                    {coverPreset === preset.id && <span className="wedding-cover-selected"><Icon name="check" size={12} /></span>}
                  </button>)}
                  <button className={`wedding-cover-option wedding-custom-cover ${coverPreset === "custom" ? "is-selected" : ""}`} type="button" aria-pressed={coverPreset === "custom"} onClick={() => { selectPreset("custom"); fileInput.current?.click(); }}>
                    <CoverArtwork preset="custom" customPreview={customPreview} />
                    <span>{customImage ? "Custom image" : "Upload image"}</span>
                    {coverPreset === "custom" && <span className="wedding-cover-selected"><Icon name="check" size={12} /></span>}
                  </button>
                  <input ref={fileInput} className="wedding-visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={updateCustomImage} aria-label="Upload a custom cover image" />
                </div>
                {fieldErrors.coverImagePreset && <small className="wedding-field-error">{fieldErrors.coverImagePreset}</small>}
              </div>
            </div>
          </details>

          <div className="wedding-admin-note"><span><Icon name="shield" size={20} /></span><p><strong>You’ll be the first wedding admin</strong><small>The account setting up the wedding becomes its first administrator.</small></p></div>
          {error && <p className="wedding-form-error" role="alert">{error}</p>}
          <button className="wedding-primary-button" type="submit" disabled={pending || signingOut}>
            {pending ? <><span className="wedding-spinner" aria-hidden="true" /> Creating your wedding workspace…</> : <>Create wedding workspace <Icon name="arrow" size={18} /></>}
          </button>
          <p className="wedding-form-footnote"><Icon name="lock" size={14} /> Wedding details are shared only with members of your workspace.</p>
        </form>
      </section>}

      <div className="wedding-setup-trust"><Icon name="lock" size={16} /><span>Your wedding details stay private to your workspace.</span></div>
    </main>
    <footer className="wedding-setup-footer"><span>Private wedding planning for your family</span><span>© 2026 Make My Marriage</span></footer>
  </div>;
}
