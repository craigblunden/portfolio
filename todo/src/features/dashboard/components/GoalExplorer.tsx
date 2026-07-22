"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  FileText,
  OctagonAlert,
  Rocket,
} from "lucide-react";
import type { TodoStatus } from "@/features/todos/api/todos";

/**
 * View models, not domain objects.
 *
 * Everything crossing into this client component is serialized into the HTML and
 * re-sent on every RSC request, so these carry only the fields actually rendered —
 * a `PostMeta` would drag its description, tags, date and attachment arrays across
 * for the sake of a title. Derived values (progress, the formatted due date, whether
 * an article is linkable) are computed on the server for the same reason.
 */

export type SubtaskView = {
  id: number;
  title: string;
  description?: string;
  status: TodoStatus;
};

export type LinkedItemView = {
  /** Unique within the goal; slugs collide across kinds, so the kind is included. */
  id: string;
  kind: "project" | "article";
  title: string;
  status: string;
  /** Absent for things with no page of their own, e.g. a planned article. */
  href?: string;
};

export type GoalEntry = {
  slug: string;
  name: string;
  summary: string;
  /** Pre-formatted, e.g. "nov 2026". Null when the goal has no target date. */
  due: string | null;
  done: number;
  total: number;
  percent: number;
  todos: SubtaskView[];
  links: LinkedItemView[];
};

const statusLabel: Record<TodoStatus, string> = {
  Completed: "done",
  InProgress: "in progress",
  Blocked: "blocked",
  Backlog: "backlog",
};

/** Chip and segment colours, kept together so a status can never render two ways. */
const statusStyles: Record<TodoStatus, { chip: string; segment: string }> = {
  Completed: { chip: "bg-success/15 text-success", segment: "bg-success" },
  InProgress: { chip: "bg-info/15 text-info", segment: "bg-info" },
  Blocked: { chip: "bg-primary/15 text-primary", segment: "bg-primary" },
  Backlog: { chip: "bg-secondary text-subtle", segment: "bg-secondary" },
};

function StatusIcon({ status }: { status: TodoStatus }) {
  const className = "size-3.5 shrink-0";

  switch (status) {
    case "Completed":
      return <Check className={`${className} text-success`} />;
    case "InProgress":
      return <CircleDot className={`${className} text-info`} />;
    case "Blocked":
      return <OctagonAlert className={`${className} text-primary`} />;
    case "Backlog":
      return <Circle className={`${className} text-subtle`} />;
  }
}

export function GoalExplorer({
  entries,
  aside,
}: {
  entries: GoalEntry[];
  /**
   * Optional third column, shown on wide screens only.
   *
   * Taken as a node rather than data so it stays server-rendered — the article cards
   * it holds reach into the post loaders, which cannot be bundled for the browser.
   */
  aside?: React.ReactNode;
}) {
  const [selectedSlug, setSelectedSlug] = useState(entries[0]?.slug);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  if (entries.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface/40 p-6 text-sm text-subtle">
        No goals yet.
      </section>
    );
  }

  const selected =
    entries.find((entry) => entry.slug === selectedSlug) ?? entries[0];

  /**
   * Arrow keys move between goals the way they do in an editor's file tree. Selection
   * follows focus, which is the standard behaviour for tabs whose panels are already
   * loaded — nothing is fetched on select, so there is no cost to landing on one.
   */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const currentIndex = entries.findIndex(
      (entry) => entry.slug === selected.slug,
    );

    const nextIndex = (() => {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          return (currentIndex + 1) % entries.length;
        case "ArrowUp":
        case "ArrowLeft":
          return (currentIndex - 1 + entries.length) % entries.length;
        case "Home":
          return 0;
        case "End":
          return entries.length - 1;
        default:
          return null;
      }
    })();

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();

    const nextSlug = entries[nextIndex].slug;
    setSelectedSlug(nextSlug);
    tabRefs.current.get(nextSlug)?.focus();
  };

  return (
    <section className="grid min-w-0 grid-cols-1 items-stretch overflow-hidden rounded-xl border border-border bg-surface/40 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,15rem)]">
      <div
        role="tablist"
        aria-label="Goals"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="flex min-w-0 flex-col border-b border-border p-2 lg:border-b-0 lg:border-r"
      >
        <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
          goals
        </p>

        {entries.map((entry) => {
          const active = entry.slug === selected.slug;

          return (
            <button
              key={entry.slug}
              ref={(node) => {
                if (node) {
                  tabRefs.current.set(entry.slug, node);
                } else {
                  tabRefs.current.delete(entry.slug);
                }
              }}
              type="button"
              role="tab"
              id={`goal-tab-${entry.slug}`}
              aria-selected={active}
              aria-controls={`goal-panel-${entry.slug}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelectedSlug(entry.slug)}
              className={`group w-full border-l-2 px-2 py-2.5 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${
                active
                  ? "border-l-primary bg-secondary/60"
                  : "border-l-transparent hover:bg-secondary/30"
              }`}
            >
              <span className="flex items-start gap-1.5">
                {active ? (
                  <ChevronDown className="mt-0.5 size-3.5 shrink-0 text-primary" />
                ) : (
                  <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-faint" />
                )}
                <span
                  className={`min-w-0 flex-1 text-[13px] leading-5 ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {entry.name}
                </span>
                <span
                  className={`shrink-0 text-[11px] tabular-nums ${
                    active ? "text-primary" : "text-subtle"
                  }`}
                >
                  {entry.percent}%
                </span>
              </span>

              <span className="mt-2 ml-5 block h-px bg-border">
                <span
                  className={`block h-px ${active ? "bg-primary" : "bg-subtle"}`}
                  style={{ width: `${entry.percent}%` }}
                />
              </span>
            </button>
          );
        })}

        <p className="mt-auto hidden px-2 pt-4 text-[11px] text-faint lg:block">
          ↑↓ to navigate
        </p>
      </div>

      <GoalPanel entry={selected} />

      {aside ? (
        <div className="hidden min-w-0 border-l border-border p-3 xl:block">
          {aside}
        </div>
      ) : null}
    </section>
  );
}

function GoalPanel({ entry }: { entry: GoalEntry }) {
  const { todos, links } = entry;

  return (
    <div
      role="tabpanel"
      id={`goal-panel-${entry.slug}`}
      aria-labelledby={`goal-tab-${entry.slug}`}
      tabIndex={0}
      className="min-w-0 p-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <h2 className="mb-0 min-w-0 text-lg font-bold tracking-[-0.02em] sm:text-xl">
          {entry.name}
        </h2>
        <span className="shrink-0 pt-1 text-[11px] tabular-nums text-subtle">
          {entry.done} / {entry.total} done
        </span>
      </div>

      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
        {entry.summary}
      </p>

      {entry.due ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-subtle">
          <Calendar className="size-3 text-primary" />
          target {entry.due}
        </p>
      ) : null}

      <SegmentedProgress todos={todos} percent={entry.percent} />

      {todos.length > 0 ? (
        <>
          <SectionLabel>subtasks</SectionLabel>
          <ul className="space-y-3">
            {todos.map((todo) => (
              <SubtaskRow key={todo.id} todo={todo} />
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-5 text-sm text-subtle">No subtasks yet.</p>
      )}

      {links.length > 0 ? (
        <>
          <SectionLabel>linked</SectionLabel>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {links.map((link) => (
              <LinkedCard key={link.id} item={link} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * One segment per subtask, coloured by status.
 *
 * A plain percentage bar hides the shape of the work: three done and one blocked
 * reads identically to three done and one queued. The segments make the mix legible
 * at a glance, and the percentage stays available as the accessible value.
 */
function SegmentedProgress({
  todos,
  percent,
}: {
  todos: SubtaskView[];
  percent: number;
}) {
  if (todos.length === 0) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Goal progress"
      className="mt-4 flex gap-1"
    >
      {todos.map((todo) => (
        <span
          key={todo.id}
          className={`h-1.5 flex-1 rounded-full ${statusStyles[todo.status].segment}`}
        />
      ))}
    </div>
  );
}

function SubtaskRow({ todo }: { todo: SubtaskView }) {
  const done = todo.status === "Completed";

  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5">
        <StatusIcon status={todo.status} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm leading-5 ${
            done ? "text-subtle line-through" : "text-secondary-foreground"
          }`}
        >
          {todo.title}
        </span>
        {todo.description ? (
          <span className="mt-0.5 block text-[12px] leading-5 text-subtle">
            {todo.description}
          </span>
        ) : null}
      </span>

      <span
        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusStyles[todo.status].chip}`}
      >
        {statusLabel[todo.status]}
      </span>
    </li>
  );
}

function LinkedCard({ item }: { item: LinkedItemView }) {
  const { kind, status, title, href } = item;

  const body = (
    <>
      <span className="flex items-center gap-1.5 text-[11px] text-subtle">
        {kind === "project" ? (
          <Rocket className="size-3 text-accent-green" />
        ) : (
          <FileText className="size-3 text-info" />
        )}
        {kind}
        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {status}
        </span>
      </span>
      <span className="mt-1.5 block text-[13px] leading-5 text-secondary-foreground">
        {title}
      </span>
    </>
  );

  const className =
    "block rounded-lg border border-border bg-card p-3 transition";

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  const external = href.startsWith("http");

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`${className} hover:border-primary/40 hover:bg-secondary/30`}
    >
      {body}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
      {children}
    </p>
  );
}
