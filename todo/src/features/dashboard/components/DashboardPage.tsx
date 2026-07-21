import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import {
  completedTasks,
  goals as goalFixtures,
} from "@/features/dashboard/data/dashboardData";
import { QueryClient } from "@tanstack/react-query";
import { Check, Clock, MoreHorizontal, Target } from "lucide-react";
import { DashboardSection } from "./DashboardSection";
import { GoalDrawer } from "./GoalDrawer";
import { getGoals, PagedGoalsResponse } from "@/features/goals/api/goals";
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

          <div className="mb-7 flex min-h-90 flex-col">
            <div className="relative min-h-50 flex-1 overflow-hidden rounded-xl border border-border bg-card bg-cover bg-center bg-no-repeat">
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

            <div className="mt-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-green">
                open to work / building in public
              </p>
              <h1 className="mb-3 text-3xl font-extrabold leading-tight tracking-[-0.06em] sm:text-4xl">
                I&apos;m tracking the next chapter
                <span className="text-primary">.</span>
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Recently made redundant, I am using this site as a live resume,
                blog, and accountability dashboard while I look for the right
                senior engineering role starting mid November.
              </p>
            </div>
          </div>

          <DashboardSection title="six_month_goals" count={goals.length}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {goals.map((goal) => (
                <GoalDrawer key={goal.name} goal={goal}>
                  <Card
                    size="sm"
                    className="cursor-pointer gap-3 rounded-xl border border-border bg-card p-4 py-4 text-left shadow-none ring-0 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid size-8 place-items-center rounded-lg bg-secondary">
                        <Target className="size-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-[-0.02em]">
                        {goal.name}
                      </div>
                    </div>
                  </Card>
                </GoalDrawer>
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
