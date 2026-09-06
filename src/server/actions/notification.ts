"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/db";
import { getCurrentUserId } from "@/server/session";
import type { ActionResult } from "@/types/action";

const notificationIdSchema = z.uuid();

function revalidateNotificationViews() {
  revalidatePath("/notifications");
  revalidatePath("/home");
}

export async function markNotificationsAsRead(): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  try {
    await prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    });

    revalidateNotificationViews();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("markNotificationsAsRead:", error);
    return { ok: false, error: "unknown" };
  }
}

export async function markSingleNotificationAsRead(
  notificationId: string,
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = notificationIdSchema.safeParse(notificationId);
  if (!parsed.success) return { ok: false, error: "validation" };

  try {
    // Scoping by recipientId is the authorisation: another user's id simply
    // matches no rows rather than updating someone else's notification.
    await prisma.notification.updateMany({
      where: { id: parsed.data, recipientId: userId },
      data: { read: true },
    });

    revalidateNotificationViews();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("markSingleNotificationAsRead:", error);
    return { ok: false, error: "unknown" };
  }
}

export async function deleteNotification(
  notificationId: string,
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = notificationIdSchema.safeParse(notificationId);
  if (!parsed.success) return { ok: false, error: "validation" };

  try {
    const { count } = await prisma.notification.deleteMany({
      where: { id: parsed.data, recipientId: userId },
    });

    if (count === 0) return { ok: false, error: "not_found" };

    revalidateNotificationViews();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("deleteNotification:", error);
    return { ok: false, error: "unknown" };
  }
}
