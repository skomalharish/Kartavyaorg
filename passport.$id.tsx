import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PassportView } from "@/components/passport";
import { useHydrated } from "@/components/kartavya";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/passport/$id")({
  head: () => ({
    meta: [
      { title: "Work Passport — KARTAVYA" },
      { name: "description", content: "Verified skills, hours and work history of a KARTAVYA professional." },
      { property: "og:title", content: "Work Passport — KARTAVYA" },
      { property: "og:description", content: "Verified skills, hours and work history of a KARTAVYA professional." },
    ],
  }),
  component: Passport,
});

function Passport() {
  const { id } = Route.useParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const w = useStore((s) => s.workers.find((x) => x.id === id));
  const isSelf = useStore((s) => s.session?.workerId === id);
  return (
    <div className="min-h-screen bg-sky">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <button className="k-btn k-btn-ghost mb-4" onClick={() => router.history.back()}><ArrowLeft className="h-4 w-4" />Back</button>
        {!hydrated ? <p className="text-muted-foreground">Loading…</p> : w ? <PassportView w={w} showPrivate={isSelf} /> : <p>Professional not found.</p>}
      </div>
    </div>
  );
}
