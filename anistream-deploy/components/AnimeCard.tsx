"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Film } from "lucide-react";
import { Anime } from "@/lib/types";
import { getDisplayTitle, formatRating } from "@/lib/utils";
import { useWatchContext } from "@/context/WatchContext";

interface AnimeCardProps {
  anime: Anime;
  priority?: boolean;
}

export default function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { scrollToTop } = useWatchContext();
  const title = getDisplayTitle(anime.title);
  const releasedCount = anime.releasedEpisodes || anime.episodes || 12;

  return (
    <div
      className="group relative flex flex-col border border-border bg-surface hover:border-neutral-400 transition-all p-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Blurred background color glow on hover */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70">
        <Image
          src={anime.coverImage.large || anime.coverImage.medium || ""}
          alt=""
          fill
          sizes="100px"
          className="object-cover scale-150"
        />
      </div>

      {/* Poster Image */}
      <Link
        href={`/anime/${anime.id}`}
        onClick={scrollToTop}
        className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900 border border-neutral-800"
      >
        <Image
          src={anime.coverImage.large || anime.coverImage.medium || ""}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 right-2 flex justify-between text-[10px] font-mono font-bold">
          <span className="bg-black/90 px-1.5 py-0.5 border border-neutral-700 text-white uppercase">
            {anime.format || "TV"}
          </span>
          <span className="bg-black/90 px-1.5 py-0.5 border border-neutral-700 text-white flex items-center gap-1">
            <Star className="h-2.5 w-2.5 fill-white text-white" />
            {formatRating(anime.rating)}
          </span>
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-2.5 font-sans text-xs flex-1 flex flex-col justify-between space-y-2">
        <Link
          href={`/anime/${anime.id}`}
          onClick={scrollToTop}
          className="font-semibold text-white truncate block hover:underline"
          title={title}
        >
          {title}
        </Link>
        <div className="flex justify-between text-[11px] text-neutral-400 font-mono pt-2 border-t border-neutral-900">
          <span>{anime.year || ""}</span>
          <span>{releasedCount} EPS OUT</span>
        </div>
      </div>

      {/* Hover Detail Popover Card */}
      {isHovered && (
        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 z-50 pointer-events-none hidden md:block">
          <div className="border border-neutral-700 bg-black/95 backdrop-blur-md p-4 space-y-2.5 shadow-2xl font-mono text-xs text-white border-l-2 border-l-white">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-bold text-white uppercase text-[11px] truncate max-w-[140px]">
                {title}
              </span>
              <span className="text-[10px] text-neutral-400">{anime.year} &bull; {anime.format}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-neutral-500 block uppercase">Episodes</span>
                <span className="text-white font-bold">{releasedCount} Released</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase">Studio</span>
                <span className="text-white truncate block">{anime.studios?.join(", ") || "N/A"}</span>
              </div>
            </div>

            <p className="text-[11px] font-sans text-neutral-300 line-clamp-3 leading-snug">
              {anime.synopsis || "No synopsis available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
