import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/db";
import type { User } from "@/db/schema";

/**
 * Resolve the signed-in user, or null when there is no valid session.
 *
 * Callers return an `unauthorized` result rather than throwing, so an expired
 * session surfaces as a normal failure instead of a 500.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return prisma.user.findUnique({ where: { id: session.user.id } });
}

/**
 * Same as {@link getCurrentUser} but only the id, for the common case where a
 * mutation just needs to scope or authorise a write.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}
