/**
 * Read-side data access for explore.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
import "server-only";

import type { ExplorePost, ExploreUser } from "@/types/explore";

import { prisma } from "@/db";



export async function getExploreData({
  currentUserId,
  query,
  tag,
  tab = "trending",
}: {
  currentUserId: string | null;
  query?: string;
  tag?: string;
  tab?: "trending" | "latest" | "people" | "media";
}) {

    // 1. If tab is 'people', search users
    if (tab === "people") {
      const searchTerm = (query || tag || "").replace(/^#/, "").trim();

      const users = await prisma.user.findMany({
        where: searchTerm
          ? {
              OR: [
                { username: { contains: searchTerm, mode: "insensitive" } },
                { name: { contains: searchTerm, mode: "insensitive" } },
                { bio: { contains: searchTerm, mode: "insensitive" } },
              ],
            }
          : undefined,
        include: {
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
      });

      // Check following status
      let followingIds = new Set<string>();
      if (currentUserId) {
        const follows = await prisma.follow.findMany({
          where: { followerId: currentUserId },
          select: { followingId: true },
        });
        followingIds = new Set(follows.map((f) => f.followingId));
      }

      const formattedUsers: ExploreUser[] = users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        photo: u.photo,
        bio: u.bio,
        _count: u._count,
        isFollowing: followingIds.has(u.id),
      }));

      return { posts: [] as ExplorePost[], users: formattedUsers };
    }

    // 2. Otherwise query posts
    const effectiveSearch = (tag || query || "").trim();

    const whereClause: {
      content?: { contains: string; mode: "insensitive" };
      imageUrl?: { not: null };
    } = {};

    if (effectiveSearch) {
      whereClause.content = {
        contains: effectiveSearch,
        mode: "insensitive",
      };
    }

    if (tab === "media") {
      whereClause.imageUrl = { not: null };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            photo: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        comments: {
          where: { parentId: null },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                photo: true,
              },
            },
            replies: {
              include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  photo: true,
                },
              },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        likes: {
          select: {
            authorId: true,
          },
        },
      },
      orderBy:
        tab === "trending"
          ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
          : { createdAt: "desc" },
      take: 40,
    });

  return { posts: posts as unknown as ExplorePost[], users: [] as ExploreUser[] };
}

export async function getTrendingTopics(limit = 6) {
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: "#",
        },
      },
      select: {
        content: true,
      },
      take: 200,
    });

    const tagCounts: Record<string, number> = {};
    for (const post of posts) {
      if (!post.content) continue;
      const matches = post.content.match(/#[a-zA-Z0-9_]+/g);
      if (matches) {
        const uniqueTags = new Set(matches.map((m) => m.replace(/^#+/, "").toLowerCase()));
        for (const tag of uniqueTags) {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }
      }
    }

    const sortedTopics = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({
        tag,
        count,
        posts: `${count} ${count === 1 ? "vibe" : "vibes"}`,
      }));

  return sortedTopics;
}
