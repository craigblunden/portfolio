/**
 * Reduces a caller-supplied `returnUrl` to a path on this site.
 *
 * The logout route takes `?returnUrl=` straight off a public query string and
 * feeds it to `new URL(value, request.url)`. Anything that resolves to a
 * different origin turns that route into an open redirect: a link that reads as
 * craigblunden.dev but lands the visitor on an attacker's page, which is a
 * ready-made phishing primitive.
 *
 * A "starts with /" test is not enough, because three different things all reach
 * another origin while passing it:
 *
 *   //evil.com      protocol-relative — inherits the current scheme
 *   /\evil.com      a backslash in the authority position is read as a slash
 *   /<TAB>/evil.com tab, newline and CR are *stripped* during URL parsing, so
 *                   this becomes //evil.com after the guard has already run
 *
 * All three are therefore neutralised before the leading-slash test, not after.
 * Anything that still looks suspicious falls back to "/" rather than being
 * repaired: the failure mode is a harmless bounce to the homepage, and guessing
 * at what a malformed value "meant" is how bypasses get reintroduced.
 *
 * The mirror of this logic lives in AuthController.GetSafeReturnUrl on the API
 * side. Keep the two in step — the open redirect this replaced existed because
 * only one of the two copies had been hardened.
 *
 * @returns a site-relative path beginning with "/", never an absolute URL.
 */
export function safeReturnPath(returnUrl: string | null | undefined): string {
  if (!returnUrl) {
    return "/";
  }

  const trimmed = returnUrl.trim();

  if (trimmed === "") {
    return "/";
  }

  // Mirror what a URL parser does to the string before judging it: drop the
  // characters it ignores, and treat "\" as the "/" it will be read as.
  const normalised = trimmed.replace(/[\t\n\r]/g, "").replace(/\\/g, "/");

  // Must be a path on this site...
  if (!normalised.startsWith("/")) {
    return "/";
  }

  // ...and not a protocol-relative URL pointing somewhere else.
  if (normalised.startsWith("//")) {
    return "/";
  }

  return trimmed;
}
