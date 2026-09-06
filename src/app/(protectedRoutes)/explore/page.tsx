"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Radio,
  Users,
  Image as ImageIcon,
  SearchX,
  Loader2,
  X,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Maximize2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getExploreData, getTrendingTopics } from "@/server/data/explore";
import type { ExplorePost, ExploreUser } from "@/server/data/explore";
import { toggleFollowUser } from "@/server/actions/user";
import PostCard from "@/components/features/post/post-card";
import ImageLightbox from "@/components/ui/image-lightbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNowStrict, format } from "date-fns";

type TabType = "trending" | "latest" | "people" | "media";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const initialQuery = searchParams.get("q") || "";
  const initialTag = searchParams.get("tag") || "";
  const initialTab = (searchParams.get("tab") as TabType) || "trending";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [trendingTags, setTrendingTags] = useState<{ tag: string; posts: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // State for lightbox in Media tab
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
    author: {
      name: string;
      username: string;
      photo: string;
    };
    time: string;
  } | null>(null);

  const fetchData = async (q: string, tag: string, tab: TabType) => {
    try {
      setLoading(true);
      const res = await getExploreData({
        query: q || undefined,
        tag: tag || undefined,
        tab,
      });

      if (res.status === 200) {
        setPosts(res.posts || []);
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error("Explore fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadTags() {
      try {
        const res = await getTrendingTopics(8);
        if (res.status === 200 && res.topics) {
          setTrendingTags(res.topics);
        }
      } catch (e) {
        console.error("Error loading tags:", e);
      }
    }
    loadTags();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const tag = searchParams.get("tag") || "";
    const tab = (searchParams.get("tab") as TabType) || "trending";

    setSearchQuery(q);
    setActiveTag(tag);
    setActiveTab(tab);

    fetchData(q, tag, tab);
  }, [searchParams]);

  const updateUrlParams = (newQuery: string, newTag: string, newTab: TabType) => {
    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery);
    if (newTag) params.set("tag", newTag);
    if (newTab !== "trending") params.set("tab", newTab);
    router.replace(`/explore?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTag("");
    updateUrlParams(searchQuery, "", activeTab);
  };

  const handleTagClick = (tag: string) => {
    const nextTag = activeTag === tag ? "" : tag;
    setActiveTag(nextTag);
    setSearchQuery("");
    updateUrlParams("", nextTag, activeTab);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    updateUrlParams(searchQuery, activeTag, tab);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveTag("");
    updateUrlParams("", "", activeTab);
  };

  const handleFollowToggle = async (targetUser: ExploreUser) => {
    try {
      const res = await toggleFollowUser(targetUser.id);
      if (res.status === 200) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? {
                ...u,
                isFollowing: res.isFollowing,
                _count: {
                  ...u._count,
                  followers: res.isFollowing
                    ? u._count.followers + 1
                    : Math.max(0, u._count.followers - 1),
                },
              }
              : u
          )
        );
        toast.success(res.isFollowing ? `Followed @${targetUser.username}` : `Unfollowed @${targetUser.username}`);
      }
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  return (
    <div className="flex flex-col min-h-full shrink-0 pb-24 md:pb-16">
      {/* Sticky Header with Search Bar */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-background/85 border-b border-border/50 px-4 sm:px-6 py-4 space-y-3.5">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search vibes, topics, or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-border/70 bg-card/60 dark:bg-muted/20 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-[color,background-color,border-color,box-shadow]"
          />
          {(searchQuery || activeTag) && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Dynamic Real Trending Hashtag Pills */}
        {trendingTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto subtle-scrollbar pb-1">
            {trendingTags.map((topic) => {
              const isSelected = activeTag === topic.tag;
              return (
                <button
                  key={topic.tag}
                  type="button"
                  onClick={() => handleTagClick(topic.tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${isSelected
                      ? "bg-background text-foreground border border-border/60"
                      : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-sky-400 border border-blue-400/20"
                    }`}
                >
                  <span>#{topic.tag}</span>
                  <span className="text-[10px] opacity-70 ml-1">({topic.posts})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Explore Sub-Tabs */}
        <div className="flex items-center gap-1 border-t border-border/40 pt-2.5">
          <button
            onClick={() => handleTabChange("trending")}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${activeTab === "trending"
                ? "bg-background text-foreground border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trending</span>
          </button>

          <button
            onClick={() => handleTabChange("latest")}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "latest"
                ? "bg-background text-foreground border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Latest</span>
          </button>

          <button
            onClick={() => handleTabChange("people")}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "people"
                ? "bg-background text-foreground border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>People</span>
          </button>

          <button
            onClick={() => handleTabChange("media")}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "media"
                ? "bg-background text-foreground border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Media</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Discovering vibes...</span>
          </div>
        ) : activeTab === "people" ? (
          /* People Discovery Tab */
          users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {users.map((person) => {
                const isMe = session?.user?.id === person.id;
                return (
                  <div
                    key={person.id}
                    className="p-4 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md flex flex-col justify-between gap-3 hover:border-border/90 hover:bg-card/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/profile/${person.username}`}
                        className="flex items-center gap-3 group/person min-w-0"
                      >
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border border-border/60 shrink-0 group-hover/person:ring-2 group-hover/person:ring-primary/40 transition-[color,background-color,border-color,box-shadow]">
                          <Image
                            src={person.photo || "/user-placeholder.png"}
                            alt={person.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm text-foreground truncate group-hover/person:underline">
                              {person.name}
                            </span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/15 shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            @{person.username}
                          </p>
                        </div>
                      </Link>

                      {!isMe && (
                        <Button
                          size="sm"
                          variant={person.isFollowing ? "outline" : "default"}
                          onClick={() => handleFollowToggle(person)}
                          className={`rounded-full h-8 px-3 text-xs font-semibold cursor-pointer transition-colors ${person.isFollowing
                              ? "border-border/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                        >
                          {person.isFollowing ? (
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
                      )}
                    </div>

                    {person.bio && (
                      <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                        {person.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground border-t border-border/30 pt-2">
                      <span>
                        <strong className="text-foreground font-semibold">
                          {person._count.followers}
                        </strong>{" "}
                        followers
                      </span>
                      <span>
                        <strong className="text-foreground font-semibold">
                          {person._count.posts}
                        </strong>{" "}
                        vibes
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-base text-foreground">No people found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Try searching with another name or username keyword.
              </p>
            </div>
          )
        ) : activeTab === "media" ? (
          /* Media Gallery Grid Tab */
          posts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {posts.map((post) => {
                if (!post.imageUrl) return null;
                let postTime = "";
                try {
                  postTime = formatDistanceToNowStrict(new Date(post.createdAt), {
                    addSuffix: true,
                  });
                } catch {
                  postTime = format(new Date(post.createdAt), "MMM dd");
                }

                return (
                  <div
                    key={post.id}
                    onClick={() =>
                      setSelectedImage({
                        src: post.imageUrl!,
                        alt: post.content || "Vibe media",
                        author: {
                          name: post.author.name,
                          username: post.author.username,
                          photo: post.author.photo || "/user-placeholder.png",
                        },
                        time: postTime,
                      })
                    }
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-border/60 bg-muted/20 cursor-zoom-in hover:border-primary/40 transition-colors"
                  >
                    <Image
                      src={post.imageUrl}
                      alt={post.content || "Media"}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-end">
                        <span className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div className="text-white text-xs">
                        <p className="font-semibold truncate">@{post.author.username}</p>
                        {post.content && (
                          <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                            {post.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-base text-foreground">No media found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                No vibes with photos or media match your search.
              </p>
            </div>
          )
        ) : (
          /* Trending & Latest Post Streams */
          posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => {
                const isLiked = post.likes.some(
                  (l) => l.authorId === session?.user?.id
                );

                return (
                  <PostCard
                    key={post.id}
                    post={post as unknown as React.ComponentProps<typeof PostCard>["post"]}
                    isLiked={isLiked}
                    comments={post.comments as unknown as React.ComponentProps<typeof PostCard>["comments"]}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-3">
                <SearchX className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-base text-foreground">No vibes found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {searchQuery || activeTag
                  ? "Try searching with different keywords or explore trending hashtags."
                  : "Be the first to create a vibe and spark the conversation!"}
              </p>
            </div>
          )
        )}
      </div>

      {/* Lightbox for Media Tab */}
      {selectedImage && (
        <ImageLightbox
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          src={selectedImage.src}
          alt={selectedImage.alt}
          author={selectedImage.author}
          time={selectedImage.time}
        />
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
