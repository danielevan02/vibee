/**
 * Read-side data access for notification.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
"use server";

import { prisma } from "@/db";
import { onAuthenticateUser } from "@/server/data/user";

export async function getNotifications(filterType?: string) {
  try {
    const { user } = await onAuthenticateUser();
    if (!user) {
      return {
        status: 401,
        message: "Unauthorized",
        notifications: [],
      };
    }

    const whereClause: {
      recipientId: string;
      type?: string;
    } = {
      recipientId: user.id,
    };

    if (filterType && filterType !== "all") {
      if (filterType === "mentions") whereClause.type = "MENTION";
      else if (filterType === "likes") whereClause.type = "LIKE";
      else if (filterType === "comments") whereClause.type = "COMMENT";
      else if (filterType === "follows") whereClause.type = "FOLLOW";
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            photo: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return {
      status: 200,
      notifications,
    };
  } catch (error) {
    console.error("getNotifications error:", error);
    return {
      status: 500,
      message: "Internal Server Error",
      notifications: [],
    };
  }
}

export async function getUnreadNotificationCount() {
  try {
    const { user } = await onAuthenticateUser();
    if (!user) return 0;

    const count = await prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error("getUnreadNotificationCount error:", error);
    return 0;
  }
}
