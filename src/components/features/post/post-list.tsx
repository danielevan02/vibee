"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import PostCard, { PostCardProps } from "@/components/features/post/post-card";
import PostSkeleton from "@/components/features/post/post-skeleton";
import { Loader2, MessageSquareDashed, Flame, Users, Compass } from "lucide-react";
import { User } from "@/db/schema";
import { usePost } from "@/lib/stores";
import type { FeedKind } from "@/types/feed";

export default function PostList({
  user,
  feed = "latest",
  followingCount = 0,
}: {
  user: User;
  feed?: FeedKind;
  /** Lets the empty state tell "you follow nobody" apart from "they are quiet". */
  followingCount?: number;
}) {
  const { posts, setPosts } = usePost();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentFeedRef = useRef(feed);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    currentFeedRef.current = feed;
  }, [feed]);

  const fetchPosts = useCallback(
    async (currentSkip: number, activeFeed: FeedKind) => {
      if (loadingRef.current || (!hasMoreRef.current && currentSkip > 0)) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/post?skip=${currentSkip}&feed=${activeFeed}`);
        if (!res.ok) throw new Error("Failed to load posts");

        // Stale response guard
        if (activeFeed !== currentFeedRef.current) return;

        const newPosts = (await res.json()) as PostCardProps["post"][];

        if (currentSkip === 0) {
          setPosts(() => newPosts);
        } else {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const uniquePosts = newPosts.filter((p) => !existingIds.has(p.id));
            return [...prev, ...uniquePosts];
          });
        }

        const more = newPosts.length === 10;
        setHasMore(more);
        hasMoreRef.current = more;
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        if (activeFeed === currentFeedRef.current) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    },
    [setPosts]
  );

  // Fetch the first page on mount. Switching feeds remounts this component -
  // the parent keys it by feed - so there are no three pieces of state to reset
  // by hand, which is React's own answer to "start over when a prop changes".
  useEffect(() => {
    fetchPosts(0, feed);
  }, [feed, fetchPosts]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        !loadingRef.current &&
        hasMoreRef.current &&
        !initialLoading
      ) {
        fetchPosts(posts.length, feed);
      }
    });

    if (bottomRef.current) {
      observer.current.observe(bottomRef.current);
    }

    return () => observer.current?.disconnect();
  }, [fetchPosts, posts.length, initialLoading, feed]);

  // If initially loading and no posts yet, display S-Tier skeleton cards
  if (initialLoading) {
    return (
      <div className="space-y-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  // If no posts found. The following feed has two very different silences -
  // "you follow nobody" is a thing the reader can act on, so it gets its own
  // copy and a way out rather than the generic "no vibes yet".
  if (posts.length === 0) {
    const isEmptyGraph = feed === "following" && followingCount === 0;

    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center bg-card/20 backdrop-blur-sm space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          {feed === "following" ? (
            <Users className="w-6 h-6" />
          ) : feed === "frequencies" ? (
            <Flame className="w-6 h-6 text-amber-500" />
          ) : (
            <MessageSquareDashed className="w-6 h-6" />
          )}
        </div>
        <h3 className="font-bold text-base text-foreground">
          {isEmptyGraph
            ? "You're not following anyone yet"
            : feed === "following"
              ? "Quiet in here"
              : feed === "frequencies"
                ? "No trending vibes yet"
                : "No vibes yet"}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          {isEmptyGraph
            ? "Follow a few voices and their vibes will land here. Until then, Latest shows you everything."
            : feed === "following"
              ? "The people you follow haven't shared anything yet. Share the first thought, or find more voices to follow."
              : feed === "frequencies"
                ? "Posts with the most likes and comments will be featured here. Be the first to start a conversation!"
                : "The timeline is currently quiet. Be the first to share a thought, photo, or conversation!"}
        </p>
        {feed === "following" && (
          <Link
            href="/explore?tab=people"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Compass className="w-3.5 h-3.5" />
            Find people to follow
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const comments = post.comments;
        const isLiked = post.likes.some((like) => like.authorId === user?.id);
        return (
          <PostCard
            key={post.id}
            post={post}
            isLiked={isLiked}
            comments={comments}
          />
        );
      })}

      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading older vibes...</span>
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
