"use client";

import React from "react";
import { EMBED_PROVIDERS } from "@/lib/video-sources";

interface ServerSelectorProps {
  selectedServerId: string;
  onSelectServer: (id: string) => void;
  audioPreference: "sub" | "dub";
  onSelectAudio: (audio: "sub" | "dub") => void;
}

export default function ServerSelector({
  selectedServerId,
  onSelectServer,
  audioPreference,
  onSelectAudio,
}: ServerSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border bg-surface p-3 text-xs">
      {/* Server Tabs 1, 2, 3, 4 */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
        <span className="font-mono text-neutral-400 text-[11px] uppercase mr-1">Server:</span>

        {EMBED_PROVIDERS.map((provider) => {
          const isSelected = selectedServerId === provider.id;
          return (
            <button
              key={provider.id}
              onClick={() => onSelectServer(provider.id)}
              className={`h-8 w-8 border transition-all flex items-center justify-center font-mono text-xs font-bold ${
                isSelected
                  ? "border-white bg-white text-black font-bold"
                  : "border-border bg-black text-neutral-400 hover:border-neutral-500 hover:text-white"
              }`}
            >
              {provider.name}
            </button>
          );
        })}
      </div>

      {/* Sub / Dub Toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-mono text-neutral-400 text-[11px] uppercase mr-1">Audio:</span>

        <div className="inline-flex border border-border bg-black p-0.5">
          <button
            onClick={() => onSelectAudio("sub")}
            className={`px-3 py-1 font-mono text-xs uppercase transition-all ${
              audioPreference === "sub"
                ? "bg-white text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            SUB
          </button>
          <button
            onClick={() => onSelectAudio("dub")}
            className={`px-3 py-1 font-mono text-xs uppercase transition-all ${
              audioPreference === "dub"
                ? "bg-white text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            DUB
          </button>
        </div>
      </div>
    </div>
  );
}
