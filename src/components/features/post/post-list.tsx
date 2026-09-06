"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostCard, { PostCardProps } from "@/components/features/post/post-card";
import PostSkeleton from "@/components/features/post/post-skeleton";
import { Loader2, MessageSquareDashed, Flame } from "lucide-react";
import { User } from "@/db/schema";
import { usePost } from "@/lib/stores";

export default function PostList({
  user,
  sort = "chronological",
}: {
  user: User;
  sort?: "chronological" | "trending";
}) {
  const { posts, setPosts } = usePost();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentSortRef = useRef(sort);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    currentSortRef.current = sort;
  }, [sort]);

  const fetchPosts = useCallback(
    async (currentSkip: number, activeSort: "chronological" | "trending") => {
      if (loadingRef.current || (!hasMoreRef.current && currentSkip > 0)) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/post?skip=${currentSkip}&sort=${activeSort}`);
        if (!res.ok) throw new Error("Failed to load posts");

        // Stale response guard
        if (activeSort !== currentSortRef.current) return;

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
        if (activeSort === currentSortRef.current) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    },
    [setPosts]
  );

  // Fetch when sort changes or on initial mount
  useEffect(() => {
    hasMoreRef.current = true;
    setHasMore(true);
    setInitialLoading(true);
    fetchPosts(0, sort);
  }, [sort, fetchPosts]);

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
        fetchPosts(posts.length, sort);
      }
    });

    if (bottomRef.current) {
      observer.current.observe(bottomRef.current);
    }

    return () => observer.current?.disconnect();
  }, [fetchPosts, posts.length, initialLoading, sort]);

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

  // If no posts found
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center bg-card/20 backdrop-blur-sm space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          {sort === "trending" ? (
            <Flame className="w-6 h-6 text-amber-500" />
          ) : (
            <MessageSquareDashed className="w-6 h-6" />
          )}
        </div>
        <h3 className="font-bold text-base text-foreground">
          {sort === "trending" ? "No trending vibes yet" : "No vibes yet"}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          {sort === "trending"
            ? "Posts with the most likes and comments will be featured here. Be the first to start a conversation!"
            : "The timeline is currently quiet. Be the first to share a thought, photo, or conversation!"}
        </p>
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
