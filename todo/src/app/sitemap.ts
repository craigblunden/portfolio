import type { MetadataRoute } from "next";
import { loadRoutablePosts } from "@/features/blog/api/posts";
import { absoluteUrl } from "@/lib/site";

/**
 * Published posts only — loadRoutablePosts excludes drafts and planned placeholders
 * by definition, so neither can leak into the sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await loadRoutablePosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/resume"), changeFrequency: "monthly", priority: 0.8 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updated ?? post.date,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
