"use server";

import { prisma } from "@/lib/prisma";
import { onAuthenticateUser } from "./user.action";
import { revalidatePath } from "next/cache";

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

export async function markNotificationsAsRead() {
  try {
    const { user } = await onAuthenticateUser();
    if (!user) return { status: 401 };

    await prisma.notification.updateMany({
      where: {
        recipientId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    revalidatePath("/notifications");
    revalidatePath("/home");

    return { status: 200, success: true };
  } catch (error) {
    console.error("markNotificationsAsRead error:", error);
    return { status: 500 };
  }
}

export async function markSingleNotificationAsRead(notificationId: string) {
  try {
    const { user } = await onAuthenticateUser();
    if (!user) return { status: 401 };

    await prisma.notification.update({
      where: {
        id: notificationId,
        recipientId: user.id,
      },
      data: {
        read: true,
      },
    });

    revalidatePath("/notifications");
    return { status: 200, success: true };
  } catch (error) {
    console.error("markSingleNotificationAsRead error:", error);
    return { status: 500 };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const { user } = await onAuthenticateUser();
    if (!user) return { status: 401, message: "Unauthorized" };

    await prisma.notification.delete({
      where: {
        id: notificationId,
        recipientId: user.id,
      },
    });

    revalidatePath("/notifications");
    return { status: 200, success: true, message: "Notification deleted" };
  } catch (error) {
    console.error("deleteNotification error:", error);
    return { status: 500, message: "Failed to delete notification" };
  }
}
