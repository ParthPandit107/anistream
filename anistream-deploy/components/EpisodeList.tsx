"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { Episode } from "@/lib/types";
import { useWatchContext } from "@/context/WatchContext";

interface EpisodeListProps {
  animeId: number;
  episodes: Episode[];
  currentEpisode?: number;
}

export default function EpisodeList({ animeId, episodes, currentEpisode }: EpisodeListProps) {
  const [searchEp, setSearchEp] = useState("");
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const { watchHistory, scrollToTop } = useWatchContext();

  const chunkSize = 100;
  const totalEps = episodes.length;
  const numRanges = Math.ceil(totalEps / chunkSize) || 1;

  React.useEffect(() => {
    if (currentEpisode && currentEpisode > 0) {
      const targetChunk = Math.floor((currentEpisode - 1) / chunkSize);
      if (targetChunk < numRanges) {
        setSelectedRangeIndex(targetChunk);
      }
    }
  }, [currentEpisode, numRanges]);

  const isWatched = (epNum: number) => {
    return watchHistory.some((h) => h.animeId === animeId && h.episode === epNum);
  };

  const startEp = selectedRangeIndex * chunkSize + 1;
  const endEp = Math.min((selectedRangeIndex + 1) * chunkSize, totalEps);

  const displayedEpisodes = episodes.slice(
    selectedRangeIndex * chunkSize,
    (selectedRangeIndex + 1) * chunkSize
  );

  const filteredEpisodes = displayedEpisodes.filter((ep) => {
    if (!searchEp) return true;
    return ep.number.toString() === searchEp.trim();
  });

  const getEpisodeColorClass = (ep: Episode, active: boolean, watched: boolean) => {
    if (active) return "border-white bg-white text-black font-bold shadow-lg scale-105";
    if (watched) return "border-emerald-500 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400";

    const cat = ep.category || "normal";
    if (cat === "filler") return "border-red-600 bg-red-950/40 text-red-300 hover:border-red-400";
    if (cat === "mixed" || cat === "anime_canon") return "border-blue-500 bg-blue-950/40 text-blue-300 hover:border-blue-400";

    // Manga Canon = Default
    return "border-border bg-surface text-neutral-300 hover:border-neutral-400";
  };

  return (
    <div className="space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">
            Episodes ({totalEps})
          </h3>
          {numRanges > 1 && (
            <span className="font-mono text-xs text-neutral-400 border border-border px-2 py-0.5">
              Showing {startEp} - {endEp}
            </span>
          )}
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full inline-block" />
            Watched
          </span>
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="h-2.5 w-2.5 bg-neutral-600 rounded-full inline-block" />
            Manga Canon (Default)
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="h-2.5 w-2.5 bg-blue-500 rounded-full inline-block" />
            Mixed Canon/Filler
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="h-2.5 w-2.5 bg-red-600 rounded-full inline-block" />
            Filler
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Ep #"
            value={searchEp}
            onChange={(e) => setSearchEp(e.target.value)}
            className="w-24 border border-border bg-surface px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Pagination Chunks */}
      {numRanges > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 font-mono text-xs">
          <button
            onClick={() => setSelectedRangeIndex((prev) => Math.max(0, prev - 1))}
            disabled={selectedRangeIndex === 0}
            className="flex items-center gap-1 border border-border bg-surface px-2.5 py-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev 100
          </button>

          {Array.from({ length: numRanges }).map((_, idx) => {
            const rangeStart = idx * chunkSize + 1;
            const rangeEnd = Math.min((idx + 1) * chunkSize, totalEps);
            const isSelected = selectedRangeIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => setSelectedRangeIndex(idx)}
                className={`px-3 py-1.5 border transition-all flex-shrink-0 ${
                  isSelected
                    ? "border-white bg-white text-black font-bold"
                    : "border-border bg-black text-neutral-400 hover:border-neutral-500 hover:text-white"
                }`}
              >
                {rangeStart} - {rangeEnd}
              </button>
            );
          })}

          <button
            onClick={() => setSelectedRangeIndex((prev) => Math.min(numRanges - 1, prev + 1))}
            disabled={selectedRangeIndex === numRanges - 1}
            className="flex items-center gap-1 border border-border bg-surface px-2.5 py-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next 100
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Grid with Color Coded Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
        {filteredEpisodes.map((ep) => {
          const active = currentEpisode === ep.number;
          const watched = isWatched(ep.number);
          const colorClass = getEpisodeColorClass(ep, active, watched);

          return (
            <Link
              key={ep.number}
              href={`/watch/${animeId}/${ep.number}`}
              onClick={scrollToTop}
              className={`group relative flex flex-col items-center justify-center p-3 border text-center transition-all ${colorClass}`}
            >
              <div className="flex items-center gap-1 font-mono text-xs">
                {active ? <Play className="h-3 w-3 fill-black" /> : null}
                <span>EP {ep.number}</span>
              </div>

              {watched && !active && (
                <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
