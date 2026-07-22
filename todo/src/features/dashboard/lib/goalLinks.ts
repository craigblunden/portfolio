import type { Project } from "@/features/dashboard/data/projectsData";

/**
 * Projects that declare they serve a given goal.
 *
 * The edge is stored on the project rather than the goal because projects are static
 * data and goals come from the API — see the note on `Project.goals`.
 */
export function projectsForGoal(projects: Project[], goalSlug: string): Project[] {
  return projects.filter((project) => project.goals?.includes(goalSlug));
}

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

/**
 * `2026-11-30` -> `nov 2026`.
 *
 * The string is split rather than passed through `Date`, which would interpret a
 * bare `YYYY-MM-DD` as UTC midnight and render the previous month for anyone west of
 * Greenwich on the first of a month. Returns null for anything that is not a
 * well-formed calendar date so the caller can omit the chip instead of printing
 * "undefined 2026".
 */
export function formatTargetDate(date: string | undefined): string | null {
  if (!date) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(date);

  if (!match) {
    return null;
  }

  const [, year, month] = match;
  const name = MONTHS[Number(month) - 1];

  return name ? `${name} ${year}` : null;
}
