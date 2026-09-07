"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useReveal } from "./motion-presets";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Sparkles,
  Coffee,
  Check,
  Clock,
  ShieldCheck,
  EyeOff,
  Feather,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AppPreview() {
  const { container, item, whenInView } = useReveal({ y: 16, stagger: 0.08, duration: 0.6 });

  // Post 1 interaction states
  const [post1Liked, setPost1Liked] = useState(false);
  const [post1Likes, setPost1Likes] = useState(142);
  const [post1Saved, setPost1Saved] = useState(false);
  const [post1ShowReplies, setPost1ShowReplies] = useState(false);

  // Post 2 interaction states
  const [post2Liked, setPost2Liked] = useState(true);
  const [post2Likes, setPost2Likes] = useState(389);
  const [post2Saved, setPost2Saved] = useState(false);

  // Follow states
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({
    clara: false,
    kenji: true,
  });

  const toggleFollow = (username: string) => {
    setFollowedUsers((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  const togglePost1Like = () => {
    if (post1Liked) {
      setPost1Liked(false);
      setPost1Likes((prev) => prev - 1);
    } else {
      setPost1Liked(true);
      setPost1Likes((prev) => prev + 1);
    }
  };

  const togglePost2Like = () => {
    if (post2Liked) {
      setPost2Liked(false);
      setPost2Likes((prev) => prev - 1);
    } else {
      setPost2Liked(true);
      setPost2Likes((prev) => prev + 1);
    }
  };

  const features = [
    {
      icon: Clock,
      title: "Chronological Feed",
      description: "Every post appears in natural order of time. No shadow demotions or hidden algorithmic weights.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Sponsored Ads",
      description: "No corporate promotions cluttering your screen or interruptions selling you crypto gadgets.",
    },
    {
      icon: EyeOff,
      title: "Zero Behavioral Tracking",
      description: "We never sell your attention, trace your location, or build psychological dossiers to exploit.",
    },
    {
      icon: Feather,
      title: "Calm Editorial Aesthetics",
      description: "Typography and whitespace tuned for deep reading, sustained attention, and artistic clarity.",
    },
    {
      icon: Zap,
      title: "Instant Thought Drops",
      description: "Share spontaneous observations, morning journals, and poetic reflections with a single tap.",
    },
    {
      icon: Globe,
      title: "Open Community Channels",
      description: "Gather around organic clubs dedicated to cinema, philosophy, analog gear, and slow life.",
    },
  ];

  return (
    <section id="feed-spotlight" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Interactive Showcase</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-normal tracking-tight text-foreground leading-[1.15]">
            Everything you need to experience{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              social harmony.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
            Interact directly with the live feed canvas below. Experience what social media feels like when it respects your sanity.
          </p>
        </div>

        {/* ========================================================= */}
        {/* PANORAMIC ART CANVAS SHOWCASE */}
        {/* ========================================================= */}
        <div className="relative rounded-3xl overflow-hidden border border-border/80 p-4 sm:p-8 lg:p-12 mb-16">
          {/* Panoramic Impressionist Oil Painting Backdrop */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/paintings/panoramic-landscape.jpg"
              alt="Panoramic impressionist painting of a sunlit creative library salon and reading community"
              fill
              sizes="(max-width: 1240px) 100vw, 1240px"
              className="object-cover object-center"
            />
            {/* Subtle Dappled Shadow & Blur for Readability */}
            <div className="absolute inset-0 bg-background/40 dark:bg-black/55 backdrop-blur-[3px]" />
          </div>

          {/* Floating Central Social Timeline Application */}
          <motion.div
            {...whenInView}
            variants={container}
            className="relative z-10 max-w-3xl mx-auto space-y-5"
          >
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-background/90 dark:bg-card/90 backdrop-blur-xl border border-white/30 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                <span className="ml-2 font-mono text-xs text-muted-foreground hidden sm:inline">
                  vibee.app/feed/chronological
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Feed</span>
              </div>
            </div>

            {/* Post 1 */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border/80 bg-background/95 dark:bg-card/95 backdrop-blur-xl p-5 sm:p-6 text-card-foreground"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 text-white font-bold flex items-center justify-center text-sm">
                    AR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground text-sm sm:text-base">
                        Aria Rostova
                      </span>
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        @aria_creates
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">8 minutes ago • Chronological</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={followedUsers.clara ? "outline" : "default"}
                  onClick={() => toggleFollow("clara")}
                  className={
                    followedUsers.clara
                      ? "h-7 px-3 text-xs rounded-full border-border/80 text-muted-foreground"
                      : "h-7 px-3 text-xs rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium border-0"
                  }
                >
                  {followedUsers.clara ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-blue-500" /> Following
                    </span>
                  ) : (
                    "Follow"
                  )}
                </Button>
              </div>

              <div className="mt-4 text-sm sm:text-base text-foreground/90 leading-relaxed font-normal">
                Social media is so much better when there isn&apos;t an algorithm screaming in your face trying to make you outraged every 3 seconds.
                <br /><br />
                Just clean thoughts, good conversations, and finding people on your exact wavelength. That&apos;s all we ever needed. ✨
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-border/40 text-muted-foreground text-xs sm:text-sm">
                <div className="flex items-center gap-5 sm:gap-7">
                  <button
                    type="button"
                    onClick={togglePost1Like}
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      post1Liked ? "text-rose-500 font-semibold" : "hover:text-rose-500",
                    )}
                  >
                    <Heart
                      className={cn("w-4 h-4", post1Liked ? "fill-rose-500 scale-110" : "")}
                    />
                    <span>{post1Likes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPost1ShowReplies(!post1ShowReplies)}
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      post1ShowReplies ? "text-primary font-semibold" : "hover:text-primary",
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>2 replies</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPost1Saved(!post1Saved)}
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      post1Saved ? "text-amber-500 font-semibold" : "hover:text-amber-500",
                    )}
                  >
                    <Bookmark
                      className={cn("w-4 h-4", post1Saved ? "fill-amber-500" : "")}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPost1ShowReplies(!post1ShowReplies)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {post1ShowReplies ? "Hide thread" : "View thread ↓"}
                </button>
              </div>

              {/* Collapsible Replies */}
              <AnimatePresence>
                {post1ShowReplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-3 pt-3 border-t border-border/30 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5 pl-3 border-l-2 border-primary/40">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[10px]">
                        MK
                      </div>
                      <div className="flex-1 bg-muted/40 p-2.5 rounded-xl text-xs">
                        <span className="font-semibold text-foreground">@maboroshi</span>
                        <p className="mt-0.5 text-muted-foreground">
                          Hard agree! The calm timeline feels like breathing fresh mountain air.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 pl-3 border-l-2 border-primary/40">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
                        JL
                      </div>
                      <div className="flex-1 bg-muted/40 p-2.5 rounded-xl text-xs">
                        <span className="font-semibold text-foreground">@joshualee</span>
                        <p className="mt-0.5 text-muted-foreground">
                          And zero sponsored ads every 3 posts is genuinely life-changing.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Post 2 */}
            <motion.div
              variants={item}
              className="rounded-2xl border border-border/80 bg-background/95 dark:bg-card/95 backdrop-blur-xl p-5 sm:p-6 text-card-foreground"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white font-bold flex items-center justify-center text-sm">
                    TK
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground text-sm sm:text-base">
                        Taka Kuroda
                      </span>
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        @takaphoto
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">35m ago • Kyoto</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                  <Coffee className="w-3 h-3" /> Kyoto Morning
                </span>
              </div>

              <p className="mt-4 text-sm sm:text-base text-foreground/90 leading-relaxed font-normal">
                Rainy dawn in Gion. Wet stone alleyways, gentle lantern glow, and black drip coffee before anyone else is awake. ☕🌧️
              </p>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-border/40 text-muted-foreground text-xs sm:text-sm">
                <div className="flex items-center gap-5 sm:gap-7">
                  <button
                    type="button"
                    onClick={togglePost2Like}
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      post2Liked ? "text-rose-500 font-semibold" : "hover:text-rose-500",
                    )}
                  >
                    <Heart
                      className={cn("w-4 h-4", post2Liked ? "fill-rose-500 scale-110" : "")}
                    />
                    <span>{post2Likes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.info("Sign in to join the discussion!")}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>24</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPost2Saved(!post2Saved)}
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      post2Saved ? "text-amber-500 font-semibold" : "hover:text-amber-500",
                    )}
                  >
                    <Bookmark
                      className={cn("w-4 h-4", post2Saved ? "fill-amber-500" : "")}
                    />
                  </button>
                </div>

                <Link href="/sign-up">
                  <span className="text-xs font-semibold text-primary hover:underline">
                    Claim your handle →
                  </span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* 6-CARD MINIMALIST EDITORIAL FEATURE GRID (Like Leedlime) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl border border-border/70 bg-card/50 hover:bg-card/90 transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-sky-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-xl font-normal text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
