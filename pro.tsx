import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/kartavya";

export const Route = createFileRoute("/pro")({
  head: () => ({ meta: [{ title: "Professional — KARTAVYA" }, { name: "description", content: "Jobs, earnings, safety and Work Passport for skilled workers." }, { property: "og:title", content: "Professional — KARTAVYA" }, { property: "og:description", content: "Jobs, earnings, safety and Work Passport for skilled workers." }] }),
  component: () => <AppShell role="professional"><Outlet /></AppShell>,
});
