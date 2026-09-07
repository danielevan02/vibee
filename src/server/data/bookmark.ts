/**
 * Read-side data access for bookmark.
 *
 * Plain async functions, deliberately NOT "use server": Server Components call
 * these directly in-process, so there is no POST round-trip and Next.js can
 * cache and stream them. Only mutations belong in server/actions.
 */
import "server-only";

import { prisma } from "@/db";
import { attachFollowState, viewerPostInclude } from "@/server/data/post";

/**
 * Bookmarked posts for one user, newest first.
 *
 * The caller passes the id rather than the function resolving the session, so
 * this stays a pure query - easy to reason about, and callable from anywhere
 * that already knows who is asking.
 */
export async function getUserBookmarks(userId: string, skip = 0, take = 20) {
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
    },
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: { include: viewerPostInclude(userId) },
    },
  });

  return attachFollowState(
    bookmarks.map((b) => b.post),
    userId,
  );
}
