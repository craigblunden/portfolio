import type { Todo } from "@/features/todos/api/todos";
import type { Goal } from "@/features/goals/api/goals";

const roleSubtasks: Todo[] = [
  {
    id: 1,
    title: "Define target role profile",
    description: "Narrowed to senior/staff IC roles at product-led companies.",
    status: "Completed",
    goalId: 1,
  },
  {
    id: 2,
    title: "Refresh resume and LinkedIn",
    description: "Rewrote around outcomes, not responsibilities.",
    status: "Completed",
    goalId: 1,
  },
  {
    id: 3,
    title: "Publish portfolio homepage",
    description: "This site — live resume and build log.",
    status: "Completed",
    goalId: 1,
  },
  {
    id: 4,
    title: "Write two technical case studies",
    description: "Drafting the dashboard rebuild story first.",
    status: "InProgress",
    goalId: 1,
  },
  {
    id: 5,
    title: "Build weekly outreach cadence",
    description: "Five warm conversations a week, tracked here.",
    status: "Backlog",
    goalId: 1,
  },
];

// PLACEHOLDER reading list — swap in the real books being read.
const readingSubtasks: Todo[] = [
  {
    id: 101,
    title: "Staff Engineer — Will Larson",
    description: "What the senior-to-staff jump actually asks for.",
    status: "Completed",
    goalId: 2,
  },
  {
    id: 102,
    title: "The Pragmatic Programmer — Thomas & Hunt",
    description: "Re-read. Holding up better than expected.",
    status: "InProgress",
    goalId: 2,
  },
  {
    id: 103,
    title: "A Philosophy of Software Design — John Ousterhout",
    description: "Queued next — deep modules over thin ones.",
    status: "Backlog",
    goalId: 2,
  },
];

// PLACEHOLDER — replace with the real project milestones.
const projectSubtasks: Todo[] = [
  {
    id: 201,
    title: "Ship the portfolio dashboard",
    description: "Goals, projects and writing in one live surface.",
    status: "Completed",
    goalId: 3,
  },
  {
    id: 202,
    title: "Put the API behind real auth",
    description: "Google OAuth, admin-only, cookie sessions.",
    status: "Completed",
    goalId: 3,
  },
  {
    id: 203,
    title: "Deploy both halves to production",
    description: "Next.js frontend and .NET API, same origin.",
    status: "InProgress",
    goalId: 3,
  },
  {
    id: 204,
    title: "Start the second project",
    description: "Scope it small enough to finish.",
    status: "Backlog",
    goalId: 3,
  },
  {
    id: 205,
    title: "Add end-to-end test coverage",
    description: "Enough to deploy on a Friday without flinching.",
    status: "Backlog",
    goalId: 3,
  },
];

const writingSubtasks: Todo[] = [
  {
    id: 301,
    title: "Set up the blog pipeline",
    description: "Markdown in the repo, rendered at request time.",
    status: "Completed",
    goalId: 4,
  },
  {
    id: 302,
    title: "Publish the first technical post",
    description: "SQLite migrations are not symmetric.",
    status: "InProgress",
    goalId: 4,
  },
  {
    id: 303,
    title: "Write one post a fortnight",
    description: "Cadence over volume — six months of it.",
    status: "Backlog",
    goalId: 4,
  },
  {
    id: 304,
    title: "Turn the best post into a talk",
    description: "Local meetup first.",
    status: "Backlog",
    goalId: 4,
  },
];

export const goals: Goal[] = [
  {
    id: 1,
    slug: "land-next-senior-role",
    name: "Land the next senior engineering role",
    summary:
      "Turn the redundancy period into a focused campaign: clear positioning, consistent applications, strong portfolio proof, and warm conversations with teams doing meaningful product engineering.",
    targetDate: "2026-11-30",
    todos: roleSubtasks,
  },
  {
    id: 2,
    slug: "keep-steady-reading-habit",
    name: "Keep a steady reading habit",
    summary:
      "One book at a time, biased towards engineering craft and career judgement — each book is a subtask, ticked off when finished.",
    targetDate: "2026-12-31",
    todos: readingSubtasks,
  },
  {
    id: 3,
    slug: "ship-side-projects",
    name: "Ship side projects",
    summary:
      "Finished and deployed beats clever and abandoned. Each project has to reach a URL someone else can open.",
    targetDate: "2026-10-31",
    todos: projectSubtasks,
  },
  {
    id: 4,
    slug: "write-in-public",
    name: "Write in public",
    summary:
      "Publish the reasoning, not just the result — the posts double as the case studies the role search needs.",
    targetDate: "2027-01-31",
    todos: writingSubtasks,
  },
];
