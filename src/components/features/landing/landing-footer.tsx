"use client";

import Link from "next/link";
import { useHydrated } from "@/hooks/use-hydrated";
import Image from "next/image";
import { useTheme } from "next-themes";

import { Heart } from "lucide-react";

export default function LandingFooter() {
  const { theme } = useTheme();
  const mounted = useHydrated();

  return (
    <footer className="border-t border-border/60 bg-background pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-border/50">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 relative">
                {mounted ? (
                  <Image
                    src={theme === "dark" ? "/white-logo.png" : "/black-logo.png"}
                    alt="VIBEE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src="/black-logo.png"
                    alt="VIBEE"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <span className="font-serif font-normal text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                VIBEE
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed font-normal">
              A quiet sanctuary for unfiltered thoughts, slow conversations, and genuine human resonance. No algorithms. No ads.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />
              <span>Sanctuary online • Kyoto & Worldwide</span>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider font-mono">
              Explore
            </p>
            <ul className="space-y-2.5 text-muted-foreground text-xs sm:text-sm font-normal">
              <li>
                <a href="#feed-spotlight" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  Feed Spotlight
                </a>
              </li>
              <li>
                <a href="#why-vibee" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  Three Steps
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  Voices
                </a>
              </li>
              <li>
                <Link href="/home" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  Browse as Guest
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Join */}
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider font-mono">
              Community
            </p>
            <ul className="space-y-2.5 text-muted-foreground text-xs sm:text-sm font-normal">
              <li>
                <Link href="/sign-in" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-blue-600 dark:text-sky-400 hover:underline transition-colors font-semibold">
                  Join Vibee →
                </Link>
              </li>
              <li>
                <Link href="/home" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">
                  Live Feed
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Philosophy */}
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider font-mono">
              Philosophy
            </p>
            <ul className="space-y-2.5 text-muted-foreground text-xs sm:text-sm font-normal">
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Chronological Manifesto
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Terms of Resonance
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()}{" "}
            <span className="font-serif font-normal">VIBEE</span>. Designed with{" "}
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> by{" "}
            <span className="font-medium text-foreground">Daniel Evan</span>
          </p>

          <p className="text-muted-foreground font-mono text-[11px]">
            Classical Impressionism meets Minimalist Microblogging.
          </p>
        </div>

        {/* Leedlime-style Panoramic Oil Painting Canvas at the very footer bottom */}
        <div className="mt-10 rounded-2xl overflow-hidden relative h-28 sm:h-40 border border-border/70 group">
          <Image
            src="/paintings/panoramic-landscape.jpg"
            alt="Impressionist oil painting of a sunlit creative library salon"
            fill
            sizes="(max-width: 1240px) 100vw, 1240px"
            className="object-cover object-bottom transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </footer>
  );
}
