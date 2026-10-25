import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Avatar, Empty, PageTitle, StageChip } from "@/components/kartavya";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/employer/applications")({ component: Apps });

function Apps() {
  const company = useStore((s) => s.company);
  const vacancies = useStore((s) => s.vacancies.filter((v) => v.company === company.name));
  const apps = useStore((s) => s.applications);
  const workers = useStore((s) => s.workers);
  const mine = apps.filter((a) => vacancies.some((v) => v.id === a.vacancyId));
  return (
    <div>
      <PageTitle title="Applications" sub="Review Work Passports, shortlist, select or reject." />
      {mine.length === 0 ? <Empty>No applications yet. Ask a worker to apply from “Find Jobs”.</Empty> : (
        <div className="space-y-3">
          {mine.map((a) => {
            const w = workers.find((x) => x.id === a.workerId);
            const v = vacancies.find((x) => x.id === a.vacancyId);
            if (!w || !v) return null;
            return (
              <div key={a.id} className="k-card flex flex-wrap items-center gap-4 p-4">
                <Avatar name={w.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><b>{w.name}</b><StageChip w={w} /></div>
                  <div className="text-sm text-muted-foreground">for <b>{v.title}</b> ({v.kind}) · applied {new Date(a.at).toLocaleDateString()}</div>
                </div>
                <span className={`k-chip ${a.status === "selected" ? "k-chip-success" : a.status === "rejected" ? "k-chip-danger" : a.status === "shortlisted" ? "k-chip-warn" : ""}`}>{a.status}</span>
                <div className="flex flex-wrap gap-2">
                  <Link to="/passport/$id" params={{ id: w.id }} className="k-btn k-btn-ghost py-1.5">Passport</Link>
                  <button className="k-btn k-btn-outline py-1.5" disabled={a.status !== "applied"} onClick={() => { actions.setApplication(a.id, "shortlisted"); toast("Shortlisted"); }}>Shortlist</button>
                  <button className="k-btn k-btn-success py-1.5" disabled={a.status === "selected"} onClick={() => { actions.setApplication(a.id, "selected"); toast.success(`${w.name} selected`); }}>Select</button>
                  <button className="k-btn k-btn-outline py-1.5" disabled={a.status === "rejected"} onClick={() => { actions.setApplication(a.id, "rejected"); toast("Rejected"); }}>Reject</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
