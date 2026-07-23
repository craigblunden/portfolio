import { Todo } from "@/features/todos/api/todos";

const serverApiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export type Goal = {
  id: number;
  /** Stable key referenced from blog frontmatter. Assigned by the API on create. */
  slug: string;
  name: string;
  summary: string;
  todos: Todo[];
  /**
   * Calendar date the goal is aimed at, as `YYYY-MM-DD`.
   *
   * Optional because the API does not store it yet — goals without one simply omit
   * the due chip rather than falling back to a hardcoded date. Kept as a string for
   * the same reason blog dates are: it sorts correctly and cannot drift a day across
   * timezones the way a Date can.
   */
  targetDate?: string;
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

/**
 * Reads a JSON body, failing with the response's actual shape.
 *
 * A misconfigured base URL usually resolves to something that answers 200 with HTML
 * rather than refusing the connection — pointing API_URL at this site makes /goals
 * hit the app's own page. That passes the `res.ok` check and then dies inside
 * JSON.parse as `Unexpected token '<'`, which names neither the URL nor the cause.
 */
async function readJson<T>(res: Response, url: string): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON from ${url} but got "${contentType || "no content-type"}". ` +
        `Check API_URL points at the API, not at the site.`,
    );
  }

  return (await res.json()) as T;
}

export const getGoals = async (offset: number, limit: number) => {
  const url = `${getApiUrl()}/goals?offset=${offset}&limit=${limit}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to load goals: ${res.status} from ${url}.`);
  }

  return readJson<PagedGoalsResponse>(res, url);
};

export const getAllGoals = async (): Promise<Goal[]> => {
  const allGoals: Goal[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const url = `${getApiUrl()}/goals?offset=${offset}&limit=${limit}`;
    const res = await fetch(url);

    if (!res.ok) break;

    const data = await readJson<PagedGoalsResponse>(res, url);
    allGoals.push(...data.payload);

    if (!data.meta.hasNextPage) break;
    offset += limit;
  }

  return allGoals;
};

export type CreateGoalInput = {
  name: string;
  summary: string;
  tags?: string;
};

export const createGoal = async (input: CreateGoalInput) => {
  const res = await fetch(`${getApiUrl()}/goals`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      summary: input.summary,
      tags: input.tags ?? "",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create goal.");
  }

  return (await res.json()) as Goal;
};

export const deleteGoal = async (goalId: number) => {
  const res = await fetch(`${getApiUrl()}/goals/${goalId}`, {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete goal with ID ${goalId}.`);
  }
};
