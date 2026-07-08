import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import Image from "next/image";
import {
  blogPosts,
  commits,
  completedTasks,
  fallbackTodos,
  goals as goalFixtures,
  habits,
  projects,
} from "@/features/dashboard/data/dashboardData";
import { getTodos, type PagedTodosResponse } from "@/features/todos/api/todos";
import { QueryClient } from "@tanstack/react-query";
import {
  Bug,
  Check,
  Clock,
  Code2,
  Command,
  Filter,
  Flame,
  GitCommit,
  Hash,
  MoreHorizontal,
  Plus,
  Rocket,
  Search,
  Target,
} from "lucide-react";
import { DashboardSection } from "./DashboardSection";
import { GoalDrawer } from "./GoalDrawer";
import { SkillRadarCard } from "@/features/dashboard/components/SkillRadarCard";
import { TimelineProgress } from "./TimelineProgress";
import { getGoals, PagedGoalsResponse } from "@/features/goals/api/goals";

export async function DashboardPage() {
  const queryClient = new QueryClient();

  let apiUnavailable = false;

  try {
    await queryClient.prefetchQuery({
      queryKey: ["todos", 0, 5],
      queryFn: () => getTodos(0, 5),
    });
  } catch {
    apiUnavailable = true;
  }

  try {
    await queryClient.prefetchQuery({
      queryKey: ["goals", 0, 5],
      queryFn: () => getGoals(0, 5),
    });
  } catch {
    apiUnavailable = true;
  }

  const todoData = queryClient.getQueryData<PagedTodosResponse>([
    "todos",
    0,
    5,
  ]);
  const todos = todoData?.payload.length ? todoData.payload : fallbackTodos;

  const goalsData = queryClient.getQueryData<PagedGoalsResponse>([
    "goals",
    0,
    5,
  ]);
  const goals = goalsData?.payload.length
    ? [...goalsData.payload, ...goalFixtures]
    : goalFixtures;

  const boardColumns = [
    { label: "next_actions", items: todos.slice(0, 2), color: "bg-[#5d6878]" },
    { label: "in_motion", items: todos.slice(2, 4), color: "bg-[#f0805c]" },
    { label: "recently_done", items: todos.slice(4, 5), color: "bg-[#4ec98a]" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0d12] font-mono text-[#e9eef5]">
      <section className="flex min-w-0 flex-col">
        <header className="flex flex-col gap-3 border-b border-[#232b36] bg-[#0a0d12] px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          <div className="flex w-full flex-1 items-center gap-2 rounded-lg border border-[#232b36] bg-[#0e1218] px-3 py-2 shadow-[0_0_0_0_rgba(240,128,92,0.14)] focus-within:border-[#f0805c]/35 focus-within:shadow-[0_0_0_3px_rgba(240,128,92,0.14)] sm:max-w-xl">
            <Search className="size-4 text-[#5d6878]" />
            <Input
              placeholder="search tasks, or run a command..."
              className="h-auto border-0 bg-transparent p-0 font-mono text-[13px] text-[#e9eef5] shadow-none placeholder:text-[#5d6878] focus-visible:ring-0"
            />
            <Kbd className="h-6 border border-[#232b36] bg-[#151a22] font-mono text-[#8b97a7]">
              <Command className="size-3" />K
            </Kbd>
          </div>
          <Button className="w-full bg-[#f0805c] font-mono text-[#1a0f0a] hover:bg-[#f59377] sm:w-auto">
            <Plus className="size-4" />
            log progress
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="mb-7 grid gap-4 lg:grid-cols-2">
            <div className="flex min-h-90 flex-col">
              <div
                className="relative min-h-50 flex-1 overflow-hidden rounded-xl border border-[#232b36] bg-[#0e1218] bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(10,13,18,0.1) 0%, rgba(10,13,18,0.88) 92%), url('/self-portrait.jpg')",
                }}
              >
                <Image
                  className="absolute inset-0 h-full w-full object-cover"
                  src="/imgs/craig.png"
                  alt="Self Portrait"
                  width={300}
                  height={200}
                  loading="eager"
                />

                <span className="absolute bottom-3 left-3 rounded-md border border-[#232b36] bg-[#0a0d12]/80 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#8b97a7]">
                  self portrait...
                </span>
              </div>

              <div className="mt-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#57a773]">
                  open to work / building in public
                </p>
                <h1 className="mb-3  text-3xl font-extrabold leading-tight tracking-[-0.06em] sm:text-4xl">
                  I&apos;m tracking the next chapter
                  <span className="text-[#f0805c]">.</span>
                </h1>
                <p className="max-w-xl text-sm leading-6 text-[#8b97a7]">
                  Recently made redundant, I am using this site as a live
                  resume, blog, and accountability dashboard while I look for
                  the right senior engineering role starting mid November.
                </p>
              </div>
            </div>

            <SkillRadarCard apiUnavailable={apiUnavailable} />
          </div>

          <TimelineProgress todos={todos} goals={goals} />

          <DashboardSection title="six_month_goals" count={goals.length}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {goals.map((goal) => (
                <GoalDrawer key={goal.name} goal={goal}>
                  <Card
                    size="sm"
                    className={`cursor-pointer gap-3 rounded-xl border bg-[#0e1218] p-4 py-4 text-left shadow-none ring-0 transition hover:-translate-y-0.5 hover:border-[#303a48] hover:shadow-[0_8px_24px_rgba(0,0,0,0.28)] ${
                      // goal.focused ? "border-[#f0805c]/35" : "border-[#232b36]"
                      "border-[#232b36]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid size-8 place-items-center rounded-lg bg-[#151a22]">
                        {/* text-red-# is based on goal type */}
                        <Target className={`size-4 text-red-700`} />
                      </div>
                      {/* text-red-# is based on progress to 100% */}
                      <div className={`text-lg font-bold text-yellow-700`}>
                        {/* {goal.progress} should be based on todos completed within a goal */}
                        60
                        <span className="text-xs text-[#5d6878]">%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold tracking-[-0.02em]">
                        {goal.name}
                      </div>
                      <div className="mt-1 text-[11px] text-[#5d6878]">
                        true / 10 / due 25-Nov
                      </div>
                    </div>
                    {/* <div className="h-1.5 overflow-hidden rounded-full bg-[#151a22]">
                      <div
                        className={`h-full rounded-full ${goal.bar}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div> */}
                  </Card>
                </GoalDrawer>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="momentum_habits" count={habits.length}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {habits.map((habit) => (
                <Card
                  key={habit.title}
                  size="sm"
                  className="rounded-xl border border-[#232b36] bg-[#0e1218] p-4 py-4 shadow-none ring-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="font-mono text-[13px] tracking-[-0.02em]">
                        {habit.title}
                      </CardTitle>
                      <p className="mt-1 text-[11px] text-[#5d6878]">
                        {habit.sub}
                      </p>
                    </div>
                    <Badge className="border-0 bg-[#f0805c]/15 font-mono text-[#f0805c]">
                      <Flame className="size-3" />
                      {habit.streak}d
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-12 gap-1">
                    {Array.from({ length: 36 }).map((_, index) => (
                      <span
                        key={index}
                        className={`size-2 rounded-xs ${
                          index % 5 === 0
                            ? "bg-[#4ec98a]"
                            : index % 3 === 0
                              ? "bg-[#3a7a52]"
                              : "bg-[#1a212b]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end text-[10px] text-[#5d6878]">
                    {habit.done ? (
                      <span className="inline-flex items-center gap-1 text-[#4ec98a]">
                        <Check className="size-3" />
                        done today
                      </span>
                    ) : (
                      "pending"
                    )}
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
                  className="relative rounded-xl border border-[#232b36] bg-[#0e1218] p-4 py-4 shadow-none ring-0"
                >
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[#4ec98a]" />
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="w-fit border-0 bg-[#4ec98a]/15 font-mono text-[#4ec98a]">
                        <Check className="size-3" />
                        {task.tag}
                      </Badge>
                      <MoreHorizontal className="size-4 text-[#404a59]" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <h3 className="text-[13px] font-semibold tracking-[-0.02em]">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#8b97a7]">
                      {task.desc}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#232b36] pt-3 text-[11px] text-[#5d6878]">
                      progress log
                      <span className="inline-flex items-center gap-1 font-semibold text-[#4ec98a]">
                        <Clock className="size-3" />
                        {task.at}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DashboardSection>

          <div className="grid gap-7 xl:grid-cols-2">
            <DashboardSection title="recent_writing" count={blogPosts.length}>
              <div className="space-y-3">
                {blogPosts.map((post) => (
                  <Card
                    key={post.title}
                    size="sm"
                    className="gap-3 rounded-xl border border-[#232b36] bg-[#0e1218] p-4 py-4 shadow-none ring-0"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="border-0 bg-[#f0805c]/15 font-mono text-[#f0805c]">
                        <Hash className="size-2.5 opacity-60" />
                        {post.tag}
                      </Badge>
                      <span className="text-[11px] text-[#5d6878]">
                        {post.date}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold tracking-[-0.02em]">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-[11px] leading-5 text-[#8b97a7]">
                        {post.excerpt}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </DashboardSection>

            <DashboardSection title="commit_history" count={commits.length}>
              <div className="space-y-3">
                {commits.map((commit) => (
                  <Card
                    key={commit.message}
                    size="sm"
                    className="gap-3 rounded-xl border border-[#232b36] bg-[#0e1218] p-4 py-4 shadow-none ring-0"
                  >
                    <div className="flex gap-3">
                      <div className="grid size-8 place-items-center rounded-lg bg-[#151a22] text-[#4ec98a]">
                        <GitCommit className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-[13px] font-semibold tracking-[-0.02em]">
                          {commit.message}
                        </h3>
                        <p className="mt-1 text-[11px] text-[#5d6878]">
                          {commit.repo} / {commit.when}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </DashboardSection>
          </div>

          <DashboardSection title="side_projects" count={projects.length}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <Card
                  key={project.name}
                  size="sm"
                  className="gap-4 rounded-xl border border-[#232b36] bg-[#0e1218] p-4 py-4 shadow-none ring-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-[#151a22] text-[#f0805c]">
                      <Rocket className="size-5" />
                    </div>
                    <Badge className="border-0 bg-[#5aa9ff]/15 font-mono text-[#5aa9ff]">
                      {project.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold tracking-[-0.02em]">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#8b97a7]">
                      {project.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((item) => (
                      <Badge
                        key={item}
                        className="border-0 bg-[#151a22] font-mono text-[#8b97a7]"
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

          <DashboardSection
            title="job_search_board"
            count={todos.length}
            action={
              <span className="inline-flex items-center gap-1 text-[11px] text-[#5d6878]">
                <Filter className="size-3" />
                board
              </span>
            }
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {boardColumns.map((column) => (
                <div key={column.label}>
                  <div className="mb-2 flex items-center gap-2 px-0.5 text-xs font-semibold">
                    <span className={`size-2 rounded-full ${column.color}`} />
                    <span>{column.label}</span>
                    <span className="text-[#404a59]">
                      {column.items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {column.items.map((todo, index) => (
                      <Card
                        key={todo.id}
                        size="sm"
                        className="gap-3 rounded-lg border border-[#232b36] bg-[#0e1218] p-3 py-3 shadow-none ring-0 transition hover:border-[#303a48]"
                      >
                        <div className="flex items-center gap-1.5">
                          <Badge className="border-0 bg-[#5aa9ff]/15 font-mono text-[#5aa9ff]">
                            <Hash className="size-2.5 opacity-60" />
                            backend
                          </Badge>
                          {index === 1 ? (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-[#f0664f]">
                              <Bug className="size-3" />
                              P1
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-[13px] font-semibold leading-5 tracking-[-0.02em]">
                          {todo.title}
                        </h3>
                        <p className="text-[11px] leading-5 text-[#5d6878]">
                          Synced from the current todo API response.
                        </p>
                        <div className="flex items-center justify-between border-t border-dashed border-[#232b36] pt-2 text-[11px] text-[#5d6878]">
                          work
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Check className="size-3" />
                            {Math.min(index + 1, 3)}/3
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      </section>
    </div>
  );
}
