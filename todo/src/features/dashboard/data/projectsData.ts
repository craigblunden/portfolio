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
  {
    slug: "trail-to-offer",
    name: "trail to offer",
    summary:
      "A job application tracker for my own search: every role on one board, with the resume and cover letter that went out with it and the people attached to it. Multi-tenant on Supabase, written end to end with Claude Code.",
    status: "active",
    stack: ["Next.js", "TypeScript", "Supabase", "Prisma", "Claude API"],
    link: { label: "trailtooffer.com", href: "https://trailtooffer.com" },
    goals: ["ship-side-projects", "land-next-senior-role"],
  },
];
