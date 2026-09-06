"use client";

import Image from "next/image";
import Link from "next/link";
import { Comment, Post, User } from "@prisma/client";
import { Fragment, useState, useRef } from "react";
import { Button } from "../ui/button";
import {
  Loader2,
  SendHorizonal,
  CheckCircle2,
  MessageCircle,
  MessageCircleDashed,
  Heart,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CommentCard from "../card/comment-card";
import ImageLightbox from "../ui/image-lightbox";
import { WORD_LIMIT } from "@/lib/constants";
import { createComment } from "@/actions/comment.action";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import MentionText from "../ui/mention-text";
import MentionTextarea, { MentionTextareaRef } from "../ui/mention-textarea";
import EmojiPicker from "../ui/emoji-picker";
import ReplyComposer from "./reply-composer";

interface CommentSectionProps {
  post: Post & {
    author: User;
    _count: {
      comments: number;
      likes: number;
    };
  };
  words: string[];
  wordLimit: number;
  time: string;
  date: string;
  comments: ThreadComment[];
  /** Reports a change in total reply count to the owner of the displayed badge. */
  onCommentCountChange?: (delta: number) => void;
}

type CommentWithAuthor = Comment & { author: User };
export type ThreadComment = CommentWithAuthor & { replies?: CommentWithAuthor[] };

const QUICK_EMOJIS = ["👏", "🔥", "❤️", "🙌", "💡", "✨"];

export default function CommentSection({
  post,
  date,
  time,
  words,
  wordLimit,
  comments,
  onCommentCountChange,
}: CommentSectionProps) {
  const { data: session } = authClient.useSession();
  const [isExpand, setIsExpand] = useState(false);
  const [commentList, setCommentList] = useState(comments);
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  // Which comment the inline reply composer is attached to. Only one is open
  // at a time - two open composers in a thread is noise, not a feature.
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const textareaRef = useRef<MentionTextareaRef>(null);

  const postImages: string[] =
    (post as { imageUrls?: string[] }).imageUrls &&
    (post as { imageUrls?: string[] }).imageUrls!.length > 0
      ? (post as { imageUrls?: string[] }).imageUrls!
      : post.imageUrl
      ? [post.imageUrl]
      : [];

  const showReadMore = words.length > wordLimit;
  const displayedContent =
    showReadMore && !isExpand
      ? words.slice(0, wordLimit).join(" ") + "..."
      : post.content;

  const handleContent = (val: string) => {
    setContent(val);
    setWordCount(val.length);
  };

  const handleAddEmoji = (emoji: string) => {
    if (content.length + emoji.length > WORD_LIMIT) return;
    const newText = content + emoji;
    setContent(newText);
    setWordCount(newText.length);
    textareaRef.current?.focus();
  };

  const handleOpenReply = (comment: { id: string; username: string }) => {
    setReplyTo((prev) => (prev?.id === comment.id ? null : comment));
  };

  const handleSubmitReply = async (replyContent: string) => {
    if (!replyTo || !replyContent.trim() || replyLoading) return;

    try {
      setReplyLoading(true);
      const { message, status, comment } = await createComment({
        content: replyContent,
        postId: post.id,
        parentId: replyTo.id,
      });

      if (status === 201 && comment) {
        // The server flattens depth, so trust `comment.parentId` over the id we
        // sent: replying to a reply lands under that reply's parent instead.
        const parentId = comment.parentId;
        setCommentList((prev) =>
          parentId
            ? prev.map((c) =>
                c.id === parentId
                  ? { ...c, replies: [...(c.replies ?? []), comment] }
                  : c
              )
            : [comment, ...prev]
        );
        onCommentCountChange?.(1);
        setReplyTo(null);
        toast.success(message || "Reply posted!");
      } else {
        toast.error(message || "Failed to post reply");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to post reply");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;

    try {
      setLoading(true);
      const { message, status, comment } = await createComment({
        content,
        postId: post.id,
      });

      if (status === 201 && comment) {
        toast.success(message || "Reply posted to thread!");
        setCommentList((prev) => [comment, ...prev]);
        onCommentCountChange?.(1);
        setContent("");
        setWordCount(0);
      } else {
        toast.error(message || "Failed to post comment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const currentUserPhoto =
    session?.user?.image || "/user-placeholder.png";

  const totalReplies = commentList.reduce(
    (sum, comment) => sum + 1 + (comment.replies?.length ?? 0),
    0
  );

  const replyComposerNode = replyTo ? (
    <ReplyComposer
      key={replyTo.id}
      replyingTo={replyTo.username}
      avatar={currentUserPhoto}
      loading={replyLoading}
      onCancel={() => setReplyTo(null)}
      onSubmit={handleSubmitReply}
    />
  ) : null;


  return (
    <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-b border-border/50 bg-background/90 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-normal text-base sm:text-lg text-foreground flex items-center gap-2 whitespace-nowrap">
              Thread
              <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground">
                {commentList.length}
              </span>
            </h2>
          </div>
        </div>

        <span className="hidden sm:inline-flex text-xs text-muted-foreground">
          Replying to <span className="font-semibold text-primary ml-1">@{post.author.username}</span>
        </span>
      </div>

      {/* Scrollable Conversation Canvas */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain subtle-scrollbar px-4 sm:px-6 py-4 sm:py-5 pb-12 sm:pb-16 space-y-5 sm:space-y-6">
        {/* The Root Post Card with Vertical Threadline */}
        <div className="relative flex items-start gap-3 sm:gap-3.5">
          {/* Left: Author Avatar + Connecting Threadline */}
          <div className="relative flex flex-col items-center shrink-0">
            <Link
              href={`/profile/${post.author.username}`}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-border/70 hover:ring-2 hover:ring-primary/40 transition-[color,background-color,border-color,box-shadow]"
            >
              <Image
                src={post.author.photo || "/user-placeholder.png"}
                fill
                sizes="40px"
                alt={post.author.name || "Author"}
                className="object-cover"
              />
            </Link>

            {/* Continuous gradient vertical thread connector descending to composer */}
            <div className="w-[2px] flex-1 bg-gradient-to-b from-border/70 via-border/50 to-primary/40 mt-2 rounded-full min-h-[40px]" />
          </div>

          {/* Right: Post Content */}
          <div className="flex-1 min-w-0 pb-4">
            {/* Author Identity & Metadata */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Link
                  href={`/profile/${post.author.username}`}
                  className="font-bold text-sm sm:text-base text-foreground truncate hover:underline"
                >
                  {post.author.name}
                </Link>
                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/15 shrink-0" />
                <Link
                  href={`/profile/${post.author.username}`}
                  className="text-xs text-muted-foreground truncate hover:underline"
                >
                  @{post.author.username}
                </Link>
              </div>
              <span className="text-xs text-muted-foreground/80 shrink-0">
                {time}
              </span>
            </div>

            {/* Post Body */}
            <div className="text-sm sm:text-[15px] text-foreground/95 leading-relaxed whitespace-pre-wrap mt-2 break-words">
              <MentionText content={displayedContent} />{" "}
              {showReadMore && (
                <button
                  onClick={() => setIsExpand(!isExpand)}
                  className="text-primary hover:underline font-semibold cursor-pointer ml-1"
                >
                  {isExpand ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            {/* Attached Media / Carousel */}
            {postImages.length > 0 && (
              <>
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
                  className="relative w-full max-h-72 aspect-video rounded-2xl overflow-hidden mt-3.5 border border-border/70 bg-muted/20 cursor-zoom-in group/media hover:border-primary/50 transition-[color,background-color,border-color,box-shadow] focus:outline-none focus:ring-2 focus:ring-primary/40 select-none"
                  aria-label="Click to enlarge photo"
                  title="Click to enlarge photo"
                >
                  <Image
                    src={postImages[activeSlide]}
                    alt={`Post attachment ${activeSlide + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover transition-transform duration-300 group-hover/media:scale-[1.02]"
                  />
                  {/* Subtle dark vignette on hover */}
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover/media:opacity-100 transition-opacity duration-200 pointer-events-none" />

                  {/* Multi-Image Controls */}
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
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/65 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-[color,background-color,border-color,transform,opacity] active:scale-95 cursor-pointer opacity-0 group-hover/media:opacity-100 sm:opacity-75 sm:hover:opacity-100"
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
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/65 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-[color,background-color,border-color,transform,opacity] active:scale-95 cursor-pointer opacity-0 group-hover/media:opacity-100 sm:opacity-75 sm:hover:opacity-100"
                        aria-label="Next photo"
                        title="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Counter Badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold flex items-center gap-1 z-10 pointer-events-none">
                        <span>
                          {activeSlide + 1}/{postImages.length}
                        </span>
                      </div>

                      {/* Dots */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 z-10 pointer-events-auto">
                        {postImages.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSlide(idx);
                            }}
                            className={`rounded-full transition-[width,background-color] duration-200 cursor-pointer ${
                              idx === activeSlide
                                ? "w-4 h-1.5 bg-white"
                                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                            }`}
                            aria-label={`Go to photo ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Floating zoom badge */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium flex items-center gap-1.5 opacity-0 group-hover/media:opacity-100 transition-[transform,opacity] duration-200 transform translate-y-1 group-hover/media:translate-y-0 pointer-events-none">
                    <Maximize2 className="w-3 h-3 text-white/90" />
                    <span>View photo</span>
                  </div>
                </div>

                {/* Full-Screen Lightbox Modal */}
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
                  time={`${time} · ${date}`}
                />
              </>
            )}

            {/* Timestamp & Engagement Metrics */}
            <div className="flex items-center justify-between text-xs text-muted-foreground/80 pt-3 mt-3 border-t border-border/35">
              <span>{time} · {date}</span>
              <div className="flex items-center gap-3 font-medium">
                <span className="flex items-center gap-1 text-rose-500/90">
                  <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-500" />
                  {post._count.likes}
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {commentList.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* The Inline Reply Composer */}
        <div className="relative z-20 focus-within:z-30 flex items-start gap-3 sm:gap-3.5 pt-1">
          {/* Current User Avatar */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border/70 shrink-0 mt-1">
            <Image
              src={currentUserPhoto}
              alt="You"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>

          {/* Composer Card Box */}
          <div className="flex-1 min-w-0 rounded-2xl border border-border/70 bg-card/60 dark:bg-muted/15 p-3 sm:p-3.5 space-y-3 focus-within:border-foreground/25 transition-[color,background-color,border-color]">
            <MentionTextarea
              ref={textareaRef}
              value={content}
              onChange={handleContent}
              placeholder={`Reply to @${post.author.username}\u2026`}
              disabled={loading}
              maxLength={WORD_LIMIT}
              rows={2}
              minHeight="64px"
            />

            {/* Composer Footer: Emoji Picker + Quick Emojis + Counter + Submit */}
            <div className="flex items-center justify-between pt-2 border-t border-border/35 gap-2">
              {/* Emojis & Quick Reactions */}
              <div className="flex items-center gap-1">
                <EmojiPicker
                  disabled={loading}
                  onSelectEmoji={handleAddEmoji}
                  variant="compact"
                  buttonLabel="Emoji"
                />

                <div className="hidden sm:flex items-center gap-1 border-l border-border/40 pl-1.5 ml-0.5">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleAddEmoji(emoji)}
                      className="w-6 h-6 rounded-md hover:bg-accent/60 flex items-center justify-center text-xs transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                      aria-label={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons & Counter */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={`text-[11px] font-mono font-medium ${
                    wordCount >= WORD_LIMIT
                      ? "text-destructive font-bold"
                      : wordCount >= WORD_LIMIT - 30
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {wordCount}/{WORD_LIMIT}
                </span>

                <Button
                  size="sm"
                  disabled={!content.trim() || loading}
                  onClick={handleSubmit}
                  className="rounded-full h-8 px-4 text-xs font-medium bg-foreground text-background hover:bg-foreground/90 flex items-center gap-1.5 active:scale-95 transition-[color,background-color,transform] cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Reply</span>
                      <SendHorizonal className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Replies Stream Divider */}
        <div className="pt-2">
          <div className="flex items-center gap-2 pb-2">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
              Replies ({totalReplies})
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          {/* Comment Cards Stream */}
          <div className="space-y-1">
            {commentList.length > 0 ? (
              commentList.map((comment, index) => (
                <Fragment key={comment.id}>
                  <CommentCard
                    id={comment.id}
                    author={comment.author}
                    content={comment.content}
                    createdAt={comment.createdAt}
                    isLast={index === commentList.length - 1}
                    onReply={handleOpenReply}
                    replies={comment.replies ?? []}
                    composer={
                      replyTo?.id === comment.id ? replyComposerNode : null
                    }
                    replyComposers={
                      replyTo &&
                      comment.replies?.some((r) => r.id === replyTo.id)
                        ? { [replyTo.id]: replyComposerNode }
                        : undefined
                    }
                  />
                </Fragment>
              ))
            ) : (
              <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 my-2">
                <div className="w-10 h-10 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-2.5">
                  <MessageCircleDashed className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  No replies yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Be the first to join the conversation and share your thoughts with @{post.author.username}!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
