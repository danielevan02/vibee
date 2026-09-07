"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useReveal } from "./motion-presets";
import { Sparkles, MessageCircle, Heart, Check, Compass, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeaturesBento() {
  const [selectedFrequency, setSelectedFrequency] = useState("Philosophy");
  const [likedThread, setLikedThread] = useState(false);

  const { container, item, whenInView } = useReveal({ y: 16, stagger: 0.1, duration: 0.65 });

  const frequencies = ["Philosophy", "Slow Living", "Analog Tech", "Poetry"];

  return (
    <section id="why-vibee" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-[1240px] mx-auto">
        {/* Section Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>How Vibee Works</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-normal tracking-tight text-foreground leading-[1.15]">
            Three steps between you and{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              genuine connection.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
            No algorithmic hurdles. No vanity metrics. Just authentic human resonance in an unhurried digital sanctuary.
          </p>
        </div>

        {/* 3 Steps Classical Painting Cards */}
        <motion.div
          {...whenInView}
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* ========================================================= */}
          {/* STEP 1: Speak Without Performance */}
          {/* ========================================================= */}
          <motion.div
            variants={item}
            className="group rounded-3xl border border-border/70 bg-card/70 dark:bg-card/40 p-3 sm:p-4 flex flex-col justify-between hover:border-primary/30 transition-colors duration-300"
          >
            <div>
              {/* Classical Oil Painting Header */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 border border-border/50">
                <Image
                  src="/paintings/card-cottage.jpg"
                  alt="Impressionist painting of open handwritten journal with fountain pen, glasses, and coffee"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Floating pill in painting */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 dark:bg-black/75 backdrop-blur-md text-[11px] font-medium text-foreground">
                    <PenTool className="w-3 h-3 text-blue-500" />
                    <span>Raw Musings</span>
                  </span>
                  <span className="text-[10px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    0 Anxiety
                  </span>
                </div>
              </div>

              {/* Card Meta & Content */}
              <div className="px-2 pb-2">
                <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-1.5 block">
                  Step 01
                </span>
                <h3 className="font-serif text-2xl font-normal tracking-tight text-foreground mb-2.5">
                  Speak Without Performance
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  No public follower counts hanging over your head. Post unfiltered musings, half-baked ideas, or personal essays without performing for an algorithm.
                </p>
              </div>
            </div>

            {/* Interactive Feature Demo */}
            <div className="mt-2 p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs">
              <div className="flex items-center justify-between text-muted-foreground text-[11px] mb-1.5 font-medium">
                <span>Metrics on Vibee:</span>
                <span className="text-blue-600 dark:text-sky-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Hidden by default
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Focus on the substance of words rather than counting likes.
              </p>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* STEP 2: Curate by Frequency */}
          {/* ========================================================= */}
          <motion.div
            variants={item}
            className="group rounded-3xl border border-border/70 bg-card/70 dark:bg-card/40 p-3 sm:p-4 flex flex-col justify-between hover:border-primary/30 transition-colors duration-300"
          >
            <div>
              {/* Classical Oil Painting Header */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 border border-border/50">
                <Image
                  src="/paintings/card-meadow.jpg"
                  alt="Impressionist painting of vinyl turntable, art books, headphones, and camera"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Floating pill in painting */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 dark:bg-black/75 backdrop-blur-md text-[11px] font-medium text-foreground">
                    <Compass className="w-3 h-3 text-amber-500" />
                    <span>Curated Passions</span>
                  </span>
                  <span className="text-[10px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    Clean Feed
                  </span>
                </div>
              </div>

              {/* Card Meta & Content */}
              <div className="px-2 pb-2">
                <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-1.5 block">
                  Step 02
                </span>
                <h3 className="font-serif text-2xl font-normal tracking-tight text-foreground mb-2.5">
                  Curate by Frequency
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Tune into channels organized by mood and curiosity. Discover thoughtful minds discussing art, architecture, and quiet philosophy instead of trending outrage.
                </p>
              </div>
            </div>

            {/* Interactive Frequency Selector */}
            <div className="mt-2 p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs">
              <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                Tap to tune frequency:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {frequencies.map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setSelectedFrequency(freq)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                      selectedFrequency === freq ? "bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white font-semibold" : "bg-background/80 hover:bg-blue-500/10 hover:text-foreground text-muted-foreground",
                    )}
                  >
                    #{freq}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* STEP 3: Unhurried Conversations */}
          {/* ========================================================= */}
          <motion.div
            variants={item}
            className="group rounded-3xl border border-border/70 bg-card/70 dark:bg-card/40 p-3 sm:p-4 flex flex-col justify-between hover:border-primary/30 transition-colors duration-300"
          >
            <div>
              {/* Classical Oil Painting Header */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 border border-border/50">
                <Image
                  src="/paintings/card-lake.jpg"
                  alt="Impressionist painting of two friends engaged in meaningful conversation at an outdoor cafe"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Floating pill in painting */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 dark:bg-black/75 backdrop-blur-md text-[11px] font-medium text-foreground">
                    <MessageCircle className="w-3 h-3 text-sky-500" />
                    <span>Unhurried Talks</span>
                  </span>
                  <span className="text-[10px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    No Bots
                  </span>
                </div>
              </div>

              {/* Card Meta & Content */}
              <div className="px-2 pb-2">
                <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-1.5 block">
                  Step 03
                </span>
                <h3 className="font-serif text-2xl font-normal tracking-tight text-foreground mb-2.5">
                  Unhurried Conversations
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Replies are built for depth, not speed. Exchange long-form perspectives and thoughtful recommendations that remain valuable for months.
                </p>
              </div>
            </div>

            {/* Interactive Mini Discussion Card */}
            <div className="mt-2 p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white font-bold text-[9px] flex items-center justify-center">
                    A
                  </div>
                  <span className="font-semibold text-foreground text-[11px]">@alex_v</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLikedThread(!likedThread)}
                  className={cn(
                    "flex items-center gap-1 text-[11px] transition-colors",
                    likedThread ? "text-rose-500 font-semibold" : "text-muted-foreground hover:text-rose-500",
                  )}
                >
                  <Heart className={cn("w-3 h-3", likedThread ? "fill-rose-500" : "")} />
                  <span>{likedThread ? 12 : 11}</span>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground italic">
                &ldquo;This is the first app where replies read like handwritten postcards.&rdquo;
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
