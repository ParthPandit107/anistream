"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SeasonRelation } from "@/lib/types";
import { Layers } from "lucide-react";
import { useWatchContext } from "@/context/WatchContext";

interface SeasonSelectorProps {
  currentAnimeId: number;
  seasons?: SeasonRelation[];
}

export default function SeasonSelector({ currentAnimeId, seasons }: SeasonSelectorProps) {
  const router = useRouter();
  const { scrollToTop } = useWatchContext();

  if (!seasons || seasons.length === 0) return null;

  const handleSelectSeason = (idStr: string) => {
    if (!idStr) return;
    scrollToTop();
    router.push(`/anime/${idStr}`);
  };

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-white" />
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
            Seasons & Related Series ({seasons.length})
          </h3>
        </div>

        {/* Season Dropdown Menu */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-neutral-400 uppercase text-[11px]">Select Season:</span>
          <select
            onChange={(e) => handleSelectSeason(e.target.value)}
            defaultValue=""
            className="border border-border bg-surface px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none font-mono"
          >
            <option value="" disabled>
              Select Released Season...
            </option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                [{season.relationType}] {season.title} ({season.format || "TV"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Related Season Badges */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        {seasons.map((season) => (
          <Link
            key={season.id}
            href={`/anime/${season.id}`}
            onClick={scrollToTop}
            className={`border px-3.5 py-2 font-mono text-xs transition-all ${
              season.id === currentAnimeId
                ? "border-white bg-white text-black font-bold"
                : "border-border bg-surface text-neutral-300 hover:border-white hover:text-white"
            }`}
          >
            <span className="font-bold uppercase text-[10px] text-neutral-400 mr-1.5">
              {season.relationType}:
            </span>
            {season.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
