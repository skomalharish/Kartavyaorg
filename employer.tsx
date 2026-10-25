import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/kartavya";

export const Route = createFileRoute("/employer")({
  head: () => ({ meta: [{ title: "Employer — KARTAVYA" }, { name: "description", content: "Hire ITI talent, post jobs and apprenticeships." }, { property: "og:title", content: "Employer — KARTAVYA" }, { property: "og:description", content: "Hire ITI talent, post jobs and apprenticeships." }] }),
  component: () => <AppShell role="employer"><Outlet /></AppShell>,
});
