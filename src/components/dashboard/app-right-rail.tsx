"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle2, ArrowRight, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSuggestedUsers, toggleFollowUser } from "@/actions/user.action";
import { getTrendingTopics } from "@/actions/explore.action";
import { toast } from "sonner";

interface RealSuggestedUser {
  id: string;
  name: string;
  username: string;
  photo: string | null;
  bio: string | null;
  isFollowing?: boolean;
}

interface RealTrendingTopic {
  tag: string;
  count: number;
  posts: string;
}

export default function AppRightRail() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState<RealSuggestedUser[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<RealTrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRailData() {
      try {
        const [usersRes, topicsRes] = await Promise.all([
          getSuggestedUsers(4),
          getTrendingTopics(4),
        ]);

        if (isMounted) {
          if (usersRes.status === 200 && usersRes.users) {
            setSuggestedUsers(usersRes.users);
          }
          if (topicsRes.status === 200 && topicsRes.topics) {
            setTrendingTopics(topicsRes.topics);
          }
        }
      } catch (err) {
        console.error("Failed to load right rail data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRailData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFollowToggle = async (targetUser: RealSuggestedUser) => {
    try {
      const res = await toggleFollowUser(targetUser.id);
      if (res.status === 200) {
        setSuggestedUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? { ...u, isFollowing: res.isFollowing }
              : u
          )
        );
        toast.success(
          res.isFollowing
            ? `Followed @${targetUser.username}`
            : `Unfollowed @${targetUser.username}`
        );
      }
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <aside className="hidden xl:flex flex-col gap-5 w-80 2xl:w-96 p-6 h-screen sticky top-0 overflow-y-auto subtle-scrollbar border-l border-border/60 bg-background/30 shrink-0">
      {/* Search Input - hidden when already on Explore page */}
      {!pathname.startsWith("/explore") && (
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search vibes, topics, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border/70 bg-card/60 dark:bg-card/30 backdrop-blur-xl text-xs sm:text-sm font-normal placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 transition-colors duration-200"
          />
        </form>
      )}

      {/* Trending Topics Widget */}
      <div className="rounded-3xl border border-border/70 bg-card/60 dark:bg-card/30 backdrop-blur-xl p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Trending
          </h3>
          {!pathname.startsWith("/explore") && (
            <Link
              href="/explore"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
            >
              <span>All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-4 flex justify-center text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : trendingTopics.length > 0 ? (
          <div className="space-y-2 text-xs">
            {trendingTopics.map((topic) => (
              <div
                key={topic.tag}
                onClick={() =>
                  router.push(`/explore?tag=${encodeURIComponent(topic.tag)}`)
                }
                className="-mx-2 px-2 py-2 rounded-xl hover:bg-foreground/[0.04] transition-colors duration-200 cursor-pointer flex items-baseline justify-between gap-3"
              >
                <p className="font-normal text-foreground text-xs sm:text-sm truncate">
                  #{topic.tag}
                </p>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground shrink-0">
                  {topic.posts}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-muted-foreground">
            <p>No active topics yet.</p>
            <p className="text-[11px] text-muted-foreground/75 mt-0.5">
              Include <span className="text-foreground font-medium">#hashtags</span> in your posts to start a trend!
            </p>
          </div>
        )}
      </div>

      {/* Community Voices Widget */}
      <div className="rounded-3xl border border-border/70 bg-card/60 dark:bg-card/30 backdrop-blur-xl p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Voices to Follow
          </h3>
          <Link
            href="/explore?tab=people"
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            All
          </Link>
        </div>

        {loading ? (
          <div className="py-4 flex justify-center text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : suggestedUsers.length > 0 ? (
          <div className="space-y-3">
            {suggestedUsers.map((person) => (
              <div
                key={person.id}
                className="flex items-start justify-between gap-3 -mx-2 px-2 py-1.5 rounded-xl hover:bg-foreground/[0.04] transition-colors duration-200"
              >
                <Link
                  href={`/profile/${person.username}`}
                  className="flex items-start gap-2.5 min-w-0 group/p flex-1"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border/70 shrink-0 mt-0.5">
                    <Image
                      src={person.photo || "/user-placeholder.png"}
                      alt={person.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-medium text-foreground truncate group-hover/p:underline">
                        {person.name}
                      </p>
                      <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      @{person.username}
                    </p>
                    {person.bio && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                        {person.bio}
                      </p>
                    )}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => handleFollowToggle(person)}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors duration-200 cursor-pointer flex items-center gap-1 ${
                    person.isFollowing
                      ? "border border-border/80 bg-transparent text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      : "bg-foreground text-background hover:bg-foreground/90 border-0"
                  }`}
                >
                  {person.isFollowing ? (
                    <>
                      <UserCheck className="w-3 h-3" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-muted-foreground">
            <p>No other users yet.</p>
            <p className="text-[11px] text-muted-foreground/75 mt-0.5">
              Invite friends to join Vibee!
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
