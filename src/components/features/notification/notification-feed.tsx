"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  AtSign,
  MessageCircle,
  Heart,
  UserPlus,
  CheckCheck,
  BellOff,
  Loader2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { markNotificationsAsRead, deleteNotification, markSingleNotificationAsRead } from "@/server/actions/notification";
import MentionText from "@/components/ui/mention-text";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ACTION_ERROR_MESSAGE } from "@/types/action";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/date";
import { iconButton } from "@/lib/ui";

interface NotificationItem {
  id: string;
  type: string;
  content: string | null;
  read: boolean;
  createdAt: Date;
  postId: string | null;
  sender: {
    id: string;
    name: string;
    username: string;
    photo: string;
  };
  post: {
    id: string;
    content: string | null;
    imageUrl: string | null;
  } | null;
}

export type FilterType = "all" | "mentions" | "likes" | "comments" | "follows";

interface NotificationFeedProps {
  initialNotifications: NotificationItem[];
  filter: FilterType;
}

/**
 * Client island for the notification list.
 *
 * The filter lives in the URL rather than in component state, so the server can
 * render the right list, and back/forward and sharing a link all behave.
 */
export default function NotificationFeed({
  initialNotifications,
  filter,
}: NotificationFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const applyFilter = (next: FilterType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    startTransition(() => {
      router.replace(params.size ? `/notifications?${params}` : "/notifications");
    });
  };

  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();



  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markNotificationsAsRead();
      if (result.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read!");
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    });
  };

  const handleDeleteNotif = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await deleteNotification(id);
      if (result.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notification removed");
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error]);
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleItemClick = (notif: NotificationItem) => {
    if (!notif.read) {
      markSingleNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case "COMMENT":
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />;
      case "FOLLOW":
        return <UserPlus className="w-3.5 h-3.5 text-purple-500" />;
      case "MENTION":
      default:
        return <AtSign className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "LIKE":
        return "bg-rose-500/10 border-rose-500/30 text-rose-500";
      case "COMMENT":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
      case "FOLLOW":
        return "bg-purple-500/10 border-purple-500/30 text-purple-500";
      case "MENTION":
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-500";
    }
  };

  const getNotificationActionText = (type: string) => {
    switch (type) {
      case "LIKE":
        return "liked your vibe";
      case "COMMENT":
        return "replied to your vibe";
      case "FOLLOW":
        return "started following you";
      case "MENTION":
      default:
        return "mentioned you in a vibe";
    }
  };

  return (
    <div className="flex flex-col min-h-full shrink-0 pb-24 md:pb-16">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-background/85 border-b border-border/50 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-normal text-2xl sm:text-3xl tracking-tight text-foreground flex items-center gap-2">
                Resonance Alerts
                {unreadCount > 0 && (
                  <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-foreground text-background">
                    {unreadCount} new
                  </span>
                )}
              </h1>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="rounded-full text-xs font-medium h-8 px-3.5 border-border/60 hover:bg-accent/60 flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Mark all read</span>
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto subtle-scrollbar pb-1">
          <button
            onClick={() => applyFilter("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0",
              filter === "all" ? "bg-background text-foreground border border-border/60" : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            All
          </button>
          <button
            onClick={() => applyFilter("mentions")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0",
              filter === "mentions" ? "bg-background text-foreground border border-border/60" : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            <AtSign className="w-3.5 h-3.5" />
            Mentions
          </button>
          <button
            onClick={() => applyFilter("likes")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0",
              filter === "likes" ? "bg-rose-600 text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70",
            )}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Likes
          </button>
          <button
            onClick={() => applyFilter("comments")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0",
              filter === "comments" ? "bg-emerald-600 text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70",
            )}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Replies
          </button>
          <button
            onClick={() => applyFilter("follows")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0",
              filter === "follows" ? "bg-purple-600 text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70",
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Followers
          </button>
        </div>
      </div>

      {/* Notifications Stream Canvas */}
      <div className="flex-1 divide-y divide-border/35">
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading notifications...</span>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => {
            const targetHref = notif.postId
              ? `/post/${notif.postId}`
              : `/profile/${notif.sender.username}`;

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={cn(
                  "flex items-start justify-between gap-3.5 p-4 sm:p-5 transition-colors hover:bg-accent/30 dark:hover:bg-accent/15 group/item relative",
                  !notif.read ? "bg-blue-500/5 dark:bg-blue-500/5" : "",
                )}
              >
                {/* Unread Glowing Dot */}
                {!notif.read && (
                  <span className="absolute left-2 top-6 w-2 h-2 rounded-full bg-blue-500" />
                )}

                <div className="flex items-start gap-3.5 min-w-0 flex-1 ml-2 sm:ml-0">
                  {/* Sender Avatar with Corner Type Badge */}
                  <Link
                    href={`/profile/${notif.sender.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="relative shrink-0 group/avatar"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border/70 group-hover/avatar:ring-2 group-hover/avatar:ring-primary/40 transition-[color,background-color,border-color,box-shadow]">
                      <Image
                        src={notif.sender.photo || "/user-placeholder.png"}
                        alt={notif.sender.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Corner Type Badge */}
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background",
                        getNotificationBadgeColor(notif.type),
                      )}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>
                  </Link>

                  {/* Notification Details & Target Link */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/profile/${notif.sender.username}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-sm text-foreground hover:underline"
                        >
                          {notif.sender.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          @{notif.sender.username}
                        </span>
                        <span className="text-xs text-foreground/80 font-normal">
                          {getNotificationActionText(notif.type)}
                        </span>
                      </div>

                      <span className="text-[11px] text-muted-foreground/75 font-medium shrink-0">
                        {relativeTime(notif.createdAt)}
                      </span>
                    </div>

                    {/* Content Snippet / Quote Box */}
                    {notif.content && (
                      <Link
                        href={targetHref}
                        className="block mt-2 text-xs sm:text-sm text-foreground/90 p-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 hover:border-primary/40 transition-colors"
                      >
                        <MentionText content={notif.content} />
                      </Link>
                    )}

                    {/* Attached Vibe Preview (if photo or post preview available) */}
                    {notif.post?.imageUrl && (
                      <Link
                        href={targetHref}
                        className="mt-2.5 inline-block relative w-32 h-20 rounded-xl overflow-hidden border border-border/60 hover:ring-2 hover:ring-primary/40 transition-[color,background-color,border-color,box-shadow]"
                      >
                        <Image
                          src={notif.post.imageUrl}
                          alt="Post preview"
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right Actions: View & Delete */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <Link
                    href={targetHref}
                    className={cn(iconButton, "hover:text-primary")}
                    title="View vibe"
                    aria-label="View vibe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={(e) => handleDeleteNotif(e, notif.id)}
                    className={cn(iconButton, "hover:text-destructive hover:bg-destructive/10")}
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="text-center py-24 px-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3.5 border border-blue-500/20">
              <BellOff className="w-7 h-7" />
            </div>
            <h3 className="font-medium text-base text-foreground">
              {filter === "all"
                ? "No notifications yet"
                : filter === "mentions"
                  ? "No mentions yet"
                  : filter === "likes"
                    ? "No likes yet"
                    : filter === "comments"
                      ? "No replies yet"
                      : "No new followers yet"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
              {filter === "all"
                ? "When someone interacts with your vibes, mentions you, or follows your profile, you'll see it here."
                : "You're all caught up! Keep engaging with the community."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
