"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Anime } from "@/lib/types";
import { getDisplayTitle, truncateText, formatRating } from "@/lib/utils";
import { useWatchContext } from "@/context/WatchContext";

interface HeroCarouselProps {
  items: Anime[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { scrollToTop } = useWatchContext();

  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  const title = getDisplayTitle(current.title);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-black border-b border-border min-h-[420px] sm:min-h-[500px] md:min-h-[580px] flex items-center">
      {/* Background Banner Image in Original Full Colors with Dark Gradient Vignette */}
      <div className="absolute inset-0 z-0 opacity-50 filter transition-all duration-1000">
        {current.bannerImage || current.coverImage.extraLarge ? (
          <Image
            src={current.bannerImage || current.coverImage.extraLarge || ""}
            alt={title}
            fill
            priority
            className="object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-4">
          {/* Format & Rating Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="border border-white bg-white px-2 py-0.5 font-mono font-bold text-black uppercase tracking-wider">
              {current.format || "TV"}
            </span>
            {current.rating && (
              <span className="flex items-center gap-1 border border-neutral-700 bg-surface px-2.5 py-0.5 text-white">
                <Star className="h-3 w-3 fill-white" />
                {formatRating(current.rating)}
              </span>
            )}
            {current.episodes && (
              <span className="border border-neutral-800 bg-surface/80 px-2.5 py-0.5 text-neutral-300">
                {current.episodes} EP
              </span>
            )}
            {current.status && (
              <span className="border border-neutral-800 bg-surface/80 px-2.5 py-0.5 text-neutral-400">
                {current.status}
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl line-clamp-2 leading-none uppercase">
            {title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
            {current.genres.slice(0, 4).map((g) => (
              <span key={g} className="border-b border-neutral-800 pb-0.5 uppercase tracking-wide">
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-neutral-300 line-clamp-3 leading-relaxed font-light">
            {truncateText(current.synopsis, 220)}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <Link
              href={`/watch/${current.id}/1`}
              onClick={scrollToTop}
              className="flex items-center gap-2 border border-white bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200 active:scale-95 uppercase tracking-wider"
            >
              <Play className="h-4 w-4 fill-black" />
              Watch Ep 1
            </Link>
            <Link
              href={`/anime/${current.id}`}
              onClick={scrollToTop}
              className="flex items-center gap-2 border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-white transition-all hover:border-neutral-500 hover:bg-surface-hover active:scale-95 uppercase tracking-wider"
            >
              <Info className="h-4 w-4" />
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Slide Controls */}
      <div className="absolute right-4 bottom-6 z-20 flex items-center gap-2">
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="flex h-9 w-9 items-center justify-center border border-border bg-black/80 text-white transition-colors hover:border-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-xs font-mono text-neutral-400 px-2">
          {currentIndex + 1} / {items.length}
        </div>
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="flex h-9 w-9 items-center justify-center border border-border bg-black/80 text-white transition-colors hover:border-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
