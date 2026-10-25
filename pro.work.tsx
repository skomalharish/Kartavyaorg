import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookingPanel, Empty, PageTitle } from "@/components/kartavya";
import { useStore, type BookingStatus } from "@/lib/store";

export const Route = createFileRoute("/pro/work")({ component: Work });

const TABS: { id: string; label: string; s: BookingStatus[] }[] = [
  { id: "active", label: "Accepted & active", s: ["accepted", "in_progress", "paused", "work_done"] },
  { id: "done", label: "Completed", s: ["completed", "disputed"] },
  { id: "declined", label: "Declined", s: ["rejected"] },
];

function Work() {
  const [tab, setTab] = useState("active");
  const mine = useStore((s) => s.bookings.filter((b) => b.workerId === s.session?.workerId));
  const t = TABS.find((x) => x.id === tab)!;
  const list = mine.filter((b) => t.s.includes(b.status));
  return (
    <div>
      <PageTitle title="My work" sub="Start, pause and complete jobs. The agreed rate is locked." />
      <div className="mb-4 flex gap-2">
        {TABS.map((x) => <button key={x.id} className={`k-btn py-1.5 ${tab === x.id ? "k-btn-primary" : "k-btn-outline"}`} onClick={() => setTab(x.id)}>{x.label}</button>)}
      </div>
      <div className="space-y-4">{list.length === 0 ? <Empty>Nothing here yet.</Empty> : list.map((b) => <BookingPanel key={b.id} b={b} viewer="professional" />)}</div>
    </div>
  );
}
