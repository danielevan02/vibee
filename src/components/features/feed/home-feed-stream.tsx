"use client";

import { useState, useCallback } from "react";
import { User } from "@/db/schema";
import { Flame, Clock, Users } from "lucide-react";
import { motion } from "motion/react";
import InputPost from "@/components/features/post/post-composer";
import PostList from "@/components/features/post/post-list";
import type { FeedKind } from "@/types/feed";
import { cn } from "@/lib/utils";
import { useSlidingPill } from "@/hooks/use-sliding-pill";

interface HomeFeedStreamProps {
  user: User;
  initialFeed: FeedKind;
  /** How many accounts the viewer follows, for the following tab's empty state. */
  followingCount: number;
}

/** One row of choices rather than a scope switch crossed with a sort switch:
 *  three timelines, each a single idea. */
const FEEDS: { key: FeedKind; label: string; icon: typeof Clock }[] = [
  { key: "following", label: "Following", icon: Users },
  { key: "latest", label: "Latest", icon: Clock },
  { key: "frequencies", label: "Frequencies", icon: Flame },
];

const FEED_SUBTITLE: Record<FeedKind, string> = {
  following: "Vibes from the people you follow, newest first.",
  latest: "Everything the community is sharing, as it arrives.",
  frequencies: "The vibes resonating most across the community.",
};

export default function HomeFeedStream({
  user,
  initialFeed,
  followingCount,
}: HomeFeedStreamProps) {
  const [activeFeed, setActiveFeed] = useState<FeedKind>(initialFeed);
  const { containerRef, setItemRef, rect, instant } = useSlidingPill(activeFeed);

  const handleFeedChange = useCallback((nextFeed: FeedKind) => {
    setActiveFeed(nextFeed);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", nextFeed);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Stream Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            The Feed
          </span>
          <h1 className="font-serif font-normal text-2xl sm:text-3xl tracking-tight text-foreground mt-1">
            Home
          </h1>
          <p className="text-xs font-normal text-muted-foreground mt-1">
            {FEED_SUBTITLE[activeFeed]}
          </p>
        </div>

        {/* View Switcher Pills */}
        <div
          ref={containerRef}
          className="relative flex items-center gap-1 p-1 rounded-full bg-muted/30 border border-border/50 text-xs font-normal self-start sm:self-auto backdrop-blur-md"
        >
          {/* Single pill, moved by animating its own box - see useSlidingPill.
              Sits at the default z-index so the `relative` buttons paint above it. */}
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{
              x: rect?.x ?? 0,
              y: rect?.y ?? 0,
              width: rect?.width ?? 0,
              height: rect?.height ?? 0,
            }}
            transition={
              instant
                ? { duration: 0 }
                : { type: "spring", stiffness: 450, damping: 34 }
            }
            className="absolute top-0 left-0 rounded-full bg-background border border-border/60 pointer-events-none"
          />
          {FEEDS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              id={`tab-${key}`}
              ref={setItemRef}
              data-pill-key={key}
              onClick={() => handleFeedChange(key)}
              aria-pressed={activeFeed === key}
              className={cn(
                "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors duration-200 select-none",
                activeFeed === key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inline SaaS Post Composer */}
      <InputPost user={user} />

      {/* Main Post Stream */}
      <div className="pt-2">
        {/* Keyed by feed: a different timeline is a fresh list, not the same
            list with its state hand-reset. */}
        <PostList
          key={activeFeed}
          user={user}
          feed={activeFeed}
          followingCount={followingCount}
        />
      </div>
    </div>
  );
}
