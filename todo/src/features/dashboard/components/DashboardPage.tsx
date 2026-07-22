import Image from "next/image";
import Link from "next/link";
// Code2 and PenLine are used only by the projects/articles strip that is currently
// commented out below; kept so it can be restored by uncommenting alone.
import { Code2, Crosshair, FileText, PenLine, Rocket } from "lucide-react";
import { goals as goalFixtures } from "@/features/dashboard/data/dashboardData";
import { projects, type Project } from "@/features/dashboard/data/projectsData";
import { loadAllPosts, type PostMeta } from "@/features/blog/api/posts";
import { isRoutable } from "@/features/blog/lib/postStatus";
import { PostCard } from "@/features/blog/components/PostCard";
import {
  postsForGoal,
  validateAttachments,
} from "@/features/blog/lib/attachments";
import {
  formatTargetDate,
  projectsForGoal,
} from "@/features/dashboard/lib/goalLinks";
import { GoalExplorer, type GoalEntry } from "./GoalExplorer";
import { getGoals, type Goal } from "@/features/goals/api/goals";
import { getGoalProgress } from "@/features/goals/lib/goalProgress";

type DashboardPageProps = {
  authDenied?: boolean;
};

/**
 * How much of each list the explorer's side rail previews.
 *
 * A peek, not the list — the full set stays in the strip below, which is the only
 * copy on narrower screens where the rail is hidden.
 */
const ASIDE_PROJECT_CAP = 2;
const ASIDE_ARTICLE_CAP = 3;

/**
 * API goals first, fixtures filling the gaps.
 *
 * Deduplicated by slug because the two sources overlap once a fixture goal is created
 * for real: without this the same goal appears twice in the rail, and two tabs would
 * share one id.
 */
function mergeGoals(fromApi: Goal[], fixtures: Goal[]): Goal[] {
  const seen = new Set(fromApi.map((goal) => goal.slug));

  return [...fromApi, ...fixtures.filter((goal) => !seen.has(goal.slug))];
}

export async function DashboardPage({
  authDenied = false,
}: DashboardPageProps) {
  // The goals request and the posts read are independent, so they run concurrently
  // rather than one after the other. allSettled rather than all because each has its
  // own fallback: a failing API costs the live goals, an unreadable content directory
  // costs the articles, and neither should take down the other or the page.
  const [goalsResult, postsResult] = await Promise.allSettled([
    getGoals(0, 5),
    loadAllPosts(),
  ]);

  // Warn rather than error: both fallbacks are designed behaviour, and the page
  // renders completely without either source. console.error would raise Next's dev
  // error overlay on every load whenever the API simply isn't running locally, which
  // trains you to ignore it. Still logged, so a real outage is not silent.
  if (goalsResult.status === "rejected") {
    console.warn(
      "[dashboard] Could not load goals; falling back to fixtures.",
      goalsResult.reason,
    );
  }

  if (postsResult.status === "rejected") {
    console.warn(
      "[dashboard] Could not load posts; rendering without them.",
      postsResult.reason,
    );
  }

  const goals = mergeGoals(
    goalsResult.status === "fulfilled" ? goalsResult.value.payload : [],
    [], // goalFixtures,
  );
  const posts = postsResult.status === "fulfilled" ? postsResult.value : [];

  // Checked once here rather than inside each lookup, so a bad reference is reported
  // a single time instead of once per goal rendered.
  validateAttachments(posts, {
    projects: projects.map((project) => project.slug),
    goals: goals.map((goal) => goal.slug),
  });

  // Links, progress and date formatting are resolved here so the explorer stays a
  // presentation component: the work runs once on the server instead of on every
  // selection in the browser, and only the rendered fields cross the RSC boundary.
  const entries: GoalEntry[] = goals.map((goal) => {
    const progress = getGoalProgress(goal);

    return {
      slug: goal.slug,
      name: goal.name,
      summary: goal.summary,
      due: formatTargetDate(goal.targetDate),
      done: progress.done,
      total: progress.total,
      percent: progress.percent,
      todos: (goal.todos ?? []).map((todo) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        status: todo.status,
      })),
      links: [
        ...projectsForGoal(projects, goal.slug).map((project) => ({
          id: `project:${project.slug}`,
          kind: "project" as const,
          title: project.name,
          status: project.status,
          href: project.link?.href,
        })),
        ...postsForGoal(posts, goal.slug).map((post) => ({
          id: `article:${post.slug}`,
          kind: "article" as const,
          title: post.title,
          status: post.status,
          href: isRoutable(post.status) ? `/blog/${post.slug}` : undefined,
        })),
      ],
    };
  });

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden bg-background font-mono text-foreground">
      <div className="min-h-0 flex-1 px-4 py-5 sm:px-6">
        {authDenied ? (
          <div className="mb-5 rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm text-primary">
            Sign-in was rejected. Please contact this guy 👇.
          </div>
        ) : null}

        <HeroStrip />

        <GoalExplorer
          entries={entries}
          aside={
            <ExplorerAside
              // Posts arrive newest-first from the loader, so slicing takes the most
              // recent rather than an arbitrary few.
              posts={posts.slice(0, ASIDE_ARTICLE_CAP)}
              projects={projects.slice(0, ASIDE_PROJECT_CAP)}
            />
          }
        />

        {/* <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <BoardColumn
            icon={<Rocket className="size-3.5" />}
            title="projects"
            count={projects.length}
          >
            {projects.map((project) => (
              <div
                key={project.slug}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="mb-0 text-sm font-semibold tracking-[-0.02em]">
                    {project.name}
                  </h3>
                  <span className="shrink-0 rounded bg-info/15 px-1.5 py-0.5 text-[10px] font-semibold text-info">
                    {project.status}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {project.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.stack.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      <Code2 className="size-3" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </BoardColumn>

          <BoardColumn
            icon={<PenLine className="size-3.5" />}
            title="articles"
            count={posts.length}
          >
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.slug} post={post} />)
            ) : (
              <p className="px-1 text-sm text-subtle">No articles yet.</p>
            )}
            <Link
              href="/blog"
              className="px-1 text-[11px] text-subtle transition hover:text-foreground"
            >
              view all articles →
            </Link>
          </BoardColumn>
        </div> */}
      </div>
    </div>
  );
}

/** Compact preview of current work, pinned beside the goals on wide screens. */
function ExplorerAside({
  projects: shown,
  posts,
}: {
  projects: Project[];
  posts: PostMeta[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <AsideLabel>projects</AsideLabel>
        {shown.length > 0 ? (
          <ul>
            {shown.map((project) => (
              <li key={project.slug}>
                <AsideRow
                  icon={<Rocket className="size-3 text-accent-green" />}
                  title={project.name}
                  meta={project.status}
                  href={project.link?.href}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 text-[12px] text-subtle">No projects yet.</p>
        )}
      </div>

      <div>
        <AsideLabel>articles</AsideLabel>
        {posts.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <AsideRow
                  icon={<FileText className="size-3 text-info" />}
                  title={post.title}
                  // A planned post has no reading time worth quoting, so its status
                  // is the more honest label.
                  meta={
                    isRoutable(post.status) ? post.readingTime : post.status
                  }
                  href={
                    isRoutable(post.status) ? `/blog/${post.slug}` : undefined
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 text-[12px] text-subtle">No articles yet.</p>
        )}

        <Link
          href="/blog"
          className="mt-2 block px-2 text-[11px] text-subtle transition hover:text-foreground"
        >
          view all →
        </Link>
      </div>
    </div>
  );
}

function AsideLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
      {children}
    </p>
  );
}

function AsideRow({
  icon,
  title,
  meta,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  /** Omitted for things with no page of their own, e.g. a planned article. */
  href?: string;
}) {
  const body = (
    <>
      <span className="flex items-start gap-1.5">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <span className="line-clamp-2 text-[12px] leading-4 text-secondary-foreground">
          {title}
        </span>
      </span>
      <span className="mt-1 block pl-4.5 text-[10px] text-subtle">{meta}</span>
    </>
  );

  const className = "block rounded-md px-2 py-1.5 transition";

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  const external = href.startsWith("http");

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`${className} hover:bg-secondary/40`}
    >
      {body}
    </Link>
  );
}

function HeroStrip() {
  return (
    <section className="mb-4 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border sm:size-35">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/imgs/craig.png"
          alt="Self portrait of Craig Blunden"
          width={150}
          height={150}
          loading="eager"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-green">
          open to work / building in public
        </p>
        <h1 className="mb-0 mt-1 text-xl font-extrabold leading-tight tracking-[-0.04em] sm:text-2xl">
          I&apos;m tracking the next chapter
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Live resume and accountability dashboard: the goals I&apos;m working
          towards, the projects I&apos;m building, and what I&apos;m writing.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm">
        <Crosshair className="size-4 shrink-0 text-primary" />
        <span className="text-secondary-foreground">senior role</span>
        <span className="text-faint">·</span>
        <span className="font-semibold text-primary">nov 2026</span>
      </div>
    </section>
  );
}

function BoardColumn({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-border bg-surface/40 p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="text-accent-green">{icon}</span>
        <h2 className="mb-0 text-sm font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        <span className="text-xs font-medium text-faint">[{count}]</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}
