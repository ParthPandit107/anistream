"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Flame, Sparkles, Tv, Bookmark, Shuffle } from "lucide-react";
import { useWatchContext } from "@/context/WatchContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollToTop } = useWatchContext();
  const [quickQuery, setQuickQuery] = useState("");

  const navItems = [
    { name: "Discover", href: "/", icon: Flame },
    { name: "Search", href: "/search", icon: Search },
    { name: "Trending", href: "/search?sort=trending", icon: Sparkles },
    { name: "Top Rated", href: "/search?sort=score", icon: Tv },
    { name: "My List", href: "/mylist", icon: Bookmark },
  ];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(quickQuery.trim())}`);
    setQuickQuery("");
    scrollToTop();
  };

  const handleRandom = async () => {
    try {
      const res = await fetch("/api/anime/trending");
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const randomItem = data.data[Math.floor(Math.random() * data.data.length)];
        router.push(`/anime/${randomItem.id}`);
        scrollToTop();
      }
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={scrollToTop}
          className="flex items-center gap-3 text-white transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center bg-white text-black font-display font-black text-2xl tracking-tighter">
            A
          </div>
          <span className="font-display text-2xl font-bold tracking-wider text-white uppercase">
            ANISTREAM
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={scrollToTop}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium transition-all border-b-2 uppercase tracking-wide ${
                  isActive
                    ? "border-white text-white bg-surface-hover"
                    : "border-transparent text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleQuickSearch} className="relative hidden sm:block w-56 xl:w-72">
            <input
              type="text"
              placeholder="Search anime..."
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="w-full border border-border bg-surface px-4 py-2 pl-9 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none transition-colors font-mono"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          </form>

          <button
            onClick={handleRandom}
            title="Random Anime"
            className="flex h-10 w-10 items-center justify-center border border-border bg-surface text-neutral-300 hover:border-white hover:text-white transition-colors"
          >
            <Shuffle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
