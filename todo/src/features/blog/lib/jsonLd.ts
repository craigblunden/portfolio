import type { PostMeta } from "@/features/blog/api/posts";
import { absoluteUrl, siteName, siteUrl } from "@/lib/site";

/**
 * schema.org BlogPosting for a single article. Emitted as a script tag so search
 * engines can attribute the piece and show a date in results.
 */
export function postJsonLd(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
    author: {
      "@type": "Person",
      name: siteName,
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: siteName,
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
  };
}
