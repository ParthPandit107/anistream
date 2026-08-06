import React from "react";

export function CardSkeleton() {
  return (
    <div className="flex flex-col border border-border bg-surface animate-pulse">
      <div className="aspect-[2/3] w-full bg-neutral-900" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 bg-neutral-800" />
        <div className="h-2.5 w-1/2 bg-neutral-900" />
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="w-full min-h-[400px] bg-neutral-950 border-b border-border animate-pulse flex items-center">
      <div className="mx-auto max-w-7xl px-4 w-full space-y-4">
        <div className="h-6 w-32 bg-neutral-800" />
        <div className="h-12 w-2/3 bg-neutral-800" />
        <div className="h-4 w-1/2 bg-neutral-900" />
        <div className="h-20 w-full max-w-xl bg-neutral-900" />
        <div className="flex gap-4 pt-4">
          <div className="h-10 w-32 bg-neutral-800" />
          <div className="h-10 w-32 bg-neutral-900" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
