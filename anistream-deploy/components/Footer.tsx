"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-black py-6 text-neutral-500 text-xs font-sans mb-16 md:mb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center bg-white text-black font-display font-bold text-xs">
            A
          </div>
          <span className="font-display font-bold text-white tracking-widest uppercase">ANISTREAM</span>
        </div>

        <div className="flex gap-4 font-mono text-[11px]">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/search" className="hover:text-white transition-colors">
            Catalog
          </Link>
        </div>
      </div>
    </footer>
  );
}
