// KARTAVYA billing rules (demo):
// - Estimated labour = hourly rate × estimated hours.
// - Billable time is rounded UP to the next 15 minutes, with a 30-minute minimum.
// - Only customer-approved extra charges are added to the bill.

export type Extra = { id: string; label: string; amount: number; status: "pending" | "approved" | "declined" };

export function estimateLabour(hourlyRate: number, hours: number) {
  return Math.round(hourlyRate * hours);
}

export function billableMinutes(elapsedMs: number) {
  const mins = Math.max(0, elapsedMs) / 60000;
  return Math.max(30, Math.ceil(mins / 15) * 15);
}

export function finalLabour(hourlyRate: number, elapsedMs: number) {
  return Math.round((hourlyRate * billableMinutes(elapsedMs)) / 60);
}

export function runningCost(hourlyRate: number, elapsedMs: number) {
  return Math.round((hourlyRate * Math.max(0, elapsedMs)) / 3600000);
}

export function approvedExtras(extras: Extra[]) {
  return extras.filter((e) => e.status === "approved").reduce((s, e) => s + e.amount, 0);
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export function fmtDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}
