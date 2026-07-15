"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllGoals, type Goal } from "@/features/goals/api/goals";
import {
  updateTodo,
  type Todo,
  type TodoStatus,
} from "@/features/todos/api/todos";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const STATUSES: TodoStatus[] = [
  "Backlog",
  "InProgress",
  "Blocked",
  "Completed",
];

const STATUS_LABELS: Record<TodoStatus, string> = {
  Backlog: "Backlog",
  InProgress: "In Progress",
  Blocked: "Blocked",
  Completed: "Completed",
};

const STATUS_COLORS: Record<TodoStatus, string> = {
  Backlog: "text-[#8b97a7] border-[#232b36]",
  InProgress: "text-[#6ca0dc] border-[#6ca0dc]/40",
  Blocked: "text-[#f0805c] border-[#f0805c]/40",
  Completed: "text-[#57a773] border-[#57a773]/40",
};

function TodoCard({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (status: TodoStatus) => updateTodo(todo.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-goals"] });
    },
    onError: () => {
      toast.error("Failed to move todo.", { richColors: true });
    },
  });

  const currentIndex = STATUSES.indexOf(todo.status);
  const prevStatus = currentIndex > 0 ? STATUSES[currentIndex - 1] : null;
  const nextStatus =
    currentIndex < STATUSES.length - 1 ? STATUSES[currentIndex + 1] : null;

  return (
    <div className="rounded-lg border border-[#232b36] bg-[#0e1218] p-3">
      <p className="mb-3 text-sm text-[#e9eef5]">{todo.title}</p>
      <div className="flex items-center justify-between gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!prevStatus || isPending}
          onClick={() => prevStatus && mutate(prevStatus)}
          className="size-6 text-[#8b97a7] hover:text-[#e9eef5] disabled:opacity-30"
          aria-label="Move left"
        >
          <ArrowLeft className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!nextStatus || isPending}
          onClick={() => nextStatus && mutate(nextStatus)}
          className="size-6 text-[#8b97a7] hover:text-[#e9eef5] disabled:opacity-30"
          aria-label="Move right"
        >
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  todos,
}: {
  status: TodoStatus;
  todos: Todo[];
}) {
  return (
    <div
      className={`flex min-w-55 flex-1 flex-col rounded-lg border bg-[#0a0d12] p-3 ${STATUS_COLORS[status]}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em]">
          {STATUS_LABELS[status]}
        </h3>
        <span className="text-xs text-[#8b97a7]">{todos.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {todos.length === 0 && (
          <p className="text-xs text-[#4a5568]">Empty</p>
        )}
        {todos.map((t) => (
          <TodoCard key={t.id} todo={t} />
        ))}
      </div>
    </div>
  );
}

function GoalKanban({ goal }: { goal: Goal }) {
  const grouped: Record<TodoStatus, Todo[]> = {
    Backlog: [],
    InProgress: [],
    Blocked: [],
    Completed: [],
  };

  for (const todo of goal.todos) {
    grouped[todo.status].push(todo);
  }

  return (
    <div>
      {goal.summary && (
        <p className="mb-4 text-sm text-[#8b97a7]">{goal.summary}</p>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATUSES.map((s) => (
          <KanbanColumn key={s} status={s} todos={grouped[s]} />
        ))}
      </div>
    </div>
  );
}

export function GoalsKanban() {
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["kanban-goals"],
    queryFn: getAllGoals,
  });

  if (isLoading) {
    return <p className="text-sm text-[#8b97a7]">Loading goals…</p>;
  }

  if (!goals || goals.length === 0) {
    return <p className="text-sm text-[#8b97a7]">No goals yet.</p>;
  }

  return (
    <Tabs defaultValue={String(goals[0].id)}>
      <TabsList
        variant="line"
        className="mb-6 flex-wrap border-b border-[#232b36] bg-transparent"
      >
        {goals.map((g) => (
          <TabsTrigger
            key={g.id}
            value={String(g.id)}
            className="font-mono text-[#8b97a7] data-selected:text-[#e9eef5]"
          >
            {g.name}
            <span className="ml-2 text-xs text-[#4a5568]">
              {g.todos.length}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {goals.map((g) => (
        <TabsContent key={g.id} value={String(g.id)}>
          <GoalKanban goal={g} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
