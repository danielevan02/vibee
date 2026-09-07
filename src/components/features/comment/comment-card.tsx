"use client";

import { Comment, User } from "@/db/schema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, CornerDownRight, Copy, Check, Trash2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { deleteComment, toggleCommentLike } from "@/server/actions/comment";
import { ACTION_ERROR_MESSAGE } from "@/types/action";
import MentionText from "@/components/ui/mention-text";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/date";
import { actionButton, tapScale, tapSpring } from "@/lib/ui";

/**
 * A comment as the reader sees it: `likes` is scoped to them by the data layer,
 * so its length answers "did I like this", and `_count` carries the total.
 */
export type CommentWithAuthor = Comment & {
  author: User;
  _count?: { likes: number };
  likes?: { authorId: string }[];
};

interface CommentCardProps {
  id: string;
  content: string;
  createdAt: Date;
  author: User;
  isLast?: boolean;
  /** Called with the comment being answered; the server resolves the parent. */
  onReply?: (comment: { id: string; username: string }) => void;
  /** Direct replies. Only ever passed to a top-level comment - depth stops here. */
  replies?: CommentWithAuthor[];
  /** True when this card is itself a reply: tighter, no nested reply list. */
  isReply?: boolean;
  /** Inline composer, rendered by the parent under the comment being answered. */
  composer?: React.ReactNode;
  /** Composer slots for this comment's own replies, keyed by reply id. */
  replyComposers?: Record<string, React.ReactNode>;
  /** Total likes, and whether one of them is the reader's. */
  likeCount?: number;
  isLiked?: boolean;
  /** Shown only when the reader may remove this comment. */
  canDelete?: boolean;
  onDeleted?: (commentId: string) => void;
  /** Asked per reply, since a thread's replies have different authors. */
  canDeleteReply?: (authorId: string) => boolean;
}

export default function CommentCard({
  id,
  author,
  content,
  createdAt,
  isLast = false,
  onReply,
  replies = [],
  isReply = false,
  composer,
  replyComposers,
  likeCount: initialLikeCount = 0,
  isLiked: initialIsLiked = false,
  canDelete = false,
  onDeleted,
  canDeleteReply,
}: CommentCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const postedAgo = relativeTime(createdAt);

  const handleLike = async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? Math.max(0, prev - 1) : prev + 1));

    try {
      const result = await toggleCommentLike(id);
      if (result.ok) {
        // The server counted after writing, so take its numbers over the guess.
        setIsLiked(result.data.isLiked);
        setLikeCount(result.data.likeCount);
      } else {
        setIsLiked(wasLiked);
        setLikeCount((prev) => (wasLiked ? prev + 1 : Math.max(0, prev - 1)));
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    } catch {
      setIsLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Can't like this comment");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteComment(id);
      if (result.ok) {
        toast.success("Comment removed");
        onDeleted?.(id);
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
        setIsDeleting(false);
      }
    } catch {
      toast.error("Failed to remove comment");
      setIsDeleting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Comment copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative flex items-start rounded-2xl hover:bg-accent/35 dark:hover:bg-accent/15 transition-colors group/item",
        isReply ? "gap-2.5 py-2.5 px-2.5" : "gap-3 sm:gap-3.5 py-3.5 px-3",
      )}
    >
      {/* Avatar with Thread Stem Line */}
      <div className="relative flex flex-col items-center shrink-0">
        <Link
          href={`/profile/${author.username}`}
          className={cn(
            "relative",
            isReply ? "w-7 h-7" : "w-9 h-9",
            "rounded-full overflow-hidden border border-border/70 group-hover/item:border-primary/40 hover:ring-2 hover:ring-primary/40 transition-[color,background-color,border-color,box-shadow]",
          )}
        >
          <Image
            src={author.photo || "/user-placeholder.png"}
            alt={author.name || "Commenter"}
            fill
            sizes={isReply ? "28px" : "36px"}
            className="object-cover"
            unoptimized
          />
        </Link>

        {/* Vertical thread connector to the next comment */}
        {(!isLast || replies.length > 0) && (
          <div className="w-[1.5px] h-full bg-border/40 group-hover/item:bg-border/60 transition-colors my-1 rounded-full" />
        )}
      </div>

      {/* Comment Body */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Author Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <Link
              href={`/profile/${author.username}`}
              className="font-medium text-xs sm:text-sm text-foreground truncate hover:underline transition-colors"
            >
              {author.name}
            </Link>
            <Link
              href={`/profile/${author.username}`}
              className="text-xs text-muted-foreground truncate hover:underline"
            >
              @{author.username}
            </Link>
          </div>

          <span className="text-[11px] text-muted-foreground/75 font-medium shrink-0">
            {postedAgo}
          </span>
        </div>

        {/* Comment Message Text */}
        <p className="mt-1 text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
          <MentionText content={content} />
        </p>

        {/* Micro-Actions Bar on Hover */}
        <div className="flex items-center gap-4 mt-2.5 pt-1 text-muted-foreground text-xs">
          {/* Heart / Like Button */}
          <button
            onClick={handleLike}
            className={cn(
              actionButton,
              isLiked
                ? "text-rose-500 font-medium"
                : "text-muted-foreground/70 hover:text-rose-500",
            )}
            aria-label="Like comment"
          >
            <motion.span className="flex" whileTap={tapScale} transition={tapSpring}>
              <Heart
                className={cn("w-3.5 h-3.5", isLiked && "fill-rose-500")}
                strokeWidth={1.75}
              />
            </motion.span>
            {likeCount > 0 && <span className="text-[11px]">{likeCount}</span>}
          </button>

          {/* Quick Reply Mention */}
          {onReply && (
            <button
              onClick={() => onReply({ id, username: author.username })}
              className={cn(actionButton, "text-muted-foreground/70 hover:text-foreground")}
              aria-label="Reply to comment"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span className="text-[11px]">Reply</span>
            </button>
          )}

          {/* Copy Comment Button */}
          <button
            onClick={handleCopy}
            className={cn(
              actionButton,
              "text-muted-foreground/60 hover:text-foreground opacity-0 group-hover/item:opacity-100",
            )}
            aria-label="Copy comment"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Delete: only rendered for people the server would actually let
              through, but the server checks again regardless. */}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(
                actionButton,
                "text-muted-foreground/60 hover:text-destructive opacity-0 group-hover/item:opacity-100 disabled:opacity-50",
              )}
              aria-label="Delete comment"
            >
              {isDeleting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              <span className="text-[10px]">Delete</span>
            </button>
          )}
        </div>

        {composer}

        {/* One level of replies. A reply never renders a reply list of its own -
            answering one is flattened onto this same parent by the server. */}
        {!isReply && replies.length > 0 && (
          <div className="mt-2 space-y-0.5 border-l border-border/40 pl-3 sm:pl-4">
            {replies.map((reply, index) => (
              <CommentCard
                key={reply.id}
                id={reply.id}
                author={reply.author}
                content={reply.content}
                createdAt={reply.createdAt}
                isLast={index === replies.length - 1}
                onReply={onReply}
                isReply
                composer={replyComposers?.[reply.id]}
                likeCount={reply._count?.likes ?? 0}
                isLiked={(reply.likes?.length ?? 0) > 0}
                canDelete={canDeleteReply?.(reply.authorId) ?? false}
                onDeleted={onDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
