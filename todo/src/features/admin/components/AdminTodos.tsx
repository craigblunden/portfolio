"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllGoals, type Goal } from "@/features/goals/api/goals";
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  type PagedTodosResponse,
  type Todo,
  type TodoStatus,
  type UpdateTodoInput,
} from "@/features/todos/api/todos";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TODO_STATUSES: TodoStatus[] = [
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

function GoalSelect({
  value,
  onChange,
  goals,
}: {
  value: string;
  onChange: (val: string) => void;
  goals: Goal[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full border-[#232b36] bg-[#151a22] text-[#e9eef5]">
        <SelectValue placeholder="No goal" />
      </SelectTrigger>
      <SelectContent className="border-[#232b36] bg-[#0e1218]">
        <SelectItem value="none">No goal</SelectItem>
        {goals.map((g) => (
          <SelectItem key={g.id} value={String(g.id)}>
            {g.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: TodoStatus;
  onChange: (val: TodoStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TodoStatus)}>
      <SelectTrigger className="w-full border-[#232b36] bg-[#151a22] text-[#e9eef5]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-[#232b36] bg-[#0e1218]">
        {TODO_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CreateTodoDialog({ goals }: { goals: Goal[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [goalId, setGoalId] = useState<string>("none");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createTodo({
        title: title.trim(),
        goalId: goalId !== "none" ? Number(goalId) : null,
      }),
    onSuccess: async () => {
      toast.success("Todo created.", { richColors: true });
      await queryClient.invalidateQueries({ queryKey: ["admin-todos"] });
      setTitle("");
      setGoalId("none");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to create todo.", { richColors: true });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-[#57a773] font-mono text-[#0a0d12] hover:bg-[#6dbf8a]">
            <Plus className="mr-1 size-4" />
            New todo
          </Button>
        }
      />
      <DialogContent className="border-[#232b36] bg-[#0e1218] text-[#e9eef5]">
        <DialogHeader>
          <DialogTitle className="font-mono text-[#e9eef5]">
            Create todo
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#8b97a7]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Todo title"
              className="border-[#232b36] bg-[#151a22] text-[#e9eef5] placeholder:text-[#4a5568]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#8b97a7]">Goal (optional)</Label>
            <GoalSelect value={goalId} onChange={setGoalId} goals={goals} />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !title.trim()}
            className="bg-[#57a773] font-mono text-[#0a0d12] hover:bg-[#6dbf8a]"
          >
            {isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditTodoDialog({ todo, goals }: { todo: Todo; goals: Goal[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [status, setStatus] = useState<TodoStatus>(todo.status);
  const [goalId, setGoalId] = useState<string>(
    todo.goalId ? String(todo.goalId) : "none",
  );
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const input: UpdateTodoInput = {
        title: title.trim(),
        status,
        goalId: goalId !== "none" ? Number(goalId) : null,
      };
      return updateTodo(todo.id, input);
    },
    onSuccess: async () => {
      toast.success("Todo updated.", { richColors: true });
      await queryClient.invalidateQueries({ queryKey: ["admin-todos"] });
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to update todo.", { richColors: true });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-[#8b97a7] hover:text-[#e9eef5]"
          />
        }
      >
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent className="border-[#232b36] bg-[#0e1218] text-[#e9eef5]">
        <DialogHeader>
          <DialogTitle className="font-mono text-[#e9eef5]">
            Edit todo
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#8b97a7]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-[#232b36] bg-[#151a22] text-[#e9eef5]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#8b97a7]">Status</Label>
            <StatusSelect value={status} onChange={setStatus} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#8b97a7]">Goal (optional)</Label>
            <GoalSelect value={goalId} onChange={setGoalId} goals={goals} />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !title.trim()}
            className="bg-[#57a773] font-mono text-[#0a0d12] hover:bg-[#6dbf8a]"
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminTodos() {
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data: todosData, isLoading: todosLoading } =
    useQuery<PagedTodosResponse>({
      queryKey: ["admin-todos", offset, limit],
      queryFn: () => getTodos(offset, limit),
    });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["all-goals"],
    queryFn: getAllGoals,
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      toast.success("Todo deleted.", { richColors: true });
      queryClient.invalidateQueries({ queryKey: ["admin-todos"] });
    },
    onError: () => {
      toast.error("Failed to delete todo.", { richColors: true });
    },
  });

  const goalMap = new Map(goals.map((g) => [g.id, g.name]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[#8b97a7]">
          {todosData ? `${todosData.payload.length} todos` : "Loading…"}
        </p>
        <CreateTodoDialog goals={goals} />
      </div>

      {todosLoading && <p className="text-sm text-[#8b97a7]">Loading todos…</p>}

      {todosData?.payload.length === 0 && (
        <p className="text-sm text-[#8b97a7]">No todos yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {todosData?.payload.map((todo: Todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between rounded-lg border border-[#232b36] bg-[#0e1218] px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium text-[#e9eef5]">
                {todo.title}
              </span>
              <div className="flex items-center gap-2 text-xs text-[#8b97a7]">
                <span
                  className={
                    todo.status === "Completed"
                      ? "text-[#57a773]"
                      : todo.status === "Blocked"
                        ? "text-[#f0805c]"
                        : todo.status === "InProgress"
                          ? "text-[#6ca0dc]"
                          : "text-[#8b97a7]"
                  }
                >
                  {STATUS_LABELS[todo.status]}
                </span>
                {todo.goalId && goalMap.has(todo.goalId) && (
                  <>
                    <span>·</span>
                    <span>{goalMap.get(todo.goalId)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="ml-4 flex shrink-0 items-center gap-1">
              <EditTodoDialog todo={todo} goals={goals} />
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-[#8b97a7] hover:text-[#f0805c]"
                onClick={() => remove(todo.id)}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {todosData && (
        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={!todosData.meta.hasPreviousPage}
            className="border-[#232b36] bg-[#0e1218] font-mono text-[#8b97a7] hover:bg-[#151a22] hover:text-[#e9eef5]"
          >
            ← Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(offset + limit)}
            disabled={!todosData.meta.hasNextPage}
            className="border-[#232b36] bg-[#0e1218] font-mono text-[#8b97a7] hover:bg-[#151a22] hover:text-[#e9eef5]"
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
