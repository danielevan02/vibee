"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { User, Bookmark, LogOut, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface UserMenuProps {
  user?: {
    id?: string;
    name?: string | null;
    username?: string | null;
    photo?: string | null;
    image?: string | null;
    email?: string | null;
  } | null;
  compact?: boolean;
  side?: "top" | "bottom" | "auto";
}

export default function UserMenu({
  user: initialUser,
  compact = false,
  side = "auto",
}: UserMenuProps) {
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (!isOpen && dropdownRef.current) {
      if (side === "top") {
        setOpenUpwards(true);
      } else if (side === "bottom") {
        setOpenUpwards(false);
      } else {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpwards(spaceBelow < 260);
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Combine server user prop with reactive client session
  const sessionUser = session?.user as Record<string, unknown> | undefined;
  const sessionUsername = typeof sessionUser?.username === "string" ? sessionUser.username : null;

  const currentUser = {
    name: session?.user?.name || initialUser?.name || "Viber",
    username: sessionUsername || initialUser?.username || "viber",
    email: session?.user?.email || initialUser?.email || "",
    avatar: session?.user?.image || initialUser?.image || initialUser?.photo || "/user-placeholder.png",
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      await authClient.signOut();
      toast.success("Signed out successfully");
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
      setLoggingOut(false);
    }
  };

  const initials = (currentUser.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="group flex items-center gap-2.5 p-1 rounded-full hover:bg-accent/60 transition-[color,background-color,border-color,box-shadow] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border/80 group-hover:border-primary/50 transition-colors bg-muted flex items-center justify-center">
          {currentUser.avatar && currentUser.avatar !== "/user-placeholder.png" ? (
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              fill
              sizes="36px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-xs font-bold text-primary">{initials}</span>
          )}
        </div>

        {!compact && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 ${
            openUpwards ? "bottom-full mb-2.5" : "top-full mt-2.5"
          } w-60 rounded-2xl bg-popover dark:bg-card text-popover-foreground border border-border ring-1 ring-black/5 dark:ring-white/10 p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150`}
        >
          {/* User Details Header */}
          <div className="px-3 py-2.5 rounded-xl bg-accent/40 mb-1 border border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border/80 shrink-0 bg-muted flex items-center justify-center">
                {currentUser.avatar && currentUser.avatar !== "/user-placeholder.png" ? (
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{currentUser.username}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <Link
              href={`/profile/${currentUser.username}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <User className="w-4 h-4 text-primary" />
              <span>Your Profile</span>
            </Link>

            <Link
              href="/bookmarks"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-primary" />
              <span>Saved Bookmarks</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="my-1.5 h-[1px] bg-border/40" />

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
