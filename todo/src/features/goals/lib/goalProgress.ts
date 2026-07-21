import type { Goal } from "@/features/goals/api/goals";

export type GoalProgress = {
  done: number;
  total: number;
  percent: number;
};

export function getGoalProgress(goal: Goal): GoalProgress {
  const todos = goal.todos ?? [];
  const total = todos.length;
  const done = todos.filter((todo) => todo.status === "Completed").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { done, total, percent };
}
