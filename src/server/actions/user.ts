"use server";

import { prisma } from "@/db";
import { updateProfileSchema, userIdSchema, type UpdateProfileInput } from "@/lib/validations/user";
import { getCurrentUser } from "@/server/session";
import type { ActionResult } from "@/types/action";
import type { User } from "@/db/schema";
import { onAuthenticateUser } from "@/server/data/user";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(
  input: UpdateProfileInput,
): Promise<ActionResult<User>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "validation" };
  const data = parsed.data;

  try {

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

    return { ok: true, data: updated };
  } catch (error) {
    console.error("updateUserProfile:", error);
    return { ok: false, error: "unknown" };
  }
}

export async function toggleFollowUser(
  targetUserId: string,
): Promise<ActionResult<{ isFollowing: boolean }>> {
  const parsedTarget = userIdSchema.safeParse(targetUserId);
  if (!parsedTarget.success) return { ok: false, error: "validation" };

  try {
    const { user } = await onAuthenticateUser();
    if (!user) {
      return { ok: false, error: "unauthorized" };
    }

    if (user.id === targetUserId) {
      return { ok: false, error: "validation" };
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

    return { ok: true, data: { isFollowing } };
  } catch (error) {
    console.error("toggleFollowUser:", error);
    return { ok: false, error: "unknown" };
  }
}
