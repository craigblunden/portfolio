import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "../frontmatter";

const FILENAME = "my-post.md";

/** The minimum frontmatter a post can declare. */
const valid = {
  title: "EF Core migrations on SQLite are not symmetric",
  description: "Applying a migration was atomic. Rolling it back wasn't.",
  date: "2026-07-21",
  status: "published",
};

const parse = (overrides: Record<string, unknown> = {}) =>
  parseFrontmatter({ ...valid, ...overrides }, FILENAME);

describe("parseFrontmatter", () => {
  describe("valid input", () => {
    it("accepts the minimum required fields", () => {
      const result = parse();

      expect(result.title).toBe(valid.title);
      expect(result.status).toBe("published");
    });

    it("defaults the optional arrays to empty", () => {
      const result = parse();

      expect(result.tags).toEqual([]);
      expect(result.goals).toEqual([]);
      expect(result.projects).toEqual([]);
    });

    it("keeps arrays that are provided", () => {
      const result = parse({
        tags: ["dotnet", "sqlite"],
        goals: ["land-next-senior-role"],
        projects: ["portfolio-dashboard"],
      });

      expect(result.tags).toEqual(["dotnet", "sqlite"]);
      expect(result.goals).toEqual(["land-next-senior-role"]);
      expect(result.projects).toEqual(["portfolio-dashboard"]);
    });

    it.each(["published", "draft", "planned"])("accepts status %s", (status) => {
      expect(parse({ status }).status).toBe(status);
    });

    it("accepts an optional updated date", () => {
      expect(parse({ updated: "2026-07-24" }).updated).toBe("2026-07-24");
    });

    // YAML turns an unquoted 2026-07-21 into a Date, so this is the path real posts
    // take unless the author remembers to quote it.
    it("normalises a Date from YAML into a YYYY-MM-DD string", () => {
      const result = parse({ date: new Date("2026-07-21T00:00:00.000Z") });

      expect(result.date).toBe("2026-07-21");
    });

    it("normalises an updated Date the same way", () => {
      const result = parse({ updated: new Date("2026-07-24T00:00:00.000Z") });

      expect(result.updated).toBe("2026-07-24");
    });
  });

  describe("required fields", () => {
    it.each(["title", "description", "date", "status"])(
      "rejects frontmatter missing %s",
      (field) => {
        const incomplete: Record<string, unknown> = { ...valid };
        delete incomplete[field];

        expect(() => parseFrontmatter(incomplete, FILENAME)).toThrow();
      },
    );

    it.each(["title", "description"])("rejects an empty %s", (field) => {
      expect(() => parse({ [field]: "" })).toThrow();
    });
  });

  describe("field formats", () => {
    it.each(["21-07-2026", "2026/07/21", "July 21 2026", "2026-7-1", "not a date"])(
      "rejects malformed date %s",
      (date) => {
        expect(() => parse({ date })).toThrow();
      },
    );

    it("rejects an unknown status", () => {
      expect(() => parse({ status: "archived" })).toThrow();
    });

    // These become URLs and cross-references, so a malformed entry is a build error
    // rather than something to normalise silently.
    it.each([["goals"], ["projects"]])("rejects a malformed %s entry", (field) => {
      expect(() => parse({ [field]: ["Not A Slug"] })).toThrow();
      expect(() => parse({ [field]: ["under_scores"] })).toThrow();
    });

    it("rejects a non-array where an array is expected", () => {
      expect(() => parse({ tags: "dotnet" })).toThrow();
    });
  });

  // These pin deliberate choices rather than incidental behaviour. Changing any of
  // them is a decision, not a refactor.
  describe("strictness decisions", () => {
    it("rejects unknown keys so a misspelled field fails loudly", () => {
      expect(() => parse({ tag: ["dotnet"] })).toThrow();
    });

    it("accepts a description at the 200 character limit", () => {
      expect(() => parse({ description: "a".repeat(200) })).not.toThrow();
    });

    it("rejects a description over the limit, which search engines would truncate", () => {
      expect(() => parse({ description: "a".repeat(201) })).toThrow();
    });

    it("allows a future date so a post can be written ahead of publishing", () => {
      expect(() => parse({ date: "2099-01-01" })).not.toThrow();
    });
  });

  describe("error messages", () => {
    it("names the offending file", () => {
      expect(() => parse({ status: "archived" })).toThrow(/my-post\.md/);
    });

    it("names the offending field", () => {
      expect(() => parse({ status: "archived" })).toThrow(/status/);
    });

    it("reports every problem at once rather than only the first", () => {
      let message = "";

      try {
        parseFrontmatter({ title: "Only a title" }, FILENAME);
      } catch (error) {
        message = (error as Error).message;
      }

      expect(message).toMatch(/description/);
      expect(message).toMatch(/date/);
      expect(message).toMatch(/status/);
    });
  });
});
