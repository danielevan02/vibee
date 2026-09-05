"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import ThemeButton from "@/components/navbar/theme-button";
import { Button } from "@/components/ui/button";

/**
 * Scroll-reactive shell around the minimalist editorial navbar.
 * At top: aligns with max-w-[1240px] page frame.
 * On scroll: smoothly morphs into a focused floating pill (max-w-4xl) with frosted glass.
 */
function NavShell({ children, drawer }: { children: ReactNode; drawer: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();

  // Smooth GPU-composited surface opacity
  const surfaceOpacity = useTransform(scrollY, [10, 50], [0, 1], { clamp: true });

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 25 && !scrolled) {
      setScrolled(true);
    } else if (latest <= 25 && scrolled) {
      setScrolled(false);
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.scrollY > 25) {
      setScrolled(true);
    }
  }, []);

  return (
    <div
      className={`mx-auto transition-[max-width,padding] duration-500 ease-out px-4 sm:px-6 pointer-events-auto ${
        scrolled ? "max-w-4xl pt-3 sm:pt-4" : "max-w-[1240px] pt-4 sm:pt-6"
      }`}
    >
      {/* Floating Bar Container */}
      <div
        className={`relative flex items-center justify-between rounded-full transition-[height,padding] duration-500 ease-out ${
          scrolled ? "h-14 sm:h-16 px-4 sm:px-6" : "h-16 sm:h-20 px-2 sm:px-4"
        }`}
      >
        {/* Frosted Glass Surface Layer on Scroll */}
        <motion.div
          aria-hidden="true"
          style={{
            opacity: surfaceOpacity,
            willChange: "opacity",
            backdropFilter: "blur(18px) saturate(180%)",
            WebkitBackdropFilter: "blur(18px) saturate(180%)",
          }}
          className="absolute inset-0 rounded-full pointer-events-none bg-background/85 dark:bg-[#0c0d10]/85 border border-border/80 dark:border-white/10"
        />

        {/* Subtle Top Rim Hairline */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: surfaceOpacity, willChange: "opacity" }}
          className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-border dark:via-white/20 to-transparent pointer-events-none rounded-full"
        />

        {children}
      </div>

      {drawer}
    </div>
  );
}

export default function LandingNavbar() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [entered, setEntered] = useState(false);

  // Hover pill geometry, measured from the link that was actually hovered.
  // One element that never unmounts beats a shared `layoutId` here: layoutId
  // morphs boxes with scaleX/scaleY, which distorts the border radius and the
  // 1px border whenever the links differ in width.
  const [pill, setPill] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [pillVisible, setPillVisible] = useState(false);
  const pillPlaced = useRef(false);

  // The first placement must not animate in from x:0/width:0.
  const instant = !pillPlaced.current;

  useEffect(() => {
    if (pill) pillPlaced.current = true;
  }, [pill]);

  const movePillTo = (el: HTMLElement) => {
    // `offsetLeft`/`offsetTop` resolve against <nav>, which is `relative`.
    setPill({
      x: el.offsetLeft,
      y: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
    setPillVisible(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: "Feed", href: "#feed-spotlight" },
    { label: "How It Works", href: "#why-vibee" },
    { label: "Community", href: "#community" },
  ];

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => setEntered(true)}
      style={entered ? { transform: "none" } : undefined}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <NavShell
        drawer={
          /* Mobile Animated Editorial Drawer */
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="sm:hidden mt-2 p-5 rounded-3xl border border-border/80 bg-background/95 dark:bg-card/95 backdrop-blur-2xl space-y-4"
              >
                <div className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="pt-3 border-t border-border/40 flex flex-col gap-2.5">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-medium rounded-xl border border-border/70 hover:bg-muted transition-colors text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button className="w-full rounded-full py-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm">
                      Join Vibee
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        }
      >
        {/* ========================================================= */}
        {/* Left: Artistic Serif Wordmark & Logo */}
        {/* ========================================================= */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.25 }}
            className="relative w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center shrink-0"
          >
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
          </motion.div>

          <span className="font-serif font-normal text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            VIBEE
          </span>
        </Link>

        {/* ========================================================= */}
        {/* Center: Minimalist Desktop Nav Links with Subtle Pill Hover */}
        {/* ========================================================= */}
        <nav
          onMouseLeave={() => setPillVisible(false)}
          className="relative z-10 hidden md:flex items-center gap-1 rounded-full px-3 py-1.5 bg-muted/30 border border-border/40 backdrop-blur-md"
        >
          {/* Single hover pill: mounted once, moved by animating its own box.
              Geometry is a spring, opacity a short tween, so it slides between
              links and fades on enter/leave without ever being rebuilt. */}
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{
              x: pill?.x ?? 0,
              y: pill?.y ?? 0,
              width: pill?.width ?? 0,
              height: pill?.height ?? 0,
              opacity: pillVisible ? 1 : 0,
            }}
            transition={{
              x: instant ? { duration: 0 } : { type: "spring", stiffness: 450, damping: 34 },
              y: instant ? { duration: 0 } : { type: "spring", stiffness: 450, damping: 34 },
              width: instant ? { duration: 0 } : { type: "spring", stiffness: 450, damping: 34 },
              height: instant ? { duration: 0 } : { type: "spring", stiffness: 450, damping: 34 },
              opacity: { duration: 0.18, ease: "easeOut" },
            }}
            className="absolute top-0 left-0 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/25 pointer-events-none"
          />

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={(e) => movePillTo(e.currentTarget)}
              onFocus={(e) => movePillTo(e.currentTarget)}
              className="relative px-3.5 py-1 text-xs lg:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ========================================================= */}
        {/* Right: High-Contrast Minimalist Actions & Theme Toggle */}
        {/* ========================================================= */}
        <div className="relative z-10 hidden sm:flex items-center gap-2.5">
          <ThemeButton />
          <Link
            href="/sign-in"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors"
          >
            Sign In
          </Link>
          <Link href="/sign-up">
            <Button
              size="sm"
              className="relative overflow-hidden group rounded-full px-5 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Join Vibee</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="relative z-10 flex sm:hidden items-center gap-1.5">
          <ThemeButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-foreground/80 hover:bg-muted transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </NavShell>
    </motion.header>
  );
}
