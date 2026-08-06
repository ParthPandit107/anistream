import { getTrendingAnime, getPopularAnime, getTopRatedAnime } from "@/lib/api/merged";
import HeroCarousel from "@/components/HeroCarousel";
import AnimeRow from "@/components/AnimeRow";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";

export const revalidate = 1800;

export default async function HomePage() {
  const [trending, popular, topRated] = await Promise.all([
    getTrendingAnime().catch(() => []),
    getPopularAnime().catch(() => []),
    getTopRatedAnime().catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner Carousel */}
      <HeroCarousel items={trending.slice(0, 6)} />

      {/* Continue Watching Row */}
      <ContinueWatchingRow />

      {/* Content Rows */}
      <div className="space-y-4 py-6">
        <AnimeRow title="Trending Now" items={trending} />
        <AnimeRow title="Popular This Season" items={popular} />
        <AnimeRow title="Top Rated Anime" items={topRated} />
      </div>
    </div>
  );
}
