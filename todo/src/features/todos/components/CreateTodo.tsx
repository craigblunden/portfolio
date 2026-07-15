"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTodo } from "@/features/todos/api/todos";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});

type CreateTodoProps = {
  goalId: number;
};

export const CreateTodo = ({ goalId }: CreateTodoProps) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["todos"],
    mutationFn: createTodo,
    onSuccess: async () => {
      toast.success("Your todo has been created.", {
        richColors: true,
      });
      await queryClient.invalidateQueries({ queryKey: ["todos"] });
      form.reset();
    },
  });

  const form = useAppForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onChange: z.object({
        title: z.string().trim().min(1, "Title is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({ title: value.title.trim(), goalId });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <h2>Create Todo</h2>

      <form.AppForm>
        <form.AppField name="title">
          {({ state, handleChange, handleBlur }) => {
            return (
              <div className="flex flex-col gap-1">
                <Input
                  value={state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Enter a title"
                  className="rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted"
                />
                {state.meta.errors.length > 0 ? (
                  <p className="text-sm text-error">
                    {state.meta.errors[0]?.message}
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.AppField>
        <form.Button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-3 py-1 text-sm text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Submit"}
        </form.Button>
      </form.AppForm>
    </form>
  );
};
