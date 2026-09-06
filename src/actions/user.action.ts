"use server";

import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function onAuthenticateUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        status: 403,
        user: null,
      };
    }

    const existUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!existUser) {
      return {
        status: 404,
        user: null,
      };
    }

    return {
      status: 200,
      user: existUser,
    };
  } catch (error) {
    if ((error as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("onAuthenticateUser error:", error);
    return {
      status: 500,
      message: "Internal Server Error",
      user: null,
    };
  }
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

export async function updateUserProfile(data: {
  name?: string;
  bio?: string;
  website?: string;
  location?: string;
}) {
  try {
    const { user } = await onAuthenticateUser();
    if (!user) {
      return { status: 401, message: "Unauthorized" };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name?.trim() || user.name,
        bio: data.bio !== undefined ? data.bio.trim() : user.bio,
        website: data.website !== undefined ? data.website.trim() : user.website,
        location: data.location !== undefined ? data.location.trim() : user.location,
      },
    });

    revalidatePath(`/profile/${user.username}`);
    revalidatePath("/home");

    return {
      status: 200,
      message: "Profile updated successfully!",
      user: updated,
    };
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return {
      status: 500,
      message: "Failed to update profile",
    };
  }
}

export async function toggleFollowUser(targetUserId: string) {
  try {
    const { user } = await onAuthenticateUser();
    if (!user) {
      return { status: 401, message: "Unauthorized" };
    }

    if (user.id === targetUserId) {
      return { status: 400, message: "You cannot follow yourself" };
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId,
        },
      },
    });

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: targetUserId,
          },
        },
      });
      isFollowing = false;

      // Clean up unread follow notification
      await prisma.notification.deleteMany({
        where: {
          type: "FOLLOW",
          senderId: user.id,
          recipientId: targetUserId,
          read: false,
        },
      });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: targetUserId,
        },
      });
      isFollowing = true;

      // Create notification
      await prisma.notification.create({
        data: {
          type: "FOLLOW",
          content: "started following you",
          recipientId: targetUserId,
          senderId: user.id,
        },
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { username: true },
    });

    if (targetUser) {
      revalidatePath(`/profile/${targetUser.username}`);
    }
    revalidatePath("/notifications");

    return {
      status: 200,
      isFollowing,
      message: isFollowing ? "Followed!" : "Unfollowed",
    };
  } catch (error) {
    console.error("toggleFollowUser error:", error);
    return {
      status: 500,
      message: "Failed to toggle follow status",
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