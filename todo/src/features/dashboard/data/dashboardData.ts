import type { Todo } from "@/features/todos/api/todos";
import type { Goal } from "@/features/goals/api/goals";

export const fallbackTodos: Todo[] = [
  {
    id: 1,
    title: "Publish redundancy reflection and next-role criteria",
    isCompleted: false,
  },
  { id: 2, title: "Apply to five senior full-stack roles", isCompleted: false },
  {
    id: 3,
    title: "Ship public task tracker homepage refresh",
    isCompleted: false,
  },
  {
    id: 4,
    title: "Write case study for dotnettodo project",
    isCompleted: false,
  },
  {
    id: 5,
    title: "Reach out to three engineering leaders",
    isCompleted: false,
  },
];

const baseSubtasks: Todo[] = [
  { id: 1, title: "Define target role profile", isCompleted: true },
  { id: 2, title: "Refresh resume and LinkedIn", isCompleted: true },
  { id: 3, title: "Publish portfolio homepage", isCompleted: true },
  { id: 4, title: "Write two technical case studies", isCompleted: false },
  { id: 5, title: "Build weekly outreach cadence", isCompleted: false },
];

export const goals: Goal[] = [
  {
    id: 1,
    name: "Land the next senior engineering role",
    summary:
      "Turn the redundancy period into a focused campaign: clear positioning, consistent applications, strong portfolio proof, and warm conversations with teams doing meaningful product engineering.",
    todos: baseSubtasks,
    // title: "Land the next senior engineering role",
    // due: "6 month runway",
    // done: 3,
    // total: 5,
    // progress: 60,
    // color: "text-[#f0805c]",
    // bar: "bg-[#f0805c]",
    // desc: "Turn the redundancy period into a focused campaign: clear positioning, consistent applications, strong portfolio proof, and warm conversations with teams doing meaningful product engineering.",
    // list: ["career", "job-search"],
    // tags: ["resume", "networking"],
    // subtasks: baseSubtasks,
    // focused: true,
  },
  // {
  //   // title: "Build in public every week",
  //   // due: "weekly",
  //   // done: 4,
  //   // total: 8,
  //   // progress: 50,
  //   // color: "text-[#5aa9ff]",
  //   // bar: "bg-[#5aa9ff]",
  //   // desc: "Use the site as a living portfolio: publish progress updates, implementation notes, tradeoffs, and small demos that show taste, consistency, and engineering judgement.",
  //   // list: ["writing", "portfolio"],
  //   // tags: ["blog", "projects"],
  //   // subtasks: [
  //   //   { label: "Draft weekly progress format", done: true },
  //   //   { label: "Publish first work-search update", done: true },
  //   //   { label: "Capture screenshots for portfolio", done: false },
  //   //   { label: "Add RSS-ready blog structure", done: false },
  //   // ],
  // },
  // {
  //   // title: "Protect energy and momentum",
  //   // due: "daily",
  //   // done: 5,
  //   // total: 7,
  //   // progress: 71,
  //   // color: "text-[#4ec98a]",
  //   // bar: "bg-[#4ec98a]",
  //   // desc: "Keep the search sustainable with visible daily wins: movement, focused deep work, reflection, and a short feedback loop on applications and interviews.",
  //   // list: ["health", "habits"],
  //   // tags: ["routine"],
  //   // subtasks: [
  //   //   { label: "Morning planning ritual", done: true },
  //   //   { label: "Daily walk or gym block", done: true },
  //   //   { label: "End-of-day written shutdown", done: true },
  //   //   { label: "Weekly review and reset", done: false },
  //   // ],
  // },
];

export const habits = [
  {
    title: "apply_or_network",
    sub: "1 meaningful action",
    streak: 6,
    done: true,
  },
  {
    title: "ship_publicly",
    sub: "commit / blog / demo",
    streak: 11,
    done: true,
  },
  { title: "deep_work", sub: "2 focused hours", streak: 4, done: false },
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

export const blogPosts = [
  {
    title: "Redundancy, momentum, and building in public",
    excerpt:
      "How I am turning an unexpected career reset into a focused six-month product and job-search sprint.",
    date: "Draft",
    tag: "career",
  },
  {
    title: "Refactoring a todo app into a personal operating system",
    excerpt:
      "Notes on reshaping a CRUD app into something that communicates product thinking and engineering taste.",
    date: "Planned",
    tag: "engineering",
  },
  {
    title: "What I want from my next engineering team",
    excerpt:
      "A practical filter for roles: ownership, product quality, technical standards, and people I can learn from.",
    date: "Planned",
    tag: "work",
  },
];

export const commits = [
  {
    message: "refactor homepage into feature-isolated dashboard",
    repo: "dotnettodo",
    when: "2h ago",
  },
  {
    message: "move app sidebar into shared common layout",
    repo: "dotnettodo",
    when: "today",
  },
  {
    message: "add goal detail drawer interactions",
    repo: "dotnettodo",
    when: "today",
  },
];

export const projects = [
  {
    name: "dotnettodo",
    summary:
      "Full-stack Next.js and .NET task tracker being evolved into a public career dashboard.",
    status: "active",
    stack: ["Next.js", ".NET", "Tailwind"],
  },
  {
    name: "career operating system",
    summary:
      "A personal site, blog, resume, and motivation tracker for the next role search.",
    status: "designing",
    stack: ["shadcn", "React", "Writing"],
  },
];
