import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { Goal } from "@/features/goals/api/goals";
import { Calendar, Check, MoreHorizontal, Rocket, Target } from "lucide-react";
import { MetaRow } from "./MetaRow";

export function GoalDrawer({
  goal,
  children,
}: {
  goal: Goal;
  children: React.ReactNode;
}) {
  const doneCount = goal.todos.filter((todo) => todo.status === "Completed").length;

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="w-[92vw] rounded-none border-border bg-card font-mono text-foreground sm:max-w-sm">
        <DrawerHeader className="border-b border-border p-5 text-left">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-accent-green">
            {"// selected_goal"}
            <span className="flex-1" />
            <MoreHorizontal className="size-4 text-subtle" />
          </div>
          <div className="flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
              <Target className="size-5" />
            </div>
            <div>
              <DrawerTitle className="font-mono text-base font-bold leading-6 tracking-[-0.03em] text-foreground">
                {goal.name}
              </DrawerTitle>
              <DrawerDescription className="mt-2 font-mono text-xs leading-6 text-muted-foreground">
                {goal.summary}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {/* <MetaRow label="list">
            {goal.list.map((list) => (
              <span key={list} className="inline-flex items-center gap-1">
                <Hash className="size-3 text-subtle" />
                {list}
              </span>
            ))}
          </MetaRow> */}
          <MetaRow label="due">
            <Calendar className="size-3 text-primary" />
            {/* {goal.due} */}
          </MetaRow>
          {/* <MetaRow label="tags">
            {goal.tags.map((tag) => (
              <Badge
                key={tag}
                className="border-0 bg-primary/15 font-mono text-primary"
              >
                #{tag}
              </Badge>
            ))}
          </MetaRow> */}

          <div className="mb-3 mt-5 flex items-baseline gap-2 text-[13px] font-semibold">
            <span className="text-accent-green">{"//"}</span>
            subtasks
            <span className="text-[11px] text-faint">
              [{doneCount}/{goal.todos.length}]
            </span>
          </div>
          {/* <Progress
            value={goal.progress}
            className="mb-4 **:data-[slot=progress-indicator]:bg-primary **:data-[slot=progress-track]:bg-secondary"
          /> */}
          <div className="space-y-2">
            {goal.todos.map((todo) => (
              <div
                key={todo.title}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-xs text-foreground"
              >
                <span
                  className={`grid size-4 place-items-center rounded border ${
                    todo.status === "Completed"
                      ? "border-success bg-success"
                      : "border-border"
                  }`}
                >
                  {todo.status === "Completed" ? (
                    <Check className="size-3 text-primary-foreground" />
                  ) : null}
                </span>
                <span
                  className={
                    todo.status === "Completed" ? "text-subtle line-through" : undefined
                  }
                >
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DrawerFooter className="border-t border-border p-4">
          <DrawerClose asChild>
            <Button className="w-full bg-primary font-mono font-bold text-primary-foreground hover:bg-primary-hover">
              <Rocket className="size-4" />
              mark as done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
