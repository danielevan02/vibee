"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog";
import { Button } from "@/components/ui/button";
import MentionTextarea from "@/components/ui/mention-textarea";
import { POST_CHAR_LIMIT } from "@/config/constants";
import { updatePost } from "@/server/actions/post";
import { ACTION_ERROR_MESSAGE } from "@/types/action";
import { cn } from "@/lib/utils";

interface EditPostDialogProps {
  postId: string;
  initialContent: string;
  onClose: () => void;
  onSaved: (content: string) => void;
}

/**
 * Edits a post's body.
 *
 * Only the text: swapping the images after the fact would quietly rewrite what
 * people already replied to, which is a different feature with different
 * consequences.
 */
export default function EditPostDialog({
  postId,
  initialContent,
  onClose,
  onSaved,
}: EditPostDialogProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const trimmed = content.trim();
  const charsLeft = POST_CHAR_LIMIT - content.length;
  const unchanged = trimmed === initialContent.trim();
  const canSave = trimmed.length > 0 && charsLeft >= 0 && !unchanged && !saving;

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      const result = await updatePost({ postId, content: trimmed });
      if (result.ok) {
        toast.success("Vibe updated");
        onSaved(result.data.content);
        onClose();
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    } catch {
      toast.error("Failed to update vibe");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6 rounded-3xl bg-background/95 dark:bg-card/95 backdrop-blur-2xl border border-border">
        <DialogTitle className="font-serif text-lg font-normal text-foreground">
          Edit vibe
        </DialogTitle>

        <p className="text-xs text-muted-foreground mt-1">
          Replies stay where they are, so keep the meaning recognisable.
        </p>

        <div className="mt-4">
          <MentionTextarea
            value={content}
            onChange={setContent}
            disabled={saving}
            maxLength={POST_CHAR_LIMIT}
            rows={4}
            minHeight="100px"
          />
        </div>

        <div className="flex items-center justify-between gap-3 mt-5">
          <span
            className={cn(
              "text-xs font-mono",
              charsLeft < 0
                ? "text-rose-500 font-medium"
                : charsLeft < 20
                  ? "text-amber-500 font-medium"
                  : "text-muted-foreground/60",
            )}
          >
            {charsLeft}
          </span>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={onClose}
              className="rounded-full px-4 h-9 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="rounded-full px-5 h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
