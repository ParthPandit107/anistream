export interface Title {
  romaji: string;
  english?: string | null;
  native?: string | null;
  userPreferred: string;
}

export interface CoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
}

export interface CharacterVA {
  id: number | string;
  name: string;
  image?: string;
  role: string;
  voiceActor?: {
    id?: number | string;
    name: string;
    image?: string;
    language?: string;
  } | null;
}

export interface StaffCreator {
  id: number | string;
  name: string;
  role: string;
  image?: string;
}

export interface SeasonRelation {
  id: number;
  malId?: number | null;
  title: string;
  format: string;
  relationType: string;
  year?: number | null;
  coverImage?: string;
}

export interface Anime {
  id: number;
  malId?: number | null;
  aniListId?: number;
  title: Title;
  coverImage: CoverImage;
  bannerImage?: string | null;
  synopsis: string;
  genres: string[];
  episodes?: number | null;
  releasedEpisodes?: number | null;
  duration?: number | null;
  rating?: number | null;
  status: string;
  year?: number | null;
  season?: string | null;
  studios: string[];
  format?: string;
  trailer?: { id?: string; site?: string } | null;
  characters?: CharacterVA[];
  staff?: StaffCreator[];
  seasons?: SeasonRelation[];
}

export interface Episode {
  number: number;
  title?: string;
  thumbnail?: string;
  description?: string;
  airedDate?: string;
  category?: "canon" | "filler" | "mixed" | "normal"; // "filler" (RED), "canon" (ORANGE), "mixed" (YELLOW), "normal" (DEFAULT)
}

export interface CommentItem {
  id: string;
  animeId: number;
  episode?: number;
  username: string;
  comment: string;
  timestamp: number;
}

export interface MyListItem {
  animeId: number;
  animeTitle: string;
  coverImage: string;
  format?: string;
  userRating: number;
  status: "Watching" | "Completed" | "Plan to Watch";
  timestamp: number;
}

export interface ContinueWatchingItem {
  animeId: number;
  animeTitle: string;
  coverImage: string;
  bannerImage?: string;
  episode: number;
  totalEpisodes: number;
  progressPercent: number;
  timestamp: number;
}

export interface WatchHistoryItem {
  animeId: number;
  animeTitle: string;
  coverImage: string;
  episode: number;
  timestamp: number;
}
