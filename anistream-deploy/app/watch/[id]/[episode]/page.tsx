"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import ServerSelector from "@/components/ServerSelector";
import EpisodeList from "@/components/EpisodeList";
import CharacterVARoster from "@/components/CharacterVARoster";
import StaffCreatorsList from "@/components/StaffCreatorsList";
import SeasonSelector from "@/components/SeasonSelector";
import CommentsSection from "@/components/CommentsSection";
import { Anime, Episode } from "@/lib/types";
import { resolveStreamUrl, EMBED_PROVIDERS, getNextServerId } from "@/lib/video-sources";
import { getDisplayTitle, formatRating } from "@/lib/utils";
import { useWatchContext } from "@/context/WatchContext";
import { ChevronLeft, ChevronRight, ArrowLeft, Star } from "lucide-react";

export default function WatchPage() {
  const params = useParams();
  const animeId = parseInt(params.id as string, 10);
  const episodeNumber = parseInt(params.episode as string, 10) || 1;

  const {
    audioPreference,
    setAudioPreference,
    selectedServer,
    setSelectedServer,
    addToWatchHistory,
    saveContinueWatching,
    saveToMyList,
    getUserRating,
    scrollToTop,
  } = useWatchContext();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch(`/api/anime/${animeId}`).then((r) => r.json()),
      fetch(`/api/anime/${animeId}/episodes`).then((r) => r.json()),
    ])
      .then(([detailData, epData]) => {
        if (isMounted) {
          if (detailData.success && detailData.data) {
            const a = detailData.data;
            setAnime(a);
            addToWatchHistory({
              animeId: a.id,
              animeTitle: getDisplayTitle(a.title),
              coverImage: a.coverImage.large || "",
              episode: episodeNumber,
            });
            saveContinueWatching({
              animeId: a.id,
              animeTitle: getDisplayTitle(a.title),
              coverImage: a.coverImage.large || "",
              bannerImage: a.bannerImage || "",
              episode: episodeNumber,
              totalEpisodes: a.episodes || 24,
              progressPercent: Math.floor((episodeNumber / (a.episodes || 24)) * 100) || 50,
            });
          }
          if (epData.success && Array.isArray(epData.data)) {
            setEpisodes(epData.data);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [animeId, episodeNumber]);

  const handleFailover = () => {
    const nextServer = getNextServerId(selectedServer);
    if (nextServer) {
      setSelectedServer(nextServer);
    }
  };

  const handleRate = (stars: number) => {
    if (!anime) return;
    saveToMyList({
      animeId: anime.id,
      animeTitle: getDisplayTitle(anime.title),
      coverImage: anime.coverImage.large || "",
      format: anime.format,
      userRating: stars,
      status: "Watching",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="mx-auto max-w-7xl px-6 space-y-6">
          <div className="aspect-video w-full bg-neutral-900 animate-pulse border border-border" />
          <div className="h-10 w-full bg-neutral-900 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-black py-20 text-center text-white space-y-4">
        <h1 className="font-display text-xl font-bold uppercase">Anime Not Found</h1>
        <Link href="/" className="inline-block border border-white bg-white px-6 py-2 text-black font-bold uppercase text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const title = getDisplayTitle(anime.title);
  const totalEps = episodes.length;
  const currentRating = getUserRating(anime.id);

  const currentStreamUrl = resolveStreamUrl(
    selectedServer,
    anime.id,
    anime.malId,
    episodeNumber,
    audioPreference
  );

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/anime/${anime.id}`}
              onClick={scrollToTop}
              className="flex h-10 w-10 items-center justify-center border border-border bg-surface text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white line-clamp-1">
                {title}
              </h1>
              <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
                <span className="text-white font-bold">EP {episodeNumber}</span>
                <span>/ {totalEps} RELEASED</span>
              </div>
            </div>
          </div>

          {/* Episode Navigation & Rating Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 border border-border bg-surface px-3 py-1.5 font-mono text-xs">
              <span className="text-neutral-400 text-[10px] uppercase mr-1">Rate:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="p-0.5 text-neutral-600 hover:text-white"
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      star <= currentRating ? "fill-white text-white" : "text-neutral-700"
                    }`}
                  />
                </button>
              ))}
            </div>

            {episodeNumber > 1 ? (
              <Link
                href={`/watch/${anime.id}/${episodeNumber - 1}`}
                onClick={scrollToTop}
                className="flex items-center gap-1.5 border border-border bg-surface px-4 py-2 text-xs font-mono text-white hover:border-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                PREV
              </Link>
            ) : (
              <button disabled className="flex items-center gap-1.5 border border-neutral-900 bg-black px-4 py-2 text-xs font-mono text-neutral-700 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
                PREV
              </button>
            )}

            {episodeNumber < totalEps ? (
              <Link
                href={`/watch/${anime.id}/${episodeNumber + 1}`}
                onClick={scrollToTop}
                className="flex items-center gap-1.5 border border-white bg-white px-4 py-2 text-xs font-mono font-bold text-black hover:bg-neutral-200 transition-colors"
              >
                NEXT
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button disabled className="flex items-center gap-1.5 border border-neutral-900 bg-black px-4 py-2 text-xs font-mono text-neutral-700 cursor-not-allowed">
                NEXT
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Video Player Box */}
        <div className="space-y-4">
          <VideoPlayer
            videoUrl={currentStreamUrl}
            animeTitle={title}
            episodeNumber={episodeNumber}
            onFailover={handleFailover}
          />

          {/* Server Selector 1, 2, 3, 4 */}
          <ServerSelector
            selectedServerId={selectedServer}
            onSelectServer={setSelectedServer}
            audioPreference={audioPreference}
            onSelectAudio={setAudioPreference}
          />
        </div>

        {/* Seasons Selector */}
        <SeasonSelector currentAnimeId={anime.id} seasons={anime.seasons} />

        {/* Grid Layout: Episodes, Voice Cast & Staff, Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-4">
          <div className="lg:col-span-2 space-y-12">
            <EpisodeList animeId={anime.id} episodes={episodes} currentEpisode={episodeNumber} />
            <CharacterVARoster characters={anime.characters} />
            <StaffCreatorsList staff={anime.staff} studios={anime.studios} />
            <CommentsSection animeId={anime.id} episodeNumber={episodeNumber} />
          </div>

          {/* Sidebar Info */}
          <div className="border border-border bg-surface p-6 space-y-4 h-fit font-mono text-xs">
            <div className="border-b border-border pb-3">
              <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm">
                Anime Metadata
              </h4>
            </div>
            <p className="text-neutral-300 font-sans text-xs leading-relaxed line-clamp-6">
              {anime.synopsis}
            </p>
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between py-1 border-b border-neutral-900">
                <span className="text-neutral-500">Rating</span>
                <span className="text-white font-bold">{formatRating(anime.rating)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-900">
                <span className="text-neutral-500">Aired</span>
                <span className="text-white">{episodes.length} Episodes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-900">
                <span className="text-neutral-500">Status</span>
                <span className="text-white">{anime.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-900">
                <span className="text-neutral-500">Studio</span>
                <span className="text-white truncate max-w-[150px]">{anime.studios.join(", ") || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
