"use server";

"use server";

import { prisma } from "@/db";
import { onAuthenticateUser } from "@/server/data/user";
import { revalidatePath } from "next/cache";

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
