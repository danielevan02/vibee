/**
 * Read-side data access for notification.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
import "server-only";

import { prisma } from "@/db";

export async function getNotifications(userId: string, filterType?: string) {
  const whereClause: {
    recipientId: string;
    type?: string;
  } = {
    recipientId: userId,
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

  return notifications;
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { recipientId: userId, read: false },
  });
}
