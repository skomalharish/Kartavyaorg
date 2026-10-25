import { Award, BadgeCheck, Clock, Star } from "lucide-react";
import { Avatar, DemoBadge, QualList, StageChip } from "@/components/kartavya";
import { tradeLabel, useStore, type Worker } from "@/lib/store";
import { inr } from "@/lib/pricing";

export function PassportView({ w, showPrivate }: { w: Worker; showPrivate: boolean }) {
  const apps = useStore((s) => s.applications.filter((a) => a.workerId === w.id));
  const vacancies = useStore((s) => s.vacancies);
  return (
    <div className="space-y-5">
      <div className="k-card flex flex-wrap items-center gap-4 p-6">
        <Avatar name={w.name} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">{w.name}</h1><DemoBadge /></div>
          <div className="mt-1 flex flex-wrap gap-2"><span className="k-chip">{tradeLabel(w.trade)}</span><StageChip w={w} /></div>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-primary">Digital Work Passport</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { i: Award, l: "Completed jobs", v: String(w.completedJobs) },
          { i: Clock, l: "Verified working hours", v: `${w.verifiedHours} h` },
          { i: BadgeCheck, l: "Supervised training hours", v: `${w.supervisedHours} h` },
          { i: Star, l: "Customer rating", v: w.rating ? `${w.rating}/5` : "No ratings yet" },
        ].map((s) => (
          <div key={s.l} className="k-card p-4"><s.i className="h-5 w-5 text-primary" /><div className="mt-2 text-xl font-bold">{s.v}</div><div className="text-xs text-muted-foreground">{s.l}</div></div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="k-card p-5">
          <h2 className="mb-2 font-bold">ITI qualification & certificates</h2>
          <QualList w={w} />
          {w.certificates.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Uploaded: {w.certificates.join(", ")} (pending verification unless marked Verified)</p>}
          <h2 className="mb-2 mt-4 font-bold">Skills <span className="k-chip k-chip-muted">self-declared</span></h2>
          <div className="flex flex-wrap gap-1.5">{w.skills.map((s) => <span key={s} className="k-chip">{s}</span>)}</div>
        </div>
        <div className="k-card p-5">
          <h2 className="mb-2 font-bold">Feedback</h2>
          {w.employerFeedback.map((f) => <p key={f} className="mb-2 text-sm"><span className="k-chip">Employer</span> {f}</p>)}
          {w.customerFeedback.slice(0, 4).map((f, i) => (
            <p key={i} className="mb-2 text-sm"><span className="k-chip k-chip-warn">{f.rating}★</span> “{f.text}” — {f.by}</p>
          ))}
          {w.employerFeedback.length + w.customerFeedback.length === 0 && <p className="text-sm text-muted-foreground">No feedback yet.</p>}
          {showPrivate && (
            <div className="mt-4 rounded-xl bg-sky p-3 text-sm">Earnings summary (private): <b className="text-accent">{inr(w.earnings)}</b></div>
          )}
        </div>
      </div>

      <div className="k-card p-5">
        <h2 className="mb-3 font-bold">Timeline — assignments, training & apprenticeships</h2>
        {w.timeline.length === 0 && <p className="text-sm text-muted-foreground">No records yet.</p>}
        <ol className="relative space-y-4 border-l-2 border-secondary pl-5">
          {w.timeline.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-accent" />
              <div className="text-xs text-muted-foreground">{t.date}</div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-muted-foreground">
                {t.hours} h · {t.kind === "job" ? "Customer job (timer-verified)" : t.kind === "training" ? "Supervised training" : "Apprenticeship"}
                {t.verifiedBy && <> · <span className="text-success">verified by {t.verifiedBy}</span></>}
              </div>
            </li>
          ))}
        </ol>
        {showPrivate && apps.length > 0 && (
          <div className="mt-5 text-sm"><b>Applications:</b> {apps.map((a) => `${vacancies.find((v) => v.id === a.vacancyId)?.title} (${a.status})`).join(" · ")}</div>
        )}
      </div>
    </div>
  );
}
