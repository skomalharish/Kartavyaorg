import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/kartavya";

export const Route = createFileRoute("/customer")({
  head: () => ({ meta: [{ title: "Customer — KARTAVYA" }, { name: "description", content: "Find and book nearby skilled professionals." }, { property: "og:title", content: "Customer — KARTAVYA" }, { property: "og:description", content: "Find and book nearby skilled professionals." }] }),
  component: () => <AppShell role="customer"><Outlet /></AppShell>,
});
