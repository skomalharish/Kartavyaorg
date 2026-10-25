import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/kartavya";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/customer/safety")({ component: Safety });

function Safety() {
  const bookings = useStore((s) => s.bookings.filter((b) => b.customerName === s.session?.name));
  const [job, setJob] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <PageTitle title="Safety & support" sub="Your safety and the worker's safety both matter." />
        <div className="k-card space-y-3 p-5 text-sm">
          <p>✔ Every professional shows which qualifications are <b>verified</b> and which are <b>self-declared</b>.</p>
          <p>✔ Rates are locked at booking. Extra charges need your approval.</p>
          <p>✔ You can dispute any final bill from My Bookings.</p>
          <p>✔ For a real emergency, call <b>112</b>. KARTAVYA does not contact emergency services automatically.</p>
        </div>
      </div>
      <form className="k-card space-y-3 p-5" onSubmit={(e) => {
        e.preventDefault();
        if (msg.trim().length < 10) { toast.error("Please describe the issue (at least 10 characters)"); return; }
        toast.success("Support ticket created (demo). Our team will reply in the app.");
        setMsg(""); setJob("");
      }}>
        <h2 className="font-bold">Report a concern</h2>
        <div>
          <label className="k-label" htmlFor="job">Related booking (optional)</label>
          <select id="job" className="k-input" value={job} onChange={(e) => setJob(e.target.value)}>
            <option value="">None</option>
            {bookings.map((b) => <option key={b.id} value={b.id}>{b.id} · {b.description}</option>)}
          </select>
        </div>
        <div>
          <label className="k-label" htmlFor="msg">What happened?</label>
          <textarea id="msg" rows={4} className="k-input" value={msg} onChange={(e) => setMsg(e.target.value)} />
        </div>
        <button className="k-btn k-btn-primary">Send to support</button>
      </form>
    </div>
  );
}
