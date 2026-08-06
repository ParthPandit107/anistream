"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search by title (e.g., Attack on Titan, Jujutsu Kaisen)...",
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-none border border-border bg-surface px-4 py-3 pl-11 pr-10 text-sm text-white placeholder-neutral-500 focus:border-white focus:outline-none transition-colors font-sans"
      />
      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
      {value && (
        <button
          onClick={onClear}
          aria-label="Clear Search"
          className="absolute right-3 top-3.5 text-neutral-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
