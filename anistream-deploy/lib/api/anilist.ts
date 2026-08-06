import { Anime } from "../types";
import { apiCache } from "../cache";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const FORBIDDEN_KEYWORDS = [
  "loli",
  "lolicon",
  "lolis",
  "shota",
  "shotacon",
  "underage",
  "child",
  "kodomo",
  "lolita",
  "pico",
  "boku no pico",
  "shoujo ramune",
  "ramune",
  "chico",
  "cozo",
];

const BLACKLISTED_TITLES = [
  "boku no pico",
  "shoujo ramune",
  "pico to chico",
  "pico x chico x cozo",
  "kodomo no jikan",
  "aki-sora",
];

export function isForbiddenQuery(query?: string): boolean {
  if (!query) return false;
  const lower = query.toLowerCase();
  return FORBIDDEN_KEYWORDS.some((kw) => lower.includes(kw));
}

export function filterSafeMedia(mediaList: any[], allowAdult = false): any[] {
  return (mediaList || []).filter((item) => {
    if (!item) return false;

    // Explicitly reject adult/hentai content when allowAdult is false
    if (!allowAdult && item.isAdult) return false;

    const titleEng = (item.title?.english || "").toLowerCase();
    const titleRom = (item.title?.romaji || "").toLowerCase();
    const titleUser = (item.title?.userPreferred || "").toLowerCase();
    const titleNative = (item.title?.native || "").toLowerCase();
    const fullTitle = `${titleEng} ${titleRom} ${titleUser} ${titleNative}`;

    // Blacklist check for notorious loli/shota titles
    const isBlacklisted = BLACKLISTED_TITLES.some(
      (bt) => titleEng.includes(bt) || titleRom.includes(bt) || titleUser.includes(bt) || fullTitle.includes(bt)
    );
    if (isBlacklisted) return false;

    const description = (item.description || "").toLowerCase();
    const genres = (item.genres || []).map((g: string) => g.toLowerCase());
    const tags = (item.tags || []).map((t: any) => (t?.name || "").toLowerCase());

    // Check tags, titles, description and genres for loli / shota / underage indicators
    const containsForbidden = FORBIDDEN_KEYWORDS.some((kw) => {
      return (
        fullTitle.includes(kw) ||
        description.includes(kw) ||
        genres.includes(kw) ||
        tags.some((tagName: string) => tagName.includes(kw))
      );
    });

    return !containsForbidden;
  });
}

interface AniListMedia {
  id: number;
  idMal?: number;
  isAdult?: boolean;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  coverImage?: {
    extraLarge?: string;
    large?: string;
    medium?: string;
  };
  bannerImage?: string;
  description?: string;
  genres?: string[];
  tags?: Array<{ name: string }>;
  episodes?: number;
  nextAiringEpisode?: {
    episode: number;
  };
  averageScore?: number;
  status?: string;
  seasonYear?: number;
  season?: string;
  format?: string;
  studios?: {
    nodes: Array<{ name: string }>;
  };
  relations?: {
    edges: Array<{
      relationType: string;
      node: {
        id: number;
        idMal?: number;
        type: string;
        title: { romaji?: string; english?: string; userPreferred?: string };
        format?: string;
        seasonYear?: number;
      };
    }>;
  };
  characters?: {
    edges: Array<{
      role: string;
      node: {
        id: number;
        name: { full?: string; userPreferred?: string };
        image?: { large?: string; medium?: string };
      };
      voiceActors?: Array<{
        id: number;
        name: { full?: string; userPreferred?: string };
        image?: { large?: string; medium?: string };
        languageV2?: string;
      }>;
    }>;
  };
}

async function fetchAniListGraphQL(query: string, variables: Record<string, any> = {}) {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`AniList GraphQL error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(data.errors[0]?.message || "GraphQL error");
  }

  return data.data;
}

function normalizeAniListMedia(media: AniListMedia): Anime {
  const characters = (media.characters?.edges || []).map((edge) => ({
    id: edge.node.id,
    name: edge.node.name?.full || edge.node.name?.userPreferred || "Unknown",
    image: edge.node.image?.large || edge.node.image?.medium,
    role: edge.role || "MAIN",
    voiceActor: edge.voiceActors && edge.voiceActors.length > 0 ? {
      id: edge.voiceActors[0].id,
      name: edge.voiceActors[0].name?.full || edge.voiceActors[0].name?.userPreferred,
      image: edge.voiceActors[0].image?.large || edge.voiceActors[0].image?.medium,
      language: edge.voiceActors[0].languageV2 || "Japanese",
    } : null,
  }));

  const seasons = (media.relations?.edges || [])
    .filter((edge) => edge.node && edge.node.type === "ANIME")
    .map((edge) => ({
      id: edge.node.id,
      title: edge.node.title?.english || edge.node.title?.userPreferred || edge.node.title?.romaji || "Related Season",
      format: edge.node.format || "TV",
      relationType: edge.relationType || "PREQUEL",
      year: edge.node.seasonYear || "",
    }));

  let releasedEpisodes = media.episodes;
  if (media.nextAiringEpisode) {
    releasedEpisodes = media.nextAiringEpisode.episode - 1;
  } else if (!releasedEpisodes && media.status === "RELEASING") {
    releasedEpisodes = 12;
  }

  return {
    id: media.id,
    malId: media.idMal,
    title: {
      romaji: media.title?.romaji || "",
      english: media.title?.english || "",
      native: media.title?.native || "",
      userPreferred: media.title?.userPreferred || media.title?.english || media.title?.romaji || "Untitled",
    },
    coverImage: {
      extraLarge: media.coverImage?.extraLarge || "",
      large: media.coverImage?.large || media.coverImage?.medium || "",
      medium: media.coverImage?.medium || "",
    },
    bannerImage: media.bannerImage || media.coverImage?.extraLarge,
    synopsis: (media.description || "No description available.").replace(/<[^>]*>?/gm, ""),
    genres: media.genres || [],
    episodes: media.episodes || 24,
    releasedEpisodes: releasedEpisodes && releasedEpisodes > 0 ? releasedEpisodes : (media.episodes || 12),
    rating: media.averageScore ? (media.averageScore / 10).toFixed(1) : "N/A",
    status: media.status || "UNKNOWN",
    year: media.seasonYear || "N/A",
    season: media.season || "",
    studios: (media.studios?.nodes || []).map((s) => s.name),
    format: media.format || "TV",
    characters,
    seasons,
  };
}

const MEDIA_FIELDS = `
  id
  idMal
  isAdult
  title {
    romaji
    english
    native
    userPreferred
  }
  coverImage {
    extraLarge
    large
    medium
  }
  bannerImage
  description(asHtml: false)
  genres
  tags {
    name
  }
  episodes
  nextAiringEpisode {
    episode
  }
  averageScore
  status
  seasonYear
  season
  format
  studios(isMain: true) {
    nodes {
      name
    }
  }
`;

export async function getAniListTrending(page = 1, perPage = 18): Promise<Anime[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  const data = await fetchAniListGraphQL(query, { page, perPage });
  const safeList = filterSafeMedia(data.Page?.media || [], false);
  return safeList.map(normalizeAniListMedia);
}

export async function getAniListPopular(page = 1, perPage = 18): Promise<Anime[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  const data = await fetchAniListGraphQL(query, { page, perPage });
  const safeList = filterSafeMedia(data.Page?.media || [], false);
  return safeList.map(normalizeAniListMedia);
}

export async function searchAniList(
  search?: string,
  genre?: string,
  year?: string,
  status?: string,
  format?: string,
  page = 1,
  perPage = 30
): Promise<Anime[]> {
  if (isForbiddenQuery(search)) {
    throw new Error("PROHIBITED_QUERY");
  }

  const isAdultQuery = genre === "18+ Hentai / Hanime";

  const query = `
    query ($search: String, $genre: String, $seasonYear: Int, $status: MediaStatus, $format: MediaFormat, $isAdult: Boolean, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, search: $search, genre: $genre, seasonYear: $seasonYear, status: $status, format: $format, isAdult: $isAdult, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  const variables: Record<string, any> = { page, perPage };
  
  if (search && search.trim()) variables.search = search.trim();
  
  if (genre && genre !== "All") {
    if (isAdultQuery) {
      variables.isAdult = true;
    } else {
      variables.genre = genre;
      variables.isAdult = false;
    }
  } else {
    variables.isAdult = false;
  }

  if (year && year !== "All") variables.seasonYear = parseInt(year, 10);
  if (status && status !== "All") variables.status = status;
  if (format && format !== "All") variables.format = format;

  const data = await fetchAniListGraphQL(query, variables);
  const safeList = filterSafeMedia(data.Page?.media || [], isAdultQuery);
  return safeList.map(normalizeAniListMedia);
}

export async function getAniListDetail(id: number): Promise<Anime | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
        relations {
          edges {
            relationType
            node {
              id
              idMal
              type
              title { romaji english userPreferred }
              format
              seasonYear
            }
          }
        }
        characters(sort: [ROLE, RELEVANCE], perPage: 12) {
          edges {
            role
            node {
              id
              name { full userPreferred }
              image { large medium }
            }
            voiceActors(language: JAPANESE, sort: [RELEVANCE]) {
              id
              name { full userPreferred }
              image { large medium }
              languageV2
            }
          }
        }
      }
    }
  `;

  try {
    const data = await fetchAniListGraphQL(query, { id });
    if (!data.Media) return null;
    const isSafe = filterSafeMedia([data.Media], true).length > 0;
    if (!isSafe) return null;
    return normalizeAniListMedia(data.Media);
  } catch (e) {
    return null;
  }
}
