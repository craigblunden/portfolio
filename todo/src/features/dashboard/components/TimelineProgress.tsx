"use client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Goal } from "@/features/goals/api/goals";
import type { Todo } from "@/features/todos/api/todos";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis } from "recharts";

type TimelineProgressProps = {
  todos: Todo[];
  goals: Goal[];
};

type DatedTodo = Todo & {
  completionDate?: string | null;
  completedAt?: string | null;
};

type GoalMilestoneFixture = {
  date: Date;
  label: string;
};

type TimelinePoint = {
  date: string;
  todos: number;
};

type TodoDotProps = {
  cx?: number;
  cy?: number;
  payload?: {
    todos?: number;
  };
};

const chartConfig = {
  todos: {
    label: "Todos Completed (Daily)",
    color: "#f0805c",
  },
  goals: {
    label: "Goal Milestone Lines",
    color: "#4ec98a",
  },
} satisfies ChartConfig;

const GOAL_MILESTONE_FIXTURES: GoalMilestoneFixture[] = [
  { date: new Date(2026, 5, 15), label: "Portfolio" },
  { date: new Date(2026, 6, 15), label: "Applications" },
  { date: new Date(2026, 7, 15), label: "Writing" },
  { date: new Date(2026, 8, 15), label: "Interviews" },
  { date: new Date(2026, 9, 1), label: "Decisions" },
  { date: new Date(2026, 10, 14), label: "Start" },
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function buildRunwayDays(startDate: Date, endDate: Date) {
  const days: Date[] = [];
  let cursor = startOfDay(startDate);
  const runwayEnd = startOfDay(endDate);

  while (cursor <= runwayEnd) {
    days.push(new Date(cursor));
    cursor = new Date(cursor.getTime() + DAY_IN_MS);
  }

  return days;
}

function parseTodoCompletionDate(todo: Todo) {
  const datedTodo = todo as DatedTodo;
  const rawDate = datedTodo.completionDate ?? datedTodo.completedAt;

  if (!rawDate) {
    return undefined;
  }

  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function buildTodoCompletionsByDay(
  todos: Todo[],
  startDate: Date,
  endDate: Date,
) {
  const countsByDay = new Map<string, number>();
  const runwayStart = startOfDay(startDate);
  const runwayEnd = startOfDay(endDate);
  const completedFallbackCount = todos.filter(
    (todo) => todo.isCompleted,
  ).length;

  todos.forEach((todo) => {
    const completionDate = parseTodoCompletionDate(todo);

    if (!completionDate) {
      return;
    }

    const normalizedDate = startOfDay(completionDate);

    if (normalizedDate < runwayStart || normalizedDate > runwayEnd) {
      return;
    }

    const key = toDayKey(normalizedDate);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  });

  if (countsByDay.size === 0 && completedFallbackCount > 0) {
    const today = startOfDay(new Date());
    const fallbackDate =
      today < runwayStart ? runwayStart : today > runwayEnd ? runwayEnd : today;
    countsByDay.set(toDayKey(fallbackDate), completedFallbackCount);
  }

  return countsByDay;
}

function buildGoalMilestones(goals: Goal[]) {
  const fixtureLimit = goals.length || GOAL_MILESTONE_FIXTURES.length;
  const activeGoalMilestones = GOAL_MILESTONE_FIXTURES.slice(0, fixtureLimit);

  return activeGoalMilestones;
}

function buildMilestones(todos: Todo[], startDate: Date, endDate: Date) {
  const runwayDays = buildRunwayDays(startDate, endDate);
  const todoCompletionsByDay = buildTodoCompletionsByDay(
    todos,
    startDate,
    endDate,
  );

  return runwayDays.map((day): TimelinePoint => {
    const key = toDayKey(day);

    return {
      date: key,
      todos: todoCompletionsByDay.get(key) ?? 0,
    };
  });
}

function renderTodoDot({ cx, cy, payload }: TodoDotProps) {
  if (cx == null || cy == null || !payload?.todos) {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill="var(--color-todos)"
      stroke="#0e1218"
      strokeWidth={1}
    />
  );
}

export function TimelineProgress({ todos, goals }: TimelineProgressProps) {
  const startDate = new Date(2026, 6, 1);
  const endDate = new Date(2026, 10, 14);
  const today = new Date();

  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysElapsed = Math.max(
    0,
    Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  const activeGoalMilestones = buildGoalMilestones(goals);
  const chartData = buildMilestones(todos, startDate, endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mb-7 space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#57a773]">
          six month runway
        </h3>
        <div className="text-right text-[10px] text-[#5d6878]">
          {daysRemaining} days / {formatDate(startDate)} - {formatDate(endDate)}
        </div>
      </div>

      <ChartContainer
        config={chartConfig}
        className="h-52 w-full rounded-xl border border-[#232b36] bg-[#0e1218] p-3"
      >
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#1a212b"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(value) => formatDate(new Date(String(value)))}
            tick={{ fill: "#8b97a7", fontSize: 11 }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(value) => formatDate(new Date(String(value)))}
              />
            }
          />
          {activeGoalMilestones.map((milestone) => (
            <ReferenceLine
              key={`${milestone.label}-${milestone.date.toISOString()}`}
              x={toDayKey(milestone.date)}
              stroke="var(--color-goals)"
              strokeDasharray="4 4"
              strokeOpacity={0.75}
              label={{
                value: milestone.label,
                position: "insideTopRight",
                fill: "#8b97a7",
                fontSize: 10,
              }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="todos"
            stroke="var(--color-todos)"
            fill="var(--color-todos)"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={renderTodoDot}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
