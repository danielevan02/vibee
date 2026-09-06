"use client";

import Link from "next/link";
import { useHydrated } from "@/hooks/use-hydrated";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import UserMenu from "@/components/features/auth/user-menu";
import {
  Home,
  Compass,
  Bell,
  User,
  Plus,
  Bookmark,
} from "lucide-react";
import ThemeButton from "@/components/features/shell/theme-button";
import { Button } from "@/components/ui/button";
import { getUnreadNotificationCount } from "@/server/data/notification";

interface AppSidebarProps {
  user?: {
    id: string;
    username: string | null;
    name: string | null;
    photo: string | null;
  } | null;
  onOpenCompose?: () => void;
}

export default function AppSidebar({ user, onOpenCompose }: AppSidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const mounted = useHydrated();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isCancelled = false;
    getUnreadNotificationCount()
      .then((count) => {
        if (!isCancelled) {
          setUnreadCount(count);
        }
      })
      .catch((err) => {
        console.error("Failed to load unread notifications count:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [pathname]);

  const profileHref = user?.username ? `/profile/${user.username}` : "/profile";
  const isProfileActive = pathname.startsWith("/profile");

  const navItems = [
    {
      label: "Home",
      href: "/home",
      icon: Home,
      isActive: pathname === "/home",
    },
    {
      label: "Explore",
      href: "/explore",
      icon: Compass,
      isActive: pathname === "/explore",
    },
    {
      label: "Saved",
      href: "/bookmarks",
      icon: Bookmark,
      isActive: pathname === "/bookmarks",
    },
    {
      label: "Alerts",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
      isActive: pathname === "/notifications",
    },
    {
      label: "Profile",
      href: profileHref,
      icon: User,
      isActive: isProfileActive,
    },
  ];

  const mobileNavItems = [
    navItems[0], // Home
    navItems[1], // Explore
    { label: "New", icon: Plus, isAction: true, href: undefined, isActive: false, badge: undefined },
    navItems[2], // Saved
    navItems[3], // Alerts
  ] as Array<{
    label: string;
    icon: typeof Plus;
    href?: string;
    isActive?: boolean;
    badge?: string;
    isAction?: boolean;
  }>;

  return (
    <>
      {/* Desktop & Tablet Sidebar (Persistent Left) */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 overflow-y-auto overscroll-contain subtle-scrollbar p-4 lg:p-6 border-r border-border/50 bg-card/20 backdrop-blur-xl shrink-0 z-30">
        <div className="space-y-6">
          {/* Logo & Brand Header */}
          <Link href="/" className="flex items-center gap-3 px-2 group">
            <div className="w-8 h-8 relative transition-transform group-hover:scale-105">
              {mounted ? (
                <Image
                  src={theme === "dark" ? "/white-logo.png" : "/black-logo.png"}
                  alt="VIBEE"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  priority
                />
              ) : (
                <Image
                  src="/black-logo.png"
                  alt="VIBEE"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  priority
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-normal text-xl sm:text-2xl tracking-tight text-foreground">
                VIBEE
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground -mt-0.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-foreground/40" />
                Sanctuary
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-normal transition-colors duration-200 ${
                    item.isActive
                      ? "bg-foreground/5 text-foreground border border-border/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-foreground text-background">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* New Vibe Primary Action Button */}
          <div className="pt-2">
            <Button
              onClick={onOpenCompose}
              className="w-full h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium text-sm transition-transform duration-200 active:scale-[0.98] flex items-center justify-center gap-2 border-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Vibe</span>
            </Button>
          </div>
        </div>

        {/* User Capsule & Controls Footer */}
        <div className="pt-4 border-t border-border/40 space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md">
            <Link
              href={profileHref}
              className="flex items-center gap-2.5 min-w-0 group/u flex-1"
            >
              <div className="truncate">
                <p className="text-xs font-medium truncate leading-tight text-foreground group-hover/u:underline">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  @{user?.username || "viber"}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-1.5">
              <ThemeButton />
              <UserMenu user={user} compact side="top" />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Screens < md).
          Built from the same navItems as the sidebar so the two can never drift
          apart again. Profile is reached from the mobile header's UserMenu,
          which also holds sign-out, so this bar stays at five slots. */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 border-t border-border/60 bg-background/90 dark:bg-card/90 backdrop-blur-2xl px-2 flex items-center z-40">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          // Every icon sits in the same 24px box, so the labels stay on one
          // baseline whether the slot holds a bare icon or the filled circle.
          const glyph = (
            <span
              className={`h-6 flex items-center justify-center ${
                item.isAction
                  ? "w-6 rounded-full bg-foreground text-background"
                  : "w-6"
              }`}
            >
              <Icon
                className={item.isAction ? "w-3.5 h-3.5" : "w-5 h-5"}
                strokeWidth={1.75}
              />
            </span>
          );

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={onOpenCompose}
                aria-label="Compose a new vibe"
                className="flex-1 flex flex-col items-center gap-1 text-foreground"
              >
                {glyph}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              className={`relative flex-1 flex flex-col items-center gap-1 transition-colors duration-200 ${
                item.isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {glyph}
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute top-0 right-1/2 translate-x-3 w-1.5 h-1.5 rounded-full bg-foreground" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
