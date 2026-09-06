"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useReveal } from "./motion-presets";
import { Feather } from "lucide-react";

export default function TestimonialsSection() {
  const { container, item, whenInView } = useReveal({ y: 16, stagger: 0.08, duration: 0.6 });

  const secondaryQuotes = [
    {
      author: "Marcus Vance",
      handle: "@marcus_v",
      role: "Architect & Essayist",
      quote:
        "Vibee feels like the internet of the early 2000s, but with modern craft. I don't feel hurried or evaluated.",
    },
    {
      author: "Chloe Martin",
      handle: "@chloemartin",
      role: "Analog Photographer",
      quote:
        "No sponsored video ads autoplaying every two scrolls. You forget how peaceful social media can be.",
    },
    {
      author: "Kenji Sato",
      handle: "@kenji_code",
      role: "Indie Engineer",
      quote:
        "When I write a thought here, people read it. No engagement loops or algorithmic shadow tricks.",
    },
  ];

  return (
    <section id="community" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative border-t border-border/60">
      <div className="max-w-[1240px] mx-auto">
        {/* Literary Pull Quote Hero (Signature Leedlime Design) */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-blue-500/25 bg-blue-500/5 text-blue-600 dark:text-sky-400 text-xs font-mono uppercase tracking-widest mb-6">
            <Feather className="w-3.5 h-3.5 text-blue-500" />
            <span>Community Voice</span>
          </div>

          <blockquote className="font-serif text-2xl sm:text-4xl lg:text-[2.65rem] font-normal text-foreground leading-[1.28] tracking-tight mb-8">
            &ldquo;Every other social platform became an anxiety casino designed to harvest our attention.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              Vibee feels like sitting on a quiet porch with friends at golden hour.
            </span>
            &rdquo;
          </blockquote>

          {/* Author with Classical Painted Avatar */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500/30 mb-3 ring-2 ring-blue-500/10">
              <Image
                src="/paintings/portrait-avatar.jpg"
                alt="Elena Rostova oil painting portrait"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <cite className="not-italic font-semibold text-foreground text-sm">
              Elena Rostova
            </cite>
            <span className="text-xs text-muted-foreground mt-0.5">
              Author & Cultural Essayist • Kyoto
            </span>
          </div>
        </div>

        {/* 3 Supporting Editorial Quotes */}
        <motion.div
          {...whenInView}
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border/60"
        >
          {secondaryQuotes.map((q, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="p-6 rounded-2xl bg-card/40 border border-border/60 hover:border-blue-500/30 flex flex-col justify-between transition-colors duration-300"
            >
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-5 font-normal">
                &ldquo;{q.quote}&rdquo;
              </p>
              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-foreground block">{q.author}</span>
                  <span className="text-muted-foreground text-[11px]">{q.role}</span>
                </div>
                <span className="text-blue-600/80 dark:text-sky-400/80 font-mono text-[11px] font-medium">{q.handle}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
