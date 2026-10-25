import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Search, ShieldCheck, Star } from "lucide-react";
import { BookingPanel, Empty, NoticeList, StatusChip, useSession } from "@/components/kartavya";
import { LATER_TRADES, TRADES, useStore, type Trade } from "@/lib/store";
import { inr } from "@/lib/pricing";

export const Route = createFileRoute("/customer/")({ component: CustomerHome });

function CustomerHome() {
  const session = useSession();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const bookings = useStore((s) => s.bookings.filter((b) => b.customerName === s.session?.name));
  const nearby = useStore((s) => s.workers.filter((w) => w.stage !== "student").sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4));
  const active = bookings.filter((b) => !["completed", "rejected", "disputed"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "rejected", "disputed"].includes(b.status));

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.toLowerCase();
    const match = TRADES.find((t) => t.label.toLowerCase().includes(s) || t.id.includes(s) || (s.includes("light") || s.includes("switch") || s.includes("wire") ? t.id === "electrical" : s.includes("tap") || s.includes("leak") || s.includes("pipe") ? t.id === "plumbing" : s.includes("cool") || s.includes("fridge") ? t.id === "ac" : s.includes("tv") ? t.id === "electronics" : false));
    navigate({ to: "/customer/find", search: { trade: match?.id } });
  };

  return (
    <div className="space-y-6">
      <div className="k-card flex flex-wrap items-center gap-4 p-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Namaste, {session?.name} 👋</h1>
          <p className="text-muted-foreground">What needs fixing today?</p>
          <form onSubmit={search} className="mt-4 flex gap-2">
            <input className="k-input" placeholder="Search: switchboard, leaking tap, AC not cooling…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search services" />
            <button className="k-btn k-btn-primary"><Search className="h-4 w-4" />Search</button>
          </form>
        </div>
        <Link to="/customer/find" className="k-btn k-btn-accent py-4"><Camera className="h-5 w-5" />Upload Problem Photo</Link>
      </div>

      <section>
        <h2 className="mb-3 font-bold">Choose a service</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {TRADES.map((t) => (
            <Link key={t.id} to="/customer/find" search={{ trade: t.id as Trade }} className="k-card p-4 font-semibold transition-transform hover:-translate-y-0.5">{t.label}</Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {LATER_TRADES.map((t) => <span key={t} className="k-chip k-chip-muted">{t} · coming soon</span>)}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <h2 className="font-bold">Active bookings</h2>
          {active.length === 0 ? <Empty>No active bookings. Upload a problem photo to get started.</Empty> : active.map((b) => <BookingPanel key={b.id} b={b} viewer="customer" />)}
          <h2 className="pt-2 font-bold">Previous bookings</h2>
          {past.length === 0 ? <Empty>No previous bookings yet.</Empty> : past.slice(0, 3).map((b) => (
            <div key={b.id} className="k-card flex items-center justify-between p-4 text-sm"><span><b>{b.id}</b> · {b.description}</span><span className="flex items-center gap-2"><StatusChip s={b.status} />{b.finalTotal !== undefined && <b className="text-accent">{inr(b.finalTotal)}</b>}</span></div>
          ))}
        </div>
        <div className="space-y-4">
          <NoticeList role="customer" />
          <div className="k-card p-5">
            <h2 className="mb-2 font-bold">Nearby professionals</h2>
            {nearby.map((w) => (
              <Link key={w.id} to="/passport/$id" params={{ id: w.id }} className="flex items-center justify-between border-t py-2 text-sm first:border-0 hover:text-primary">
                <span>{w.name}<span className="block text-xs text-muted-foreground">{w.distanceKm} km · {inr(w.hourlyRate)}/hr</span></span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" />{w.rating}</span>
              </Link>
            ))}
          </div>
          <Link to="/customer/safety" className="k-card flex items-center gap-3 p-5"><ShieldCheck className="h-6 w-6 text-success" /><span><b>Safety & support</b><span className="block text-sm text-muted-foreground">Report an issue or get help</span></span></Link>
        </div>
      </div>
    </div>
  );
}
