"use server";

import { prisma } from "@/lib/prisma";
import { onAuthenticateUser } from "./user.action";

export interface ExplorePost {
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
  likes: {
    authorId: string;
  }[];
}

export interface ExploreUser {
  id: string;
  name: string;
  username: string;
  photo: string | null;
  bio: string | null;
  _count: {
    followers: number;
    posts: number;
  };
  isFollowing?: boolean;
}

export async function getExploreData({
  query,
  tag,
  tab = "trending",
}: {
  query?: string;
  tag?: string;
  tab?: "trending" | "latest" | "people" | "media";
}) {
  try {
    const { user: currentUserAuth } = await onAuthenticateUser();

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
      if (currentUserAuth) {
        const follows = await prisma.follow.findMany({
          where: { followerId: currentUserAuth.id },
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

      return {
        status: 200,
        posts: [],
        users: formattedUsers,
      };
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

    return {
      status: 200,
      posts: posts as unknown as ExplorePost[],
      users: [],
    };
  } catch (error) {
    console.error("getExploreData error:", error);
    return {
      status: 500,
      message: "Internal Server Error",
      posts: [],
      users: [],
    };
  }
}

export async function getTrendingTopics(limit = 6) {
  try {
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

    return {
      status: 200,
      topics: sortedTopics,
    };
  } catch (error) {
    console.error("getTrendingTopics error:", error);
    return { status: 500, topics: [] };
  }
}
