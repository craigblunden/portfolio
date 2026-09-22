import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * `script-src` allows 'unsafe-inline' deliberately. The alternative — per-request
 * nonces — requires middleware that runs on every response, which forces dynamic
 * rendering and would defeat the static generation the blog relies on
 * (`generateStaticParams` + `dynamicParams = false`). Next.js also emits its own
 * inline bootstrap and hydration scripts, so 'self' alone breaks the app.
 *
 * The inline script this site actually authors is the JSON-LD block, which is
 * serialised through `postJsonLdScript` and escapes "<" so no field can close the
 * tag early. Markdown is rendered without `allowDangerousHtml`, so post content
 * cannot introduce markup either.
 *
 * `style-src` needs 'unsafe-inline' for Tailwind's injected styles and
 * `rehype-pretty-code`'s inline token colours.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Cloudflare terminates TLS in front of this, but the origin should assert it
  // too so a direct hit on the Azure hostname is not downgradeable.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Redundant with frame-ancestors above, kept for pre-CSP3 user agents.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Drops the "X-Powered-By: Next.js" banner that advertises the stack.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
