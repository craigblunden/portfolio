import type { Todo } from "@/features/todos/api/todos";
import type { Goal } from "@/features/goals/api/goals";

const baseSubtasks: Todo[] = [
  {
    id: 1,
    title: "Define target role profile",
    status: "Completed",
    goalId: 1,
  },
  {
    id: 2,
    title: "Refresh resume and LinkedIn",
    status: "Completed",
    goalId: 1,
  },
  {
    id: 3,
    title: "Publish portfolio homepage",
    status: "Completed",
    goalId: 1,
  },
  {
    id: 4,
    title: "Write two technical case studies",
    status: "Backlog",
    goalId: 1,
  },
  {
    id: 5,
    title: "Build weekly outreach cadence",
    status: "Backlog",
    goalId: 1,
  },
];

export const goals: Goal[] = [
  {
    id: 1,
    name: "Land the next senior engineering role",
    summary:
      "Turn the redundancy period into a focused campaign: clear positioning, consistent applications, strong portfolio proof, and warm conversations with teams doing meaningful product engineering.",
    todos: baseSubtasks,
  },
];

export const completedTasks = [
  {
    title: "Reframed the portfolio around the job search",
    desc: "Shifted from private todo app to a public, motivating career dashboard.",
    at: "today",
    tag: "portfolio",
  },
  {
    title: "Mapped six-month runway into visible goals",
    desc: "Broke the transition into role search, writing, projects, and habit systems.",
    at: "yesterday",
    tag: "career",
  },
];
