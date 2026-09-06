import NotificationFeed, {
  type FilterType,
} from "@/components/features/notification/notification-feed";
import { getNotifications } from "@/server/data/notification";
import { getCurrentUserId } from "@/server/session";
import { redirect } from "next/navigation";

const FILTERS: FilterType[] = ["all", "mentions", "likes", "comments", "follows"];

/**
 * Server Component. The filter comes from the URL, so switching tabs re-renders
 * on the server with the right data instead of refetching from the browser.
 */
export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");

  const { filter: raw } = await searchParams;
  const filter = (FILTERS as string[]).includes(raw ?? "")
    ? (raw as FilterType)
    : "all";

  const notifications = await getNotifications(userId, filter);

  return (
    // `key` remounts the island when the filter changes, which is React's own
    // answer to "reset state when a prop changes" - no effect, no cascade.
    <NotificationFeed
      key={filter}
      initialNotifications={notifications as never}
      filter={filter}
    />
  );
}
