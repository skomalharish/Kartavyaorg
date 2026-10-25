import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/kartavya";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/employer/company")({ component: Company });

function Company() {
  const company = useStore((s) => s.company);
  const [f, setF] = useState(company);
  return (
    <div className="max-w-xl">
      <PageTitle title="Company profile" sub="Demo company — shown to candidates on your posts." />
      <form className="k-card space-y-4 p-5" onSubmit={(e) => {
        e.preventDefault();
        if (f.name.trim().length < 2 || f.city.trim().length < 2) { toast.error("Company name and city are required"); return; }
        actions.updateCompany({ ...f, name: f.name.trim() }); toast.success("Company profile saved");
      }}>
        {(["name", "type", "city"] as const).map((k) => (
          <div key={k}><label className="k-label capitalize" htmlFor={k}>{k === "type" ? "Business type" : k}</label><input id={k} className="k-input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
        ))}
        <div><label className="k-label" htmlFor="about">About</label><textarea id="about" rows={3} className="k-input" value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} /></div>
        <button className="k-btn k-btn-primary">Save</button>
      </form>
    </div>
  );
}
