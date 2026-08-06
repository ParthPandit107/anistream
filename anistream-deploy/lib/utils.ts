import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function truncateText(str: string | undefined | null, length: number = 160): string {
  if (!str) return "";
  // Strip simple HTML tags if present in AniList / Jikan synopses
  const cleanStr = str.replace(/<[^>]*>?/gm, "");
  if (cleanStr.length <= length) return cleanStr;
  return cleanStr.slice(0, length).trim() + "...";
}

export function getDisplayTitle(titleObj?: { romaji?: string; english?: string | null; userPreferred?: string }): string {
  if (!titleObj) return "Untitled Anime";
  return titleObj.english || titleObj.userPreferred || titleObj.romaji || "Untitled Anime";
}

export function formatRating(score?: number | null): string {
  if (score === undefined || score === null || score === 0) return "N/A";
  if (score > 10) return `${(score / 10).toFixed(1)} / 10`;
  return `${score.toFixed(1)} / 10`;
}
