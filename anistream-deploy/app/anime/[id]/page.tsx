import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAnimeById, getAnimeEpisodes } from "@/lib/api/merged";
import { getDisplayTitle, formatRating, truncateText } from "@/lib/utils";
import EpisodeList from "@/components/EpisodeList";
import CharacterVARoster from "@/components/CharacterVARoster";
import StaffCreatorsList from "@/components/StaffCreatorsList";
import SeasonSelector from "@/components/SeasonSelector";
import CommentsSection from "@/components/CommentsSection";
import { Star, Play } from "lucide-react";

export const revalidate = 3600;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const anime = await getAnimeById(params.id);
  if (!anime) return { title: "Anime Not Found — AniStream" };

  const title = getDisplayTitle(anime.title);
  const description = truncateText(anime.synopsis, 150);
  const image = anime.coverImage.extraLarge || anime.coverImage.large;

  return {
    title: `${title} — AniStream`,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
    },
  };
}

export default async function AnimeDetailPage({ params }: Props) {
  const anime = await getAnimeById(params.id);
  if (!anime) notFound();

  const episodes = await getAnimeEpisodes(anime);
  const title = getDisplayTitle(anime.title);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": anime.format === "MOVIE" ? "Movie" : "TVSeries",
    name: title,
    alternateName: anime.title.native || anime.title.romaji,
    description: anime.synopsis,
    image: anime.coverImage.extraLarge || anime.coverImage.large,
    genre: anime.genres,
    numberOfEpisodes: episodes.length,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Banner Header with Spacious Layout */}
      <div className="relative min-h-[400px] md:min-h-[480px] w-full bg-neutral-950 overflow-hidden border-b border-border">
        {anime.bannerImage || anime.coverImage.extraLarge ? (
          <div className="absolute inset-0 opacity-40">
            <Image
              src={anime.bannerImage || anime.coverImage.extraLarge || ""}
              alt={title}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>
        ) : null}

        {/* Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 sm:px-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
            {/* Poster Image */}
            <div className="relative aspect-[2/3] w-52 sm:w-60 flex-shrink-0 border-2 border-border bg-neutral-900 shadow-2xl overflow-hidden mx-auto md:mx-0">
              {anime.coverImage.large ? (
                <Image
                  src={anime.coverImage.extraLarge || anime.coverImage.large}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-xs text-neutral-600">
                  NO COVER
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="border border-white bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
                  {anime.format || "TV"}
                </span>
                {anime.rating && (
                  <span className="flex items-center gap-1 border border-neutral-700 bg-surface px-3 py-0.5 text-xs text-white">
                    <Star className="h-3.5 w-3.5 fill-white" />
                    {formatRating(anime.rating)}
                  </span>
                )}
                <span className="border border-neutral-800 bg-surface px-3 py-0.5 text-xs text-neutral-400 font-mono">
                  {anime.status}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                {title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2.5">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="border border-neutral-800 bg-surface-card px-3 py-1 text-xs text-neutral-300 uppercase tracking-wide font-mono"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans max-w-3xl pt-2">
                {anime.synopsis}
              </p>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  href={`/watch/${anime.id}/1`}
                  className="inline-flex items-center gap-2 border border-white bg-white px-8 py-3.5 text-sm font-bold text-black uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                >
                  <Play className="h-4 w-4 fill-black" />
                  Stream Ep 1
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="border-b border-border bg-surface py-6">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 text-xs font-mono">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Year</span>
              <span className="text-white font-semibold">{anime.year || "N/A"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Aired Episodes</span>
              <span className="text-white font-semibold">{episodes.length} EPS OUT</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Studio</span>
              <span className="text-white font-semibold truncate block">{anime.studios.join(", ") || "N/A"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Score</span>
              <span className="text-white font-semibold">{formatRating(anime.rating)}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Status</span>
              <span className="text-white font-semibold">{anime.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-16">
        {/* Season Selector */}
        <SeasonSelector currentAnimeId={anime.id} seasons={anime.seasons} />

        {/* Released Episodes Selector Grid */}
        <section>
          <EpisodeList animeId={anime.id} episodes={episodes} />
        </section>

        {/* Voice Actors & Character Roster */}
        <section>
          <CharacterVARoster characters={anime.characters} />
        </section>

        {/* Creators & Staff */}
        <section>
          <StaffCreatorsList staff={anime.staff} studios={anime.studios} />
        </section>

        {/* Comments Section */}
        <section>
          <CommentsSection animeId={anime.id} />
        </section>
      </div>
    </div>
  );
}
