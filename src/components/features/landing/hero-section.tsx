"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useReveal } from "./motion-presets";
import {
  ArrowRight,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HeroSection() {
  const [dummyText, setDummyText] = useState("");
  const [postedVibe, setPostedVibe] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(24);
  const [hasLiked, setHasLiked] = useState(false);

  const { container, item, onMount } = useReveal({ y: 20, stagger: 0.08, duration: 0.7 });

  const handlePostDummyVibe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dummyText.trim()) {
      toast.info("Type a thought or select a mood pill above! 🌿");
      return;
    }
    setPostedVibe(dummyText);
    toast.success("Vibe published in preview mode! Claim your handle to join live 🎉");
  };

  return (
    <section className="relative pt-28 sm:pt-36 md:pt-40 pb-16 md:pb-24 overflow-hidden">
      {/* Subtle Editorial Grid Backdrop */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          {...onMount}
          variants={container}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
        >
          {/* ========================================================= */}
          {/* LEFT COLUMN: Editorial Literary Typography & Value Pitch */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start text-left">
            {/* Subtle Eyebrow Badge */}
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-medium mb-6 tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold text-foreground">A quiet sanctuary</span>
              <span className="text-muted-foreground">• Built for human connection</span>
            </motion.div>

            {/* Main Editorial Serif Heading */}
            <motion.h1
              variants={item}
              className="font-serif text-4xl sm:text-6xl xl:text-[4.25rem] font-normal tracking-tight text-foreground leading-[1.08] mb-6"
            >
              Stop fighting the algorithm. <br />
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent italic font-normal">
                Start sharing
              </span>{" "}
              real thoughts.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-8 font-normal"
            >
              Say goodbye to manufactured outrage and manipulative dopamine casinos.
              Vibee is a calm, chronological sanctuary where raw musings, thoughtful essays,
              and genuine human conversations flourish naturally.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10"
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-sm sm:text-base font-semibold rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-[color,background-color,border-color,transform] duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Join Vibee — It&apos;s free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#feed-spotlight">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 text-sm sm:text-base font-medium rounded-full border border-blue-500/30 dark:border-blue-400/20 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-blue-700 dark:text-sky-300 transition-colors"
                >
                  Explore Feed Spotlight ↓
                </Button>
              </a>
            </motion.div>

            {/* Trust Assurances */}
            <motion.div
              variants={item}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>100% Chronological</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Zero Commercial Noise</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Free Forever</span>
              </div>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Impressionist Oil Painting Canvas with Floating Glass Card */}
          {/* ========================================================= */}
          <motion.div
            variants={item}
            className="lg:col-span-6 xl:col-span-5 relative w-full"
          >
            {/* Artistic Outer Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-muted/20 group">
              {/* Classical Oil Painting Backdrop */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] w-full overflow-hidden">
                <Image
                  src="/paintings/hero-landscape.jpg"
                  alt="Impressionist painting of a person writing authentic thoughts in a journal by a sunlit window with coffee"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="object-cover object-center transform transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Soft Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 pointer-events-none" />

                {/* Top Badge on Canvas */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 dark:bg-black/70 backdrop-blur-md border border-white/20 text-xs font-medium text-foreground">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                    <span>Live community frequency</span>
                  </div>
                  <span className="text-[11px] font-mono text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    420 online
                  </span>
                </div>

                {/* Floating Frosted Glass Interactive Card */}
                <div className="absolute inset-x-3 sm:inset-x-5 bottom-3 sm:bottom-5">
                  <div className="rounded-2xl p-4 sm:p-5 bg-background/90 dark:bg-card/90 backdrop-blur-xl border border-white/30 dark:border-white/10 text-card-foreground">
                    {/* Author Row */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-background">
                          MR
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            Maya Rostova
                            <span className="text-[11px] font-normal text-muted-foreground">@maya</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">Kyoto, Japan • 3m ago</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20">
                        🌿 Quiet Vibe
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs sm:text-sm text-foreground/90 font-normal leading-relaxed mb-3">
                      &ldquo;Closed the algorithmic feeds today and sat by the open window with morning coffee.
                      Writing without performing for an audience feels like breathing fresh air again.&rdquo;
                    </p>

                    {/* Interactive Post Actions */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-border/50 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => {
                            setHasLiked(!hasLiked);
                            setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1));
                          }}
                          className={cn(
                            "flex items-center gap-1.5 transition-colors py-1 px-2 rounded-md hover:bg-muted",
                            hasLiked ? "text-rose-500 font-medium" : "hover:text-rose-500",
                          )}
                        >
                          <Heart className={cn("w-3.5 h-3.5", hasLiked ? "fill-rose-500 text-rose-500" : "")} />
                          <span>{likeCount}</span>
                        </button>
                        <span className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>8</span>
                        </span>
                        <span className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
                          <Share2 className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <Link href="/sign-up">
                        <span className="text-[11px] font-medium text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1">
                          Join conversation →
                        </span>
                      </Link>
                    </div>

                    {/* Optional Inline Micro-Composer to try dropping a thought */}
                    <div className="mt-3 pt-3 border-t border-border/40">
                      <form onSubmit={handlePostDummyVibe} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={dummyText}
                          onChange={(e) => setDummyText(e.target.value.slice(0, 140))}
                          placeholder="Drop a calm thought..."
                          className="flex-1 bg-muted/50 rounded-full px-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="submit"
                          className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white flex items-center justify-center hover:opacity-90 transition-transform active:scale-95 shrink-0"
                          title="Share"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </form>

                      {/* Display dummy posted vibe */}
                      <AnimatePresence>
                        {postedVibe && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="text-[11px] bg-primary/10 border border-primary/20 rounded-xl p-2 text-foreground flex items-center justify-between"
                          >
                            <span className="truncate pr-2">Your vibe: &ldquo;{postedVibe}&rdquo;</span>
                            <Link href="/sign-up" className="font-semibold text-primary shrink-0 hover:underline">
                              Claim @handle
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
