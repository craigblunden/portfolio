import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  completedTasks,
  goals as goalFixtures,
} from "@/features/dashboard/data/dashboardData";
import { QueryClient } from "@tanstack/react-query";
import {
  Check,
  Circle,
  CircleDot,
  Code2,
  Crosshair,
  FileCode2,
  FileText,
  GitBranch,
  OctagonAlert,
  PenLine,
  Rocket,
  Target,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { projects } from "@/features/dashboard/data/projectsData";
import {
  blogPosts,
  type BlogStatus,
} from "@/features/dashboard/data/blogsData";
import { GoalDrawer } from "./GoalDrawer";
import { getGoals, PagedGoalsResponse } from "@/features/goals/api/goals";
import { getGoalProgress } from "@/features/goals/lib/goalProgress";
import type { Todo, TodoStatus } from "@/features/todos/api/todos";
import { AdminSessionButton } from "@/features/auth/components/AdminSessionButton";
import { getAdminSession } from "@/features/auth/api/session";

const blogStatusStyles: Record<BlogStatus, string> = {
  published: "bg-success/15 text-success",
  draft: "bg-primary/15 text-primary",
  planned: "bg-secondary text-muted-foreground",
};

const todoStatusIcon: Record<TodoStatus, React.ReactNode> = {
  Completed: <Check className="size-3.5 text-success" />,
  InProgress: <CircleDot className="size-3.5 text-info" />,
  Blocked: <OctagonAlert className="size-3.5 text-primary" />,
  Backlog: <Circle className="size-3.5 text-subtle" />,
};

/* Inline todo previews per goal card; full detail lives in the drawer. */
const TODO_PREVIEW_CAP = 4;
const COMPLETED_DISPLAY_CAP = 3;

type DashboardPageProps = {
  authDenied?: boolean;
};

export async function DashboardPage({
  authDenied = false,
}: DashboardPageProps) {
  const queryClient = new QueryClient();
  const { isAdmin } = await getAdminSession();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["goals", 0, 5],
      queryFn: () => getGoals(0, 5),
    });
  } catch {
    // API unavailable — fall back to fixtures below.
  }

  const goalsData = queryClient.getQueryData<PagedGoalsResponse>([
    "goals",
    0,
    5,
  ]);
  const goals = goalsData?.payload.length
    ? [...goalsData.payload, ...goalFixtures]
    : goalFixtures;

  const [northStar, ...otherGoals] = goals;
  const recentlyCompleted = completedTasks.slice(0, COMPLETED_DISPLAY_CAP);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background font-mono text-foreground">
      <EditorTabs isAdmin={isAdmin} />

      <div className="min-h-0 flex-1 px-4 py-5 sm:px-6">
        {authDenied ? (
          <div className="mb-5 rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm text-primary">
            Sign-in was rejected. Please contact this guy 👇.
          </div>
        ) : null}

        <HeroStrip />

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <BoardColumn
            icon={<Zap className="size-3.5" />}
            title="goals_and_todos"
            count={goals.length}
          >
            {northStar ? (
              <NorthStarCard goal={northStar} />
            ) : (
              <EmptyColumnNote>No goals yet.</EmptyColumnNote>
            )}
            {otherGoals.map((goal) => (
              <SecondaryGoalCard key={goal.name} goal={goal} />
            ))}

            {recentlyCompleted.length > 0 ? (
              <>
                <ColumnSubheading>recently_done</ColumnSubheading>
                {recentlyCompleted.map((task) => (
                  <div
                    key={task.title}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="size-3.5 shrink-0 text-success" />
                      <span className="text-secondary-foreground">
                        {task.title}
                      </span>
                    </div>
                    <div className="mt-1 pl-5.5 text-[11px] text-subtle">
                      {task.tag} · {task.at}
                    </div>
                  </div>
                ))}
              </>
            ) : null}
          </BoardColumn>

          <BoardColumn
            icon={<Rocket className="size-3.5" />}
            title="projects"
            count={projects.length}
          >
            {projects.map((project) => (
              <Card
                key={project.name}
                size="sm"
                className="gap-3 rounded-lg border border-border bg-card p-4 py-4 shadow-none ring-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                    <Rocket className="size-4" />
                  </div>
                  <Badge className="border-0 bg-info/15 font-mono text-info">
                    {project.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-[-0.02em]">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {project.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((item) => (
                    <Badge
                      key={item}
                      className="border-0 bg-secondary font-mono text-muted-foreground"
                    >
                      <Code2 className="size-3" />
                      {item}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </BoardColumn>

          <BoardColumn
            icon={<PenLine className="size-3.5" />}
            title="blogs_written"
            count={blogPosts.length}
          >
            {blogPosts.map((post) => {
              const inner = (
                <Card
                  size="sm"
                  className="gap-2 rounded-lg border border-border bg-card p-4 py-4 shadow-none ring-0 transition hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold tracking-[-0.02em]">
                      {post.title}
                    </h3>
                    <Badge
                      className={`shrink-0 border-0 font-mono ${blogStatusStyles[post.status]}`}
                    >
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {post.excerpt}
                  </p>
                  {post.tag ? (
                    <span className="text-[11px] text-subtle">#{post.tag}</span>
                  ) : null}
                </Card>
              );

              return post.href ? (
                <Link key={post.title} href={post.href}>
                  {inner}
                </Link>
              ) : (
                <div key={post.title}>{inner}</div>
              );
            })}
          </BoardColumn>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}

function EditorTabs({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex items-center border-b border-border bg-card">
      <span className="flex items-center gap-2 border-r border-border bg-background px-4 py-2.5 text-[13px] text-foreground shadow-[inset_0_2px_0_0_var(--primary)]">
        <FileCode2 className="size-3.5 text-primary" />
        home.tsx
      </span>
      <Link
        href="/resume"
        className="flex items-center gap-2 border-r border-border px-4 py-2.5 text-[13px] text-muted-foreground transition hover:bg-background hover:text-foreground"
      >
        <FileText className="size-3.5" />
        resume.md
      </Link>
      {isAdmin ? (
        <div className="ml-auto flex items-center pr-3">
          <AdminSessionButton />
        </div>
      ) : null}
    </div>
  );
}

function HeroStrip() {
  return (
    <section className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border sm:size-20">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/imgs/craig.png"
          alt="Self portrait of Craig Blunden"
          width={80}
          height={80}
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
          Live resume and accountability dashboard: the goal I&apos;m working
          towards, the projects I&apos;m building, and what I&apos;m reading.
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

function ColumnSubheading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-center gap-2 px-1 text-[11px] font-semibold text-accent-green">
      {"//"} {children}
    </div>
  );
}

function EmptyColumnNote({ children }: { children: React.ReactNode }) {
  return <p className="px-1 text-sm text-subtle">{children}</p>;
}

function NorthStarCard({
  goal,
}: {
  goal: Parameters<typeof getGoalProgress>[0];
}) {
  const progress = getGoalProgress(goal);
  const previewTodos = (goal.todos ?? []).slice(0, TODO_PREVIEW_CAP);

  return (
    <GoalDrawer goal={goal}>
      <Card
        size="sm"
        className="cursor-pointer gap-3 rounded-lg border border-primary/30 bg-card p-4 text-left shadow-none ring-0 transition hover:border-primary/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10">
            <Target className="size-4 text-primary" />
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-primary">
              {progress.percent}
              <span className="text-xs text-subtle">%</span>
            </span>
            <div className="text-[11px] text-subtle">
              {progress.done}/{progress.total} · due nov 2026
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-[-0.02em]">{goal.name}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {goal.summary}
          </p>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        {previewTodos.length > 0 ? (
          <ul className="space-y-1.5 border-t border-dashed border-border pt-3">
            {previewTodos.map((todo: Todo) => (
              <li key={todo.id} className="flex items-center gap-2 text-sm">
                <span className="shrink-0">{todoStatusIcon[todo.status]}</span>
                <span
                  className={
                    todo.status === "Completed"
                      ? "text-subtle line-through"
                      : "text-secondary-foreground"
                  }
                >
                  {todo.title}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </GoalDrawer>
  );
}

function SecondaryGoalCard({
  goal,
}: {
  goal: Parameters<typeof getGoalProgress>[0];
}) {
  const progress = getGoalProgress(goal);

  return (
    <GoalDrawer goal={goal}>
      <Card
        size="sm"
        className="cursor-pointer gap-2 rounded-lg border border-border bg-card p-3 text-left shadow-none ring-0 transition hover:border-primary/30"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em]">
            <Target className="size-3.5 shrink-0 text-primary" />
            {goal.name}
          </span>
          <span className="text-sm font-bold text-foreground">
            {progress.percent}
            <span className="text-xs text-subtle">%</span>
          </span>
        </div>
        <div className="text-[11px] text-subtle">
          {progress.done}/{progress.total} done
        </div>
      </Card>
    </GoalDrawer>
  );
}

function StatusBar() {
  return (
    <footer className="flex items-center gap-4 overflow-x-auto border-t border-border bg-primary px-3 py-1 text-[12px] font-semibold text-primary-foreground">
      <span className="flex items-center gap-1">
        <GitBranch className="size-3" />
        develop
      </span>
      <span className="flex items-center gap-1">
        <OctagonAlert className="size-3" />
        0
        <TriangleAlert className="ml-1 size-3" />
        0
      </span>
      <span className="hidden sm:inline">open_to_work: true</span>
      <span className="ml-auto flex items-center gap-1">
        <Crosshair className="size-3" />
        target: nov 2026
      </span>
      <span className="hidden sm:inline">TypeScript React</span>
      <span className="hidden sm:inline">UTF-8</span>
    </footer>
  );
}
