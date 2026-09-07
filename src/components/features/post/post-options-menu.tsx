"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Bookmark,
  Link2,
  Trash2,
  UserPlus,
  UserCheck,
  Flag,
  Loader2,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ACTION_ERROR_MESSAGE } from "@/types/action";
import { deletePost } from "@/server/actions/post";
import EditPostDialog from "./edit-post-dialog";
import { toggleFollowUser } from "@/server/actions/user";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { iconButton, menuItem } from "@/lib/ui";
import ReportModal from "./report-modal";

interface PostOptionsMenuProps {
  postId: string;
  authorId: string;
  authorUsername: string;
  isAuthor: boolean;
  /** Resolved on the server, so the menu opens with the right label instead of
   *  always offering "Follow" - which turned a click into a silent unfollow. */
  isFollowingAuthor?: boolean;
  isBookmarked: boolean;
  /** The body being edited, so the dialog opens on what is actually there. */
  content: string | null;
  onToggleBookmark: () => void;
  onDeletePost?: () => void;
  onEditPost?: (content: string) => void;
}

export default function PostOptionsMenu({
  postId,
  authorId,
  authorUsername,
  isAuthor,
  isFollowingAuthor = false,
  isBookmarked,
  content,
  onToggleBookmark,
  onDeletePost,
  onEditPost,
}: PostOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(isFollowingAuthor);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/post/${postId}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
      setIsOpen(false);
    }
  };

  const handleBookmarkClick = () => {
    onToggleBookmark();
    setIsOpen(false);
  };

  const handleFollowClick = async () => {
    setIsFollowLoading(true);
    try {
      const result = await toggleFollowUser(authorId);
      if (result.ok) {
        const { isFollowing: nextFollowing } = result.data;
        setIsFollowing(nextFollowing);
        toast.success(
          nextFollowing
            ? `Now following @${authorUsername}`
            : `Unfollowed @${authorUsername}`
        );
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
      setIsOpen(false);
    }
  };

  const handleReportClick = () => {
    setIsReportModalOpen(true);
    setIsOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost(postId);
      if (result.ok) {
        toast.success("Vibe deleted successfully");
        setIsDeleteDialogOpen(false);
        setIsOpen(false);
        onDeletePost?.();
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    } catch {
      toast.error("An error occurred while deleting vibe");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 3-Dots Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={iconButton}
        aria-label="More options"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-popover dark:bg-card text-popover-foreground border border-border ring-1 ring-black/5 dark:ring-white/10 p-1.5 z-40 space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={menuItem}
            >
              <Link2 className="w-4 h-4" />
              <span>Copy link to vibe</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleBookmarkClick}
              className={menuItem}
            >
              <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-amber-500 text-amber-500")} />
              <span>{isBookmarked ? "Remove bookmark" : "Save vibe"}</span>
            </button>

            {/* If Not Author: Follow & Report */}
            {!isAuthor && (
              <>
                <button
                  type="button"
                  disabled={isFollowLoading}
                  onClick={handleFollowClick}
                  className={menuItem}
                >
                  {isFollowing ? (
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>
                    {isFollowing
                      ? `Unfollow @${authorUsername}`
                      : `Follow @${authorUsername}`}
                  </span>
                </button>

                <div className="border-t border-border/50 my-1" />

                <button
                  type="button"
                  onClick={handleReportClick}
                  className={menuItem}
                >
                  <Flag className="w-4 h-4" />
                  <span>Report vibe</span>
                </button>
              </>
            )}

            {/* If Author: Edit & Delete */}
            {isAuthor && (
              <>
                <div className="border-t border-border/50 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(true);
                    setIsOpen(false);
                  }}
                  className={menuItem}
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit vibe</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                    setIsOpen(false);
                  }}
                  className={cn(menuItem, "text-rose-500 hover:text-rose-500 hover:bg-rose-500/10")}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete vibe</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl bg-background/95 dark:bg-card/95 backdrop-blur-2xl border border-border">
          <DialogTitle className="flex items-center gap-2 font-serif text-lg font-normal text-foreground">
            <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span>Delete vibe?</span>
          </DialogTitle>

          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            This action cannot be undone. This vibe and all of its comments,
            likes, and media will be permanently removed.
          </p>

          <div className="flex items-center justify-end gap-2.5 mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="rounded-xl px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog. Mounted only while open so it always seeds from the
          post's current body. */}
      {isEditOpen && (
        <EditPostDialog
          postId={postId}
          initialContent={content ?? ""}
          onClose={() => setIsEditOpen(false)}
          onSaved={(next) => onEditPost?.(next)}
        />
      )}

      {/* Real Interactive Report Modal */}
      <ReportModal
        postId={postId}
        authorUsername={authorUsername}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
