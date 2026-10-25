import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Camera, Clock, HardHat, IdCard, Search, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/kartavya";
import hero from "@/assets/hero-electrician.jpg";
import workshop from "@/assets/iti-workshop.jpg";
import ac from "@/assets/ac-tech.jpg";
import plumber from "@/assets/plumber.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KARTAVYA — Your Skills Deserve Opportunities" },
      { name: "description", content: "Find local work, build your skills, earn fairly, and work safely. Hire verified ITI professionals nearby." },
      { property: "og:title", content: "KARTAVYA — Your Skills Deserve Opportunities" },
      { property: "og:description", content: "Find local work, build your skills, earn fairly, and work safely." },
    ],
  }),
  component: Index,
});

const entries = [
  { role: "customer" as const, icon: Search, title: "Find a Professional", text: "Upload a photo of the problem and compare nearby verified technicians with upfront hourly pricing." },
  { role: "professional" as const, icon: HardHat, title: "Join as a Skilled Worker", text: "ITI students, graduates and experienced technicians — get local jobs, apprenticeships and a Work Passport." },
  { role: "employer" as const, icon: Briefcase, title: "Hire Skilled Talent", text: "Workshops and contractors — post vacancies and apprenticeships, review verified Work Passports." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Wordmark />
        <Link to="/login" search={{ role: "customer" }} className="k-btn k-btn-outline">Demo login</Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-4 md:grid-cols-2">
        <div className="k-fade">
          <span className="k-chip">Your Time, Your Money.</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Your Skills Deserve <span className="text-primary">Opportunities.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">Find local work, build your skills, earn fairly, and work safely.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" search={{ role: "customer" }} className="k-btn k-btn-accent">Find a professional <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/login" search={{ role: "professional" }} className="k-btn k-btn-outline">I'm a skilled worker</Link>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="Electrician repairing a switchboard" width={1280} height={960} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]" />
          <div className="k-card k-fade absolute -bottom-5 left-4 flex items-center gap-3 p-3">
            <Clock className="h-5 w-5 text-accent" />
            <div className="text-sm"><b>₹250/hr × 2 h = ₹500</b><div className="text-xs text-muted-foreground">Price shown before you book</div></div>
          </div>
        </div>
      </section>

      <section className="bg-sky py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">How would you like to start?</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {entries.map((e) => (
              <Link key={e.role} to="/login" search={{ role: e.role }} className="k-card group p-6 transition-transform hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary"><e.icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-bold uppercase tracking-wide">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{e.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 md:grid-cols-4">
        {[
          { icon: Camera, t: "Photo-based matching", d: "Show the problem, pick the trade, see nearby pros." },
          { icon: Clock, t: "Transparent time pricing", d: "Locked hourly rate, live job timer, fair final bill." },
          { icon: ShieldCheck, t: "Worker safety", d: "SOS, check-ins and connection monitoring on jobs." },
          { icon: IdCard, t: "Digital Work Passport", d: "Verified skills, hours and history for employers." },
        ].map((f) => (
          <div key={f.t} className="p-2">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-bold">{f.t}</h3>
            <p className="text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-3">
        {[{ src: workshop, a: "ITI students training at a lathe" }, { src: ac, a: "AC technician servicing a split AC" }, { src: plumber, a: "Plumber fixing a sink" }].map((i) => (
          <img key={i.a} src={i.src} alt={i.a} loading="lazy" width={1024} height={768} className="aspect-[4/3] w-full rounded-2xl object-cover" />
        ))}
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <Wordmark small /> — Your Time, Your Money. Connecting Skills to Opportunities.
        <div className="mt-1 text-xs">Hackathon prototype · demo data only</div>
      </footer>
    </div>
  );
}
