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
import { Textarea } from "@/components/ui/textarea";
import {
  createGoal,
  getAllGoals,
  type Goal,
} from "@/features/goals/api/goals";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function CreateGoalDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createGoal({ name: name.trim(), summary: summary.trim(), tags: tags.trim() }),
    onSuccess: async () => {
      toast.success("Goal created.", { richColors: true });
      await queryClient.invalidateQueries({ queryKey: ["admin-goals"] });
      await queryClient.invalidateQueries({ queryKey: ["all-goals"] });
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
          <Button className="bg-[#57a773] font-mono text-[#0a0d12] hover:bg-[#6dbf8a]">
            <Plus className="mr-1 size-4" />
            New goal
          </Button>
        }
      />
      <DialogContent className="border-[#232b36] bg-[#0e1218] text-[#e9eef5]">
        <DialogHeader>
          <DialogTitle className="font-mono text-[#e9eef5]">
            Create goal
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#8b97a7]">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-[#232b36] bg-[#151a22] text-[#e9eef5]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#8b97a7]">Summary</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="border-[#232b36] bg-[#151a22] text-[#e9eef5]"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#8b97a7]">Tags (optional)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma,separated"
              className="border-[#232b36] bg-[#151a22] text-[#e9eef5]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !name.trim() || !summary.trim()}
            className="bg-[#57a773] font-mono text-[#0a0d12] hover:bg-[#6dbf8a]"
          >
            {isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminGoals() {
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["admin-goals"],
    queryFn: getAllGoals,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[#8b97a7]">
          {goals ? `${goals.length} goals` : "Loading…"}
        </p>
        <CreateGoalDialog />
      </div>

      {isLoading && <p className="text-sm text-[#8b97a7]">Loading goals…</p>}

      {goals?.length === 0 && (
        <p className="text-sm text-[#8b97a7]">No goals yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {goals?.map((g) => (
          <div
            key={g.id}
            className="rounded-lg border border-[#232b36] bg-[#0e1218] px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#e9eef5]">{g.name}</span>
              <span className="text-xs text-[#8b97a7]">
                {g.todos.length} todos
              </span>
            </div>
            {g.summary && (
              <p className="mt-1 text-xs text-[#8b97a7]">{g.summary}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
