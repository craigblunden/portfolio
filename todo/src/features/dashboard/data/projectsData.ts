export type ProjectStatus = "active" | "designing" | "paused" | "shipped";

export type Project = {
  name: string;
  summary: string;
  status: ProjectStatus;
  stack: string[];
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    name: "portfolio / career dashboard",
    summary:
      "This site — a full-stack Next.js and .NET app serving as live resume, goal tracker, and public accountability dashboard for the job search.",
    status: "active",
    stack: ["Next.js", "React", ".NET", "Tailwind", "shadcn/ui"],
    link: { label: "github", href: "https://github.com/craigblunden" },
  },
  // PLACEHOLDER — replace with a real current project before launch.
  {
    name: "second project placeholder",
    summary:
      "Swap this entry for whatever you're actually building next — keep the one-liner focused on why it matters.",
    status: "designing",
    stack: ["TypeScript"],
  },
];
