/**
 * Absolute site origin, used for canonical URLs, OpenGraph tags and the sitemap.
 *
 * Read from the environment rather than hardcoded because the production domain is
 * still temporary. Changing it is an env var change plus a rebuild — no code edits,
 * and nothing anywhere else in the app should embed the domain.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const siteName = "Craig Blunden";

export const siteDescription =
  "Full-stack engineer. Live resume, what I'm building, and notes on what I'm learning.";

/** Absolute URL for a site-relative path. */
export const absoluteUrl = (pathname: string) =>
  `${siteUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
