import { describe, expect, it } from "vitest";
import type { Project } from "@/features/dashboard/data/projectsData";
import { formatTargetDate, projectsForGoal } from "../goalLinks";

const makeProject = (slug: string, goals?: string[]): Project => ({
  slug,
  name: slug,
  summary: "A project for testing",
  status: "active",
  stack: ["TypeScript"],
  goals,
});

describe("projectsForGoal", () => {
  it("returns only projects declaring the goal", () => {
    const projects = [
      makeProject("a", ["land-next-senior-role"]),
      makeProject("b", ["ship-side-projects"]),
      makeProject("c", ["land-next-senior-role", "ship-side-projects"]),
    ];

    expect(
      projectsForGoal(projects, "land-next-senior-role").map((p) => p.slug),
    ).toEqual(["a", "c"]);
  });

  it("skips projects with no goals declared", () => {
    expect(projectsForGoal([makeProject("a")], "any-goal")).toEqual([]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(projectsForGoal([makeProject("a", ["other"])], "any-goal")).toEqual([]);
  });
});

describe("formatTargetDate", () => {
  it("formats a calendar date as month and year", () => {
    expect(formatTargetDate("2026-11-30")).toBe("nov 2026");
  });

  it("formats January and December at the range edges", () => {
    expect(formatTargetDate("2027-01-31")).toBe("jan 2027");
    expect(formatTargetDate("2026-12-01")).toBe("dec 2026");
  });

  it("does not shift month on the first of the month", () => {
    // A Date-based implementation parses this as UTC midnight and renders "oct 2026"
    // for anyone west of Greenwich.
    expect(formatTargetDate("2026-11-01")).toBe("nov 2026");
  });

  it("returns null when there is no date", () => {
    expect(formatTargetDate(undefined)).toBeNull();
  });

  it("returns null for a malformed date", () => {
    expect(formatTargetDate("nov 2026")).toBeNull();
    expect(formatTargetDate("2026-11")).toBeNull();
  });

  it("returns null for an out-of-range month", () => {
    expect(formatTargetDate("2026-13-01")).toBeNull();
    expect(formatTargetDate("2026-00-01")).toBeNull();
  });
});
