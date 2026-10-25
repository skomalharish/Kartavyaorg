import { createFileRoute } from "@tanstack/react-router";
import { Empty, PageTitle, useMe } from "@/components/kartavya";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/pricing";

export const Route = createFileRoute("/pro/earnings")({ component: Earnings });

function Earnings() {
  const me = useMe();
  const done = useStore((s) => s.bookings.filter((b) => b.workerId === s.session?.workerId && (b.status === "completed" || b.status === "disputed")));
  if (!me) return null;
  const inApp = done.reduce((s, b) => s + (b.finalTotal ?? 0), 0);
  return (
    <div>
      <PageTitle title="Earnings" sub="Includes demo history. Disputed bills are on hold until reviewed." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="k-card p-5"><div className="text-xs text-muted-foreground">Total earnings</div><div className="text-3xl font-bold text-accent">{inr(me.earnings)}</div></div>
        <div className="k-card p-5"><div className="text-xs text-muted-foreground">From jobs in this demo</div><div className="text-3xl font-bold">{inr(inApp)}</div></div>
        <div className="k-card p-5"><div className="text-xs text-muted-foreground">Verified working hours</div><div className="text-3xl font-bold">{me.verifiedHours} h</div></div>
      </div>
      <h2 className="mb-3 font-bold">Work history</h2>
      {done.length === 0 ? <Empty>Completed jobs will appear here.</Empty> : (
        <div className="k-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sky text-left"><tr><th className="p-3">Job</th><th className="p-3">Date</th><th className="p-3">Billable</th><th className="p-3">Rate</th><th className="p-3 text-right">Total</th></tr></thead>
            <tbody>
              {done.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3">{b.id} · {b.description}{b.status === "disputed" && <span className="k-chip k-chip-danger ml-2">disputed</span>}</td>
                  <td className="p-3">{b.completedAt && new Date(b.completedAt).toLocaleDateString()}</td>
                  <td className="p-3">{b.billableMin} min</td>
                  <td className="p-3">{inr(b.hourlyRate)}/hr</td>
                  <td className="p-3 text-right font-semibold">{inr(b.finalTotal ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
