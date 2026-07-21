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
import { Textarea } from "@/components/ui/textarea";
import {
  createGoal,
  getAllGoals,
  type Goal,
} from "@/features/goals/api/goals";
import { getGoalProgress } from "@/features/goals/lib/goalProgress";
import {
  createTodo,
  deleteTodo,
  updateTodo,
  type Todo,
  type TodoStatus,
} from "@/features/todos/api/todos";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Pencil, Plus, Target, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GOALS_QUERY_KEY = ["admin-goals"];

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

const STATUS_TEXT_COLORS: Record<TodoStatus, string> = {
  Backlog: "text-muted-foreground",
  InProgress: "text-info",
  Blocked: "text-primary",
  Completed: "text-accent-green",
};

function useInvalidateGoals() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
}

function CreateGoalDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const invalidateGoals = useInvalidateGoals();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createGoal({
        name: name.trim(),
        summary: summary.trim(),
        tags: tags.trim(),
      }),
    onSuccess: async () => {
      toast.success("Goal created.", { richColors: true });
      await invalidateGoals();
      setName("");
      setSummary("");
      setTags("");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to create goal.", { richColors: true });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-accent-green font-mono text-background hover:bg-accent-green/85">
            <Plus className="mr-1 size-4" />
            New goal
          </Button>
        }
      />
      <DialogContent className="border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">
            Create goal
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-border bg-secondary text-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground">Summary</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="border-border bg-secondary text-foreground"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground">Tags (optional)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma,separated"
              className="border-border bg-secondary text-foreground"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !name.trim() || !summary.trim()}
            className="bg-accent-green font-mono text-background hover:bg-accent-green/85"
          >
            {isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTodoRow({ goalId }: { goalId: number }) {
  const [title, setTitle] = useState("");
  const invalidateGoals = useInvalidateGoals();

  const { mutate, isPending } = useMutation({
    mutationFn: () => createTodo({ title: title.trim(), goalId }),
    onSuccess: async () => {
      toast.success("Todo added.", { richColors: true });
      await invalidateGoals();
      setTitle("");
    },
    onError: () => {
      toast.error("Failed to add todo.", { richColors: true });
    },
  });

  const canSubmit = title.trim().length > 0 && !isPending;

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) mutate();
      }}
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="add a todo to this goal…"
        className="h-8 border-border bg-secondary font-mono text-sm text-foreground placeholder:text-subtle"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!canSubmit}
        className="shrink-0 bg-accent-green font-mono text-background hover:bg-accent-green/85"
      >
        <Plus className="size-4" />
        add
      </Button>
    </form>
  );
}

function EditTodoDialog({ todo }: { todo: Todo }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const invalidateGoals = useInvalidateGoals();

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateTodo(todo.id, { title: title.trim() }),
    onSuccess: async () => {
      toast.success("Todo updated.", { richColors: true });
      await invalidateGoals();
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
            aria-label={`Edit "${todo.title}"`}
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent className="border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">
            Edit todo
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-border bg-secondary text-foreground"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !title.trim()}
            className="bg-accent-green font-mono text-background hover:bg-accent-green/85"
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TodoRow({ todo }: { todo: Todo }) {
  const invalidateGoals = useInvalidateGoals();

  const { mutate: changeStatus, isPending: statusPending } = useMutation({
    mutationFn: (status: TodoStatus) => updateTodo(todo.id, { status }),
    onSuccess: () => invalidateGoals(),
    onError: () => {
      toast.error("Failed to update status.", { richColors: true });
    },
  });

  const { mutate: remove, isPending: removePending } = useMutation({
    mutationFn: () => deleteTodo(todo.id),
    onSuccess: async () => {
      toast.success("Todo deleted.", { richColors: true });
      await invalidateGoals();
    },
    onError: () => {
      toast.error("Failed to delete todo.", { richColors: true });
    },
  });

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          todo.status === "Completed"
            ? "text-subtle line-through"
            : "text-foreground"
        }`}
      >
        {todo.title}
      </span>

      <Select
        value={todo.status}
        onValueChange={(v) => v && changeStatus(v as TodoStatus)}
        disabled={statusPending}
      >
        <SelectTrigger
          size="sm"
          aria-label={`Status for "${todo.title}"`}
          className={`w-32 shrink-0 border-border bg-secondary font-mono text-xs ${STATUS_TEXT_COLORS[todo.status]}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-border bg-card font-mono">
          {TODO_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <EditTodoDialog todo={todo} />
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={removePending}
        aria-label={`Delete "${todo.title}"`}
        className="text-muted-foreground hover:text-primary"
        onClick={() => remove()}
      >
        <Trash className="size-4" />
      </Button>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const [expanded, setExpanded] = useState(false);
  const progress = getGoalProgress(goal);

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary">
          <Target className="size-4 text-primary" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">
            {goal.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {progress.done}/{progress.total} done · {progress.percent}%
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded ? (
        <div className="space-y-3 border-t border-border p-4">
          {goal.summary ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {goal.summary}
            </p>
          ) : null}

          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="space-y-2">
            {goal.todos.length === 0 ? (
              <p className="text-sm text-subtle">No todos yet.</p>
            ) : (
              goal.todos.map((todo) => <TodoRow key={todo.id} todo={todo} />)
            )}
          </div>

          <AddTodoRow goalId={goal.id} />
        </div>
      ) : null}
    </div>
  );
}

export function AdminGoals() {
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: GOALS_QUERY_KEY,
    queryFn: getAllGoals,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {goals ? `${goals.length} goals` : "Loading…"}
        </p>
        <CreateGoalDialog />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading goals…</p>
      )}

      {goals?.length === 0 && (
        <p className="text-sm text-muted-foreground">No goals yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {goals?.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
      </div>
    </div>
  );
}
