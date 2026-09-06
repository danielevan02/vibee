"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizonal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MentionTextarea, { MentionTextareaRef } from "@/components/ui/mention-textarea";
import { WORD_LIMIT } from "@/lib/constants";

interface ReplyComposerProps {
  /** Handle being replied to; prefilled as a mention. */
  replyingTo: string;
  avatar: string;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (content: string) => void | Promise<void>;
}

/**
 * Compact composer shown inline under the comment being replied to.
 *
 * Deliberately lighter than the thread's main composer - no emoji tray, no
 * quick reactions - because it appears nested inside a list and has to stay
 * readable at one indent level on a phone.
 */
export default function ReplyComposer({
  replyingTo,
  avatar,
  loading = false,
  onCancel,
  onSubmit,
}: ReplyComposerProps) {
  const [content, setContent] = useState(`@${replyingTo} `);
  const textareaRef = useRef<MentionTextareaRef>(null);

  // MentionTextarea has no autoFocus prop; it exposes focus() on its ref.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const trimmed = content.trim();
  const canSend = trimmed.length > 0 && trimmed !== `@${replyingTo}` && !loading;

  return (
    <div className="flex items-start gap-2.5 mt-2.5">
      <div className="relative w-7 h-7 rounded-full overflow-hidden border border-border/70 shrink-0 mt-0.5">
        <Image
          src={avatar}
          alt="You"
          fill
          sizes="28px"
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0 rounded-2xl border border-border/70 bg-card/60 dark:bg-muted/15 px-3 py-2.5 focus-within:border-foreground/25 transition-colors duration-200">
        <MentionTextarea
          ref={textareaRef}
          value={content}
          onChange={setContent}
          placeholder={`Reply to @${replyingTo}…`}
          disabled={loading}
          maxLength={WORD_LIMIT}
          rows={1}
          minHeight="36px"
        />

        <div className="flex items-center justify-end gap-2 pt-1.5">
          <span
            className={`text-[11px] font-mono ${
              content.length >= WORD_LIMIT
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {content.length}/{WORD_LIMIT}
          </span>

          <button
            type="button"
            onClick={onCancel}
            className="h-7 px-2.5 rounded-full text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors duration-200 cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>

          <Button
            size="sm"
            disabled={!canSend}
            onClick={() => onSubmit(content)}
            className="rounded-full h-7 px-3 text-[11px] font-medium bg-foreground text-background hover:bg-foreground/90 flex items-center gap-1.5 active:scale-95 transition-[color,background-color,transform] cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                Reply
                <SendHorizonal className="w-3 h-3" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
