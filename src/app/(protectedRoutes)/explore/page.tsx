import { redirect } from "next/navigation";

import ExploreView from "@/components/features/explore/explore-view";
import { getExploreData, getTrendingTopics } from "@/server/data/explore";
import { getCurrentUserId } from "@/server/session";

type TabType = "trending" | "latest" | "people" | "media";
const TABS: TabType[] = ["trending", "latest", "people", "media"];

/**
 * Server Component. Search, tag and tab all come from the URL, so every explore
 * state is a real, shareable address that renders complete on the server.
 */
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; tab?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");

  const { q = "", tag = "", tab: rawTab } = await searchParams;
  const tab = (TABS as string[]).includes(rawTab ?? "")
    ? (rawTab as TabType)
    : "trending";

  const [data, trendingTags] = await Promise.all([
    getExploreData({ currentUserId: userId, query: q || undefined, tag: tag || undefined, tab }),
    getTrendingTopics(8),
  ]);

  return (
    <ExploreView
      key={`${q}|${tag}|${tab}`}
      initialPosts={data.posts}
      initialUsers={data.users}
      trendingTags={trendingTags}
      query={q}
      tag={tag}
      tab={tab}
    />
  );
}
