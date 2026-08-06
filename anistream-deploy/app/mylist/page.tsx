"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Trash2, Bookmark, Play } from "lucide-react";
import { useWatchContext } from "@/context/WatchContext";

export default function MyListPage() {
  const { myList, removeFromMyList, saveToMyList, scrollToTop } = useWatchContext();
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filteredList = myList.filter((item) => {
    if (filterStatus === "All") return true;
    return item.status === filterStatus;
  });

  const handleRatingChange = (item: any, newStars: number) => {
    saveToMyList({
      animeId: item.animeId,
      animeTitle: item.animeTitle,
      coverImage: item.coverImage,
      format: item.format,
      userRating: newStars,
      status: item.status,
    });
  };

  const handleStatusChange = (item: any, newStatus: any) => {
    saveToMyList({
      animeId: item.animeId,
      animeTitle: item.animeTitle,
      coverImage: item.coverImage,
      format: item.format,
      userRating: item.userRating,
      status: newStatus,
    });
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-wider text-white">
              My List & Ratings
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Your personal library of saved anime and 5-star ratings.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 border border-border bg-surface p-1">
            {["All", "Watching", "Completed", "Plan to Watch"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-mono uppercase transition-all ${
                  filterStatus === s
                    ? "bg-white text-black font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* List Grid */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item) => (
              <div
                key={item.animeId}
                className="group relative flex border border-border bg-surface hover:border-neutral-400 transition-all p-4 gap-4"
              >
                {/* Poster Thumbnail */}
                <Link
                  href={`/anime/${item.animeId}`}
                  onClick={scrollToTop}
                  className="relative aspect-[2/3] w-28 flex-shrink-0 overflow-hidden bg-neutral-900 border border-neutral-800"
                >
                  <Image
                    src={item.coverImage}
                    alt={item.animeTitle}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </Link>

                {/* Details & Interactive 5-Star Rating */}
                <div className="flex flex-1 flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <Link
                      href={`/anime/${item.animeId}`}
                      onClick={scrollToTop}
                      className="font-sans text-sm font-semibold text-white line-clamp-1 hover:underline"
                    >
                      {item.animeTitle}
                    </Link>

                    {/* Status Dropdown */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
                      className="border border-border bg-black px-2 py-1 text-[11px] font-mono text-neutral-300 focus:border-white focus:outline-none"
                    >
                      <option value="Watching">Watching</option>
                      <option value="Completed">Completed</option>
                      <option value="Plan to Watch">Plan to Watch</option>
                    </select>
                  </div>

                  {/* 5-Star Interactive Rating Control */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase block">
                      Your Rating ({item.userRating || 0}/5 Stars)
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(item, star)}
                          className="p-0.5 text-neutral-600 hover:text-white transition-colors"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              star <= item.userRating ? "fill-white text-white" : "text-neutral-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
                    <Link
                      href={`/watch/${item.animeId}/1`}
                      onClick={scrollToTop}
                      className="flex items-center gap-1.5 text-xs font-mono font-bold text-white hover:underline uppercase"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      Stream
                    </Link>

                    <button
                      onClick={() => removeFromMyList(item.animeId)}
                      className="text-neutral-500 hover:text-white p-1"
                      title="Remove from My List"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border bg-surface p-16 text-center text-xs text-neutral-500 font-mono space-y-4">
            <Bookmark className="h-8 w-8 text-neutral-600 mx-auto" />
            <p className="text-white text-sm font-semibold uppercase">No Anime Saved in My List</p>
            <p>Save your favorite anime from any detail page and rate them out of 5 stars.</p>
            <Link
              href="/search"
              onClick={scrollToTop}
              className="inline-block border border-white bg-white px-6 py-2.5 text-black font-bold uppercase text-xs"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
