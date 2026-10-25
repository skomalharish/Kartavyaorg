import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/kartavya";
import { actions, useStore, type Role } from "@/lib/store";

type Search = { role: Role };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    role: s["role"] === "professional" || s["role"] === "employer" ? s["role"] : "customer",
  }),
  head: () => ({
    meta: [
      { title: "Demo login — KARTAVYA" },
      { name: "description", content: "Choose your role and sign in to the KARTAVYA demo." },
      { property: "og:title", content: "Demo login — KARTAVYA" },
      { property: "og:description", content: "Choose your role and sign in to the KARTAVYA demo." },
    ],
  }),
  component: Login,
});

const ROLES: { id: Role; label: string }[] = [
  { id: "customer", label: "Customer" },
  { id: "professional", label: "Skilled worker" },
  { id: "employer", label: "Employer" },
];

function Login() {
  const { role: initial } = Route.useSearch();
  const [role, setRole] = useState<Role>(initial);
  const [name, setName] = useState("");
  const [workerId, setWorkerId] = useState("w1");
  const [err, setErr] = useState("");
  const workers = useStore((s) => s.workers);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = workers.find((x) => x.id === workerId);
    const finalName = role === "professional" ? w?.name ?? "" : name.trim();
    if (role !== "professional" && finalName.length < 2) { setErr("Please enter your name (at least 2 characters)."); return; }
    actions.login(role === "professional" ? { role, name: finalName, workerId } : { role, name: finalName });
    toast.success(`Signed in as ${finalName} (demo)`);
    navigate({ to: role === "customer" ? "/customer" : role === "professional" ? "/pro" : "/employer" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky px-4">
      <form onSubmit={submit} className="k-card k-fade w-full max-w-md p-7">
        <Link to="/"><Wordmark /></Link>
        <p className="text-sm text-muted-foreground">Your Time, Your Money.</p>
        <div className="mt-4 rounded-xl bg-sky p-3 text-xs text-muted-foreground">
          <b className="text-foreground">Demo mode.</b> No real OTP, Google sign-in or identity check is performed. Your data stays in this browser.
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Role">
          {ROLES.map((r) => (
            <button type="button" key={r.id} role="radio" aria-checked={role === r.id} onClick={() => { setRole(r.id); setErr(""); }}
              className={`k-btn px-2 text-xs ${role === r.id ? "k-btn-primary" : "k-btn-outline"}`}>{r.label}</button>
          ))}
        </div>

        {role === "professional" ? (
          <div className="mt-5">
            <label className="k-label" htmlFor="w">Sign in as demo worker</label>
            <select id="w" className="k-input" value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name} — {w.stage === "student" ? "ITI student" : w.trade}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">Tip: pick Ravi Kumar to follow the electrician demo, or Pooja Patil for the ITI student view.</p>
          </div>
        ) : (
          <div className="mt-5">
            <label className="k-label" htmlFor="n">{role === "employer" ? "Your name (recruiter)" : "Your name"}</label>
            <input id="n" className="k-input" placeholder="e.g. Priya Sharma" value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} />
            <button type="button" className="mt-1 text-xs font-semibold text-primary" onClick={() => setName(role === "employer" ? "Shree Electricals HR" : "Demo Customer")}>Use demo name</button>
          </div>
        )}
        {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
        <button className="k-btn k-btn-accent mt-6 w-full">Continue</button>
        <button type="button" className="mt-3 w-full text-xs text-muted-foreground underline" onClick={() => { actions.reset(); toast("Demo data reset"); }}>Reset all demo data</button>
      </form>
    </div>
  );
}
