"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, Feather, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ContrastQuietSection() {
  const [composerText, setComposerText] = useState("");
  const [activeMood, setActiveMood] = useState("Quiet Reflection");
  const [previewPost, setPreviewPost] = useState<string | null>(null);
  const [likes, setLikes] = useState(7);
  const [liked, setLiked] = useState(false);

  const moodPresets = [
    { label: "Quiet Reflection", prefix: "Sitting with the thought that " },
    { label: "Poetic Musings", prefix: "In the gentle spaces between hours, " },
    { label: "Morning Stillness", prefix: "Coffee in hand, noticing " },
    { label: "Late Night Realization", prefix: "Past midnight, it becomes clear that " },
  ];

  const handleSelectPreset = (preset: (typeof moodPresets)[0]) => {
    setActiveMood(preset.label);
    if (!composerText.startsWith(preset.prefix)) {
      setComposerText(preset.prefix);
    }
  };

  const handlePostPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) {
      toast.info("Type a brief thought to see the quiet composer in action! 🌿");
      return;
    }
    setPreviewPost(composerText);
    toast.success("Quiet vibe published in preview! Join Vibee to share with the sanctuary.");
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto">
        {/* The Midnight Sapphire Container Block (Vibee Signature White & Blue Aesthetic) */}
        <div className="relative rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-[#071226] via-[#0d214d] to-[#060e1f] text-white p-6 sm:p-12 lg:p-16 overflow-hidden border border-blue-400/25">
          {/* Luminous Ambient Sapphire Radial Glow */}
          <div
            className="absolute top-0 right-1/4 w-[500px] h-[500px] pointer-events-none -z-0 opacity-40"
            style={{
              background: "radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] pointer-events-none -z-0 opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto text-center mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-xs font-mono uppercase tracking-widest text-sky-300 mb-4">
              <Feather className="w-3.5 h-3.5 text-sky-400" />
              Philosophy
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.12] mb-5 text-white">
              Built for humans, <br />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent italic font-normal">
                not dopamine algorithms.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-sky-100/75 leading-relaxed font-light">
              Traditional social feeds are engineered like gambling machines to provoke distress and maximize advertising impressions.
              Vibee is built from opposite values: calm pacing, intentional sharing, and room to think.
            </p>
          </div>

          {/* Interactive Calm Composer Inside the Sapphire Sanctuary Block */}
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-blue-400/20 p-5 sm:p-7 text-white">
              {/* Top Greeting */}
              <div className="flex items-center justify-between mb-4 text-xs text-sky-200/80">
                <span className="flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                  Good day. What feels true to you right now?
                </span>
                <span className="font-mono text-[10px] text-sky-300/50">Unhurried</span>
              </div>

              {/* Mood Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {moodPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      activeMood === preset.label
                        ? "bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white font-semibold border border-sky-400/40"
                        : "bg-white/10 hover:bg-blue-500/20 text-white/80 border border-white/10"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Text Input Form */}
              <form onSubmit={handlePostPreview} className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value.slice(0, 280))}
                    placeholder="Write without editing yourself for an audience..."
                    className="w-full bg-[#050b18]/70 rounded-2xl p-3.5 text-sm text-white placeholder:text-sky-200/30 border border-blue-400/20 focus:outline-none focus:ring-2 focus:ring-sky-400/50 resize-none font-normal"
                  />
                  <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-sky-300/50">
                    {composerText.length}/280
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-sky-200/60">
                    Chronological distribution only
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-full px-5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs gap-1.5 border-0 transition-transform active:scale-95"
                  >
                    <Send className="w-3 h-3" />
                    Drop Vibe
                  </Button>
                </div>
              </form>

              {/* Preview Result */}
              <AnimatePresence>
                {previewPost && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                            YOU
                          </div>
                          <span className="font-semibold text-white">@your_mind</span>
                          <span className="text-sky-200/50 text-[10px]">• Just now</span>
                        </div>
                        <span className="text-[10px] text-sky-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3 text-sky-400" /> Live preview
                        </span>
                      </div>

                      <p className="text-white/90 text-sm pl-8 font-light italic mb-3">
                        &ldquo;{previewPost}&rdquo;
                      </p>

                      <div className="flex items-center justify-between pl-8 pt-2 border-t border-white/10 text-sky-200/70">
                        <button
                          type="button"
                          onClick={() => {
                            setLiked(!liked);
                            setLikes(liked ? likes - 1 : likes + 1);
                          }}
                          className={`flex items-center gap-1.5 transition-colors ${
                            liked ? "text-rose-400 font-semibold" : "hover:text-rose-400"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-400" : ""}`} />
                          <span>{likes}</span>
                        </button>
                        <Link href="/sign-up">
                          <span className="text-xs text-sky-300 hover:text-white font-medium hover:underline flex items-center gap-1">
                            Claim your permanent handle →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
