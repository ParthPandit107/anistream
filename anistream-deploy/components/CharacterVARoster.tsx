"use client";

import React from "react";
import Image from "next/image";
import { CharacterVA } from "@/lib/types";
import { User, Mic } from "lucide-react";

interface CharacterVARosterProps {
  characters?: CharacterVA[];
}

export default function CharacterVARoster({ characters }: CharacterVARosterProps) {
  if (!characters || characters.length === 0) {
    return (
      <div className="border border-border bg-surface p-4 text-center text-xs text-neutral-500 font-mono">
        No voice cast information available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider border-l-2 border-white pl-3">
        Voice Cast & Characters
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {characters.map((char) => (
          <div
            key={char.id}
            className="flex items-center justify-between border border-border bg-surface p-2.5 transition-colors hover:border-neutral-700"
          >
            {/* Character */}
            <div className="flex items-center gap-2.5 max-w-[50%]">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden bg-neutral-900 border border-neutral-800">
                {char.image ? (
                  <Image
                    src={char.image}
                    alt={char.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <User className="h-full w-full p-2 text-neutral-600" />
                )}
              </div>
              <div className="truncate">
                <div className="font-sans text-xs font-semibold text-white truncate">
                  {char.name}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 uppercase">
                  {char.role}
                </div>
              </div>
            </div>

            <div className="text-neutral-700 text-xs px-1">
              <Mic className="h-3.5 w-3.5" />
            </div>

            {/* Voice Actor */}
            <div className="flex items-center gap-2.5 max-w-[50%] justify-end text-right">
              <div className="truncate">
                <div className="font-sans text-xs font-medium text-neutral-300 truncate">
                  {char.voiceActor?.name || "Unassigned"}
                </div>
                <div className="font-mono text-[10px] text-neutral-500">
                  {char.voiceActor?.language || "Japanese"}
                </div>
              </div>
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden bg-neutral-900 border border-neutral-800">
                {char.voiceActor?.image ? (
                  <Image
                    src={char.voiceActor.image}
                    alt={char.voiceActor.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <User className="h-full w-full p-2 text-neutral-600" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
