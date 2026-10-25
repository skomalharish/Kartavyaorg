import { describe, expect, it } from "vitest";
import { approvedExtras, billableMinutes, estimateLabour, finalLabour } from "@/lib/pricing";

describe("pricing", () => {
  it("estimate = hourly rate × duration (₹250 × 2h = ₹500)", () => {
    expect(estimateLabour(250, 2)).toBe(500);
  });
  it("bills a 30 minute minimum", () => {
    expect(billableMinutes(5 * 60000)).toBe(30);
  });
  it("rounds billable time up to 15 minutes", () => {
    expect(billableMinutes(61 * 60000)).toBe(75);
    expect(finalLabour(250, 61 * 60000)).toBe(313);
  });
  it("only adds customer-approved extras", () => {
    expect(
      approvedExtras([
        { id: "a", label: "Switch", amount: 120, status: "approved" },
        { id: "b", label: "Wire", amount: 80, status: "pending" },
        { id: "c", label: "MCB", amount: 300, status: "declined" },
      ]),
    ).toBe(120);
  });
});
