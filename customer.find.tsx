import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Check, Loader2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { PageTitle, QualList, StageChip, Avatar, useSession } from "@/components/kartavya";
import { actions, TRADES, tradeLabel, useStore, type Trade, type Worker } from "@/lib/store";
import { estimateLabour, inr } from "@/lib/pricing";

export const Route = createFileRoute("/customer/find")({
  validateSearch: (s: Record<string, unknown>): { trade?: Trade | undefined } => ({
    trade: TRADES.some((t) => t.id === s["trade"]) ? (s["trade"] as Trade) : undefined,
  }),
  component: Find,
});

const VISIT_FEE = 50;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 640 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = img.width * scale; c.height = img.height * scale;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function Find() {
  const { trade: initialTrade } = Route.useSearch();
  const session = useSession();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string>();
  const [trade, setTrade] = useState<Trade | "">(initialTrade ?? "");
  const [desc, setDesc] = useState("");
  const [locality, setLocality] = useState("");
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<{ trade?: string; desc?: string; locality?: string; photo?: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState<Worker>();
  const workers = useStore((s) => s.workers);

  const matches = workers
    .filter((w) => w.trade === trade && w.stage !== "student" && w.available)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const onFile = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    try { setPhoto(await resizeImage(f)); setErrors((e) => ({ ...e, photo: "" })); }
    catch { toast.error("Couldn't read that image. Try another one."); }
  };

  const locate = () => {
    if (!navigator.geolocation) { toast.error("Location isn't supported here — please type your locality"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocality(`Near ${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}`); setLocating(false); },
      () => { setLocating(false); toast.error("Location permission denied — please type your locality"); },
      { timeout: 8000 },
    );
  };

  const findPros = () => {
    const e: { trade?: string; desc?: string; locality?: string } = {};
    if (!trade) e.trade = "Select the trade that fits the problem.";
    if (desc.trim().length < 8) e.desc = "Describe the problem in a few words (min 8 characters).";
    if (locality.trim().length < 3) e.locality = "Enter your locality or use your location.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setShowResults(true);
    setSelected(undefined);
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const confirm = () => {
    if (!selected || !trade || !session) return;
    const id = actions.createBooking({
      customerName: session.name, workerId: selected.id, trade, description: desc.trim(), photo,
      locality: locality.trim(), hourlyRate: selected.hourlyRate, estHours: selected.estHours,
      extras: [{ id: "visit", label: "Visit charge (disclosed at booking)", amount: VISIT_FEE, status: "approved" }],
    });
    toast.success(`Booking ${id} sent to ${selected.name}`);
    navigate({ to: "/customer/bookings" });
  };

  return (
    <div>
      <PageTitle title="Find a professional" sub="Upload a photo, describe the issue and compare nearby professionals." />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="k-card p-5">
          <div className="text-xs font-bold uppercase text-primary">Step 1–3 · Problem photo</div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          {photo ? (
            <div className="mt-3">
              <img src={photo} alt="Selected problem" className="max-h-72 w-full rounded-xl object-cover" />
              <button className="k-btn k-btn-outline mt-3" onClick={() => fileRef.current?.click()}>Change photo</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} className="mt-3 flex h-56 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-sky text-primary transition-colors hover:bg-secondary">
              <Camera className="h-8 w-8" /><b>Upload Problem Photo</b><span className="text-xs text-muted-foreground">Choose from device or take a photo</span>
            </button>
          )}
          <p className="mt-3 text-xs text-muted-foreground">The photo is shared with the professional you select. KARTAVYA does not analyse the image automatically in this prototype — matching uses the trade you choose.</p>
        </div>

        <div className="k-card space-y-4 p-5">
          <div className="text-xs font-bold uppercase text-primary">Step 4–5 · Details & location</div>
          <div>
            <label className="k-label" htmlFor="trade">Trade</label>
            <select id="trade" className="k-input" value={trade} onChange={(e) => setTrade(e.target.value as Trade)}>
              <option value="">Select a trade…</option>
              {TRADES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            {errors["trade"] && <p className="mt-1 text-xs text-destructive">{errors["trade"]}</p>}
          </div>
          <div>
            <label className="k-label" htmlFor="desc">Describe the problem</label>
            <textarea id="desc" rows={3} className="k-input" placeholder="e.g. Switchboard is burnt and sparking when I switch on the fan" value={desc} onChange={(e) => setDesc(e.target.value)} />
            {errors.desc && <p className="mt-1 text-xs text-destructive">{errors.desc}</p>}
          </div>
          <div>
            <label className="k-label" htmlFor="loc">Locality</label>
            <div className="flex gap-2">
              <input id="loc" className="k-input" placeholder="e.g. Kothrud, Pune" value={locality} onChange={(e) => setLocality(e.target.value)} />
              <button type="button" className="k-btn k-btn-outline" onClick={locate} disabled={locating}>{locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}Use location</button>
            </div>
            {errors.locality && <p className="mt-1 text-xs text-destructive">{errors.locality}</p>}
          </div>
          <button className="k-btn k-btn-accent w-full" onClick={findPros}>Show nearby professionals</button>
        </div>
      </div>

      {showResults && trade && (
        <section id="results" className="mt-8 k-fade">
          <h2 className="mb-1 text-xl font-bold">Step 6 · {matches.length} {tradeLabel(trade)} professionals near {locality}</h2>
          <p className="mb-4 text-sm text-muted-foreground">Demo professionals. Compare and select one. ITI students are not listed for independent jobs.</p>
          {matches.length === 0 && <p className="text-sm text-muted-foreground">No professionals available right now.</p>}
          <div className="grid gap-4 md:grid-cols-3">
            {matches.map((w) => {
              const est = estimateLabour(w.hourlyRate, w.estHours);
              const isSel = selected?.id === w.id;
              return (
                <div key={w.id} className={`k-card flex flex-col p-5 transition-shadow ${isSel ? "ring-2 ring-primary" : ""}`}>
                  <div className="flex items-center gap-3">
                    <Avatar name={w.name} />
                    <div><b>{w.name}</b><div className="text-xs text-muted-foreground">{w.experienceYears} yrs experience</div></div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1"><StageChip w={w} /><span className="k-chip">{w.available ? "Available today" : "Busy"}</span></div>
                  <p className="mt-2 text-xs text-muted-foreground">{w.skills.join(" · ")}</p>
                  <div className="mt-2"><QualList w={w} /></div>
                  <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">Rating</dt><dd className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" />{w.rating}</dd>
                    <dt className="text-muted-foreground">Distance</dt><dd>{w.distanceKm} km</dd>
                    <dt className="text-muted-foreground">Hourly rate</dt><dd className="font-semibold text-accent">{inr(w.hourlyRate)}</dd>
                    <dt className="text-muted-foreground">Est. duration</dt><dd>{w.estHours} h</dd>
                    <dt className="text-muted-foreground">Est. total</dt><dd className="font-bold text-accent">{inr(est + VISIT_FEE)}</dd>
                  </dl>
                  <div className="mt-auto flex gap-2 pt-4">
                    <Link to="/passport/$id" params={{ id: w.id }} className="k-btn k-btn-outline flex-1">View Profile</Link>
                    <button className={`k-btn flex-1 ${isSel ? "k-btn-primary" : "k-btn-accent"}`} onClick={() => setSelected(w)}>{isSel ? <><Check className="h-4 w-4" />Selected</> : "Select"}</button>
                  </div>
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="k-card k-fade mt-6 p-6">
              <h3 className="text-lg font-bold">Price estimate with {selected.name}</h3>
              <div className="mt-3 grid max-w-md grid-cols-2 gap-y-1.5 text-sm">
                <span>Hourly rate</span><span className="text-right">{inr(selected.hourlyRate)}/hr</span>
                <span>Estimated duration</span><span className="text-right">{selected.estHours} h</span>
                <span>Estimated labour cost</span><span className="text-right font-semibold">{inr(estimateLabour(selected.hourlyRate, selected.estHours))}</span>
                <span>Visit charge (disclosed)</span><span className="text-right">{inr(VISIT_FEE)}</span>
                <span>Possible materials</span><span className="text-right text-muted-foreground">Only with your approval</span>
                <span className="font-bold">Total estimated amount</span><span className="text-right text-xl font-bold text-accent">{inr(estimateLabour(selected.hourlyRate, selected.estHours) + VISIT_FEE)}</span>
              </div>
              <p className="mt-3 max-w-xl text-xs text-muted-foreground">The final bill depends on verified billable time (rounded up to 15 min, minimum 30 min) at the agreed rate, plus any extra charges you approve. The rate is locked once you confirm and cannot be changed by the professional.</p>
              <button className="k-btn k-btn-accent mt-4" onClick={confirm}>Confirm booking</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
