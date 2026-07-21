import type { MetadataRoute } from "next";
import { loadRoutablePosts } from "@/features/blog/api/posts";
import { absoluteUrl } from "@/lib/site";

/**
 * Published posts only. loadRoutablePosts is called with includeDrafts: false
 * explicitly rather than relying on NODE_ENV, so a draft can never leak into the
 * sitemap even if this is generated outside a production build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await loadRoutablePosts({ includeDrafts: false });

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
