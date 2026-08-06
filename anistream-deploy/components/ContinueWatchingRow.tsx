"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Trash2 } from "lucide-react";
import { useWatchContext } from "@/context/WatchContext";

export default function ContinueWatchingRow() {
  const { continueWatching, removeFromContinueWatching, scrollToTop } = useWatchContext();

  if (!continueWatching || continueWatching.length === 0) return null;

  return (
    <section className="py-8 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white border-l-2 border-white pl-4">
            Continue Watching ({continueWatching.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {continueWatching.map((item) => {
            const progressVal = item.progressPercent || 50;

            return (
              <div
                key={`${item.animeId}-${item.episode}`}
                className="group relative flex border border-border bg-surface hover:border-neutral-400 transition-all p-3 gap-3 overflow-hidden"
              >
                {/* Cover Poster */}
                <Link
                  href={`/watch/${item.animeId}/${item.episode}`}
                  onClick={scrollToTop}
                  className="relative aspect-[2/3] w-24 flex-shrink-0 overflow-hidden bg-neutral-900 border border-neutral-800"
                >
                  <Image
                    src={item.coverImage}
                    alt={item.animeTitle}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex flex-1 min-w-0 flex-col justify-between py-0.5">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
                      <span className="text-white font-bold">EP {item.episode}</span>
                      <span>/ {item.totalEpisodes || "?"}</span>
                    </div>

                    <Link
                      href={`/watch/${item.animeId}/${item.episode}`}
                      onClick={scrollToTop}
                      className="font-sans text-xs font-semibold text-white truncate block hover:underline"
                      title={item.animeTitle}
                    >
                      {item.animeTitle}
                    </Link>
                  </div>

                  {/* Clean Static Progress Line */}
                  <div className="space-y-2 pt-2 min-w-0">
                    <div className="relative h-1.5 w-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-white"
                        style={{ width: `${progressVal}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] min-w-0 gap-2">
                      <Link
                        href={`/watch/${item.animeId}/${item.episode}`}
                        onClick={scrollToTop}
                        className="font-bold text-white uppercase hover:underline truncate"
                      >
                        Resume Ep {item.episode}
                      </Link>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromContinueWatching(item.animeId);
                        }}
                        className="flex-shrink-0 flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white uppercase font-mono border border-neutral-800 bg-black px-2 py-0.5"
                        title="Remove from Continue Watching"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
