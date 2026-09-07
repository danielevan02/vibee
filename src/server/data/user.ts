/**
 * Read-side data access for user.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
import "server-only";

import { prisma } from "@/db";
import { attachFollowState, viewerPostInclude } from "@/server/data/post";
import { getCurrentUser } from "@/server/session";

export { getCurrentUser };


export async function getUserProfile(username: string, currentUserId: string | null) {
  try {

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

    if (!targetUser) return null;

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
    if (currentUserId && currentUserId !== targetUser.id) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUser.id,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    const isOwnProfile = currentUserId === targetUser.id;

    return {
      profile: {
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
    console.error("getUserProfile:", error);
    return null;
  }
}

/** Both failure paths return this, so they cannot drift apart. */
const EMPTY_TAB = { posts: [], replies: [] } as const;

export async function getUserPosts(
  username: string,
  viewerId: string,
  tab: "vibes" | "replies" | "media" | "likes" | "bookmarks" = "vibes"
) {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) return EMPTY_TAB;

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
      return { posts: [], replies: comments };
    }

    if (tab === "bookmarks") {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: targetUser.id },
        include: {
          post: { include: viewerPostInclude(viewerId) },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      const posts = await attachFollowState(
        bookmarks.map((b) => b.post),
        viewerId,
      );
      return { posts, replies: [] };
    }

    if (tab === "likes") {
      const likedPosts = await prisma.like.findMany({
        where: { authorId: targetUser.id },
        include: {
          post: { include: viewerPostInclude(viewerId) },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      const posts = await attachFollowState(
        likedPosts.map((l) => l.post),
        viewerId,
      );
      return { posts, replies: [] };
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

    const found = await prisma.post.findMany({
      where: whereClause,
      include: viewerPostInclude(viewerId),
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

    const posts = await attachFollowState(found, viewerId);

    return { posts, replies: [] };
  } catch (error) {
    console.error("getUserPosts:", error);
    return EMPTY_TAB;
  }
}

/**
 * How many accounts the viewer follows.
 *
 * The home page uses it to decide whether the following feed is worth opening
 * on, so a brand new account does not land on an empty timeline.
 */
export async function getFollowingCount(userId: string) {
  return prisma.follow.count({ where: { followerId: userId } });
}

export async function getSuggestedUsers(currentUserId: string | null, limit = 4) {
  const users = await prisma.user.findMany({
    where: currentUserId ? { id: { not: currentUserId } } : undefined,
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
  if (currentUserId) {
  const follows = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });
  followingIds = new Set(follows.map((f) => f.followingId));
  }

  return users.map((u) => ({ ...u, isFollowing: followingIds.has(u.id) }));
}
