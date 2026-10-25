import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BookingPanel, Empty, NoticeList, QualList, StageChip, useMe } from "@/components/kartavya";
import { actions, TRADES, useStore, type Trade } from "@/lib/store";
import { inr } from "@/lib/pricing";

export const Route = createFileRoute("/pro/")({ component: ProHome });

function ProHome() {
  const me = useMe();
  const requests = useStore((s) => s.bookings.filter((b) => b.workerId === s.session?.workerId && b.status === "requested"));
  const active = useStore((s) => s.bookings.filter((b) => b.workerId === s.session?.workerId && ["accepted", "in_progress", "paused", "work_done"].includes(b.status)));
  const [skill, setSkill] = useState("");
  const [qual, setQual] = useState("");
  const [cert, setCert] = useState("");
  if (!me) return null;
  const student = me.stage === "student";
  const fields = [me.skills.length > 0, me.qualifications.length > 0, me.hourlyRate > 0 || student, me.certificates.length > 0, me.experienceYears > 0 || student];
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div className="space-y-6">
      <div className="k-card flex flex-wrap items-center gap-6 p-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Hello, {me.name}</h1>
          <div className="mt-1 flex flex-wrap gap-2"><StageChip w={me} /><span className="k-chip">{TRADES.find((t) => t.id === me.trade)?.label}</span></div>
          <div className="mt-4 max-w-sm">
            <div className="flex justify-between text-xs"><span>Profile completion</span><b>{completion}%</b></div>
            <div className="mt-1 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${completion}%` }} /></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="text-2xl font-bold">{me.completedJobs}</div><div className="text-xs text-muted-foreground">Jobs done</div></div>
          <div><div className="text-2xl font-bold">{me.verifiedHours}h</div><div className="text-xs text-muted-foreground">Verified hours</div></div>
          <div><div className="text-2xl font-bold text-accent">{inr(me.earnings)}</div><div className="text-xs text-muted-foreground">Earnings</div></div>
        </div>
      </div>

      {student && (
        <div className="k-card border-accent p-5">
          <h2 className="font-bold">For ITI students</h2>
          <p className="text-sm text-muted-foreground">As a student you can take supervised practical training, apprenticeships, entry-level roles and mentorship. You won't be listed for independent customer jobs until you qualify.</p>
          <Link to="/pro/jobs" className="k-btn k-btn-accent mt-3">Browse apprenticeships & mentorship</Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <h2 className="font-bold">New service requests</h2>
          {student ? <Empty>Customer requests are available after qualification.</Empty> : requests.length === 0 ? <Empty>No new requests. Make sure you're set to available.</Empty> : requests.map((b) => <BookingPanel key={b.id} b={b} viewer="professional" />)}
          <h2 className="pt-2 font-bold">Accepted & active jobs</h2>
          {active.length === 0 ? <Empty>No active jobs.</Empty> : active.map((b) => <BookingPanel key={b.id} b={b} viewer="professional" />)}
        </div>
        <div className="space-y-4">
          <NoticeList role="professional" />
          <div className="k-card space-y-4 p-5">
            <h2 className="font-bold">Profile & settings</h2>
            <label className="flex items-center justify-between text-sm font-semibold">
              Available for jobs
              <input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={me.available} onChange={(e) => actions.updateWorker(me.id, { available: e.target.checked })} />
            </label>
            {!student && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const v = Number((e.currentTarget.elements.namedItem("rate") as HTMLInputElement).value);
                if (!(v >= 100 && v <= 2000)) { toast.error("Hourly rate must be between ₹100 and ₹2,000"); return; }
                actions.updateWorker(me.id, { hourlyRate: v }); toast.success("Rate updated for new bookings only");
              }}>
                <label className="k-label" htmlFor="rate">Hourly rate (₹) — applies to new bookings</label>
                <div className="flex gap-2"><input id="rate" name="rate" className="k-input" defaultValue={me.hourlyRate} inputMode="numeric" /><button className="k-btn k-btn-outline">Save</button></div>
              </form>
            )}
            <div>
              <label className="k-label" htmlFor="trade">Trade</label>
              <select id="trade" className="k-input" value={me.trade} onChange={(e) => actions.updateWorker(me.id, { trade: e.target.value as Trade })}>
                {TRADES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="k-label" htmlFor="exp">Experience (years)</label>
              <input id="exp" type="number" min={0} max={50} className="k-input" value={me.experienceYears} onChange={(e) => actions.updateWorker(me.id, { experienceYears: Math.max(0, Number(e.target.value) || 0) })} />
            </div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (skill.trim().length < 2) { toast.error("Enter a skill"); return; } actions.updateWorker(me.id, { skills: [...me.skills, skill.trim()] }); setSkill(""); }}>
              <input className="k-input" placeholder="Add a skill" value={skill} onChange={(e) => setSkill(e.target.value)} /><button className="k-btn k-btn-outline">Add</button>
            </form>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (qual.trim().length < 3) { toast.error("Enter a qualification"); return; } actions.updateWorker(me.id, { qualifications: [...me.qualifications, { label: qual.trim(), verified: false }] }); setQual(""); toast("Added as self-declared"); }}>
              <input className="k-input" placeholder="Add qualification" value={qual} onChange={(e) => setQual(e.target.value)} /><button className="k-btn k-btn-outline">Add</button>
            </form>
            <QualList w={me} />
            <div>
              <label className="k-label" htmlFor="cert">Upload certificate (demo)</label>
              <input id="cert" type="file" accept="image/*,.pdf" className="text-sm" onChange={(e) => {
                const f = e.target.files?.[0]; if (!f) return;
                actions.updateWorker(me.id, { certificates: [...me.certificates, f.name] }); setCert(f.name); toast.success("Certificate uploaded — pending verification");
              }} />
              {cert && <p className="mt-1 text-xs text-muted-foreground">Last uploaded: {cert} · not yet verified</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
