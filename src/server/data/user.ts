/**
 * Read-side data access for user.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
"use server";

import { prisma } from "@/db";
import { getCurrentUser } from "@/server/session";

export async function onAuthenticateUser() {
  const user = await getCurrentUser();
  return { status: user ? 200 : 403, user };
}

export async function searchMentionUsers(query: string) {
  try {
    const cleanQuery = query.replace(/^@/, "").trim();
    const users = await prisma.user.findMany({
      where: cleanQuery
        ? {
            OR: [
              { username: { contains: cleanQuery, mode: "insensitive" } },
              { name: { contains: cleanQuery, mode: "insensitive" } },
            ],
          }
        : undefined,
      take: 6,
      select: {
        id: true,
        name: true,
        username: true,
        photo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { status: 200, users };
  } catch (error) {
    console.error("searchMentionUsers error:", error);
    return { status: 500, users: [] };
  }
}

export async function getUserProfile(username: string) {
  try {
    const { user: currentUserAuth } = await onAuthenticateUser();

    const targetUser = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!targetUser) {
      return {
        status: 404,
        message: "User not found",
        user: null,
      };
    }

    // Calculate total likes received across all posts
    const userPosts = await prisma.post.findMany({
      where: { authorId: targetUser.id },
      select: {
        _count: {
          select: { likes: true },
        },
      },
    });

    const totalLikesReceived = userPosts.reduce(
      (acc, curr) => acc + curr._count.likes,
      0
    );

    // Check if current logged-in user is following this user
    let isFollowing = false;
    if (currentUserAuth && currentUserAuth.id !== targetUser.id) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserAuth.id,
            followingId: targetUser.id,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    const isOwnProfile = currentUserAuth?.id === targetUser.id;

    return {
      status: 200,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
        photo: targetUser.photo,
        bio: targetUser.bio,
        website: targetUser.website,
        location: targetUser.location,
        coverImage: targetUser.coverImage,
        createdAt: targetUser.createdAt,
        stats: {
          posts: targetUser._count.posts,
          comments: targetUser._count.comments,
          followers: targetUser._count.followers,
          following: targetUser._count.following,
          likesReceived: totalLikesReceived,
        },
      },
      isFollowing,
      isOwnProfile,
    };
  } catch (error) {
    console.error("getUserProfile error:", error);
    return {
      status: 500,
      message: "Internal Server Error",
      user: null,
    };
  }
}

export async function getUserPosts(
  username: string,
  tab: "vibes" | "replies" | "media" | "likes" | "bookmarks" = "vibes"
) {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      return { status: 404, posts: [], replies: [] };
    }

    if (tab === "replies") {
      const comments = await prisma.comment.findMany({
        where: { authorId: targetUser.id },
        include: {
          author: true,
          post: {
            include: {
              author: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      return { status: 200, replies: comments, posts: [] };
    }

    if (tab === "bookmarks") {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: targetUser.id },
        include: {
          post: {
            include: {
              author: true,
              _count: {
                select: {
                  comments: true,
                  likes: true,
                },
              },
              comments: {
                where: { parentId: null },
                include: {
                  author: true,
                  replies: {
                    include: { author: true },
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
              bookmarks: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      const posts = bookmarks.map((b) => b.post);
      return { status: 200, posts, replies: [] };
    }

    if (tab === "likes") {
      const likedPosts = await prisma.like.findMany({
        where: { authorId: targetUser.id },
        include: {
          post: {
            include: {
              author: true,
              _count: {
                select: {
                  comments: true,
                  likes: true,
                },
              },
              comments: {
                where: { parentId: null },
                include: {
                  author: true,
                  replies: {
                    include: { author: true },
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
              bookmarks: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      const posts = likedPosts.map((l) => l.post);
      return { status: 200, posts, replies: [] };
    }

    // Default: 'vibes' or 'media'
    const whereClause: {
      authorId: string;
      imageUrl?: { not: null };
    } = {
      authorId: targetUser.id,
    };

    if (tab === "media") {
      whereClause.imageUrl = { not: null };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        comments: {
          include: {
            author: true,
          },
        },
        likes: {
          select: {
            authorId: true,
          },
        },
        bookmarks: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

    return { status: 200, posts, replies: [] };
  } catch (error) {
    console.error("getUserPosts error:", error);
    return { status: 500, posts: [], replies: [] };
  }
}

export async function getSuggestedUsers(limit = 4) {
  try {
    const { user: currentUserAuth } = await onAuthenticateUser();

    const users = await prisma.user.findMany({
      where: currentUserAuth ? { id: { not: currentUserAuth.id } } : undefined,
      take: limit,
      orderBy: [
        { followers: { _count: "desc" } },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        name: true,
        username: true,
        photo: true,
        bio: true,
      },
    });

    let followingIds = new Set<string>();
    if (currentUserAuth) {
      const follows = await prisma.follow.findMany({
        where: { followerId: currentUserAuth.id },
        select: { followingId: true },
      });
      followingIds = new Set(follows.map((f) => f.followingId));
    }

    return {
      status: 200,
      users: users.map((u) => ({
        ...u,
        isFollowing: followingIds.has(u.id),
      })),
    };
  } catch (error) {
    console.error("getSuggestedUsers error:", error);
    return { status: 500, users: [] };
  }
}
