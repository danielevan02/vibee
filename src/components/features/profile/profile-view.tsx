"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Globe,
  SlidersHorizontal,
  UserPlus,
  UserCheck,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  UserX,
  HeartOff,
  MessageSquareDashed,
  Loader2,
  ArrowLeft,
  Maximize2,
  Bookmark,
} from "lucide-react";
import { toggleFollowUser } from "@/server/actions/user";
import PostCard from "@/components/features/post/post-card";
import ImageLightbox from "@/components/ui/image-lightbox";
import EditProfileModal, {
  type ProfileImageUpdate,
} from "@/components/features/profile/edit-profile-modal";
import MentionText from "@/components/ui/mention-text";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { monthAndYear, shortDate } from "@/lib/date";
import { cn } from "@/lib/utils";

type ProfileTab = "vibes" | "replies" | "media" | "likes" | "bookmarks";

interface UserProfileData {
  id: string;
  name: string;
  username: string;
  photo: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  coverImage: string | null;
  createdAt: Date;
  stats: {
    posts: number;
    comments: number;
    followers: number;
    following: number;
    likesReceived: number;
  };
}

interface ProfilePostItem {
  id: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
    photo: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      username: string;
      photo: string | null;
    };
  }[];
  /** Scoped to the viewer: non-empty means the viewer liked this post. */
  likes: {
    authorId: string;
  }[];
  /** Scoped to the viewer, same as `likes`. */
  bookmarks: {
    userId: string;
  }[];
  viewerFollowsAuthor: boolean;
}

interface ProfileReplyItem {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
    photo: string | null;
  };
  post: {
    id: string;
    content: string | null;
    author: {
      username: string;
    };
  } | null;
}

interface ProfileViewProps {
  username: string;
  initialProfile: UserProfileData | null;
  initialIsFollowing: boolean;
  initialIsOwnProfile: boolean;
  initialPosts: ProfilePostItem[];
  initialReplies: ProfileReplyItem[];
  tab: ProfileTab;
}

/**
 * Client island for a profile.
 *
 * The profile and the active tab's content are both resolved on the server in
 * parallel. The old version fetched the profile on mount and only then fetched
 * the tab content - two sequential round-trips after hydration.
 */
export default function ProfileView({
  username,
  initialProfile,
  initialIsFollowing,
  initialIsOwnProfile,
  initialPosts,
  initialReplies,
  tab,
}: ProfileViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // The tab decides what the server fetched, so switching it navigates rather
  // than flipping local state that nothing would act on.
  const activeTab = tab;
  const setActiveTab = (next: ProfileTab) => {
    startTransition(() => {
      router.replace(
        next === "vibes"
          ? `/profile/${username}`
          : `/profile/${username}?tab=${next}`,
      );
    });
  };

  const [profile, setProfile] = useState<UserProfileData | null>(initialProfile);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const isOwnProfile = initialIsOwnProfile;

  const posts = initialPosts;
  const replies = initialReplies;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);


  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const result = await toggleFollowUser(profile.id);
      if (result.ok) {
        const nextFollowing = result.data.isFollowing;
        setIsFollowing(nextFollowing);
        setProfile((prev) =>
          prev
            ? {
              ...prev,
              stats: {
                ...prev.stats,
                followers: nextFollowing
                  ? prev.stats.followers + 1
                  : Math.max(0, prev.stats.followers - 1),
              },
            }
            : prev
        );
        toast.success(
          nextFollowing
            ? `Followed @${profile.username}`
            : `Unfollowed @${profile.username}`
        );
      }
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  const handleProfileUpdated = (updated: ProfileImageUpdate) => {
    setProfile((prev) =>
      prev
        ? {
          ...prev,
          ...updated,
        }
        : prev
    );
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <UserX className="w-7 h-7" />
        </div>
        <h2 className="font-extrabold text-xl text-foreground">User Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          The account @{username} doesn&apos;t exist or might have been removed.
        </p>
        <Button asChild variant="outline" className="rounded-full mt-2">
          <Link href="/home">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home Feed
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full shrink-0 pb-24 md:pb-16">
      {/* Masthead (sticky layer 1). Its height is a token rather than the sum
          of its padding and contents, because the tab strip below sticks at
          exactly that height - see --spacing-masthead in globals.css. */}
      <div className="sticky top-0 z-20 h-masthead shrink-0 backdrop-blur-xl bg-background/85 border-b border-border/50 px-4 sm:px-6 flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8 hover:bg-accent/60"
        >
          <Link href="/home">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="font-serif font-normal text-base sm:text-lg leading-6 tracking-tight text-foreground truncate">
            {profile.name}
          </h1>
          <p className="text-[11px] leading-4 text-muted-foreground">
            {profile.stats.posts} {profile.stats.posts === 1 ? "vibe" : "vibes"}
          </p>
        </div>
      </div>

      {/* Hero Banner: the reader's own cover when they have one, otherwise the
          painted gradient - so an empty profile still looks deliberate. */}
      <div className="relative h-36 sm:h-48 w-full bg-gradient-to-r from-blue-600/25 via-sky-500/20 to-indigo-600/30 overflow-hidden border-b border-border/60">
        {profile.coverImage ? (
          <button
            type="button"
            onClick={() => setLightboxImage(profile.coverImage)}
            className="absolute inset-0 cursor-zoom-in group/cover"
            aria-label="View cover photo"
            title="Click to view cover photo"
          >
            <Image
              src={profile.coverImage}
              alt={`${profile.name}'s cover photo`}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
              priority
            />
            <span className="absolute inset-0 bg-black/15 opacity-0 group-hover/cover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          </>
        )}
      </div>

      {/* Profile Info Container */}
      <div className="px-4 sm:px-6 pb-4 border-b border-border/40">
        {/* Avatar & Action Row */}
        <div className="flex justify-between items-end -mt-12 sm:-mt-14 mb-4">
          <div
            onClick={() => setLightboxImage(profile.photo)}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background overflow-hidden bg-muted/40 cursor-zoom-in group/avatar"
            title="Click to view full photo"
          >
            <Image
              src={profile.photo || "/user-placeholder.png"}
              alt={profile.name}
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-cover transition-transform duration-300 group-hover/avatar:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Action Button: Edit or Follow */}
          <div>
            {isOwnProfile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-full font-medium text-xs h-9 px-4 border-border/70 hover:bg-accent/60 flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollowToggle}
                  className={cn(
                    "rounded-full font-semibold text-xs h-9 px-4 transition-colors",
                    isFollowing ? "border-border/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" : "bg-foreground text-background hover:bg-foreground/90 border-0",
                  )}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 mr-1" />
                      <span>Follow</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* User Identity */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h2 className="font-serif font-normal text-2xl sm:text-3xl tracking-tight text-foreground">
              {profile.name}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            @{profile.username}
          </p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 text-xs sm:text-sm text-foreground/90 leading-relaxed max-w-xl whitespace-pre-wrap break-words">
            <MentionText content={profile.bio} />
          </p>
        )}

        {/* Meta details (Location, Website, Joined) */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3.5 text-xs text-muted-foreground font-normal">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
              <a
                href={
                  profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate max-w-xs"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
            <span>Joined {monthAndYear(profile.createdAt)}</span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-border/35 text-xs">
          <div className="flex items-center gap-1">
            <strong className="text-foreground font-medium">
              {profile.stats.posts}
            </strong>
            <span className="text-muted-foreground">Vibes</span>
          </div>

          <div className="flex items-center gap-1">
            <strong className="text-foreground font-medium">
              {profile.stats.followers}
            </strong>
            <span className="text-muted-foreground">Followers</span>
          </div>

          <div className="flex items-center gap-1">
            <strong className="text-foreground font-medium">
              {profile.stats.following}
            </strong>
            <span className="text-muted-foreground">Following</span>
          </div>

          <div className="flex items-center gap-1 text-rose-500 font-medium">
            <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
            <strong className="text-foreground font-medium">
              {profile.stats.likesReceived}
            </strong>
            <span className="text-muted-foreground">Likes</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="sticky top-masthead z-10 h-subheader shrink-0 flex items-stretch border-b border-border/50 bg-background/85 backdrop-blur-xl px-2 sm:px-4">
        <button
          onClick={() => setActiveTab("vibes")}
          className={cn(
            "flex-1 flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors relative",
            activeTab === "vibes" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span>Vibes</span>
          {activeTab === "vibes" && (
            <span className="absolute bottom-0 inset-x-4 h-0.5 bg-foreground rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("replies")}
          className={cn(
            "flex-1 flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors relative",
            activeTab === "replies" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span>Replies</span>
          {activeTab === "replies" && (
            <span className="absolute bottom-0 inset-x-4 h-0.5 bg-foreground rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("media")}
          className={cn(
            "flex-1 flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors relative",
            activeTab === "media" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span>Media</span>
          {activeTab === "media" && (
            <span className="absolute bottom-0 inset-x-4 h-0.5 bg-foreground rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("likes")}
          className={cn(
            "flex-1 flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors relative",
            activeTab === "likes" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span>Likes</span>
          {activeTab === "likes" && (
            <span className="absolute bottom-0 inset-x-4 h-0.5 bg-foreground rounded-full" />
          )}
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={cn(
              "flex-1 flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors relative",
              activeTab === "bookmarks" ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>Saved</span>
            {activeTab === "bookmarks" && (
              <span className="absolute bottom-0 inset-x-4 h-0.5 bg-foreground rounded-full" />
            )}
          </button>
        )}
      </div>

      {/* Tab Content Stream */}
      <div className="flex-1 p-4 sm:p-6 space-y-4">
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading content...</span>
          </div>
        ) : activeTab === "media" ? (
          /* Media Gallery Tab */
          posts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {posts.map((post) => {
                if (!post.imageUrl) return null;
                return (
                  <div
                    key={post.id}
                    onClick={() => setLightboxImage(post.imageUrl)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-border/60 bg-muted/20 cursor-zoom-in hover:border-primary/40 transition-colors"
                  >
                    <Image
                      src={post.imageUrl}
                      alt={post.content || "Media"}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-2.5">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-base text-foreground">No photos yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                @{profile.username} hasn&apos;t posted any vibes with media.
              </p>
            </div>
          )
        ) : activeTab === "replies" ? (
          /* Replies Stream */
          replies.length > 0 ? (
            <div className="divide-y divide-border/35 border border-border/60 rounded-2xl bg-card/30 overflow-hidden">
              {replies.map((reply) => (
                <div key={reply.id} className="p-4 space-y-2 hover:bg-accent/20 transition-colors">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Replied to <strong className="text-foreground">@{reply.post?.author?.username}</strong>
                    </span>
                    <span>
                      {shortDate(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    <MentionText content={reply.content} />
                  </p>
                  {reply.post && (
                    <Link
                      href={`/post/${reply.post.id}`}
                      className="block p-2.5 rounded-xl border border-border/50 bg-background/50 hover:border-primary/40 text-xs text-muted-foreground transition-colors"
                    >
                      <span className="font-semibold text-foreground">
                        @{reply.post.author?.username}:
                      </span>{" "}
                      {reply.post.content?.slice(0, 90)}...
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-2.5">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-base text-foreground">No replies yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                @{profile.username} hasn&apos;t replied to any vibes yet.
              </p>
            </div>
          )
        ) : (
          /* Vibes or Likes Stream */
          posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as unknown as React.ComponentProps<typeof PostCard>["post"]}
                  comments={(post.comments || []) as unknown as React.ComponentProps<typeof PostCard>["comments"]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-2.5">
                {activeTab === "likes" ? (
                  <HeartOff className="w-6 h-6" />
                ) : activeTab === "bookmarks" ? (
                  <Bookmark className="w-6 h-6" />
                ) : (
                  <MessageSquareDashed className="w-6 h-6" />
                )}
              </div>
              <h3 className="font-medium text-base text-foreground">
                {activeTab === "likes"
                  ? "No liked vibes"
                  : activeTab === "bookmarks"
                    ? "No saved vibes"
                    : "No vibes posted yet"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === "likes"
                  ? `@${profile.username} hasn't liked any vibes yet.`
                  : activeTab === "bookmarks"
                    ? "You haven't saved any vibes yet."
                    : `@${profile.username} hasn't shared any vibes yet.`}
              </p>
            </div>
          )
        )}
      </div>

      {/* Edit Profile Modal. Mounted only while open: its fields seed from
          props, so a persistent instance would reopen showing stale values. */}
      {isOwnProfile && isEditModalOpen && (
        <EditProfileModal
          onClose={() => setIsEditModalOpen(false)}
          currentUser={{
            name: profile.name,
            bio: profile.bio,
            website: profile.website,
            location: profile.location,
            photo: profile.photo,
            coverImage: profile.coverImage,
          }}
          onSuccess={handleProfileUpdated}
        />
      )}

      {/* Lightbox for Profile Photo or Media */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          src={lightboxImage}
          alt={profile.name}
          author={{
            name: profile.name,
            username: profile.username,
            photo: profile.photo,
          }}
        />
      )}
    </div>
  );
}
