import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, CheckCircle2, Clock, LogOut, MapPin, Phone, ShieldAlert, Star, X } from "lucide-react";
import { toast } from "sonner";
import {
  actions, elapsedMs, STATUS_LABEL, tradeLabel, useStore,
  type Booking, type Role, type Worker,
} from "@/lib/store";
import { approvedExtras, billableMinutes, estimateLabour, finalLabour, fmtDuration, inr, runningCost } from "@/lib/pricing";

export function Wordmark({ small }: { small?: boolean }) {
  return (
    <span className={`font-extrabold tracking-tight text-ink ${small ? "text-lg" : "text-2xl"}`}>
      KART<span className="text-accent">A</span>VYA
      <span className="ml-0.5 inline-block h-2 w-2 rounded-full bg-accent align-baseline" />
    </span>
  );
}

export function DemoBadge() {
  return <span className="k-chip k-chip-warn">Demo data</span>;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useNow(active = true, ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return now;
}

const NAV: Record<Role, { to: string; label: string }[]> = {
  customer: [
    { to: "/customer", label: "Home" },
    { to: "/customer/find", label: "Find Professionals" },
    { to: "/customer/bookings", label: "My Bookings" },
    { to: "/customer/safety", label: "Safety" },
    { to: "/customer/profile", label: "Profile" },
  ],
  professional: [
    { to: "/pro", label: "Dashboard" },
    { to: "/pro/jobs", label: "Find Jobs" },
    { to: "/pro/work", label: "My Work" },
    { to: "/pro/earnings", label: "Earnings" },
    { to: "/pro/passport", label: "Work Passport" },
    { to: "/pro/safety", label: "Safety" },
  ],
  employer: [
    { to: "/employer", label: "Dashboard" },
    { to: "/employer/candidates", label: "Find Candidates" },
    { to: "/employer/post", label: "Post Jobs" },
    { to: "/employer/applications", label: "Applications" },
    { to: "/employer/company", label: "Company Profile" },
  ],
};

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useStore((s) => s.session);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const notices = useStore((s) => s.notices.filter((n) => n.role === role || n.role === "all"));
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);

  useEffect(() => {
    if (hydrated && (!session || session.role !== role)) navigate({ to: "/login", search: { role } });
  }, [hydrated, session, role, navigate]);

  if (!hydrated || !session || session.role !== role) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading your dashboard…</div>;
  }
  const unread = Math.max(0, notices.length - seen);

  return (
    <div className="min-h-screen bg-sky">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/"><Wordmark small /></Link>
          <span className="k-chip hidden sm:inline-flex">
            {role === "customer" ? "Customer" : role === "professional" ? "Professional" : "Employer"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground md:inline">{session.name}</span>
            <div className="relative">
              <button aria-label="Notifications" className="k-btn k-btn-ghost relative px-2.5" onClick={() => { setOpen(!open); setSeen(notices.length); }}>
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute right-1 top-1 h-4 min-w-4 rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{unread}</span>}
              </button>
              {open && (
                <div className="k-card k-fade absolute right-0 mt-2 max-h-96 w-80 overflow-auto p-3">
                  <div className="mb-2 flex items-center justify-between"><b className="text-sm">Notifications</b><button aria-label="Close" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button></div>
                  {notices.length === 0 && <p className="text-sm text-muted-foreground">No notifications yet.</p>}
                  {notices.slice(0, 20).map((n) => (
                    <div key={n.id} className="border-t py-2 text-sm first:border-0">{n.text}<div className="text-xs text-muted-foreground">{new Date(n.at).toLocaleString()}</div></div>
                  ))}
                </div>
              )}
            </div>
            <button className="k-btn k-btn-ghost px-2.5" aria-label="Log out" onClick={() => { actions.logout(); navigate({ to: "/" }); }}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV[role].map((n) => {
            const active = path === n.to;
            return (
              <Link key={n.to} to={n.to} className={`rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-sky hover:text-foreground"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 k-fade" key={path}>{children}</main>
      <footer className="pb-8 text-center text-xs text-muted-foreground">KARTAVYA prototype · all people, prices and alerts are demonstration data · saved in this browser only</footer>
    </div>
  );
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">{children}</div>;
}

export function Avatar({ name }: { name: string }) {
  const init = name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  return <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">{init}</div>;
}

export function StageChip({ w }: { w: Worker }) {
  if (w.stage === "student") return <span className="k-chip k-chip-warn">ITI student · supervised only</span>;
  if (w.stage === "graduate") return <span className="k-chip">ITI graduate</span>;
  return <span className="k-chip">Experienced</span>;
}

export function QualList({ w }: { w: Worker }) {
  return (
    <ul className="space-y-1 text-sm">
      {w.qualifications.map((q) => (
        <li key={q.label} className="flex items-center gap-2">
          {q.verified ? <span className="k-chip k-chip-success">Verified</span> : <span className="k-chip k-chip-muted">Self-declared</span>}
          {q.label}
        </li>
      ))}
    </ul>
  );
}

export function StatusChip({ s }: { s: Booking["status"] }) {
  const cls = s === "completed" ? "k-chip-success" : s === "rejected" || s === "disputed" ? "k-chip-danger" : s === "work_done" || s === "requested" ? "k-chip-warn" : "";
  return <span className={`k-chip ${cls}`}>{STATUS_LABEL[s]}</span>;
}

/** Shared job panel for customer and professional views. */
export function BookingPanel({ b, viewer }: { b: Booking; viewer: "customer" | "professional" }) {
  const worker = useStore((s) => s.workers.find((w) => w.id === b.workerId));
  const live = b.status === "in_progress" || b.status === "paused";
  const now = useNow(live);
  const el = elapsedMs(b, now);
  const est = estimateLabour(b.hourlyRate, b.estHours);
  const extras = approvedExtras(b.extras);
  const [extraLabel, setExtraLabel] = useState("");
  const [extraAmt, setExtraAmt] = useState("");
  const [rating, setRating] = useState(5);
  const [disputeText, setDisputeText] = useState("");
  const [showDispute, setShowDispute] = useState(false);

  return (
    <div className="k-card p-5">
      <div className="flex flex-wrap items-start gap-4">
        {b.photo && <img src={b.photo} alt="Problem photo" className="h-24 w-24 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <b>{b.id}</b><StatusChip s={b.status} /><span className="k-chip k-chip-muted">{tradeLabel(b.trade)}</span>
          </div>
          <p className="mt-1 font-semibold">{b.description}</p>
          <p className="text-sm text-muted-foreground">
            {viewer === "customer" ? `Professional: ${worker?.name}` : `Customer: ${b.customerName}`} · <MapPin className="inline h-3.5 w-3.5" /> {b.locality}
          </p>
        </div>
        <div className="text-right text-sm">
          <div className="text-muted-foreground">Agreed rate (locked)</div>
          <div className="text-lg font-bold text-accent">{inr(b.hourlyRate)}/hr</div>
          <div className="text-muted-foreground">Est. {b.estHours} h · {inr(est)}</div>
        </div>
      </div>

      {(live || b.status === "work_done") && (
        <div className="mt-4 grid gap-3 rounded-xl bg-sky p-4 sm:grid-cols-3">
          <div><div className="text-xs text-muted-foreground">Elapsed billable time</div><div className="font-mono text-2xl font-bold">{fmtDuration(el)}</div></div>
          <div><div className="text-xs text-muted-foreground">Running labour cost</div><div className="text-2xl font-bold text-accent">{inr(runningCost(b.hourlyRate, el))}</div></div>
          <div className="text-xs text-muted-foreground">
            Started {b.startedAt && new Date(b.startedAt).toLocaleTimeString()}
            {b.completedAt && <> · Finished {new Date(b.completedAt).toLocaleTimeString()}</>}
            {b.status === "paused" && <div className="font-semibold text-accent">Paused — not billing</div>}
          </div>
        </div>
      )}

      {b.extras.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-semibold">Additional charges (need customer approval)</div>
          {b.extras.map((x) => (
            <div key={x.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-sm">
              <span>{x.label} · <b>{inr(x.amount)}</b></span>
              {x.status === "pending" && viewer === "customer" ? (
                <span className="flex gap-2">
                  <button className="k-btn k-btn-success py-1" onClick={() => actions.decideExtra(b.id, x.id, "approved")}>Approve</button>
                  <button className="k-btn k-btn-outline py-1" onClick={() => actions.decideExtra(b.id, x.id, "declined")}>Decline</button>
                </span>
              ) : (
                <span className={`k-chip ${x.status === "approved" ? "k-chip-success" : x.status === "declined" ? "k-chip-danger" : "k-chip-warn"}`}>{x.status}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {(b.status === "completed" || b.status === "disputed") && b.finalLabour !== undefined && (
        <div className="mt-4 rounded-xl border p-4 text-sm">
          <b>Final bill</b>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <span>Billable time ({b.billableMin} min, rounded up to 15 min, min 30)</span><span className="text-right">{inr(b.finalLabour)}</span>
            <span>Approved additional charges</span><span className="text-right">{inr(extras)}</span>
            <span className="font-bold">Total</span><span className="text-right text-lg font-bold text-accent">{inr(b.finalTotal ?? 0)}</span>
          </div>
          {b.dispute && <p className="mt-2 text-destructive">Dispute raised: {b.dispute}</p>}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {viewer === "professional" && b.status === "requested" && (
          <>
            <button className="k-btn k-btn-primary" onClick={() => { actions.accept(b.id); toast.success("Request accepted"); }}>Accept request</button>
            <button className="k-btn k-btn-outline" onClick={() => { actions.reject(b.id); toast("Request declined"); }}>Reject</button>
          </>
        )}
        {viewer === "professional" && b.status === "accepted" && (
          <button className="k-btn k-btn-accent" onClick={() => { actions.start(b.id); toast.success("Job started — timer running"); }}><Clock className="h-4 w-4" />Start Job</button>
        )}
        {viewer === "professional" && b.status === "in_progress" && (
          <>
            <button className="k-btn k-btn-outline" onClick={() => actions.pause(b.id)}>Pause (e.g. fetching parts)</button>
            <button className="k-btn k-btn-success" onClick={() => { actions.finishWork(b.id); toast.success("Marked complete — waiting for customer"); }}><CheckCircle2 className="h-4 w-4" />Complete Job</button>
          </>
        )}
        {viewer === "professional" && b.status === "paused" && (
          <button className="k-btn k-btn-primary" onClick={() => actions.resume(b.id)}>Resume</button>
        )}
        {viewer === "professional" && live && (
          <form className="flex flex-wrap gap-2" onSubmit={(e) => {
            e.preventDefault();
            const amt = Number(extraAmt);
            if (!extraLabel.trim() || !(amt > 0)) { toast.error("Enter a description and an amount above ₹0"); return; }
            actions.requestExtra(b.id, extraLabel.trim(), amt); setExtraLabel(""); setExtraAmt(""); toast("Sent to customer for approval");
          }}>
            <input className="k-input w-44" placeholder="Material, e.g. new switch" value={extraLabel} onChange={(e) => setExtraLabel(e.target.value)} />
            <input className="k-input w-24" placeholder="₹" inputMode="numeric" value={extraAmt} onChange={(e) => setExtraAmt(e.target.value)} />
            <button className="k-btn k-btn-outline">Request extra charge</button>
          </form>
        )}
        {viewer === "customer" && b.status === "work_done" && b.startedAt && b.completedAt && (
          <div className="w-full rounded-xl bg-sky p-4 text-sm">
            <p>Billable time: <b>{billableMinutes(b.completedAt - b.startedAt - b.pausedMs)} min</b> → labour <b>{inr(finalLabour(b.hourlyRate, b.completedAt - b.startedAt - b.pausedMs))}</b> + approved extras <b>{inr(extras)}</b></p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span>Rate the work:</span>
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} aria-label={`${r} stars`} onClick={() => setRating(r)}><Star className={`h-5 w-5 ${r <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} /></button>
              ))}
              <button className="k-btn k-btn-accent ml-auto" onClick={() => { actions.confirmCompletion(b.id, rating); toast.success("Job confirmed. Final bill generated."); }}>Confirm completion</button>
            </div>
          </div>
        )}
        {viewer === "customer" && b.status === "completed" && !showDispute && (
          <button className="k-btn k-btn-outline" onClick={() => setShowDispute(true)}>Dispute bill</button>
        )}
        {showDispute && b.status === "completed" && (
          <form className="flex w-full flex-wrap gap-2" onSubmit={(e) => {
            e.preventDefault();
            if (disputeText.trim().length < 10) { toast.error("Please describe the issue (at least 10 characters)"); return; }
            actions.dispute(b.id, disputeText.trim()); setShowDispute(false); toast("Dispute submitted for review");
          }}>
            <input className="k-input flex-1" placeholder="What is wrong with this bill?" value={disputeText} onChange={(e) => setDisputeText(e.target.value)} />
            <button className="k-btn k-btn-danger">Submit dispute</button>
          </form>
        )}
      </div>
    </div>
  );
}

export function EmergencyDashboard() {
  const alerts = useStore((s) => s.alerts);
  const workers = useStore((s) => s.workers);
  return (
    <div className="k-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <h2 className="text-lg font-bold">Emergency dashboard</h2>
        <span className="k-chip k-chip-warn">Simulated</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">Alerts go to the designated safety contact and KARTAVYA support only. Emergency services are never contacted automatically in this prototype.</p>
      {alerts.length === 0 && <Empty>No safety alerts. Trigger a demo alert from the professional's Safety page.</Empty>}
      <div className="space-y-3">
        {alerts.map((a) => {
          const w = workers.find((x) => x.id === a.workerId);
          return (
            <div key={a.id} className={`rounded-xl border p-4 ${a.status === "active" ? "border-destructive bg-destructive/5" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                <b>{w?.name}</b>
                <span className={`k-chip ${a.status === "active" ? "k-chip-danger" : a.status === "acknowledged" ? "k-chip-warn" : "k-chip-success"}`}>{a.status}</span>
                {a.simulated && <span className="k-chip k-chip-muted">demo</span>}
              </div>
              <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                <span>Alert reason: <b>{a.reason}</b></span>
                <span>Active job: {a.jobId}</span>
                <span>Last known location: {a.location}</span>
                <span>Last update: {new Date(a.at).toLocaleString()}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="k-btn k-btn-outline py-1.5" disabled={a.status !== "active"} onClick={() => actions.setAlert(a.id, "acknowledged")}>Acknowledge Alert</button>
                <button className="k-btn k-btn-outline py-1.5" onClick={() => toast(`Calling ${w?.name} (demo — no real call placed)`)}><Phone className="h-4 w-4" />Contact Worker</button>
                <button className="k-btn k-btn-success py-1.5" disabled={a.status === "resolved"} onClick={() => actions.setAlert(a.id, "resolved")}>Resolve Alert</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NoticeList({ role }: { role: Role }) {
  const notices = useStore((s) => s.notices.filter((n) => n.role === role || n.role === "all"));
  return (
    <div className="k-card p-5">
      <h2 className="mb-2 font-bold">Notifications</h2>
      {notices.length === 0 && <p className="text-sm text-muted-foreground">Nothing new.</p>}
      <ul className="space-y-2 text-sm">
        {notices.slice(0, 5).map((n) => <li key={n.id} className="border-l-2 border-accent pl-3">{n.text}</li>)}
      </ul>
    </div>
  );
}

export function useSession() {
  return useStore((s) => s.session);
}
export function useMe() {
  const id = useStore((s) => s.session?.workerId);
  return useStore((s) => s.workers.find((w) => w.id === id));
}
