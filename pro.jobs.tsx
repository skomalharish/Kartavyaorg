import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BookingPanel, Empty, PageTitle, useMe } from "@/components/kartavya";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/pro/jobs")({ component: Jobs });

function Jobs() {
  const me = useMe();
  const [kind, setKind] = useState<"all" | "job" | "apprenticeship">("all");
  const vacancies = useStore((s) => s.vacancies);
  const apps = useStore((s) => s.applications.filter((a) => a.workerId === s.session?.workerId));
  const requests = useStore((s) => s.bookings.filter((b) => b.workerId === s.session?.workerId && b.status === "requested"));
  if (!me) return null;
  const list = vacancies.filter((v) => kind === "all" || v.kind === kind);
  return (
    <div className="space-y-6">
      <PageTitle title="Find jobs" sub="Nearby service requests, employer vacancies and apprenticeships." />
      {me.stage !== "student" && (
        <section className="space-y-3">
          <h2 className="font-bold">Nearby service requests</h2>
          {requests.length === 0 ? <Empty>No pending customer requests right now.</Empty> : requests.map((b) => <BookingPanel key={b.id} b={b} viewer="professional" />)}
        </section>
      )}
      {me.stage === "student" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="k-card p-4"><b>Supervised practical training</b><p className="text-sm text-muted-foreground">Shadow a verified electrician on real jobs. Hours count once the supervisor verifies them.</p><button className="k-btn k-btn-outline mt-2" onClick={() => toast.success("Request sent to Ravi Kumar (mentor, demo)")}>Request a supervised slot</button></div>
          <div className="k-card p-4"><b>Mentorship</b><p className="text-sm text-muted-foreground">Weekly guidance from experienced ITI alumni.</p><button className="k-btn k-btn-outline mt-2" onClick={() => toast.success("Mentorship request sent (demo)")}>Find a mentor</button></div>
        </div>
      )}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mr-auto font-bold">Vacancies & apprenticeships</h2>
          {(["all", "job", "apprenticeship"] as const).map((k) => (
            <button key={k} className={`k-btn py-1.5 ${kind === k ? "k-btn-primary" : "k-btn-outline"}`} onClick={() => setKind(k)}>{k === "all" ? "All" : k === "job" ? "Jobs" : "Apprenticeships"}</button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((v) => {
            const applied = apps.find((a) => a.vacancyId === v.id);
            return (
              <div key={v.id} className="k-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div><b>{v.title}</b><div className="text-sm text-muted-foreground">{v.company} · {v.location}</div></div>
                  <span className={`k-chip ${v.kind === "apprenticeship" ? "k-chip-warn" : ""}`}>{v.kind}</span>
                </div>
                <p className="mt-2 text-sm">{v.requirement}</p>
                <p className="text-sm font-semibold text-accent">{v.pay}</p>
                <button className="k-btn k-btn-accent mt-3" disabled={!!applied} onClick={() => { actions.apply(v.id, me.id); toast.success(`Applied to ${v.title} with your Work Passport`); }}>
                  {applied ? `Applied · ${applied.status}` : "Apply with Work Passport"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
