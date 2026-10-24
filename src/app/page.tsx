"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";

type IconName = "arrow" | "calendar" | "camera" | "check" | "chevron" | "clock" | "close" | "globe" | "guests" | "heart" | "home" | "map" | "menu" | "money" | "people" | "spark" | "tasks" | "vendors";

const iconContent: Record<IconName, ReactNode> = {
  arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 16 2 2 4-4" /></>,
  camera: <><path d="M14 5 15.5 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4.5L10 5z" /><circle cx="12" cy="13" r="3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  guests: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  heart: <path d="M20.8 8.7c0 5.5-8.8 11-8.8 11s-8.8-5.5-8.8-11A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" />,
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></>,
  map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  money: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><circle cx="12" cy="14" r="2" /></>,
  people: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 8v6M17 11h6" /></>,
  spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z" /></>,
  tasks: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" /></>,
  vendors: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M8 9h.01M12 9h.01M16 9h.01M8 12h.01M16 12h.01" /></>,
};

function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{iconContent[name]}</svg>;
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><Icon name="heart" size={17} /></span>;
}

const eventList = [
  { day: "FEB 11 · THU", name: "Mehendi Ceremony", venue: "Courtyard Lawn", guests: "85 Guests", tasks: "Tasks: 8 / 10 done", coordinator: "Sister Ananya", tone: "mint" },
  { day: "FEB 12 · FRI MORNING", name: "Haldi & Chooda", venue: "Poolside Pavilion", guests: "120 Guests", tasks: "12 / 12 Complete", coordinator: "Rajesh Uncle", tone: "gold" },
  { day: "FEB 12 · FRI NIGHT", name: "Sangeet & Cocktail", venue: "Grand Ballroom", guests: "280 Guests", tasks: "DJ & Choreo Set", coordinator: "Kabir & Priya", tone: "lilac" },
  { day: "FEB 13 · SAT", name: "Wedding Ceremony", venue: "Temple Lawn", guests: "350 Guests", tasks: "Mandap Ready", coordinator: "Aarav & Pandit Ji", tone: "peach" },
  { day: "FEB 14 · SUN", name: "Reception Dinner", venue: "Banquet Hall & Terrace", guests: "320 Guests", tasks: "Seating Finalized", coordinator: "Both Families", tone: "blue" },
];

const tabs = ["Events Overview", "Guest & RSVP Roster", "Expense Tracker", "Family Tasks", "Website & Photos"] as const;
type DashboardTab = (typeof tabs)[number];

function EventOverview() {
  return <div className="timeline-grid">{eventList.map((event) => <article className="mini-event" key={event.name}>
    <div className="mini-event-date"><span>{event.day}</span><i className={`event-dot ${event.tone}`} /></div>
    <strong>{event.name}</strong><span className="mini-venue">{event.venue}</span>
    <div className="mini-event-facts"><span><Icon name="guests" size={13} /> {event.guests}</span><span><Icon name="check" size={13} /> {event.tasks}</span></div>
    <span className="coordinator">Coord: {event.coordinator}</span>
  </article>)}</div>;
}

function GuestRoster() {
  return <div className="tab-panel roster-panel">
    <div className="tab-panel-heading"><div><span className="panel-label">GUEST LIST</span><h4>Invitations &amp; responses</h4></div><span className="small-status"><span /> RSVP summary</span></div>
    <div className="roster-table"><div className="roster-row roster-head"><span>GUEST</span><span>EVENTS INVITED TO</span><span>RESPONSE</span></div>
      <div className="roster-row"><strong>Mehta Family (4)</strong><span>Haldi, Sangeet, Phere</span><em className="status-yes">Attending · 4</em></div>
      <div className="roster-row"><strong>Rohan Sharma (2)</strong><span>Sangeet, Reception</span><em className="status-yes">Attending · 2</em></div>
      <div className="roster-row"><strong>Neha Kapoor (3)</strong><span>Phere, Reception</span><em className="status-pending">Pending</em></div>
    </div>
  </div>;
}

function ExpenseTracker() {
  return <div className="tab-panel expense-panel">
    <div className="tab-panel-heading"><div><span className="panel-label">EXPENSES RECORDED</span><h4>Recent wedding expenses</h4></div><strong className="expense-total">₹12,45,000 <small>recorded</small></strong></div>
    <div className="expense-list"><div><span className="expense-icon"><Icon name="home" size={15} /></span><strong>Courtyard venue advance</strong><span>Venue · Mehendi</span><b>₹4,50,000</b></div><div><span className="expense-icon"><Icon name="vendors" size={15} /></span><strong>Floral decoration</strong><span>Decor · Sangeet</span><b>₹2,15,000</b></div><div><span className="expense-icon"><Icon name="camera" size={15} /></span><strong>Wedding photography</strong><span>Photography · Wedding</span><b>₹1,80,000</b></div></div>
  </div>;
}

function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("Events Overview");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTabIndex = tabs.indexOf(activeTab);
  const [completed, setCompleted] = useState([false, true, false]);
  const taskItems = [
    { title: "Coordinate Pandit Ji travel & muhurat timing", meta: "Vedic Ceremony · Due in 3 days", owner: "Father Rajesh" },
    { title: "Review choreo song playlist for Sangeet", meta: "Sangeet & Cocktail · Completed yesterday", owner: "Kabir & Cousins" },
    { title: "Finalize RSVP list for Haldi headcounts", meta: "Haldi & Chooda · In progress", owner: "Mother Sunita" },
  ];

  function toggleTask(index: number) {
    setCompleted((current) => current.map((value, taskIndex) => taskIndex === index ? !value : value));
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const nextIndex = event.key === "ArrowRight" ? (index + 1) % tabs.length
      : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length
      : event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : -1;

    if (nextIndex >= 0) {
      event.preventDefault();
      setActiveTab(tabs[nextIndex]);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  return <div className="dashboard-shell" id="workspace-preview" aria-label="Interactive sample wedding workspace">
    <div className="dashboard-window-bar"><div className="window-dots"><i /><i /><i /></div><span className="window-title">Priya &amp; Aarav&apos;s Workspace</span><span className="workspace-badge"><i /> Sample workspace</span></div>
    <div className="workspace-summary-bar"><span>Wedding workspace</span><b>February 11–14, 2027 <i>·</i> Jaipur, Rajasthan</b><div className="avatar-stack" aria-label="5 family planners"><span>PK</span><span>AM</span><span>RS</span><span>+2</span><small>Family planners</small></div></div>
    <div className="dashboard-tabs" role="tablist" aria-label="Workspace preview sections">
      {tabs.map((tab, index) => <button ref={(element) => { tabRefs.current[index] = element; }} className={activeTab === tab ? "active" : ""} type="button" role="tab" id={`workspace-tab-${index}`} aria-controls="workspace-tabpanel" aria-selected={activeTab === tab} tabIndex={activeTab === tab ? 0 : -1} key={tab} onClick={() => setActiveTab(tab)} onKeyDown={(event) => handleTabKeyDown(event, index)}><Icon name={(["calendar", "guests", "money", "tasks", "globe"] as IconName[])[index]} size={14} />{tab}</button>)}
    </div>
    <div className="dashboard-inside">
      <div className="dashboard-stats">
        <article className="dashboard-stat"><div><span>Confirmed headcount</span><Icon name="people" size={17} /></div><strong>312 <small>/ 350 invited</small></strong><span className="stat-foot">Guests attending across your events</span></article>
        <article className="dashboard-stat"><div><span>RSVP responses</span><Icon name="guests" size={17} /></div><strong>210 <small>responses</small></strong><span className="stat-foot">Collected from invited guests</span></article>
        <article className="dashboard-stat"><div><span>Family coordination</span><Icon name="check" size={17} /></div><strong>38 of 46 <small>tasks complete</small></strong><span className="stat-progress"><i /></span></article>
        <article className="dashboard-stat"><div><span>Expenses recorded</span><Icon name="money" size={17} /></div><strong>₹12,45,000</strong><span className="stat-foot">Across 18 expenses</span></article>
      </div>

      <div id="workspace-tabpanel" role="tabpanel" aria-labelledby={`workspace-tab-${activeTabIndex}`} tabIndex={0}>
        <div className="overview-heading"><h3>{activeTab === "Events Overview" ? "Multi-day celebration timeline" : activeTab}</h3><span>{activeTab === "Events Overview" ? "5 events scheduled" : "Sample workspace preview"}</span></div>
        {activeTab === "Events Overview" && <EventOverview />}
        {activeTab === "Guest & RSVP Roster" && <GuestRoster />}
        {activeTab === "Expense Tracker" && <ExpenseTracker />}
        {activeTab === "Family Tasks" && <div className="task-tab-panel">{taskItems.map((task, index) => <button className={`task-tab-row ${completed[index] ? "is-complete" : ""}`} type="button" key={task.title} onClick={() => toggleTask(index)}><span className="task-toggle"><Icon name="check" size={13} /></span><span className="task-tab-copy"><strong>{task.title}</strong><small>{task.meta}</small></span><span className="task-owner">{task.owner}</span></button>)}</div>}
        {activeTab === "Website & Photos" && <div className="site-tab-panel"><div className="site-preview-icon"><Icon name="globe" size={21} /></div><div><span className="panel-label">WEDDING WEBSITE</span><h4>Priya &amp; Aarav&apos;s celebration</h4><p>Event details, a YouTube livestream link, and a private photo gallery in one place.</p><span className="site-preview-url">makemymarriage.com/w/priya-aarav</span></div><div className="site-preview-actions"><span><Icon name="camera" size={14} /> Private gallery</span><span><Icon name="globe" size={14} /> Guest website</span></div></div>}
      </div>
      <div className="dashboard-bottom">
        <section className="action-list-panel">
          <div className="bottom-panel-heading"><strong>Family action items</strong><button type="button" onClick={() => setActiveTab("Family Tasks")}>View tasks <Icon name="arrow" size={13} /></button></div>
          {taskItems.slice(0, 2).map((task, index) => <button className={`action-task ${completed[index] ? "completed" : ""}`} type="button" key={task.title} onClick={() => toggleTask(index)}><span className="action-check"><Icon name="check" size={13} /></span><span><strong>{task.title}</strong><small>{task.meta}</small></span><em>{task.owner}</em></button>)}
        </section>
        <section className="guest-access-card">
          <div className="guest-access-label"><Icon name="globe" size={14} /> Guest digital card</div>
          <h4>Instant guest view</h4>
          <p>Guests open their private celebration page on any phone browser. No account or app needed.</p>
          <ul><li><Icon name="check" size={13} /> Direct RSVP form</li><li><Icon name="check" size={13} /> Map pin &amp; venue directions</li><li><Icon name="check" size={13} /> Direct photo uploads</li></ul>
          <a href="#guest-access">makemymarriage.com/w/priya-aarav <Icon name="arrow" size={12} /></a>
        </section>
      </div>
    </div>
  </div>;
}

function Capabilities() {
  return <section className="capabilities-section" id="capabilities">
    <div className="capabilities-heading"><span>MADE FOR THE WHOLE CELEBRATION</span><h2>Everything your family needs.<br />One workspace.</h2><p>Multi-day, multi-event coordination without chaotic group chats.</p></div>
    <div className="capability-grid">
      <article className="capability-card"><div className="capability-top"><span className="capability-icon family"><Icon name="people" size={22} /></span><span className="capability-tag">Events &amp; tasks</span></div><h3>Plan together: events, tasks, family</h3><p>Share ceremony details and give everyone a clear next step.</p><div className="capability-sample sample-event"><span className="sample-icon"><Icon name="calendar" size={16} /></span><span><strong>Haldi Ceremony</strong><small>Friday, Feb 12 · Poolside Pavilion</small></span><b>In progress</b></div><div className="capability-meta"><span>Assigned to Kabir</span><span><Icon name="check" size={13} /> Shared task list</span></div></article>
      <article className="capability-card"><div className="capability-top"><span className="capability-icon guests"><Icon name="guests" size={22} /></span><span className="capability-tag">Guests &amp; planning</span></div><h3>Manage guests, expenses, and vendors</h3><p>Keep RSVP responses, recorded expenses, and vendor details close at hand.</p><div className="capability-sample sample-roster"><div className="sample-roster-row"><span className="sample-person">M</span><strong>Mehta Family (4)</strong><span className="mini-chip">Attending</span></div><div className="sample-roster-row"><span className="sample-person lavender">R</span><strong>Rohan Sharma (2)</strong><span className="mini-chip">RSVP saved</span></div><div className="sample-roster-footer"><span>Expense tracker</span><strong>₹8,400 recorded today</strong></div></div><div className="capability-meta"><span>Guest list · Expenses · Vendors</span><span><Icon name="check" size={13} /> Wedding overview</span></div></article>
      <article className="capability-card"><div className="capability-top"><span className="capability-icon share"><Icon name="globe" size={22} /></span><span className="capability-tag">Guest hub</span></div><h3>Share the celebration: website, stream, photos</h3><p>One destination for event details, a YouTube link, and wedding memories.</p><div className="capability-sample sample-guest"><span className="sample-photo"><Icon name="camera" size={17} /></span><span><strong>Private photo gallery</strong><small>Guests can add photos from their phones</small></span><span className="sample-check"><Icon name="check" size={13} /></span></div><div className="capability-meta"><span>Wedding website · YouTube livestream</span><span><Icon name="check" size={13} /> Guest access links</span></div></article>
    </div>
  </section>;
}

function Steps() {
  return <section className="steps-section" id="how-it-works">
    <div className="steps-heading"><span>HOW IT WORKS</span><h2>Three simple steps to calmer wedding planning</h2><p>Designed for families to get started without spreadsheets or lost updates.</p></div>
    <div className="steps-grid">
      <article className="step-card"><span className="step-number">1</span><span className="step-icon"><Icon name="calendar" size={19} /></span><span className="step-tag">Wedding workspace</span><h3>Create your workspace</h3><p>Add your celebration dates, location, and the events you are planning.</p><div className="step-foot"><Icon name="check" size={13} /> Your multi-event schedule starts here</div></article>
      <article className="step-card"><span className="step-number">2</span><span className="step-icon lavender"><Icon name="people" size={19} /></span><span className="step-tag">Invite your people</span><h3>Bring family together</h3><p>Invite parents, siblings, and trusted friends to help organize.</p><div className="step-foot"><Icon name="check" size={13} /> Admin and Manager roles</div></article>
      <article className="step-card"><span className="step-number">3</span><span className="step-icon peach"><Icon name="spark" size={19} /></span><span className="step-tag">Keep plans together</span><h3>Plan one detail at a time</h3><p>Keep guests, vendors, expenses, and the next steps in view.</p><div className="step-foot"><Icon name="check" size={13} /> A shared family workspace</div></article>
    </div>
  </section>;
}

function GuestExperience() {
  const [rsvp, setRsvp] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [fileMessage, setFileMessage] = useState("");

  function handlePhotoSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    const count = files?.length ?? 0;
    setPhotoCount(count);
    setFileMessage(count === 1 ? "1 photo selected · preview only" : count > 1 ? `${count} photos selected · preview only` : "");
  }

  return <section className="guest-section" id="guest-access">
    <div className="guest-section-copy"><span className="guest-eyebrow"><Icon name="heart" size={14} /> MADE FOR YOUR GUESTS</span><h2>Easy access for every guest.</h2><p>Guests can RSVP, find event details, and share wedding photos from a private link—without creating an account or installing an app.</p>
      <div className="guest-benefit-list"><div><span><Icon name="check" size={13} /></span><strong>RSVP from a private invitation link</strong></div><div><span><Icon name="check" size={13} /></span><strong>Get directions and view event details</strong></div><div><span><Icon name="check" size={13} /></span><strong>Share photos from a phone</strong></div></div>
      <div className="guest-mini-note"><span className="note-mark"><Icon name="globe" size={15} /></span><span><strong>No guest account needed</strong><small>Open the invitation directly in a browser.</small></span></div>
    </div>
    <div className="guest-preview-area"><div className="guest-card">
      <div className="guest-card-top"><span className="guest-mini-logo"><BrandMark /></span><span className="guest-card-brand">PRIYA &amp; AARAV</span><span className="guest-link-badge">Guest link</span></div>
      <div className="guest-event-card"><div className="guest-event-head"><span className="event-kicker">MAIN CEREMONY</span>{rsvp && <span className="rsvp-confirmed">Preview only</span>}</div><h3>Vedic Phere &amp; Lunch</h3><p>Saturday, February 13 · 10:30 AM</p><div className="guest-card-buttons"><a href="https://maps.google.com/?q=Jaipur+Rajasthan" target="_blank" rel="noreferrer"><Icon name="map" size={13} /> Directions</a><button type="button" aria-pressed={rsvp} onClick={() => setRsvp((current) => !current)}><Icon name="check" size={13} />{rsvp ? "Preview selected" : "Preview RSVP"}</button></div></div>
      <div className="guest-upload-box"><Icon name="camera" size={18} /><strong>Share your photos from the Sangeet</strong><span>{fileMessage || "Choose photos to preview selection"}</span><label className="upload-button">{photoCount ? "Choose more" : "Choose photos"}<Icon name="arrow" size={13} /><input type="file" accept="image/*" multiple onChange={handlePhotoSelect} aria-label="Choose wedding photos (preview only)" /></label><small className="guest-preview-only">Preview only · photos are not uploaded</small></div>
      <div className="guest-card-footer"><span><Icon name="heart" size={12} /> A private link for your guests</span><span>Wedding details</span></div>
    </div><div className="guest-preview-caption"><span><Icon name="check" size={13} /></span> Designed for a phone browser</div></div>
  </section>;
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  return <main className="site-shell" id="top">
    <header className="site-header"><div className="header-inner">
      <a className="brand" href="#top" aria-label="Make My Marriage home"><BrandMark /><span>Make My Marriage</span></a>
      <nav className="desktop-nav" aria-label="Main navigation"><a href="#capabilities">Features</a><a href="#how-it-works">How it works</a><a href="#capabilities">Capabilities</a><a href="#guest-access">Guest access</a></nav>
      <div className="header-actions"><a className="signin-link" href="/sign-in">Sign in</a><a className="button button-primary header-cta" href="/create-account">Create account <Icon name="arrow" size={14} /></a><span className="header-avatar" aria-hidden="true"><Icon name="people" size={15} /></span></div>
      <button className={`mobile-nav-toggle ${mobileMenuOpen ? "is-open" : ""}`} type="button" aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} onClick={() => setMobileMenuOpen((open) => !open)}><Icon name={mobileMenuOpen ? "close" : "menu"} size={19} /></button>
    </div>{mobileMenuOpen && <nav className="mobile-nav" aria-label="Mobile navigation"><a href="#capabilities" onClick={closeMenu}>Features</a><a href="#how-it-works" onClick={closeMenu}>How it works</a><a href="#guest-access" onClick={closeMenu}>Guest access</a><a href="/sign-in">Sign in</a><a className="mobile-signup-link" href="/create-account">Create account <Icon name="arrow" size={14} /></a></nav>}</header>

    <section className="hero-section">
      <div className="hero-copy"><span className="hero-kicker"><i /> Shared wedding workspace for families <b>·</b> Built for multi-event celebrations</span><h1>Bring your wedding plans together.</h1><p>One shared workspace for couples and families.</p><div className="hero-actions"><a className="button button-primary" href="/create-account">Create your account <Icon name="arrow" size={15} /></a><a className="button button-outline" href="/sign-in">Sign in</a></div><div className="hero-notes"><span><Icon name="check" size={13} /> Designed for wedding members</span><i /><span>Guests can take part without accounts</span></div></div>
      <div className="hero-dashboard-wrap"><DashboardPreview /><p className="preview-disclaimer">Illustrative workspace interface, customized for a multi-event celebration.</p></div>
    </section>

    <Capabilities />
    <Steps />
    <GuestExperience />

    <section className="closing-cta"><div className="cta-inner"><span className="cta-overline">ONE SHARED WORKSPACE FOR COUPLES AND FAMILIES</span><h2>Bring your wedding plans together today.</h2><p>Keep the details, people, and celebrations in one place.</p><div className="cta-actions"><a className="button button-primary" href="/create-account">Create your account <Icon name="arrow" size={15} /></a><a className="button button-dark-outline" href="/sign-in">Sign in</a></div><span className="cta-foot"><Icon name="check" size={13} /> Works in your browser</span></div></section>

    <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><a className="brand" href="#top"><BrandMark /><span>Make My Marriage</span></a><p>One shared workspace to bring your wedding plans together.</p></div><nav aria-label="Footer navigation"><a href="#capabilities">Features</a><a href="#how-it-works">How it works</a><a href="/sign-in">Sign in</a><a className="footer-cta" href="/create-account">Create account</a></nav></div><div className="footer-bottom"><span>© 2026 Make My Marriage. All rights reserved.</span><span>Made for celebrations that bring families together.</span></div></footer>
  </main>;
}
