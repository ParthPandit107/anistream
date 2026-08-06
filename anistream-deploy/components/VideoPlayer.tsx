"use client";

import React, { useRef } from "react";

interface VideoPlayerProps {
  streamUrl: string;
  animeTitle: string;
  episode: number;
  onServerFailover?: () => void;
}

export default function VideoPlayer({
  streamUrl,
  animeTitle,
  episode,
  onServerFailover,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative aspect-video w-full bg-black border border-border">
      <iframe
        src={streamUrl}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        onError={onServerFailover}
      />
    </div>
  );
}
