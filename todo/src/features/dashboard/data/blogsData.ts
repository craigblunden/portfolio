export type BlogStatus = "published" | "draft" | "planned";

export type BlogPost = {
  title: string;
  excerpt: string;
  status: BlogStatus;
  tag?: string;
  href?: string;
};

// PLACEHOLDER content — replace with real posts (and links) as they publish.
export const blogPosts: BlogPost[] = [
  {
    title: "Redundancy, momentum, and building in public",
    excerpt:
      "How I am turning an unexpected career reset into a focused six-month product and job-search sprint.",
    status: "draft",
    tag: "career",
  },
  {
    title: "Refactoring a todo app into a personal operating system",
    excerpt:
      "Notes on reshaping a CRUD app into something that communicates product thinking and engineering taste.",
    status: "planned",
    tag: "engineering",
  },
  {
    title: "What I want from my next engineering team",
    excerpt:
      "A practical filter for roles: ownership, product quality, technical standards, and people I can learn from.",
    status: "planned",
    tag: "work",
  },
];
