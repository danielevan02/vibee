import { onAuthenticateUser } from "@/actions/user.action";
import HomeFeedStream from "@/components/dashboard/home-feed-stream";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { user } = await onAuthenticateUser();
  if (!user) {
    return redirect("/sign-in");
  }

  const resolvedParams = await searchParams;
  const initialTab = resolvedParams.tab === "trending" ? "trending" : "chronological";

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-16">
      <HomeFeedStream user={user} initialTab={initialTab} />
    </div>
  );
}