"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import AnimeCard from "@/components/AnimeCard";
import { Anime } from "@/lib/types";
import { Search, Filter, Plus, ArrowUpDown, ShieldAlert } from "lucide-react";

const FORBIDDEN_KEYWORDS = [
  "loli",
  "lolicon",
  "lolis",
  "shota",
  "shotacon",
  "underage",
  "child",
  "kodomo",
  "lolita",
];

function isForbidden(q?: string) {
  if (!q) return false;
  const lower = q.toLowerCase();
  return FORBIDDEN_KEYWORDS.some((kw) => lower.includes(kw));
}

const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

const DECADE_RANGES = [
  { label: "All Release Years", value: "All" },
  { label: "2020s (2020 – 2026)", value: "2020s" },
  { label: "2010s (2010 – 2019)", value: "2010s" },
  { label: "2000s (2000 – 2009)", value: "2000s" },
  { label: "1990s (1990 – 1999)", value: "1990s" },
  { label: "1980s (1980 – 1989)", value: "1980s" },
  { label: "1970s (1970 – 1979)", value: "1970s" },
  { label: "1960s & Older (Before 1970)", value: "1960s" },
];

const STATUSES = ["All", "RELEASING", "FINISHED"];
const FORMAT_OPTIONS = [
  { label: "All Types (Shows & Movies)", value: "All" },
  { label: "Anime Shows (TV)", value: "TV" },
  { label: "Anime Movies", value: "MOVIE" },
  { label: "OVA & Specials", value: "OVA" },
];

const SORT_OPTIONS = [
  { label: "Popularity (Default)", value: "popularity" },
  { label: "Rating: High to Low", value: "rating_desc" },
  { label: "Rating: Low to High", value: "rating_asc" },
  { label: "Episodes: High to Low", value: "episodes_desc" },
  { label: "Episodes: Low to High", value: "episodes_asc" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [sortBy, setSortBy] = useState("popularity");

  const [results, setResults] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(24);
  const [loading, setLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const fetchResults = (pageNum = 1, append = false) => {
    if (isForbidden(query)) {
      setWarningMessage(
        "WARNING: Content violating safety policies (including loli/shota/underage content) is strictly prohibited and not tolerated on this platform."
      );
      setResults([]);
      return;
    }

    setWarningMessage(null);
    setLoading(true);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedGenre !== "All") params.set("genre", selectedGenre);
    if (selectedYear !== "All") params.set("year", selectedYear);
    if (selectedStatus !== "All") params.set("status", selectedStatus);
    if (selectedFormat !== "All") params.set("format", selectedFormat);
    params.set("page", pageNum.toString());

    fetch(`/api/anime/search?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.forbidden) {
          setWarningMessage(res.error);
          setResults([]);
        } else if (res.success && Array.isArray(res.data)) {
          const newItems = res.data;
          setResults((prev) => {
            const combined = append ? [...prev, ...newItems] : newItems;
            const seen = new Set<number>();
            return combined.filter((item: Anime) => {
              if (!item || !item.id || seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
          });
        } else {
          if (!append) setResults([]);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!append) setResults([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    setPage(1);
    setVisibleCount(24);
    setResults([]);
    fetchResults(1, false);
  }, [selectedGenre, selectedYear, selectedStatus, selectedFormat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setVisibleCount(24);
    setResults([]);
    fetchResults(1, false);
  };

  const handleShowMore = () => {
    const nextVisible = visibleCount + 18;
    setVisibleCount(nextVisible);

    if (nextVisible >= results.length - 6) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchResults(nextPage, true);
    }
  };

  const sortedResults = useMemo(() => {
    const list = [...results];
    if (sortBy === "rating_desc") {
      return list.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    }
    if (sortBy === "rating_asc") {
      return list.sort((a, b) => (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0));
    }
    if (sortBy === "episodes_desc") {
      return list.sort((a, b) => (b.releasedEpisodes || b.episodes || 0) - (a.releasedEpisodes || a.episodes || 0));
    }
    if (sortBy === "episodes_asc") {
      return list.sort((a, b) => (a.releasedEpisodes || a.episodes || 0) - (b.releasedEpisodes || b.episodes || 0));
    }
    return list;
  }, [results, sortBy]);

  const fullRowsLimit = Math.floor(sortedResults.length / 6) * 6;
  const targetCount = Math.min(visibleCount, fullRowsLimit);
  const visibleResults = sortedResults.slice(0, targetCount > 0 ? targetCount : sortedResults.length);

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-8">
        {/* Title */}
        <div className="border-b border-border pb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-white">
            Anime Catalog
          </h1>
          <span className="font-mono text-xs text-neutral-400">
            Showing {visibleResults.length} Unique Titles
          </span>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4 border border-border bg-surface p-6 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-bold uppercase pb-2 border-b border-border">
            <Filter className="h-4 w-4" />
            <span>Catalog Filters & Sorting</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-neutral-400 uppercase text-[10px] mb-1">
                Type (Shows / Movies)
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full border border-border bg-black p-2.5 text-xs text-white focus:border-white focus:outline-none"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 uppercase text-[10px] mb-1">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full border border-border bg-black p-2.5 text-xs text-white focus:border-white focus:outline-none"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g === "All" ? "All Genres" : g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 uppercase text-[10px] mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-border bg-black p-2.5 text-xs text-white focus:border-white focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Statuses" : s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 uppercase text-[10px] mb-1">
                Release Decade / Era
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full border border-border bg-black p-2.5 text-xs text-white focus:border-white focus:outline-none"
              >
                {DECADE_RANGES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-neutral-400 uppercase text-[10px] mb-1 flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-white bg-surface p-2.5 text-xs text-white font-bold focus:border-white focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime title..."
              className="w-full border border-border bg-surface pl-10 pr-4 py-3 text-xs text-white font-mono placeholder-neutral-500 focus:border-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="border border-white bg-white text-black font-bold px-8 text-xs font-mono uppercase hover:bg-neutral-200 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Warning Banner for Prohibited Queries */}
        {warningMessage && (
          <div className="border border-red-600 bg-red-950/60 p-6 flex items-start gap-4 text-red-200 font-mono text-xs">
            <ShieldAlert className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-red-400 uppercase tracking-wider text-sm">
                Safety & Policy Violation Warning
              </div>
              <p>{warningMessage}</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {loading && results.length === 0 ? (
          <div className="py-20 text-center font-mono text-xs text-neutral-400">
            Searching catalog...
          </div>
        ) : visibleResults.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-4">
              {visibleResults.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>

            {/* Show More Button */}
            <div className="flex justify-center pt-6 pb-10 border-t border-neutral-900">
              <button
                onClick={handleShowMore}
                disabled={loading}
                className="flex items-center gap-2 border border-white bg-white px-10 py-3.5 text-xs font-mono font-bold text-black uppercase hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {loading ? "Loading More Anime..." : "+ Show More Anime"}
              </button>
            </div>
          </div>
        ) : !warningMessage ? (
          <div className="border border-border bg-surface p-16 text-center text-xs font-mono text-neutral-500 uppercase">
            No anime found matching your criteria.
          </div>
        ) : null}
      </div>
    </div>
  );
}
