"use client";

import { MessageCircle, Heart, Share2, Bookmark, CheckCircle2, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ImageLightbox from "../ui/image-lightbox";
import { motion, AnimatePresence } from "motion/react";
import { Comment, Post, User } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../animate-ui/radix/dialog";
import { createLike, removeLike } from "@/actions/like.action";
import { toggleBookmark } from "@/actions/bookmark.action";
import { toast } from "sonner";
import CommentSection from "../section/comment-section";
import MentionText from "../ui/mention-text";
import { authClient } from "@/lib/auth-client";
import { usePost } from "@/lib/stores";
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
    likes: {
      authorId: string;
    }[];
    bookmarks?: {
      userId: string;
    }[];
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
  isLiked = false,
  isBookmarked: initialIsBookmarked,
  comments,
}: PostCardProps) {
  const { data: session } = authClient.useSession();
  const { setPosts } = usePost();
  const isAuthor = session?.user ? session.user.id === post.authorId : false;

  let relativeTime = "";
  try {
    relativeTime = formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true });
  } catch {
    relativeTime = format(new Date(post.createdAt), "MMM dd");
  }

  const time = format(new Date(post.createdAt), "hh:mm aa");
  const date = format(new Date(post.createdAt), "MMM dd, yyyy");

  const [like, setLike] = useState(post._count.likes);
  const [active, setActive] = useState(isLiked);
  const [isExpand, setIsExpand] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (initialIsBookmarked !== undefined) return initialIsBookmarked;
    if (post.bookmarks && post.bookmarks.length > 0) return true;
    return false;
  });
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

  const content = post.content || "";
  const wordLimit = 25;
  const words = content.split(/\s+/);
  const showReadMore = words.length > wordLimit;
  const displayedContent =
    showReadMore && !isExpand
      ? words.slice(0, wordLimit).join(" ") + "..."
      : content;

  const handleLike = async () => {
    setActive((prev) => !prev);
    setLike((prev) => (active ? prev - 1 : prev + 1));
    try {
      if (!active) {
        const { message } = await createLike({ postId: post.id });
        if (message) {
          toast.error(message);
        }
      } else {
        const { message } = await removeLike({ postId: post.id });
        if (message) {
          toast.error(message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Can't like this post");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/home#post-${post.id}`);
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
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 shrink-0" />
              <Link
                href={`/profile/${post.author.username}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                @{post.author.username}
              </Link>
              <span className="text-muted-foreground/60 text-xs">·</span>
              <span className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground/80 hover:text-foreground transition-colors" title={`${date} at ${time}`}>
                {relativeTime}
              </span>
            </div>
          </div>
        </div>

        <PostOptionsMenu
          postId={post.id}
          authorId={post.author.id}
          authorUsername={post.author.username}
          isAuthor={isAuthor}
          isBookmarked={isBookmarked}
          onToggleBookmark={async () => {
            const next = !isBookmarked;
            setIsBookmarked(next);
            try {
              const res = await toggleBookmark(post.id);
              if (res.status === 200) {
                setIsBookmarked(res.isBookmarked);
                toast.success(res.message);
              } else {
                setIsBookmarked(!next);
                toast.error(res.message || "Failed to update bookmark");
              }
            } catch {
              setIsBookmarked(!next);
              toast.error("Failed to update bookmark");
            }
          }}
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
              className="text-primary font-medium hover:underline ml-1 cursor-pointer inline"
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
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-[color,background-color,border-color,transform,opacity] active:scale-95 cursor-pointer opacity-0 group-hover/img:opacity-100 sm:opacity-75 sm:hover:opacity-100"
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
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-[color,background-color,border-color,transform,opacity] active:scale-95 cursor-pointer opacity-0 group-hover/img:opacity-100 sm:opacity-75 sm:hover:opacity-100"
                    aria-label="Next photo"
                    title="Next photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Top Right: Counter Pill Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white text-[11px] font-mono flex items-center gap-1 z-10 pointer-events-none">
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
                        className={`rounded-full transition-[width,background-color] duration-200 cursor-pointer ${idx === activeSlide
                            ? "w-4 h-1.5 bg-white"
                            : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                          }`}
                        aria-label={`Go to photo ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Floating expand pill */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-[transform,opacity] duration-200 transform translate-y-1 group-hover/img:translate-y-0 pointer-events-none">
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

        {/* Action Bar (S-Tier Twitter/Linear style) */}
        <div className="flex mt-4 pt-3 border-t border-border/30 items-center justify-between text-muted-foreground text-xs">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors group/like ${active ? "text-rose-500 font-medium" : "hover:text-rose-500"
                }`}
              aria-label="Like post"
            >
              <motion.div
                whileTap={{ scale: 1.4 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${active ? "fill-rose-500 text-rose-500" : "group-hover/like:text-rose-500"
                    }`}
                />
              </motion.div>
              <span>{like}</span>
            </button>

            {/* Comment Dialog Trigger */}
            <Dialog>
              <DialogTrigger className="flex items-center gap-1.5 hover:text-foreground transition-colors duration-200 cursor-pointer group/comment">
                <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                <span>{post._count.comments}</span>
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
                />
              </DialogContent>
            </Dialog>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors duration-200 cursor-pointer"
              aria-label="Share post"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={async () => {
              const next = !isBookmarked;
              setIsBookmarked(next);
              try {
                const res = await toggleBookmark(post.id);
                if (res.status === 200) {
                  setIsBookmarked(res.isBookmarked);
                  toast.success(res.message);
                } else {
                  setIsBookmarked(!next);
                  toast.error(res.message || "Failed to update bookmark");
                }
              } catch {
                setIsBookmarked(!next);
                toast.error("Failed to update bookmark");
              }
            }}
            className={`p-1.5 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer ${isBookmarked ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
              }`}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark vibe"}
          >
            <Bookmark
              className={`w-4 h-4 transition-transform active:scale-125 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""
                }`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
