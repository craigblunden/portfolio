"use client";

import { Button } from "@/components/ui/button";
import {
  deleteTodo,
  getTodos,
  type PagedTodosResponse,
  type Todo,
} from "@/features/todos/api/todos";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateTodo } from "./CreateTodo";

export const Todos = () => {
  const [offset, setOffset] = useState(0);
  const limit = 5;

  const { data } = useQuery<PagedTodosResponse>({
    queryKey: ["todos", offset, limit],
    queryFn: () => getTodos(offset, limit),
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: ["todos"],
    mutationFn: deleteTodo,
    onSuccess: () => {
      toast.success("Your todo has been deleted.", {
        richColors: true,
      });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <div className="w-full">
      {data?.payload.map((todo: Todo) => (
        <div
          key={todo.id}
          className="mb-4 flex items-center justify-between rounded-md border border-border bg-background p-4"
        >
          <span>{todo.title}</span>
          <Button
            onClick={() => mutate(todo.id)}
            className="text-muted transition hover:text-foreground"
          >
            <Trash />
          </Button>
        </div>
      ))}
      <Button
        onClick={() => setOffset(Math.max(0, offset - limit))}
        className="mr-2 rounded-md border border-border bg-surface px-3 py-1 text-sm text-foreground transition hover:bg-surface-elevated"
        disabled={!data?.meta.hasPreviousPage}
      >
        Prev
      </Button>
      <Button
        onClick={() => setOffset(offset + limit)}
        className="rounded-md border border-border bg-surface px-3 py-1 text-sm text-foreground transition hover:bg-surface-elevated"
        disabled={!data?.meta.hasNextPage}
      >
        Next
      </Button>
      <CreateTodo />
    </div>
  );
};
