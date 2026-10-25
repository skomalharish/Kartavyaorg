import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/kartavya";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/employer/post")({ component: Post });

function Post() {
  const company = useStore((s) => s.company);
  const navigate = useNavigate();
  const [f, setF] = useState({ title: "", trade: "Electrician", kind: "job" as "job" | "apprenticeship", location: company.city, pay: "", requirement: "" });
  const [err, setErr] = useState<Partial<Record<keyof typeof f, string>>>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Partial<Record<keyof typeof f, string>> = {};
    if (f.title.trim().length < 3) er.title = "Enter a title";
    if (f.location.trim().length < 2) er.location = "Enter a location";
    if (f.pay.trim().length < 2) er.pay = "Enter pay or stipend";
    if (f.requirement.trim().length < 3) er.requirement = "Enter requirements";
    setErr(er);
    if (Object.keys(er).length) return;
    actions.postVacancy({ ...f, company: company.name });
    toast.success(`${f.kind === "job" ? "Job" : "Apprenticeship"} posted`);
    navigate({ to: "/employer" });
  };
  const field = (k: keyof typeof f, label: string, ph: string) => (
    <div><label className="k-label" htmlFor={k}>{label}</label><input id={k} className="k-input" placeholder={ph} value={f[k]} onChange={set(k)} />{err[k] && <p className="mt-1 text-xs text-destructive">{err[k]}</p>}</div>
  );
  return (
    <div className="max-w-xl">
      <PageTitle title="Post a job or apprenticeship" sub={`Posting as ${company.name}`} />
      <form onSubmit={submit} className="k-card space-y-4 p-5">
        <div className="grid grid-cols-2 gap-2">
          {(["job", "apprenticeship"] as const).map((k) => <button type="button" key={k} className={`k-btn ${f.kind === k ? "k-btn-primary" : "k-btn-outline"}`} onClick={() => setF({ ...f, kind: k })}>{k === "job" ? "Job vacancy" : "Apprenticeship"}</button>)}
        </div>
        {field("title", "Title", "e.g. Junior Fitter")}
        <div><label className="k-label" htmlFor="trade">Trade</label>
          <select id="trade" className="k-input" value={f.trade} onChange={set("trade")}>{["Electrician", "Fitter", "Welder", "Mechanic", "AC Technician", "Plumber", "Electronics Mechanic"].map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        {field("location", "Location", "e.g. Pimpri")}
        {field("pay", f.kind === "job" ? "Salary" : "Stipend", "e.g. ₹15,000/mo")}
        {field("requirement", "Requirements", "e.g. ITI Fitter, 0–2 yrs")}
        <button className="k-btn k-btn-accent w-full">Publish</button>
      </form>
    </div>
  );
}
