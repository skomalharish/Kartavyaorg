import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageTitle, useSession } from "@/components/kartavya";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/customer/profile")({ component: Profile });

function Profile() {
  const session = useSession();
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  return (
    <div className="max-w-lg">
      <PageTitle title="Profile" sub="Demo account — stored only in this browser." />
      <form className="k-card space-y-3 p-5" onSubmit={(e) => {
        e.preventDefault();
        if (phone && !/^[6-9]\d{9}$/.test(phone)) { toast.error("Enter a valid 10-digit Indian mobile number"); return; }
        toast.success("Profile saved");
      }}>
        <div><label className="k-label">Name</label><input className="k-input" value={session?.name ?? ""} disabled /></div>
        <div><label className="k-label" htmlFor="ph">Mobile (optional)</label><input id="ph" className="k-input" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" /></div>
        <div><label className="k-label" htmlFor="ad">Default locality</label><input id="ad" className="k-input" value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="e.g. Kothrud, Pune" /></div>
        <div className="flex gap-2">
          <button className="k-btn k-btn-primary">Save</button>
          <button type="button" className="k-btn k-btn-outline" onClick={() => { actions.reset(); toast("Demo data reset"); }}>Reset demo data</button>
        </div>
      </form>
    </div>
  );
}
