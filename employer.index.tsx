import { createFileRoute, Link } from "@tanstack/react-router";
import { NoticeList, PageTitle, EmergencyDashboard } from "@/components/kartavya";
import { useStore } from "@/lib/store";
import workshop from "@/assets/iti-workshop.jpg";

export const Route = createFileRoute("/employer/")({ component: EmpHome });

function EmpHome() {
  const company = useStore((s) => s.company);
  const vacancies = useStore((s) => s.vacancies);
  const apps = useStore((s) => s.applications);
  const mine = vacancies.filter((v) => v.company === company.name);
  const myApps = apps.filter((a) => mine.some((v) => v.id === a.vacancyId));
  return (
    <div className="space-y-6">
      <div className="k-card grid overflow-hidden md:grid-cols-2">
        <div className="p-6">
          <PageTitle title={company.name} sub={`${company.type} · ${company.city}`} />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-2xl font-bold">{mine.length}</div><div className="text-xs text-muted-foreground">Open posts</div></div>
            <div><div className="text-2xl font-bold">{myApps.length}</div><div className="text-xs text-muted-foreground">Applications</div></div>
            <div><div className="text-2xl font-bold text-success">{myApps.filter((a) => a.status === "shortlisted" || a.status === "selected").length}</div><div className="text-xs text-muted-foreground">Shortlisted</div></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/employer/post" className="k-btn k-btn-accent">Post a job or apprenticeship</Link>
            <Link to="/employer/candidates" className="k-btn k-btn-outline">Find candidates</Link>
          </div>
        </div>
        <img src={workshop} alt="ITI workshop training" loading="lazy" width={1024} height={768} className="h-full max-h-72 w-full object-cover" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <NoticeList role="employer" />
        <div className="k-card p-5">
          <h2 className="mb-2 font-bold">Your posts</h2>
          {mine.map((v) => <div key={v.id} className="flex justify-between border-t py-2 text-sm first:border-0"><span>{v.title}</span><span className="k-chip">{v.kind}</span></div>)}
        </div>
      </div>
      <EmergencyDashboard />
    </div>
  );
}
