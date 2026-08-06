"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Trash2, Play } from "lucide-react";
import { useWatchContext } from "@/context/WatchContext";

export default function MyListPage() {
  const { myList, removeFromMyList, updateRatingInMyList, scrollToTop } = useWatchContext();

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-8">
        <div className="border-b border-border pb-4 flex justify-between items-center">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-white">
            My List & Ratings
          </h1>
          <div className="text-xs font-mono text-neutral-400">
            {myList.length} Items Saved
          </div>
        </div>

        {myList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myList.map((item) => (
              <div
                key={item.animeId}
                className="border border-border bg-surface p-4 flex gap-4 hover:border-neutral-400 transition-all"
              >
                <Link
                  href={`/anime/${item.animeId}`}
                  onClick={scrollToTop}
                  className="relative aspect-[2/3] w-24 flex-shrink-0 bg-neutral-900 border border-neutral-800 overflow-hidden block"
                >
                  <Image
                    src={item.coverImage}
                    alt={item.animeTitle}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0">
                  <div>
                    <Link
                      href={`/anime/${item.animeId}`}
                      onClick={scrollToTop}
                      className="font-bold text-sm text-white hover:underline block truncate"
                      title={item.animeTitle}
                    >
                      {item.animeTitle}
                    </Link>
                    <span className="text-xs font-mono text-neutral-400">
                      {item.status || "Watching"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                      Rating ({item.userRating}/5 Stars)
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => updateRatingInMyList(item.animeId, star)}
                          className={`text-sm transition-colors ${
                            star <= item.userRating ? "text-white" : "text-neutral-700"
                          }`}
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-neutral-900 text-xs font-mono">
                    <Link
                      href={`/watch/${item.animeId}/1`}
                      onClick={scrollToTop}
                      className="flex items-center gap-1 text-white font-bold hover:underline uppercase"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      Stream
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromMyList(item.animeId);
                      }}
                      className="flex items-center gap-1 text-neutral-500 hover:text-white uppercase font-mono border border-neutral-800 bg-black px-2 py-1 text-[10px]"
                      title="Remove from My List"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border bg-surface p-16 text-center text-xs font-mono text-neutral-500 uppercase">
            No anime saved in My List.
          </div>
        )}
      </div>
    </div>
  );
}
