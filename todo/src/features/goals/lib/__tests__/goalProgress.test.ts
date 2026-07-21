import { describe, expect, it } from "vitest";
import type { Goal } from "@/features/goals/api/goals";
import type { Todo } from "@/features/todos/api/todos";
import { getGoalProgress } from "../goalProgress";

const makeTodo = (id: number, status: Todo["status"]): Todo => ({
  id,
  title: `Todo ${id}`,
  status,
  goalId: 1,
});

const makeGoal = (todos: Todo[]): Goal => ({
  id: 1,
  name: "Test goal",
  summary: "A goal for testing",
  todos,
});

describe("getGoalProgress", () => {
  it("computes done, total and percent from todos", () => {
    const goal = makeGoal([
      makeTodo(1, "Completed"),
      makeTodo(2, "Completed"),
      makeTodo(3, "Backlog"),
      makeTodo(4, "InProgress"),
      makeTodo(5, "Blocked"),
    ]);

    expect(getGoalProgress(goal)).toEqual({ done: 2, total: 5, percent: 40 });
  });

  it("returns 100 percent when all todos are completed", () => {
    const goal = makeGoal([makeTodo(1, "Completed"), makeTodo(2, "Completed")]);

    expect(getGoalProgress(goal)).toEqual({ done: 2, total: 2, percent: 100 });
  });

  it("returns zero progress for an empty todo list", () => {
    expect(getGoalProgress(makeGoal([]))).toEqual({
      done: 0,
      total: 0,
      percent: 0,
    });
  });

  it("handles a goal with missing todos", () => {
    const goal = { ...makeGoal([]), todos: undefined } as unknown as Goal;

    expect(getGoalProgress(goal)).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it("rounds percent to the nearest integer", () => {
    const goal = makeGoal([
      makeTodo(1, "Completed"),
      makeTodo(2, "Backlog"),
      makeTodo(3, "Backlog"),
    ]);

    expect(getGoalProgress(goal).percent).toBe(33);
  });
});
