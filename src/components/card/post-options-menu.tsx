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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { deletePost } from "@/actions/post.action";
import { toggleFollowUser } from "@/actions/user.action";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog";
import { Button } from "@/components/ui/button";
import ReportModal from "./report-modal";

interface PostOptionsMenuProps {
  postId: string;
  authorId: string;
  authorUsername: string;
  isAuthor: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onDeletePost?: () => void;
}

export default function PostOptionsMenu({
  postId,
  authorId,
  authorUsername,
  isAuthor,
  isBookmarked,
  onToggleBookmark,
  onDeletePost,
}: PostOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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
      const url = `${window.location.origin}/home#post-${postId}`;
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
      const res = await toggleFollowUser(authorId);
      if (res.status === 200) {
        const nextFollowing = Boolean(res.isFollowing);
        setIsFollowing(nextFollowing);
        toast.success(
          nextFollowing
            ? `Now following @${authorUsername}`
            : `Unfollowed @${authorUsername}`
        );
      } else {
        toast.error(res.message || "Failed to update follow status");
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
      const res = await deletePost(postId);
      if (res.status === 200) {
        toast.success("Vibe deleted successfully");
        setIsDeleteDialogOpen(false);
        setIsOpen(false);
        if (onDeletePost) {
          onDeletePost();
        }
      } else {
        toast.error(res.message || "Failed to delete vibe");
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
        className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer"
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
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
            >
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <span>Copy link to vibe</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleBookmarkClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
            >
              <Bookmark
                className={`w-4 h-4 ${
                  isBookmarked
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <span>{isBookmarked ? "Remove bookmark" : "Save vibe"}</span>
            </button>

            {/* If Not Author: Follow & Report */}
            {!isAuthor && (
              <>
                <button
                  type="button"
                  disabled={isFollowLoading}
                  onClick={handleFollowClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
                >
                  {isFollowing ? (
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report vibe</span>
                </button>
              </>
            )}

            {/* If Author: Delete Post */}
            {isAuthor && (
              <>
                <div className="border-t border-border/50 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
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
              className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="rounded-xl px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
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
