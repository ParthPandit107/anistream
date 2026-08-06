import { Anime, CharacterVA, StaffCreator } from "../types";
import { fetchWithRetry } from "../cache";

const JIKAN_BASE_URL = process.env.JIKAN_API_URL || "https://api.jikan.moe/v4";

export function normalizeJikanAnime(item: any): Anime {
  return {
    id: item.mal_id,
    malId: item.mal_id,
    aniListId: undefined,
    title: {
      romaji: item.title_japanese || item.title || "",
      english: item.title_english || null,
      native: item.title_japanese || null,
      userPreferred: item.title || item.title_english || "Untitled Anime",
    },
    coverImage: {
      extraLarge: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url,
      large: item.images?.webp?.image_url || item.images?.jpg?.image_url,
      medium: item.images?.webp?.small_image_url || item.images?.jpg?.small_image_url,
    },
    bannerImage: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url,
    synopsis: item.synopsis || "No synopsis available.",
    genres: item.genres?.map((g: any) => g.name) || [],
    episodes: item.episodes || null,
    duration: item.duration ? parseInt(item.duration, 10) || 24 : 24,
    rating: item.score || null,
    status: item.status === "Currently Airing" ? "RELEASING" : item.status === "Finished Airing" ? "FINISHED" : "UNKNOWN",
    year: item.year || (item.aired?.prop?.from?.year) || null,
    season: item.season ? item.season.toUpperCase() : null,
    studios: item.studios?.map((s: any) => s.name) || [],
    format: item.type ? item.type.toUpperCase() : "TV",
    trailer: item.trailer?.youtube_id ? { id: item.trailer.youtube_id, site: "youtube" } : null,
    characters: [],
    staff: [],
  };
}

export async function fetchJikan<T>(path: string): Promise<T> {
  return fetchWithRetry(async () => {
    const res = await fetch(`${JIKAN_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (res.status === 429) {
      throw new Error("Jikan Rate Limit Exceeded (429)");
    }
    if (!res.ok) {
      throw new Error(`Jikan HTTP Error: ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  }, 3, 1000);
}

export async function getJikanAnimeDetail(malId: number): Promise<Anime | null> {
  try {
    const item = await fetchJikan<any>(`/anime/${malId}/full`);
    if (!item) return null;
    const anime = normalizeJikanAnime(item);

    // Fetch characters & staff in parallel
    try {
      const charsData = await fetchJikan<any[]>(`/anime/${malId}/characters`);
      if (charsData && Array.isArray(charsData)) {
        anime.characters = charsData.slice(0, 12).map((c: any) => {
          const jpVa = c.voice_actors?.find((va: any) => va.language === "Japanese") || c.voice_actors?.[0];
          return {
            id: c.character.mal_id,
            name: c.character.name,
            image: c.character.images?.webp?.image_url || c.character.images?.jpg?.image_url,
            role: c.role ? c.role.toUpperCase() : "MAIN",
            voiceActor: jpVa ? {
              id: jpVa.person.mal_id,
              name: jpVa.person.name,
              image: jpVa.person.images?.jpg?.image_url,
              language: jpVa.language || "Japanese",
            } : null,
          } as CharacterVA;
        });
      }
    } catch (e) {
      console.warn(`Could not load Jikan characters for MAL ID ${malId}:`, e);
    }

    try {
      const staffData = await fetchJikan<any[]>(`/anime/${malId}/staff`);
      if (staffData && Array.isArray(staffData)) {
        anime.staff = staffData.slice(0, 12).map((s: any) => ({
          id: s.person.mal_id,
          name: s.person.name,
          role: Array.isArray(s.positions) ? s.positions.join(", ") : "Staff",
          image: s.person.images?.jpg?.image_url,
        } as StaffCreator));
      }
    } catch (e) {
      console.warn(`Could not load Jikan staff for MAL ID ${malId}:`, e);
    }

    return anime;
  } catch (err) {
    console.error(`Jikan fetch failed for MAL ID ${malId}:`, err);
    return null;
  }
}

export async function searchJikanAnime(query: string): Promise<Anime[]> {
  try {
    const list = await fetchJikan<any[]>(`/anime?q=${encodeURIComponent(query)}&sfw=true&limit=24`);
    return Array.isArray(list) ? list.map(normalizeJikanAnime) : [];
  } catch (err) {
    console.error("Jikan search error:", err);
    return [];
  }
}
