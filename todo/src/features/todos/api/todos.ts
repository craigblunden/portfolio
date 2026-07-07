const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export type Todo = {
  id: number;
  title: string;
  isCompleted: boolean;
};

export type PagedTodosResponse = {
  payload: Todo[];
  meta: {
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type CreateTodoInput = {
  title: string;
};

const getApiUrl = () => {
  if (!apiUrl) {
    throw new Error(
      "Missing API URL. Set NEXT_PUBLIC_API_URL (and optionally API_URL for server-only use).",
    );
  }

  return apiUrl;
};

export const getTodos = async (offset: number, limit: number) => {
  const res = await fetch(
    `${getApiUrl()}/todos?offset=${offset}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error("Failed to load todos.");
  }

  return (await res.json()) as PagedTodosResponse;
};

export const createTodo = async ({ title }: CreateTodoInput) => {
  const res = await fetch(`${getApiUrl()}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    throw new Error("Failed to create todo.");
  }

  return (await res.json()) as Todo;
};

export const deleteTodo = async (id: number) => {
  const res = await fetch(`${getApiUrl()}/todos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete todo.");
  }
};
