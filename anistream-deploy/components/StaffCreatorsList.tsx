"use client";

import React from "react";
import Image from "next/image";
import { StaffCreator } from "@/lib/types";
import { Clapperboard } from "lucide-react";

interface StaffCreatorsListProps {
  staff?: StaffCreator[];
  studios?: string[];
}

export default function StaffCreatorsList({ staff, studios }: StaffCreatorsListProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider border-l-2 border-white pl-3">
        Creators & Staff
      </h3>

      {studios && studios.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-surface border border-border p-3">
          <Clapperboard className="h-4 w-4 text-white" />
          <span className="uppercase text-neutral-500">Studio:</span>
          <span className="font-bold text-white uppercase">{studios.join(", ")}</span>
        </div>
      )}

      {staff && staff.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {staff.map((person) => (
            <div
              key={`${person.id}-${person.role}`}
              className="flex items-center gap-3 border border-border bg-surface p-2.5"
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden bg-neutral-900 border border-neutral-800">
                {person.image ? (
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-neutral-600">
                    N/A
                  </div>
                )}
              </div>
              <div className="truncate">
                <div className="font-sans text-xs font-semibold text-white truncate">
                  {person.name}
                </div>
                <div className="font-mono text-[10px] text-neutral-400 truncate">
                  {person.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border bg-surface p-4 text-center text-xs text-neutral-500 font-mono">
          No detailed staff roster available.
        </div>
      )}
    </div>
  );
}
