import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import {
  completedTasks,
  goals as goalFixtures,
} from "@/features/dashboard/data/dashboardData";
import { QueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Check,
  Clock,
  Code2,
  Crosshair,
  MoreHorizontal,
  Rocket,
  Target,
} from "lucide-react";
import { projects } from "@/features/dashboard/data/projectsData";
import { books, type BookStatus } from "@/features/dashboard/data/booksData";

const bookStatusStyles: Record<BookStatus, string> = {
  reading: "bg-primary/15 text-primary",
  finished: "bg-success/15 text-success",
  queued: "bg-secondary text-muted-foreground",
};
import { DashboardSection } from "./DashboardSection";
import { GoalDrawer } from "./GoalDrawer";
import { getGoals, PagedGoalsResponse } from "@/features/goals/api/goals";
import { getGoalProgress } from "@/features/goals/lib/goalProgress";
import { AdminSessionButton } from "@/features/auth/components/AdminSessionButton";
import { getAdminSession } from "@/features/auth/api/session";

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
  const northStarProgress = northStar
    ? getGoalProgress(northStar)
    : { done: 0, total: 0, percent: 0 };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-mono text-foreground">
      <section className="flex min-w-0 flex-col">
        {isAdmin ? (
          <header className="flex justify-end border-b border-border bg-background px-4 py-3 sm:px-5">
            <AdminSessionButton />
          </header>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {authDenied ? (
            <div className="mb-5 rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm text-primary">
              Sign-in was rejected. Please contact this guy 👇.
            </div>
          ) : null}

          <section className="mb-7 grid gap-5 sm:grid-cols-[260px_1fr] sm:items-stretch">
            <div className="relative min-h-50 overflow-hidden rounded-xl border border-border bg-card">
              <Image
                className="absolute inset-0 h-full w-full object-cover"
                src="/imgs/craig.png"
                alt="Self Portrait"
                width={300}
                height={200}
                loading="eager"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,13,18,0.1) 0%, rgba(10,13,18,0.88) 92%)",
                }}
              />

              <span className="absolute bottom-3 left-3 rounded-md border border-border bg-background/80 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                self portrait...
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-green">
                open to work / building in public
              </p>
              <h1 className="mb-3 text-3xl font-extrabold leading-tight tracking-[-0.06em] sm:text-4xl">
                I&apos;m tracking the next chapter
                <span className="text-primary">.</span>
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                This site is my live resume and accountability dashboard: the
                goal I&apos;m working towards, the projects I&apos;m building,
                and what I&apos;m reading along the way.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
                <Crosshair className="size-4 shrink-0 text-primary" />
                <span className="font-semibold text-foreground">target:</span>
                <span className="text-secondary-foreground">
                  senior engineering role
                </span>
                <span className="text-faint">·</span>
                <span className="font-semibold text-primary">
                  November 2026
                </span>
              </div>
            </div>
          </section>

          {northStar ? (
            <DashboardSection title="the_goal" count={goals.length}>
              <GoalDrawer goal={northStar}>
                <Card
                  size="sm"
                  className="cursor-pointer gap-4 rounded-xl border border-primary/30 bg-card p-5 text-left shadow-none ring-0 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10">
                      <Target className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold tracking-[-0.02em] sm:text-lg">
                        {northStar.name}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {northStar.summary}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-2xl font-extrabold text-primary">
                        {northStarProgress.percent}
                        <span className="text-sm text-subtle">%</span>
                      </div>
                      <div className="text-[11px] text-subtle">
                        {northStarProgress.done}/{northStarProgress.total} done
                        · due nov 2026
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${northStarProgress.percent}%` }}
                    />
                  </div>
                </Card>
              </GoalDrawer>

              {otherGoals.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {otherGoals.map((goal) => {
                    const progress = getGoalProgress(goal);
                    return (
                      <GoalDrawer key={goal.name} goal={goal}>
                        <Card
                          size="sm"
                          className="cursor-pointer gap-3 rounded-xl border border-border bg-card p-4 py-4 text-left shadow-none ring-0 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="grid size-8 place-items-center rounded-lg bg-secondary">
                              <Target className="size-4 text-primary" />
                            </div>
                            <div className="text-lg font-bold text-foreground">
                              {progress.percent}
                              <span className="text-xs text-subtle">%</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold tracking-[-0.02em]">
                              {goal.name}
                            </div>
                            <div className="mt-1 text-[11px] text-subtle">
                              {progress.done}/{progress.total} done
                            </div>
                          </div>
                        </Card>
                      </GoalDrawer>
                    );
                  })}
                </div>
              ) : null}
            </DashboardSection>
          ) : null}

          <DashboardSection title="projects_im_building" count={projects.length}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <Card
                  key={project.name}
                  size="sm"
                  className="gap-4 rounded-xl border border-border bg-card p-4 py-4 shadow-none ring-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
                      <Rocket className="size-5" />
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
            </div>
          </DashboardSection>

          <DashboardSection title="books_im_reading" count={books.length}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {books.map((book) => (
                <Card
                  key={book.title}
                  size="sm"
                  className="gap-3 rounded-xl border border-border bg-card p-4 py-4 shadow-none ring-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-secondary text-accent-green">
                      <BookOpen className="size-5" />
                    </div>
                    <Badge
                      className={`border-0 font-mono ${bookStatusStyles[book.status]}`}
                    >
                      {book.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-[-0.02em]">
                      {book.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-subtle">{book.author}</p>
                    {book.note ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {book.note}
                      </p>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection
            title="recently_completed"
            count={completedTasks.length}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {completedTasks.map((task) => (
                <Card
                  key={task.title}
                  size="sm"
                  className="relative rounded-xl border border-border bg-card p-4 py-4 shadow-none ring-0"
                >
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-success" />
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="w-fit border-0 bg-success/15 font-mono text-success">
                        <Check className="size-3" />
                        {task.tag}
                      </Badge>
                      <MoreHorizontal className="size-4 text-faint" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <h3 className="text-sm font-semibold tracking-[-0.02em]">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {task.desc}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-3 text-[11px] text-subtle">
                      progress log
                      <span className="inline-flex items-center gap-1 font-semibold text-success">
                        <Clock className="size-3" />
                        {task.at}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DashboardSection>
        </div>
      </section>
    </div>
  );
}
