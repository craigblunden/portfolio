import { describe, expect, it } from "vitest";
import { getReadingTime } from "../readingTime";

const words = (count: number) => Array.from({ length: count }, () => "word").join(" ");

describe("getReadingTime", () => {
  it("reports a minimum of one minute for empty content", () => {
    expect(getReadingTime("")).toBe("1 min read");
  });

  it("reports one minute for content below the words-per-minute threshold", () => {
    expect(getReadingTime(words(50))).toBe("1 min read");
  });

  it("rounds up rather than down", () => {
    // 201 words at 200wpm is just over a minute, which reads as two.
    expect(getReadingTime(words(201))).toBe("2 min read");
  });

  it("scales with length", () => {
    expect(getReadingTime(words(1000))).toBe("5 min read");
  });

  // A long code block is scanned, not read word by word. Counting it inflates the
  // estimate badly on exactly the posts most likely to contain one.
  it("excludes fenced code blocks from the count", () => {
    const withCode = [
      words(100),
      "```ts",
      words(2000),
      "```",
      words(100),
    ].join("\n");

    expect(getReadingTime(withCode)).toBe("1 min read");
  });

  it("excludes code fences that declare no language", () => {
    const withCode = ["```", words(2000), "```"].join("\n");

    expect(getReadingTime(withCode)).toBe("1 min read");
  });

  it("counts prose either side of a code block", () => {
    const withCode = [words(300), "```ts", words(500), "```", words(300)].join("\n");

    expect(getReadingTime(withCode)).toBe("3 min read");
  });

  it("does not count markdown punctuation as words", () => {
    expect(getReadingTime("## A heading\n\n- item\n- item\n\n---")).toBe("1 min read");
  });
});
