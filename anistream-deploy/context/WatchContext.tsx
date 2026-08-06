"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WatchHistoryItem, MyListItem, CommentItem, ContinueWatchingItem } from "@/lib/types";

interface WatchContextType {
  audioPreference: "sub" | "dub";
  setAudioPreference: (pref: "sub" | "dub") => void;
  selectedServer: string;
  setSelectedServer: (server: string) => void;
  watchHistory: WatchHistoryItem[];
  addToWatchHistory: (item: Omit<WatchHistoryItem, "timestamp">) => void;
  continueWatching: ContinueWatchingItem[];
  saveContinueWatching: (item: Omit<ContinueWatchingItem, "timestamp">) => void;
  removeFromContinueWatching: (animeId: number) => void;
  myList: MyListItem[];
  saveToMyList: (item: Omit<MyListItem, "timestamp">) => void;
  removeFromMyList: (animeId: number) => void;
  getUserRating: (animeId: number) => number;
  comments: Record<number, CommentItem[]>;
  addComment: (animeId: number, username: string, text: string, episode?: number) => void;
  scrollToTop: () => void;
}

const WatchContext = createContext<WatchContextType | undefined>(undefined);

export function WatchProvider({ children }: { children: React.ReactNode }) {
  const [audioPreference, setAudioPreferenceState] = useState<"sub" | "dub">("sub");
  const [selectedServer, setSelectedServerState] = useState<string>("megaplay");
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [myList, setMyList] = useState<MyListItem[]>([]);
  const [comments, setComments] = useState<Record<number, CommentItem[]>>({});

  useEffect(() => {
    try {
      const savedAudio = localStorage.getItem("anistream_audio_pref");
      if (savedAudio === "sub" || savedAudio === "dub") setAudioPreferenceState(savedAudio);

      const savedServer = localStorage.getItem("anistream_server_pref");
      if (savedServer) setSelectedServerState(savedServer);

      const savedHistory = localStorage.getItem("anistream_watch_history");
      if (savedHistory) setWatchHistory(JSON.parse(savedHistory));

      const savedContinue = localStorage.getItem("anistream_continue_watching");
      if (savedContinue) setContinueWatching(JSON.parse(savedContinue));

      const savedList = localStorage.getItem("anistream_my_list");
      if (savedList) setMyList(JSON.parse(savedList));

      const savedComments = localStorage.getItem("anistream_comments");
      if (savedComments) setComments(JSON.parse(savedComments));
    } catch (e) {
      console.warn("Unable to access localStorage:", e);
    }
  }, []);

  const setAudioPreference = (pref: "sub" | "dub") => {
    setAudioPreferenceState(pref);
    try { localStorage.setItem("anistream_audio_pref", pref); } catch (e) {}
  };

  const setSelectedServer = (server: string) => {
    setSelectedServerState(server);
    try { localStorage.setItem("anistream_server_pref", server); } catch (e) {}
  };

  const addToWatchHistory = (item: Omit<WatchHistoryItem, "timestamp">) => {
    const newItem: WatchHistoryItem = { ...item, timestamp: Date.now() };
    setWatchHistory((prev) => {
      const filtered = prev.filter((h) => !(h.animeId === item.animeId && h.episode === item.episode));
      const updated = [newItem, ...filtered].slice(0, 30);
      try { localStorage.setItem("anistream_watch_history", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const saveContinueWatching = (item: Omit<ContinueWatchingItem, "timestamp">) => {
    const newItem: ContinueWatchingItem = { ...item, timestamp: Date.now() };
    setContinueWatching((prev) => {
      const filtered = prev.filter((c) => c.animeId !== item.animeId);
      const updated = [newItem, ...filtered].slice(0, 20);
      try { localStorage.setItem("anistream_continue_watching", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const removeFromContinueWatching = (animeId: number) => {
    setContinueWatching((prev) => {
      const updated = prev.filter((c) => c.animeId !== animeId);
      try { localStorage.setItem("anistream_continue_watching", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const saveToMyList = (item: Omit<MyListItem, "timestamp">) => {
    const newItem: MyListItem = { ...item, timestamp: Date.now() };
    setMyList((prev) => {
      const filtered = prev.filter((i) => i.animeId !== item.animeId);
      const updated = [newItem, ...filtered];
      try { localStorage.setItem("anistream_my_list", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const removeFromMyList = (animeId: number) => {
    setMyList((prev) => {
      const updated = prev.filter((i) => i.animeId !== animeId);
      try { localStorage.setItem("anistream_my_list", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const getUserRating = (animeId: number): number => {
    const found = myList.find((i) => i.animeId === animeId);
    return found ? found.userRating : 0;
  };

  const addComment = (animeId: number, username: string, text: string, episode?: number) => {
    if (!text.trim()) return;
    const newComment: CommentItem = {
      id: Math.random().toString(36).substring(2, 9),
      animeId,
      episode,
      username: username.trim() || "Anonymous",
      comment: text.trim(),
      timestamp: Date.now(),
    };

    setComments((prev) => {
      const existing = prev[animeId] || [];
      const updated = { ...prev, [animeId]: [newComment, ...existing] };
      try { localStorage.setItem("anistream_comments", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <WatchContext.Provider
      value={{
        audioPreference,
        setAudioPreference,
        selectedServer,
        setSelectedServer,
        watchHistory,
        addToWatchHistory,
        continueWatching,
        saveContinueWatching,
        removeFromContinueWatching,
        myList,
        saveToMyList,
        removeFromMyList,
        getUserRating,
        comments,
        addComment,
        scrollToTop,
      }}
    >
      {children}
    </WatchContext.Provider>
  );
}

export function useWatchContext() {
  const context = useContext(WatchContext);
  if (!context) {
    throw new Error("useWatchContext must be used within a WatchProvider");
  }
  return context;
}
