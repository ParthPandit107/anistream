"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Sparkles, Clock } from "lucide-react";
import { useWatchContext } from "@/context/WatchContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { scrollToTop } = useWatchContext();

  const navs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Trending", href: "/search?sort=trending", icon: Sparkles },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-black/95 backdrop-blur-md px-6 py-2">
      <div className="flex items-center justify-around">
        {navs.map((nav) => {
          const Icon = nav.icon;
          const isActive = pathname === nav.href;
          return (
            <Link
              key={nav.name}
              href={nav.href}
              onClick={() => scrollToTop()}
              className={`flex flex-col items-center gap-1 py-1 text-xs transition-colors ${
                isActive ? "text-white font-semibold" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{nav.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
