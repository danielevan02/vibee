"use client";

import { MessageCircle, Heart, Share2, Bookmark, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ImageLightbox from "@/components/ui/image-lightbox";
import { motion, AnimatePresence } from "motion/react";
import { Comment, Post, User } from "@/db/schema";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/radix/dialog";
import { createLike, removeLike } from "@/server/actions/like";
import { toggleBookmark } from "@/server/actions/bookmark";
import { toast } from "sonner";
import { ACTION_ERROR_MESSAGE } from "@/types/action";
import CommentSection from "@/components/features/comment/comment-section";
import MentionText from "@/components/ui/mention-text";
import { authClient } from "@/lib/auth-client";
import { usePost } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { clockTime, fullDate, relativeTime } from "@/lib/date";
import { PREVIEW_WORD_LIMIT } from "@/config/constants";
import { actionButton, overlayButton, overlayChip, tapScale, tapSpring } from "@/lib/ui";
import PostOptionsMenu from "./post-options-menu";

export interface PostCardProps {
  post: Post & {
    author: User;
    _count: {
      comments: number;
      likes: number;
      bookmarks?: number;
    };
    comments: (Comment & {
      author: User;
      replies?: (Comment & { author: User })[];
    })[];
    /** Scoped to the viewer by the data layer: non-empty means "I liked this". */
    likes: {
      authorId: string;
    }[];
    /** Scoped to the viewer, same as `likes`. */
    bookmarks?: {
      userId: string;
    }[];
    /** Whether the viewer follows this post's author. */
    viewerFollowsAuthor?: boolean;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments: (Comment & {
    author: User;
    replies?: (Comment & { author: User })[];
  })[];
}

export default function PostCard({
  post,
  isLiked: initialIsLiked,
  isBookmarked: initialIsBookmarked,
  comments,
}: PostCardProps) {
  const { data: session } = authClient.useSession();
  const { setPosts } = usePost();
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const isAuthor = session?.user ? session.user.id === post.authorId : false;

  const postedAgo = relativeTime(post.createdAt);
  const time = clockTime(post.createdAt);
  const date = fullDate(post.createdAt);

  const [like, setLike] = useState(post._count.likes);
  // `likes` and `bookmarks` arrive scoped to the viewer, so their mere presence
  // is the answer. The explicit props stay for callers that already know.
  const [active, setActive] = useState(
    initialIsLiked ?? (post.likes?.length ?? 0) > 0,
  );
  const [isExpand, setIsExpand] = useState(false);
  const [content, setContent] = useState(post.content || "");
  const [isBookmarked, setIsBookmarked] = useState(
    initialIsBookmarked ?? (post.bookmarks?.length ?? 0) > 0,
  );
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Extract multi-image or single legacy image
  const postImages: string[] =
    (post as { imageUrls?: string[] }).imageUrls &&
      (post as { imageUrls?: string[] }).imageUrls!.length > 0
      ? (post as { imageUrls?: string[] }).imageUrls!
      : post.imageUrl
        ? [post.imageUrl]
        : [];

  const wordLimit = PREVIEW_WORD_LIMIT;
  const words = content.split(/\s+/);
  const showReadMore = words.length > wordLimit;
  const displayedContent =
    showReadMore && !isExpand
      ? words.slice(0, wordLimit).join(" ") + "..."
      : content;

  // One handler for both bookmark buttons (the options menu and the action bar),
  // which previously carried two copies of the same optimistic logic.
  const handleToggleBookmark = async () => {
    const next = !isBookmarked;
    setIsBookmarked(next);

    try {
      const result = await toggleBookmark(post.id);
      if (result.ok) {
        setIsBookmarked(result.data.isBookmarked);
        toast.success(
          result.data.isBookmarked
            ? "Saved to bookmarks"
            : "Removed from bookmarks",
        );
      } else {
        setIsBookmarked(!next);
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    } catch {
      setIsBookmarked(!next);
      toast.error("Failed to update bookmark");
    }
  };

  const handleLike = async () => {
    const wasActive = active;
    setActive(!wasActive);
    setLike((prev) => (wasActive ? prev - 1 : prev + 1));

    try {
      const result = wasActive
        ? await removeLike({ postId: post.id })
        : await createLike({ postId: post.id });

      if (!result.ok) {
        // Roll the optimistic update back rather than leaving the UI lying.
        setActive(wasActive);
        setLike((prev) => (wasActive ? prev + 1 : prev - 1));
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    } catch (error) {
      console.error(error);
      setActive(wasActive);
      setLike((prev) => (wasActive ? prev + 1 : prev - 1));
      toast.error("Can't like this post");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-3xl border border-border/70 bg-card/60 dark:bg-card/30 backdrop-blur-xl p-5 sm:p-6 flex flex-col w-full transition-colors duration-200 hover:border-border group"
    >
      {/* Author Header */}
      <div className="flex justify-between items-start mb-3.5">
        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${post.author.username}`}
            className="relative w-10 h-10 rounded-full overflow-hidden border border-border/70 shrink-0 hover:ring-2 hover:ring-primary/40 transition-[color,background-color,border-color,box-shadow] ring-1 ring-primary/10"
          >
            <Image
              src={post.author.photo || "/user-placeholder.png"}
              fill
              sizes="40px"
              alt={post.author.name || "User"}
              className="object-cover"
              unoptimized
            />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-medium text-sm text-foreground hover:underline cursor-pointer"
              >
                {post.author.name}
              </Link>
              <Link
                href={`/profile/${post.author.username}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                @{post.author.username}
              </Link>
              <span className="text-muted-foreground/60 text-xs">·</span>
              <span className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground/80 hover:text-foreground transition-colors" title={`${date} at ${time}`}>
                {postedAgo}
              </span>
            </div>
          </div>
        </div>

        <PostOptionsMenu
          postId={post.id}
          authorId={post.author.id}
          authorUsername={post.author.username}
          isAuthor={isAuthor}
          isFollowingAuthor={post.viewerFollowsAuthor ?? false}
          isBookmarked={isBookmarked}
          content={content}
          onEditPost={setContent}
          onToggleBookmark={handleToggleBookmark}
          onDeletePost={() => {
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          }}
        />
      </div>

      {/* Post Text Content */}
      <div className="flex flex-col text-sm sm:text-[15px] leading-relaxed text-foreground/90 pl-0 sm:pl-[52px]">
        <p className="whitespace-pre-wrap w-full break-words">
          <MentionText content={displayedContent} />{" "}
          {showReadMore && (
            <button
              onClick={() => setIsExpand(!isExpand)}
              className="text-primary font-medium hover:underline ml-1 inline"
            >
              {isExpand ? "Show less" : "Read more"}
            </button>
          )}
        </p>

        {/* Media Preview / Carousel if attached */}
        {postImages.length > 0 && (
          <div className="mt-3.5">
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setIsImageOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsImageOpen(true);
                }
              }}
              className="cursor-zoom-in block text-left group/img overflow-hidden rounded-2xl border border-border/70 hover:border-foreground/25 transition-colors duration-200 focus:outline-none focus:border-foreground/40 relative select-none"
              aria-label="View photo in full size"
              title="Click to enlarge photo"
            >
              <div className="relative w-full max-h-[420px] aspect-video sm:aspect-[16/10] overflow-hidden bg-muted/40">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={postImages[activeSlide]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={postImages[activeSlide]}
                      alt={`Post attachment ${activeSlide + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Hover Vignette */}
              <div className="absolute inset-0 bg-black/15 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none" />

              {/* Multi-Image Controls: Next / Prev Arrow Buttons */}
              {postImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide((prev) =>
                        prev > 0 ? prev - 1 : postImages.length - 1
                      );
                    }}
                    className={cn(
                      overlayButton,
                      "absolute left-2.5 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/img:opacity-100 sm:opacity-75 sm:hover:opacity-100",
                    )}
                    aria-label="Previous photo"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide((prev) =>
                        prev < postImages.length - 1 ? prev + 1 : 0
                      );
                    }}
                    className={cn(
                      overlayButton,
                      "absolute right-2.5 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/img:opacity-100 sm:opacity-75 sm:hover:opacity-100",
                    )}
                    aria-label="Next photo"
                    title="Next photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Top Right: Counter Pill Badge */}
                  <div className={cn(overlayChip, "absolute top-3 right-3 font-mono flex items-center gap-1 z-10 pointer-events-none")}>
                    <span>
                      {activeSlide + 1}/{postImages.length}
                    </span>
                  </div>

                  {/* Bottom Center: Dot Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 z-10 pointer-events-auto">
                    {postImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSlide(idx);
                        }}
                        className={cn(
                          "rounded-full transition-[width,background-color] duration-200",
                          idx === activeSlide ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80",
                        )}
                        aria-label={`Go to photo ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Floating expand pill */}
              <div className={cn(overlayChip, "absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-[transform,opacity] duration-200 translate-y-1 group-hover/img:translate-y-0 pointer-events-none")}>
                <Maximize2 className="w-3 h-3 text-white/90" />
                <span>View photo</span>
              </div>
            </div>

            <ImageLightbox
              isOpen={isImageOpen}
              onClose={() => setIsImageOpen(false)}
              images={postImages}
              initialIndex={activeSlide}
              alt={post.content || "Post attachment"}
              author={{
                name: post.author.name,
                username: post.author.username,
                photo: post.author.photo,
              }}
              time={`${date} at ${time}`}
            />
          </div>
        )}

        {/* Action Bar. The four controls share one anatomy from lib/ui - same
            gap, same transition, same press spring - and differ only in the
            colour each one settles on. */}
        <div className="flex mt-4 pt-3 border-t border-border/30 items-center justify-between text-muted-foreground text-xs">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={cn(
                actionButton,
                active ? "text-rose-500 font-medium" : "hover:text-rose-500",
              )}
              aria-label="Like post"
            >
              <motion.span
                className="flex"
                whileTap={tapScale}
                transition={tapSpring}
              >
                <Heart
                  className={cn("w-4 h-4", active && "fill-rose-500")}
                  strokeWidth={1.75}
                />
              </motion.span>
              <span>{like}</span>
            </button>

            {/* Comment Dialog Trigger */}
            <Dialog>
              <DialogTrigger className={cn(actionButton, "hover:text-foreground")}>
                <motion.span
                  className="flex"
                  whileTap={tapScale}
                  transition={tapSpring}
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                </motion.span>
                <span>{commentCount}</span>
              </DialogTrigger>
              <DialogContent
                mobileSheet
                className="max-w-2xl h-[85dvh] max-h-[85dvh] max-sm:h-[88dvh] max-sm:max-h-[88dvh] flex flex-col min-h-0 p-0 gap-0 overflow-hidden bg-background/95 dark:bg-card/95 backdrop-blur-2xl border border-border/70 rounded-3xl"
              >
                <DialogTitle className="sr-only">Thread Discussion</DialogTitle>
                <CommentSection
                  post={post}
                  date={date}
                  time={time}
                  wordLimit={wordLimit}
                  words={words}
                  comments={comments}
                  onCommentCountChange={(delta) =>
                    setCommentCount((prev) => prev + delta)
                  }
                />
              </DialogContent>
            </Dialog>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={cn(actionButton, "hover:text-foreground")}
              aria-label="Share post"
            >
              <motion.span
                className="flex"
                whileTap={tapScale}
                transition={tapSpring}
              >
                <Share2 className="w-4 h-4" strokeWidth={1.75} />
              </motion.span>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={cn(
              actionButton,
              isBookmarked ? "text-amber-500" : "hover:text-amber-500",
            )}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark vibe"}
          >
            <motion.span
              className="flex"
              whileTap={tapScale}
              transition={tapSpring}
            >
              <Bookmark
                className={cn("w-4 h-4", isBookmarked && "fill-amber-500")}
                strokeWidth={1.75}
              />
            </motion.span>
          </button>
        </div>
      </div>
    </article>
  );
}
