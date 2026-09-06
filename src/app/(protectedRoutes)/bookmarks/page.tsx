import { redirect } from "next/navigation";

import BookmarkList from "@/components/features/bookmark/bookmark-list";
import { getUserBookmarks } from "@/server/data/bookmark";
import { getCurrentUserId } from "@/server/session";

/**
 * Server Component: the saved posts are fetched during the render on the
 * server, so the HTML arrives complete. Nothing here needs the browser, so
 * nothing here ships to it.
 */
export default async function BookmarksPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");

  const posts = await getUserBookmarks(userId, 0, 30);

  return <BookmarkList posts={posts} />;
}
