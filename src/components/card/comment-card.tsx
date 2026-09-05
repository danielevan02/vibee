"use client";

import { Comment, User } from "@prisma/client";
import { formatDistanceToNowStrict, format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Heart, CornerDownRight, Copy, Check } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import MentionText from "../ui/mention-text";

export type CommentWithAuthor = Comment & { author: User };

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
}: CommentCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);

  let relativeTime = "";
  try {
    relativeTime = formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true });
  } catch {
    relativeTime = format(new Date(createdAt), "MMM dd");
  }

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Comment copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative flex items-start rounded-2xl hover:bg-accent/35 dark:hover:bg-accent/15 transition-colors group/item ${
        isReply ? "gap-2.5 py-2.5 px-2.5" : "gap-3 sm:gap-3.5 py-3.5 px-3"
      }`}
    >
      {/* Avatar with Thread Stem Line */}
      <div className="relative flex flex-col items-center shrink-0">
        <Link
          href={`/profile/${author.username}`}
          className={`relative ${
            isReply ? "w-7 h-7" : "w-9 h-9"
          } rounded-full overflow-hidden border border-border/70 group-hover/item:border-primary/40 hover:ring-2 hover:ring-primary/40 transition-[color,background-color,border-color,box-shadow]`}
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
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/15 shrink-0" />
            <Link
              href={`/profile/${author.username}`}
              className="text-xs text-muted-foreground truncate hover:underline"
            >
              @{author.username}
            </Link>
          </div>

          <span className="text-[11px] text-muted-foreground/75 font-medium shrink-0">
            {relativeTime}
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
            className={`flex items-center gap-1 transition-colors cursor-pointer ${
              isLiked
                ? "text-rose-500 font-semibold"
                : "hover:text-rose-500 text-muted-foreground/70"
            }`}
            aria-label="Like comment"
          >
            <motion.div
              whileTap={{ scale: 1.4 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isLiked ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
            </motion.div>
            {likeCount > 0 && <span className="text-[11px]">{likeCount}</span>}
          </button>

          {/* Quick Reply Mention */}
          {onReply && (
            <button
              onClick={() => onReply({ id, username: author.username })}
              className="flex items-center gap-1 hover:text-foreground transition-colors duration-200 cursor-pointer text-muted-foreground/70"
              aria-label="Reply to comment"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span className="text-[11px]">Reply</span>
            </button>
          )}

          {/* Copy Comment Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer text-muted-foreground/60 opacity-0 group-hover/item:opacity-100 transition-opacity"
            aria-label="Copy comment"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
          </button>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
