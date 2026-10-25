import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { EmergencyDashboard, PageTitle, useMe, useNow } from "@/components/kartavya";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/pro/safety")({ component: Safety });

type SR = { start: () => void; stop: () => void; continuous: boolean; interimResults: boolean; lang: string; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null };

const KEYWORDS = ["help", "bachao", "emergency", "madad"];

function Safety() {
  const me = useMe();
  const jobs = useStore((s) => s.bookings.filter((b) => b.workerId === s.session?.workerId && ["accepted", "in_progress", "paused"].includes(b.status)));
  const [jobId, setJobId] = useState("");
  const job = jobs.find((j) => j.id === jobId) ?? jobs[0];
  const [session, setSession] = useState(false);
  const [contact, setContact] = useState("Sunita Kumar (sister)");
  const [listening, setListening] = useState(false);
  const recRef = useRef<SR | null>(null);
  const [interval, setIntervalSec] = useState(30);
  const [nextCheck, setNextCheck] = useState<number | null>(null);
  const [online, setOnline] = useState(true);
  const [lastBeat, setLastBeat] = useState(Date.now());
  const [timeoutSec, setTimeoutSec] = useState(20);
  const now = useNow(true);

  const jobRef = job?.id ?? "DEMO-JOB";
  const loc = job ? `${job.locality} (demo location)` : "Kothrud, Pune (demo location)";

  const raise = (reason: string, simulated = true) => {
    if (!me) return;
    actions.raiseAlert({ workerId: me.id, jobId: jobRef, reason, location: loc, simulated });
    toast.error(`Alert sent to ${contact} & KARTAVYA support: ${reason}`);
  };

  // Connection + heartbeat
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => { setOnline(true); setLastBeat(Date.now()); };
    const off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    const hb = setInterval(() => { if (navigator.onLine) setLastBeat(Date.now()); }, 5000);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); clearInterval(hb); };
  }, []);
  const stale = now - lastBeat > timeoutSec * 1000;
  const conn = !online ? "offline" : stale ? "unknown" : "connected";

  // Check-in timer
  useEffect(() => {
    if (!session || nextCheck === null || now < nextCheck) return;
    actions.checkin(jobRef, false);
    raise("Missed safety check-in (not proof of an emergency)");
    setNextCheck(Date.now() + interval * 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  useEffect(() => () => recRef.current?.stop(), []);

  const toggleVoice = () => {
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) { toast.error("Voice commands aren't supported in this browser. Use the SOS button."); return; }
    const rec = new Ctor();
    rec.continuous = true; rec.interimResults = false; rec.lang = "en-IN";
    rec.onresult = (e) => {
      const last = (e.results[e.results.length - 1]?.[0]?.transcript ?? "").toLowerCase();
      if (KEYWORDS.some((k) => last.includes(k))) raise(`Voice command: “${last.trim()}”`, false);
    };
    rec.onerror = (e) => { if (e.error === "not-allowed") toast.error("Microphone permission denied. Use the SOS button."); setListening(false); };
    rec.onend = () => setListening(false);
    try { rec.start(); recRef.current = rec; setListening(true); toast("Listening for “help” / “bachao”. Audio is not recorded or stored."); }
    catch { toast.error("Couldn't start the microphone"); }
  };

  if (!me) return null;
  const left = nextCheck ? Math.max(0, Math.ceil((nextCheck - now) / 1000)) : null;

  return (
    <div className="space-y-6">
      <PageTitle title="Worker safety" sub="Optional, permission-based safety tools for active jobs." />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="k-card space-y-4 p-5 md:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <label className="k-label" htmlFor="job">Job</label>
              <select id="job" className="k-input" value={job?.id ?? ""} onChange={(e) => setJobId(e.target.value)}>
                {jobs.length === 0 && <option value="">No active job — demo session</option>}
                {jobs.map((j) => <option key={j.id} value={j.id}>{j.id} · {j.description}</option>)}
              </select>
            </div>
            <div className={`k-chip ${conn === "connected" ? "k-chip-success" : conn === "offline" ? "k-chip-danger" : "k-chip-warn"}`}>
              {conn === "connected" ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {conn === "connected" ? "Connected" : conn === "offline" ? "Offline" : "Connection unknown"}
            </div>
          </div>
          {conn !== "connected" && <p className="text-sm text-destructive">Last successful update: {new Date(lastBeat).toLocaleTimeString()}. Missed heartbeat — the device may have lost connection.</p>}

          <label className="flex items-center justify-between rounded-xl bg-sky p-4 font-semibold">
            Safety session for this job
            <input type="checkbox" className="h-6 w-6 accent-[var(--primary)]" checked={session} onChange={(e) => {
              setSession(e.target.checked);
              if (e.target.checked) { setNextCheck(Date.now() + interval * 1000); toast.success("Safety session on"); }
              else { setNextCheck(null); recRef.current?.stop(); setListening(false); }
            }} />
          </label>

          {session ? (
            <div className="space-y-5 k-fade">
              <div className="flex justify-center py-2">
                <button onClick={() => raise("Manual SOS button pressed")} className="k-sos-pulse flex h-40 w-40 flex-col items-center justify-center rounded-full bg-destructive text-3xl font-extrabold text-destructive-foreground transition-transform active:scale-95" aria-label="SOS — send emergency alert">
                  SOS<span className="text-xs font-semibold">Tap to alert</span>
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button className={`k-btn ${listening ? "k-btn-danger" : "k-btn-outline"}`} onClick={toggleVoice}>
                  {listening ? <><Mic className="h-4 w-4 animate-pulse" />Microphone active — tap to stop</> : <><MicOff className="h-4 w-4" />Enable voice SOS (“help” / “bachao”)</>}
                </button>
                <button className="k-btn k-btn-outline" onClick={() => raise("Sound anomaly — SIMULATED demo (no real audio analysis)")}>
                  <Volume2 className="h-4 w-4" />Trigger demo sound-anomaly alert
                </button>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="k-label" htmlFor="int">Check-in every</label>
                    <select id="int" className="k-input" value={interval} onChange={(e) => { const v = Number(e.target.value); setIntervalSec(v); setNextCheck(Date.now() + v * 1000); }}>
                      <option value={30}>30 seconds (demo)</option><option value={300}>5 minutes</option><option value={900}>15 minutes</option><option value={1800}>30 minutes</option>
                    </select>
                  </div>
                  <div className="flex-1 text-sm">Next check-in in <b className="font-mono text-lg">{left}s</b></div>
                  <button className="k-btn k-btn-success" onClick={() => { actions.checkin(jobRef, true); setNextCheck(Date.now() + interval * 1000); toast.success("Checked in — you're OK"); }}>I'm OK</button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">If you miss a check-in, your safety contact is told the check-in was missed — this does not by itself mean an emergency.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Turn on a safety session to show the SOS button, voice SOS and check-ins.</p>
          )}
        </div>

        <div className="k-card space-y-3 p-5">
          <h2 className="font-bold">Safety settings</h2>
          <div><label className="k-label" htmlFor="c">Designated safety contact</label><input id="c" className="k-input" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
          <div><label className="k-label" htmlFor="t">Connection-loss warning after</label>
            <select id="t" className="k-input" value={timeoutSec} onChange={(e) => setTimeoutSec(Number(e.target.value))}>
              <option value={20}>20 seconds (demo)</option><option value={60}>1 minute</option><option value={300}>5 minutes</option>
            </select>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li>Audio is processed only while the microphone indicator is on, in your browser, and never recorded.</li>
            <li>We can't detect a switched-off phone — only that updates stopped.</li>
            <li>Emergency services are not contacted automatically. Call 112 if needed.</li>
          </ul>
        </div>
      </div>
      <EmergencyDashboard />
    </div>
  );
}
