import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { Avatar, Empty, PageTitle, QualList, StageChip } from "@/components/kartavya";
import { TRADES, useStore } from "@/lib/store";

export const Route = createFileRoute("/employer/candidates")({ component: Candidates });

function Candidates() {
  const workers = useStore((s) => s.workers);
  const [trade, setTrade] = useState("");
  const [stage, setStage] = useState("");
  const [minExp, setMinExp] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const list = workers.filter((w) =>
    (!trade || w.trade === trade) && (!stage || w.stage === stage) && w.experienceYears >= minExp &&
    (!verifiedOnly || w.qualifications.some((q) => q.verified)));
  return (
    <div>
      <PageTitle title="Find candidates" sub="Search ITI talent by trade, qualification and experience." />
      <div className="k-card mb-5 grid gap-3 p-4 sm:grid-cols-4">
        <select className="k-input" value={trade} onChange={(e) => setTrade(e.target.value)} aria-label="Trade"><option value="">All trades</option>{TRADES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
        <select className="k-input" value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Stage"><option value="">Any stage</option><option value="student">ITI student</option><option value="graduate">ITI graduate</option><option value="experienced">Experienced</option></select>
        <select className="k-input" value={minExp} onChange={(e) => setMinExp(Number(e.target.value))} aria-label="Experience"><option value={0}>Any experience</option><option value={1}>1+ yrs</option><option value={3}>3+ yrs</option><option value={5}>5+ yrs</option></select>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />Verified qualification</label>
      </div>
      {list.length === 0 ? <Empty>No candidates match these filters.</Empty> : (
        <div className="grid gap-4 md:grid-cols-3">
          {list.map((w) => (
            <div key={w.id} className="k-card flex flex-col p-5">
              <div className="flex items-center gap-3"><Avatar name={w.name} /><div><b>{w.name}</b><div className="text-xs text-muted-foreground">{w.experienceYears} yrs · {w.verifiedHours + w.supervisedHours} h logged</div></div></div>
              <div className="mt-2"><StageChip w={w} /></div>
              <div className="mt-2"><QualList w={w} /></div>
              {w.rating > 0 && <div className="mt-2 flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-accent text-accent" />{w.rating}</div>}
              <Link to="/passport/$id" params={{ id: w.id }} className="k-btn k-btn-outline mt-auto pt-2">Review Work Passport</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
