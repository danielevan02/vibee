"use server";

"use server";

import { prisma } from "@/db";
import { onAuthenticateUser } from "@/server/data/user";
import { revalidatePath } from "next/cache";

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
