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
      <DrawerContent className="w-[92vw] rounded-none border-[#232b36] bg-[#0e1218] font-mono text-[#e9eef5] sm:max-w-sm">
        <DrawerHeader className="border-b border-[#232b36] p-5 text-left">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#57a773]">
            {"// selected_goal"}
            <span className="flex-1" />
            <MoreHorizontal className="size-4 text-[#5d6878]" />
          </div>
          <div className="flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-[#f0805c]/15 text-[#f0805c]">
              <Target className="size-5" />
            </div>
            <div>
              <DrawerTitle className="font-mono text-base font-bold leading-6 tracking-[-0.03em] text-[#e9eef5]">
                {goal.name}
              </DrawerTitle>
              <DrawerDescription className="mt-2 font-mono text-xs leading-6 text-[#8b97a7]">
                {goal.summary}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {/* <MetaRow label="list">
            {goal.list.map((list) => (
              <span key={list} className="inline-flex items-center gap-1">
                <Hash className="size-3 text-[#5d6878]" />
                {list}
              </span>
            ))}
          </MetaRow> */}
          <MetaRow label="due">
            <Calendar className="size-3 text-[#f0805c]" />
            {/* {goal.due} */}
          </MetaRow>
          {/* <MetaRow label="tags">
            {goal.tags.map((tag) => (
              <Badge
                key={tag}
                className="border-0 bg-[#f0805c]/15 font-mono text-[#f0805c]"
              >
                #{tag}
              </Badge>
            ))}
          </MetaRow> */}

          <div className="mb-3 mt-5 flex items-baseline gap-2 text-[13px] font-semibold">
            <span className="text-[#57a773]">{"//"}</span>
            subtasks
            <span className="text-[11px] text-[#404a59]">
              [{doneCount}/{goal.todos.length}]
            </span>
          </div>
          {/* <Progress
            value={goal.progress}
            className="mb-4 **:data-[slot=progress-indicator]:bg-[#f0805c] **:data-[slot=progress-track]:bg-[#151a22]"
          /> */}
          <div className="space-y-2">
            {goal.todos.map((todo) => (
              <div
                key={todo.title}
                className="flex items-center gap-2 rounded-lg border border-[#232b36] px-3 py-2 text-left text-xs text-[#e9eef5]"
              >
                <span
                  className={`grid size-4 place-items-center rounded border ${
                    todo.status === "Completed"
                      ? "border-[#4ec98a] bg-[#4ec98a]"
                      : "border-[#303a48]"
                  }`}
                >
                  {todo.status === "Completed" ? (
                    <Check className="size-3 text-[#0e1218]" />
                  ) : null}
                </span>
                <span
                  className={
                    todo.status === "Completed" ? "text-[#5d6878] line-through" : undefined
                  }
                >
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DrawerFooter className="border-t border-[#232b36] p-4">
          <DrawerClose asChild>
            <Button className="w-full bg-[#f0805c] font-mono font-bold text-[#1a0f0a] hover:bg-[#f59377]">
              <Rocket className="size-4" />
              mark as done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
