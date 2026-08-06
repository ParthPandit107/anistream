"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Anime } from "@/lib/types";
import AnimeCard from "./AnimeCard";
import { CardSkeleton } from "./Skeleton";

interface AnimeRowProps {
  title: string;
  items: Anime[];
  loading?: boolean;
}

export default function AnimeRow({ title, items, loading = false }: AnimeRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const distance = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-6 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-white border-l-2 border-white pl-3">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll("left")}
              aria-label="Scroll Left"
              className="flex h-8 w-8 items-center justify-center border border-border bg-surface text-white transition-colors hover:border-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              aria-label="Scroll Right"
              className="flex h-8 w-8 items-center justify-center border border-border bg-surface text-white transition-colors hover:border-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none py-1 scroll-smooth"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="w-[160px] sm:w-[200px] flex-shrink-0">
                  <CardSkeleton />
                </div>
              ))
            : items.map((anime) => (
                <div key={anime.id} className="w-[160px] sm:w-[200px] flex-shrink-0">
                  <AnimeCard anime={anime} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
