import { describe, expect, it } from "vitest";

import { safeReturnPath } from "@/lib/safe-redirect";

/**
 * `safeReturnPath` is the only thing standing between a public query string and
 * `NextResponse.redirect`, so these cases are the specification, not examples.
 */
describe("safeReturnPath", () => {
  it.each([
    ["/", "/"],
    ["/goals", "/goals"],
    ["/blog/some-post", "/blog/some-post"],
    ["/goals?filter=open", "/goals?filter=open"],
    ["/blog#section", "/blog#section"],
  ])("keeps the site-relative path %s", (input, expected) => {
    expect(safeReturnPath(input)).toBe(expected);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty", ""],
    ["whitespace", "   "],
  ])("falls back to / when the value is %s", (_label, input) => {
    expect(safeReturnPath(input)).toBe("/");
  });

  it.each([
    ["absolute http", "http://evil.example.com"],
    ["absolute https", "https://evil.example.com"],
    ["scheme-relative", "//evil.example.com"],
    ["scheme-relative with path", "//evil.example.com/pwned"],
    ["backslash authority", "/\\evil.example.com"],
    ["mixed slash-backslash", "/\\/evil.example.com"],
    ["double backslash", "\\\\evil.example.com"],
    ["javascript scheme", "javascript:alert(1)"],
    ["data scheme", "data:text/html,<script>alert(1)</script>"],
    ["no leading slash", "evil.example.com"],
    // URL parsing strips these, so "/<TAB>/evil.com" becomes "//evil.com"
    // *after* a naive leading-slash check has already approved it.
    ["embedded tab", "/\t/evil.example.com"],
    ["embedded newline", "/\n/evil.example.com"],
    ["embedded carriage return", "/\r/evil.example.com"],
    ["tab before backslash", "/\t\\evil.example.com"],
  ])("rejects %s", (_label, input) => {
    expect(safeReturnPath(input)).toBe("/");
  });

  /**
   * The guarantee the logout route depends on: whatever comes back, resolving it
   * against this origin must stay on this origin.
   */
  it.each([
    "//evil.example.com",
    "/\\evil.example.com",
    "/\t/evil.example.com",
    "/\n/evil.example.com",
    "https://evil.example.com",
    "/goals",
  ])("never resolves off-origin for %s", (input) => {
    const resolved = new URL(
      safeReturnPath(input),
      "https://craigblunden.dev/x",
    );

    expect(resolved.origin).toBe("https://craigblunden.dev");
  });
});
