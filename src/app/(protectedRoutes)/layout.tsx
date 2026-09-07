import { getCurrentUser, getSuggestedUsers } from "@/server/data/user";
import { getTrendingTopics } from "@/server/data/explore";
import { getUnreadNotificationCount } from "@/server/data/notification";
import AppSidebar from "@/components/features/shell/app-sidebar";
import AppRightRail from "@/components/features/shell/app-right-rail";
import Link from "next/link";
import ThemeButton from "@/components/features/shell/theme-button";
import UserMenu from "@/components/features/auth/user-menu";
import { redirect } from "next/navigation";
import BrandLogo from "@/components/features/shell/brand-logo";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // The shell's data is fetched here, once, on the server. Previously the
  // sidebar and the rail each fetched their own on mount, so every navigation
  // showed empty rails and fired three extra round-trips.
  const [unreadCount, suggestedUsers, trendingTopics] = await Promise.all([
    getUnreadNotificationCount(user.id),
    getSuggestedUsers(user.id, 4),
    getTrendingTopics(4),
  ]);

  return (
    // `overflow-clip` rather than `overflow-hidden`: hidden still creates a
    // scroll container, so the browser can silently scroll this shell to reveal
    // a newly focused element (reply box, emoji search, mention textarea). With
    // no scrollbar and no way to scroll back, the rails stayed offset until a
    // reload. `clip` creates no scroll container at all.
    <div className="relative h-screen max-h-screen overflow-clip bg-background text-foreground flex flex-col md:flex-row justify-center selection:bg-primary/20 selection:text-primary">

      {/* Mobile Top Header (Screens < md) */}
      <header className="md:hidden sticky top-0 z-30 h-16 border-b border-border/60 bg-background/85 dark:bg-card/85 backdrop-blur-xl px-4 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo size={28} priority />
          <span className="font-serif font-normal text-xl sm:text-2xl tracking-tight text-foreground">
            VIBEE
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <ThemeButton />
          <UserMenu user={user} compact side="bottom" />
        </div>
      </header>

      {/* Section 1 (Kiri): Persistent Left Sidebar (Fixed / Non-scrolling) */}
      <AppSidebar user={user} unreadCount={unreadCount} />

      {/* Section 2 (Tengah): Central Content Canvas (THE ONLY SCROLLABLE COLUMN) */}
      <main className="flex-1 w-full max-w-2xl h-screen max-h-screen overflow-y-auto subtle-scrollbar flex flex-col border-r border-border/60 bg-background/40">
        {children}
      </main>

      {/* Section 3 (Kanan): Right Rail */}
      <AppRightRail suggestedUsers={suggestedUsers} trendingTopics={trendingTopics} />

      {/* Progressive bottom blur removed as requested */}
    </div>
  );
}