"use client";

import React, { useState } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { useWatchContext } from "@/context/WatchContext";

interface CommentsSectionProps {
  animeId: number;
  episodeNumber?: number;
}

export default function CommentsSection({ animeId, episodeNumber }: CommentsSectionProps) {
  const { comments, addComment } = useWatchContext();
  const [username, setUsername] = useState("");
  const [commentText, setCommentText] = useState("");

  const animeComments = comments[animeId] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(animeId, username, commentText, episodeNumber);
    setCommentText("");
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 border-t border-border pt-8">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider border-l-2 border-white pl-3">
          Comments ({animeComments.length})
        </h3>
      </div>

      {/* Leave a Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3 border border-border bg-surface p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-border bg-black px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none font-mono"
          />
        </div>

        <textarea
          rows={3}
          placeholder="Leave a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full border border-border bg-black p-3 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none font-sans"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 border border-white bg-white px-6 py-2 text-xs font-mono font-bold text-black uppercase hover:bg-neutral-200 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {animeComments.length > 0 ? (
          animeComments.map((c) => (
            <div key={c.id} className="border border-border bg-surface p-4 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{c.username}</span>
                  {c.episode && (
                    <span className="border border-neutral-800 bg-black px-1.5 py-0.5 text-[10px] text-neutral-400 font-normal">
                      EP {c.episode}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-500">{formatDate(c.timestamp)}</span>
              </div>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed pl-5 border-l border-neutral-800">
                {c.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="border border-border bg-surface p-6 text-center text-xs text-neutral-500 font-mono">
            No comments yet. Be the first to leave a comment.
          </div>
        )}
      </div>
    </div>
  );
}
