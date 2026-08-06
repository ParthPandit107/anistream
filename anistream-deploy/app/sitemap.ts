import { MetadataRoute } from "next";
import { getTrendingAnime, getPopularAnime } from "@/lib/api/merged";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ];

  try {
    const [trending, popular] = await Promise.all([
      getTrendingAnime().catch(() => []),
      getPopularAnime().catch(() => []),
    ]);

    const combined = [...trending, ...popular];
    const uniqueIds = Array.from(new Set(combined.map((a) => a.id)));

    const animeRoutes = uniqueIds.map((id) => ({
      url: `${baseUrl}/anime/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...animeRoutes];
  } catch (e) {
    return staticRoutes;
  }
}
