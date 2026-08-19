export type ProjectStatus = "active" | "designing" | "paused" | "shipped";

export type Project = {
  /** Stable key referenced from blog frontmatter; validated at build time. */
  slug: string;
  name: string;
  summary: string;
  status: ProjectStatus;
  stack: string[];
  link?: { label: string; href: string };
  /**
   * Goal slugs this project serves, surfaced as "linked" cards in the goal detail
   * pane. Declared here rather than on the goal because projects are static data and
   * goals come from the API — this keeps the edge in the file you can actually edit.
   */
  goals?: string[];
};

export const projects: Project[] = [
  // {
  //   slug: "portfolio-dashboard",
  //   name: "portfolio / career dashboard",
  //   summary:
  //     "This site — a full-stack Next.js and .NET app serving as live resume, goal tracker, and public accountability dashboard for the job search.",
  //   status: "active",
  //   stack: ["Next.js", "React", ".NET", "Tailwind", "shadcn/ui"],
  //   link: { label: "github", href: "https://github.com/craigblunden" },
  //   goals: ["land-next-senior-role", "ship-side-projects"],
  // },
  // PLACEHOLDER — replace with a real current project before launch.
  {
    slug: "project-placeholder",
    name: "project placeholder",
    summary:
      "Swap this entry for whatever you're actually building next — keep the one-liner focused on why it matters.",
    status: "designing",
    stack: ["TypeScript"],
    goals: ["ship-side-projects"],
  },
];
