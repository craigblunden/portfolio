import { Todo } from "@/features/todos/api/todos";

const serverApiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

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
  if (typeof window !== "undefined") {
    return "/api/backend";
  }

  if (!serverApiUrl) {
    throw new Error("Missing API URL. Set API_URL or NEXT_PUBLIC_API_URL.");
  }

  return serverApiUrl;
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

export const getAllGoals = async (): Promise<Goal[]> => {
  const allGoals: Goal[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const res = await fetch(
      `${getApiUrl()}/goals?offset=${offset}&limit=${limit}`,
    );

    if (!res.ok) break;

    const data = (await res.json()) as PagedGoalsResponse;
    allGoals.push(...data.payload);

    if (!data.meta.hasNextPage) break;
    offset += limit;
  }

  return allGoals;
};
