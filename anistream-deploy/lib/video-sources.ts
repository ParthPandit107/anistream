export interface EmbedProvider {
  id: string;
  name: string;
  supportsAudio: ("sub" | "dub")[];
  getMalUrl?: (malId: number | string, ep: number, audio: "sub" | "dub") => string;
  getUrl: (id: number | string, ep: number, audio: "sub" | "dub") => string;
}

export const EMBED_PROVIDERS: EmbedProvider[] = [
  {
    id: "megaplay",
    name: "1",
    supportsAudio: ["sub", "dub"],
    getMalUrl: (malId, ep, audio) =>
      `https://megaplay.buzz/stream/mal/${malId}/${ep}/${audio}`,
    getUrl: (id, ep, audio) =>
      `https://megaplay.buzz/stream/ani/${id}/${ep}/${audio}`,
  },
  {
    id: "vidnest_animepahe",
    name: "2",
    supportsAudio: ["sub", "dub"],
    getUrl: (id, ep, audio) =>
      `https://vidnest.fun/animepahe/${id}/${ep}/${encodeURIComponent(audio)}`,
  },
  {
    id: "vidnest_anime",
    name: "3",
    supportsAudio: ["sub", "dub"],
    getUrl: (id, ep, audio) =>
      `https://vidnest.fun/anime/${id}/${ep}/${encodeURIComponent(audio)}`,
  },
  {
    id: "tryembed",
    name: "4",
    supportsAudio: ["sub", "dub"],
    getUrl: (id, ep, audio) =>
      `https://tryembed.us.cc/embed/anime/${id}/${ep}/${audio}`,
  },
];

export interface VideoSourceProvider extends EmbedProvider {}
export const VIDEO_PROVIDERS = EMBED_PROVIDERS;

export function getNextServerId(currentId: string): string | null {
  const currentIndex = EMBED_PROVIDERS.findIndex((p) => p.id === currentId);
  if (currentIndex >= 0 && currentIndex < EMBED_PROVIDERS.length - 1) {
    return EMBED_PROVIDERS[currentIndex + 1].id;
  }
  return null;
}

export function resolveStreamUrl(
  providerId: string,
  animeId: number | string,
  malId?: number | string | null,
  episode: number = 1,
  audio: "sub" | "dub" = "sub"
): string | null {
  const provider = EMBED_PROVIDERS.find((p) => p.id === providerId) || EMBED_PROVIDERS[0];
  if (!provider) return null;

  if (malId && provider.getMalUrl) {
    return provider.getMalUrl(malId, episode, audio);
  }
  return provider.getUrl(animeId, episode, audio);
}
