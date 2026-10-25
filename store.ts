import { useSyncExternalStore } from "react";
import { type Extra, approvedExtras, billableMinutes, finalLabour } from "./pricing";

export type Role = "customer" | "professional" | "employer";
export type Trade = "electrical" | "plumbing" | "ac" | "electronics";

export const TRADES: { id: Trade; label: string }[] = [
  { id: "electrical", label: "Electrical repairs" },
  { id: "plumbing", label: "Plumbing" },
  { id: "ac", label: "AC & refrigeration" },
  { id: "electronics", label: "Electronics repair" },
];
export const LATER_TRADES = [
  "Welding & fabrication",
  "Automotive repairs",
  "Carpentry",
  "Computer & networking",
  "Painting & maintenance",
];
export const tradeLabel = (t: Trade) => TRADES.find((x) => x.id === t)?.label ?? t;

export type Verified = { label: string; verified: boolean };
export type TimelineItem = { date: string; title: string; hours: number; kind: "job" | "training" | "apprenticeship"; verifiedBy?: string };

export type Worker = {
  id: string;
  name: string;
  trade: Trade;
  stage: "student" | "graduate" | "experienced";
  skills: string[];
  qualifications: Verified[];
  experienceYears: number;
  rating: number;
  distanceKm: number;
  available: boolean;
  hourlyRate: number;
  estHours: number;
  completedJobs: number;
  verifiedHours: number;
  supervisedHours: number;
  earnings: number;
  employerFeedback: string[];
  customerFeedback: { by: string; rating: number; text: string }[];
  timeline: TimelineItem[];
  certificates: string[];
};

export type BookingStatus =
  | "requested" | "accepted" | "rejected" | "in_progress" | "paused" | "work_done" | "completed" | "disputed";

export type Booking = {
  id: string;
  customerName: string;
  workerId: string;
  trade: Trade;
  description: string;
  photo?: string | undefined;
  locality: string;
  hourlyRate: number; // locked at booking
  estHours: number;
  extras: Extra[];
  status: BookingStatus;
  createdAt: number;
  startedAt?: number | undefined;
  completedAt?: number | undefined;
  pausedMs: number;
  pauseStartedAt?: number | undefined;
  billableMin?: number | undefined;
  finalLabour?: number | undefined;
  finalTotal?: number | undefined;
  dispute?: string | undefined;
  rating?: number | undefined;
};

export type Vacancy = {
  id: string; title: string; company: string; trade: string; kind: "job" | "apprenticeship";
  location: string; pay: string; requirement: string; postedAt: number;
};
export type Application = { id: string; vacancyId: string; workerId: string; status: "applied" | "shortlisted" | "selected" | "rejected"; at: number };
export type Alert = {
  id: string; workerId: string; jobId: string; reason: string; status: "active" | "acknowledged" | "resolved";
  at: number; location: string; simulated: boolean;
};
export type Notice = { id: string; role: Role | "all"; text: string; at: number };

export type Session = { role: Role; name: string; workerId?: string | undefined };

export type State = {
  session: Session | null;
  workers: Worker[];
  bookings: Booking[];
  vacancies: Vacancy[];
  applications: Application[];
  alerts: Alert[];
  notices: Notice[];
  company: { name: string; type: string; city: string; about: string };
  checkins: { id: string; jobId: string; at: number; ok: boolean }[];
};

const day = 86400000;
const T0 = Date.UTC(2026, 9, 20);

function seedWorkers(): Worker[] {
  const base = {
    available: true, employerFeedback: [] as string[], customerFeedback: [] as Worker["customerFeedback"],
    timeline: [] as TimelineItem[], certificates: [] as string[], supervisedHours: 0,
  };
  return [
    {
      ...base, id: "w1", name: "Ravi Kumar", trade: "electrical", stage: "graduate",
      skills: ["Switchboard repair", "House wiring", "MCB & DB installation", "Fan & light fitting"],
      qualifications: [{ label: "ITI Electrician (NCVT), 2023", verified: true }, { label: "Apprenticeship – Tata Power, 1 yr", verified: true }, { label: "Solar panel basics (self-declared)", verified: false }],
      experienceYears: 3, rating: 4.7, distanceKm: 1.2, hourlyRate: 250, estHours: 2,
      completedJobs: 18, verifiedHours: 64, supervisedHours: 120, earnings: 15800,
      employerFeedback: ["Punctual, follows safety SOPs. — Shree Electricals"],
      customerFeedback: [{ by: "Anita S.", rating: 5, text: "Fixed our switchboard neatly and explained the issue." }, { by: "Vikram P.", rating: 4, text: "Good work, arrived on time." }],
      timeline: [
        { date: "2026-10-12", title: "Kitchen wiring fault repair", hours: 3, kind: "job" },
        { date: "2026-09-28", title: "DB box replacement", hours: 4, kind: "job" },
        { date: "2024-06-30", title: "Apprenticeship completed – Tata Power", hours: 120, kind: "apprenticeship", verifiedBy: "Tata Power Training Cell" },
      ],
      certificates: ["ITI Electrician certificate.pdf"],
    },
    {
      ...base, id: "w2", name: "Salim Shaikh", trade: "electrical", stage: "experienced",
      skills: ["Industrial wiring", "Inverter installation", "Fault finding"],
      qualifications: [{ label: "ITI Electrician, 2015", verified: true }, { label: "Wireman licence", verified: true }],
      experienceYears: 10, rating: 4.9, distanceKm: 3.4, hourlyRate: 350, estHours: 1.5,
      completedJobs: 212, verifiedHours: 690, earnings: 241000,
      customerFeedback: [{ by: "Rohan M.", rating: 5, text: "Very experienced, quick diagnosis." }],
    },
    {
      ...base, id: "w3", name: "Deepak Yadav", trade: "electrical", stage: "graduate",
      skills: ["Switch & socket repair", "Lighting"],
      qualifications: [{ label: "ITI Electrician, 2025", verified: true }],
      experienceYears: 1, rating: 4.4, distanceKm: 0.8, hourlyRate: 180, estHours: 2.5,
      completedJobs: 9, verifiedHours: 26, earnings: 4300,
    },
    {
      ...base, id: "w4", name: "Pooja Patil", trade: "electrical", stage: "student",
      skills: ["Basic wiring (supervised)"],
      qualifications: [{ label: "ITI Electrician – 2nd year student", verified: true }],
      experienceYears: 0, rating: 0, distanceKm: 2.0, hourlyRate: 0, estHours: 0,
      completedJobs: 0, verifiedHours: 0, supervisedHours: 36, earnings: 0,
      timeline: [{ date: "2026-08-15", title: "Supervised practical – panel wiring", hours: 36, kind: "training", verifiedBy: "ITI Pune instructor" }],
    },
    {
      ...base, id: "w5", name: "Manoj Verma", trade: "plumbing", stage: "experienced",
      skills: ["Leak repair", "Pipe fitting", "Bathroom fittings"],
      qualifications: [{ label: "ITI Plumber, 2018", verified: true }],
      experienceYears: 7, rating: 4.6, distanceKm: 1.9, hourlyRate: 280, estHours: 1.5,
      completedJobs: 140, verifiedHours: 410, earnings: 98000,
    },
    {
      ...base, id: "w6", name: "Arjun Nair", trade: "plumbing", stage: "graduate",
      skills: ["Tap & sink repair", "Drain cleaning"],
      qualifications: [{ label: "ITI Plumber, 2024", verified: true }],
      experienceYears: 2, rating: 4.5, distanceKm: 2.6, hourlyRate: 200, estHours: 2,
      completedJobs: 31, verifiedHours: 88, earnings: 15200,
    },
    {
      ...base, id: "w7", name: "Imran Khan", trade: "ac", stage: "experienced",
      skills: ["Split AC service", "Gas refilling", "Refrigerator repair"],
      qualifications: [{ label: "ITI Refrigeration & AC Mechanic, 2016", verified: true }],
      experienceYears: 9, rating: 4.8, distanceKm: 2.2, hourlyRate: 400, estHours: 1.5,
      completedJobs: 260, verifiedHours: 720, earnings: 287000,
    },
    {
      ...base, id: "w8", name: "Suresh Babu", trade: "ac", stage: "graduate",
      skills: ["AC cleaning", "Installation"],
      qualifications: [{ label: "ITI RAC Mechanic, 2024", verified: true }],
      experienceYears: 2, rating: 4.3, distanceKm: 4.1, hourlyRate: 260, estHours: 2,
      completedJobs: 40, verifiedHours: 95, earnings: 22000,
    },
    {
      ...base, id: "w9", name: "Kavita Joshi", trade: "electronics", stage: "graduate",
      skills: ["TV & monitor repair", "Mixer & appliance repair", "PCB soldering"],
      qualifications: [{ label: "ITI Electronics Mechanic, 2022", verified: true }],
      experienceYears: 4, rating: 4.7, distanceKm: 1.5, hourlyRate: 300, estHours: 1.5,
      completedJobs: 75, verifiedHours: 190, earnings: 51000,
    },
    {
      ...base, id: "w10", name: "Naveen Reddy", trade: "electronics", stage: "experienced",
      skills: ["Inverter & UPS", "Washing machine boards"],
      qualifications: [{ label: "Diploma Electronics (self-declared)", verified: false }],
      experienceYears: 6, rating: 4.5, distanceKm: 3.0, hourlyRate: 320, estHours: 2,
      completedJobs: 98, verifiedHours: 260, earnings: 70000,
    },
  ];
}

export function seed(): State {
  return {
    session: null,
    workers: seedWorkers(),
    bookings: [
      {
        id: "BK-1001", customerName: "Demo Customer", workerId: "w5", trade: "plumbing",
        description: "Kitchen sink leakage", locality: "Kothrud, Pune", hourlyRate: 280, estHours: 1.5,
        extras: [], status: "completed", createdAt: T0 - 6 * day, startedAt: T0 - 6 * day, completedAt: T0 - 6 * day + 80 * 60000,
        pausedMs: 0, billableMin: 90, finalLabour: 420, finalTotal: 420, rating: 5,
      },
    ],
    vacancies: [
      { id: "v1", title: "Junior Electrician", company: "Shree Electricals", trade: "Electrician", kind: "job", location: "Pune", pay: "₹16,000–20,000/mo", requirement: "ITI Electrician, 0–2 yrs", postedAt: T0 - 2 * day },
      { id: "v2", title: "Fitter Apprentice", company: "Deccan Engineering Works", trade: "Fitter", kind: "apprenticeship", location: "Pimpri", pay: "₹9,000 stipend", requirement: "ITI Fitter (pursuing/passed)", postedAt: T0 - day },
      { id: "v3", title: "MIG Welder", company: "Sahyadri Fabricators", trade: "Welder", kind: "job", location: "Chakan", pay: "₹18,000–24,000/mo", requirement: "ITI Welder, 1+ yr", postedAt: T0 - 3 * day },
      { id: "v4", title: "Two-wheeler Mechanic", company: "Speedline Motors", trade: "Mechanic", kind: "job", location: "Hadapsar", pay: "₹15,000–19,000/mo", requirement: "ITI MMV/Mechanic Diesel", postedAt: T0 - 4 * day },
      { id: "v5", title: "AC Technician Apprentice", company: "CoolTech Services", trade: "AC Technician", kind: "apprenticeship", location: "Baner", pay: "₹10,000 stipend", requirement: "ITI RAC (pursuing/passed)", postedAt: T0 - day },
      { id: "v6", title: "Electrician Apprentice (supervised)", company: "Shree Electricals", trade: "Electrician", kind: "apprenticeship", location: "Pune", pay: "₹8,500 stipend", requirement: "ITI Electrician student/graduate", postedAt: T0 },
    ],
    applications: [
      { id: "a1", vacancyId: "v1", workerId: "w3", status: "applied", at: T0 - day },
    ],
    alerts: [],
    notices: [
      { id: "n1", role: "all", text: "Welcome to the KARTAVYA demo. All people, prices and alerts are sample data.", at: T0 },
    ],
    company: { name: "Shree Electricals", type: "Electrical contractor", city: "Pune", about: "Residential and commercial electrical contracting since 2009." },
    checkins: [],
  };
}

const KEY = "kartavya-demo-v1";
let state: State = seed();
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...seed(), ...JSON.parse(raw) };
  } catch {
    /* ignore corrupted storage */
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full (usually large photos) — drop photos and retry
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...state, bookings: state.bookings.map((b) => ({ ...b, photo: undefined })) }));
    } catch { /* give up silently */ }
  }
}

export function setState(fn: (s: State) => State) {
  load();
  state = fn(state);
  persist();
  listeners.forEach((l) => l());
}
export function getState() {
  load();
  return state;
}

const serverSnap = seed();
function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
export function useStore<T>(sel: (s: State) => T): T {
  const snap = useSyncExternalStore(
    subscribe,
    getState,
    () => serverSnap,
  );
  return sel(snap);
}

export const uid = (p: string) => p + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

function notify(role: Notice["role"], text: string) {
  return { id: uid("n"), role, text, at: Date.now() } as Notice;
}

// ---------- actions ----------
export const actions = {
  login(session: Session) {
    setState((s) => ({ ...s, session }));
  },
  logout() {
    setState((s) => ({ ...s, session: null }));
  },
  reset() {
    setState(() => seed());
  },
  createBooking(b: Omit<Booking, "id" | "status" | "createdAt" | "pausedMs" | "extras"> & { extras?: Extra[] }) {
    const id = "BK-" + Math.floor(1000 + Math.random() * 9000);
    setState((s) => {
      const w = s.workers.find((x) => x.id === b.workerId);
      return {
        ...s,
        bookings: [{ ...b, id, status: "requested", createdAt: Date.now(), pausedMs: 0, extras: b.extras ?? [] }, ...s.bookings],
        notices: [notify("professional", `New request ${id} for ${w?.name}: ${b.description}`), ...s.notices],
      };
    });
    return id;
  },
  updateBooking(id: string, fn: (b: Booking) => Booking, notice?: Notice) {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? fn(b) : b)),
      notices: notice ? [notice, ...s.notices] : s.notices,
    }));
  },
  accept(id: string) {
    actions.updateBooking(id, (b) => ({ ...b, status: "accepted" }), notify("customer", `Booking ${id} was accepted by the professional.`));
  },
  reject(id: string) {
    actions.updateBooking(id, (b) => ({ ...b, status: "rejected" }), notify("customer", `Booking ${id} was declined. Please choose another professional.`));
  },
  start(id: string) {
    actions.updateBooking(id, (b) => ({ ...b, status: "in_progress", startedAt: Date.now() }), notify("customer", `Job ${id} started — timer is running.`));
  },
  pause(id: string) {
    actions.updateBooking(id, (b) => ({ ...b, status: "paused", pauseStartedAt: Date.now() }));
  },
  resume(id: string) {
    actions.updateBooking(id, (b) => ({
      ...b, status: "in_progress",
      pausedMs: b.pausedMs + (b.pauseStartedAt ? Date.now() - b.pauseStartedAt : 0), pauseStartedAt: undefined,
    }));
  },
  finishWork(id: string) {
    actions.updateBooking(id, (b) => {
      const now = Date.now();
      const paused = b.pausedMs + (b.pauseStartedAt ? now - b.pauseStartedAt : 0);
      return { ...b, status: "work_done", completedAt: now, pausedMs: paused, pauseStartedAt: undefined };
    }, notify("customer", `Professional marked job ${id} complete. Please confirm and review the bill.`));
  },
  requestExtra(id: string, label: string, amount: number) {
    actions.updateBooking(id, (b) => ({ ...b, extras: [...b.extras, { id: uid("x"), label, amount, status: "pending" }] }),
      notify("customer", `Approval needed on ${id}: ${label} (₹${amount}).`));
  },
  decideExtra(id: string, extraId: string, status: "approved" | "declined") {
    actions.updateBooking(id, (b) => ({ ...b, extras: b.extras.map((e) => (e.id === extraId ? { ...e, status } : e)) }));
  },
  confirmCompletion(id: string, rating: number) {
    setState((s) => {
      const b = s.bookings.find((x) => x.id === id);
      if (!b || !b.startedAt || !b.completedAt) return s;
      const elapsed = b.completedAt - b.startedAt - b.pausedMs;
      const labour = finalLabour(b.hourlyRate, elapsed);
      const total = labour + approvedExtras(b.extras);
      const mins = billableMinutes(elapsed);
      const hrs = Math.round((mins / 60) * 100) / 100;
      return {
        ...s,
        bookings: s.bookings.map((x) => (x.id === id ? { ...x, status: "completed", billableMin: mins, finalLabour: labour, finalTotal: total, rating } : x)),
        workers: s.workers.map((w) =>
          w.id === b.workerId
            ? {
                ...w,
                completedJobs: w.completedJobs + 1,
                verifiedHours: Math.round((w.verifiedHours + hrs) * 100) / 100,
                earnings: w.earnings + total,
                rating: Math.round(((w.rating * w.completedJobs + rating) / (w.completedJobs + 1)) * 10) / 10,
                customerFeedback: [{ by: b.customerName, rating, text: `${tradeLabel(b.trade)}: ${b.description}` }, ...w.customerFeedback],
                timeline: [{ date: new Date().toISOString().slice(0, 10), title: `${b.description} (${b.id})`, hours: hrs, kind: "job" as const }, ...w.timeline],
              }
            : w,
        ),
        notices: [notify("professional", `Customer confirmed ${id}. ₹${total} added to earnings and Work Passport updated.`), ...s.notices],
      };
    });
  },
  dispute(id: string, reason: string) {
    actions.updateBooking(id, (b) => ({ ...b, status: "disputed", dispute: reason }), notify("professional", `Customer raised a dispute on ${id}: ${reason}`));
  },
  updateWorker(id: string, patch: Partial<Worker>) {
    setState((s) => ({ ...s, workers: s.workers.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));
  },
  apply(vacancyId: string, workerId: string) {
    setState((s) => {
      if (s.applications.some((a) => a.vacancyId === vacancyId && a.workerId === workerId)) return s;
      const w = s.workers.find((x) => x.id === workerId);
      const v = s.vacancies.find((x) => x.id === vacancyId);
      return {
        ...s,
        applications: [{ id: uid("a"), vacancyId, workerId, status: "applied", at: Date.now() }, ...s.applications],
        notices: [notify("employer", `${w?.name} applied for ${v?.title}.`), ...s.notices],
      };
    });
  },
  setApplication(id: string, status: Application["status"]) {
    setState((s) => {
      const a = s.applications.find((x) => x.id === id);
      const v = s.vacancies.find((x) => x.id === a?.vacancyId);
      return {
        ...s,
        applications: s.applications.map((x) => (x.id === id ? { ...x, status } : x)),
        notices: [notify("professional", `Your application for ${v?.title} is now: ${status}.`), ...s.notices],
      };
    });
  },
  postVacancy(v: Omit<Vacancy, "id" | "postedAt">) {
    setState((s) => ({ ...s, vacancies: [{ ...v, id: uid("v"), postedAt: Date.now() }, ...s.vacancies] }));
  },
  updateCompany(c: State["company"]) {
    setState((s) => ({ ...s, company: c }));
  },
  raiseAlert(a: Omit<Alert, "id" | "at" | "status">) {
    setState((s) => ({ ...s, alerts: [{ ...a, id: uid("AL"), at: Date.now(), status: "active" }, ...s.alerts] }));
  },
  setAlert(id: string, status: Alert["status"]) {
    setState((s) => ({ ...s, alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)) }));
  },
  checkin(jobId: string, ok: boolean) {
    setState((s) => ({ ...s, checkins: [{ id: uid("c"), jobId, at: Date.now(), ok }, ...s.checkins] }));
  },
};

export function elapsedMs(b: Booking, now: number) {
  if (!b.startedAt) return 0;
  const end = b.completedAt ?? now;
  const pausing = b.pauseStartedAt ? (b.completedAt ?? now) - b.pauseStartedAt : 0;
  return Math.max(0, end - b.startedAt - b.pausedMs - pausing);
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Awaiting professional",
  accepted: "Accepted",
  rejected: "Declined",
  in_progress: "In progress",
  paused: "Paused",
  work_done: "Awaiting your confirmation",
  completed: "Completed",
  disputed: "Disputed",
};
