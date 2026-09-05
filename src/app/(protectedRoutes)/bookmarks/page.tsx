"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bookmark, ArrowLeft } from "lucide-react";
import { getUserBookmarks } from "@/actions/bookmark.action";
import PostCard, { PostCardProps } from "@/components/card/post-card";
import PostSkeleton from "@/components/card/post-skeleton";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  const [posts, setPosts] = useState<PostCardProps["post"][]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserBookmarks(0, 30);
      if (res.status === 200 && res.posts) {
        setPosts(res.posts as unknown as PostCardProps["post"][]);
      }
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-16 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="p-2 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-normal text-2xl sm:text-3xl tracking-tight text-foreground">
                Saved Sanctuary
              </h1>
              {!loading && posts.length > 0 && (
                <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-border/60 text-muted-foreground">
                  {posts.length} {posts.length === 1 ? "vibe" : "vibes"}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your personal library of saved vibes and unhurried conversations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 p-12 text-center bg-card/30 backdrop-blur-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-normal text-lg text-foreground">
              No saved vibes yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When you find a thought or conversation you want to revisit later, tap the bookmark icon to save it here.
            </p>
          </div>
          <Link href="/home" className="inline-block">
            <Button
              size="sm"
              className="rounded-full px-5 py-2 font-semibold bg-foreground text-background hover:bg-foreground/90 border-0"
            >
              Explore Feed
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const comments = post.comments || [];
            return (
              <PostCard
                key={post.id}
                post={post}
                isLiked={false}
                isBookmarked={true}
                comments={comments}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
