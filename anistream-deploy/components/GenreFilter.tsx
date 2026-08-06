"use client";

import React from "react";
import { Filter } from "lucide-react";

interface GenreFilterProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  selectedYear: string;
  onSelectYear: (year: string) => void;
  selectedFormat: string;
  onSelectFormat: (format: string) => void;
  onReset: () => void;
}

export const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
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

export const STATUSES = ["All", "RELEASING", "FINISHED", "NOT_YET_RELEASED"];
export const FORMATS = ["All", "TV", "MOVIE", "OVA", "ONA", "SPECIAL"];
export const YEARS = ["All", "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2015", "2010"];

export default function GenreFilter({
  selectedGenre,
  onSelectGenre,
  selectedStatus,
  onSelectStatus,
  selectedYear,
  onSelectYear,
  selectedFormat,
  onSelectFormat,
  onReset,
}: GenreFilterProps) {
  return (
    <div className="space-y-4 border border-border bg-surface p-4 text-xs font-sans">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 font-display font-semibold uppercase text-white tracking-wider">
          <Filter className="h-4 w-4" />
          Filter Catalog
        </div>
        <button
          onClick={onReset}
          className="text-neutral-400 hover:text-white underline font-mono text-[11px]"
        >
          Reset Filters
        </button>
      </div>

      {/* Dropdowns row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Status */}
        <div>
          <label className="block mb-1 font-mono text-neutral-400 text-[11px] uppercase">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="w-full border border-border bg-black p-2 text-white focus:border-white focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="block mb-1 font-mono text-neutral-400 text-[11px] uppercase">Format</label>
          <select
            value={selectedFormat}
            onChange={(e) => onSelectFormat(e.target.value)}
            className="w-full border border-border bg-black p-2 text-white focus:border-white focus:outline-none"
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block mb-1 font-mono text-neutral-400 text-[11px] uppercase">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(e.target.value)}
            className="w-full border border-border bg-black p-2 text-white focus:border-white focus:outline-none"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Genre Select Dropdown for mobile */}
        <div>
          <label className="block mb-1 font-mono text-neutral-400 text-[11px] uppercase">Genre</label>
          <select
            value={selectedGenre}
            onChange={(e) => onSelectGenre(e.target.value)}
            className="w-full border border-border bg-black p-2 text-white focus:border-white focus:outline-none"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Genre Pills (Desktop) */}
      <div className="pt-2">
        <label className="block mb-2 font-mono text-neutral-400 text-[11px] uppercase">Quick Genres</label>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => onSelectGenre(genre)}
                className={`px-2.5 py-1 text-xs border transition-all ${
                  isSelected
                    ? "border-white bg-white text-black font-semibold"
                    : "border-neutral-800 bg-surface-card text-neutral-400 hover:border-neutral-600 hover:text-white"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
