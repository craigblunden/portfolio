import { Todo } from "@/features/todos/api/todos";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export type Goal = {
  id: number;
  name: string;
  summary: string;
  todos: Todo[];
};

export type PagedGoalsResponse = {
  payload: Goal[];
  meta: {
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

const getApiUrl = () => {
  if (!apiUrl) {
    throw new Error(
      "Missing API URL. Set NEXT_PUBLIC_API_URL (and optionally API_URL for server-only use).",
    );
  }

  return apiUrl;
};

export const getGoals = async (offset: number, limit: number) => {
  const res = await fetch(
    `${getApiUrl()}/goals?offset=${offset}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error("Failed to load goals.");
  }

  return (await res.json()) as PagedGoalsResponse;
};
