"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ImagePlus,
  Loader2,
  X,
  SendHorizontal,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ImageLightbox from "@/components/ui/image-lightbox";
import { User } from "@/db/schema";
import { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { createPost } from "@/server/actions/post";
import { toast } from "sonner";
import { ACTION_ERROR_MESSAGE } from "@/types/action";
import { AnimatePresence, motion } from "motion/react";
import { usePost } from "@/lib/stores";
import { MAX_POST_IMAGES, POST_CHAR_LIMIT } from "@/config/constants";
import { overlayButton, overlayChip, toolbarButton } from "@/lib/ui";
import { cn } from "@/lib/utils";

import MentionTextarea from "@/components/ui/mention-textarea";
import EmojiPicker from "@/components/ui/emoji-picker";

export default function InputPost({ user }: { user?: User | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("imageUploader");
  const { setPosts } = usePost();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const maxImages = MAX_POST_IMAGES;
  const maxChars = POST_CHAR_LIMIT;
  const charsLeft = maxChars - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit =
    (content.trim().length > 0 || files.length > 0) && !isOverLimit && !loading;

  const handleButtonClick = () => {
    if (files.length >= maxImages) {
      toast.info(`Maximum ${maxImages} images allowed per vibe.`);
      return;
    }
    fileInputRef?.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    // Validate images
    const validFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length < selectedFiles.length) {
      toast.error("Some files were skipped because they are not valid images.");
    }

    if (validFiles.length === 0) return;

    setFiles((prev) => {
      const remainingSlots = maxImages - prev.length;
      if (remainingSlots <= 0) {
        toast.error(`You can attach up to ${maxImages} images.`);
        return prev;
      }
      const filesToAdd = validFiles.slice(0, remainingSlots);
      if (validFiles.length > remainingSlots) {
        toast.info(`Maximum ${maxImages} images allowed. First ${remainingSlots} were added.`);
      }
      const newFiles = [...prev, ...filesToAdd];
      const newUrls = newFiles.map((f) => URL.createObjectURL(f));
      setPreviewUrls(newUrls);
      return newFiles;
    });

    // Reset input value so same files can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, idx) => idx !== indexToRemove);
      const newUrls = newFiles.map((f) => URL.createObjectURL(f));
      setPreviewUrls(newUrls);
      setActiveSlide((prevIndex) => {
        if (newFiles.length === 0) return 0;
        return prevIndex >= newFiles.length ? newFiles.length - 1 : prevIndex;
      });
      return newFiles;
    });
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : previewUrls.length - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev < previewUrls.length - 1 ? prev + 1 : 0));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setLoading(true);

      // Upload first when there is media, so the post is only created once the
      // URLs actually exist.
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        toast.loading(
          `Uploading ${files.length} media ${files.length > 1 ? "files" : "file"}...`,
          { id: "create-post" }
        );
        const uploaded = await startUpload(files);
        if (!uploaded || uploaded.length === 0) {
          throw new Error("Media upload failed");
        }
        uploadedUrls = uploaded.map((r) => r.ufsUrl).filter(Boolean);
        if (uploadedUrls.length === 0) {
          throw new Error("Could not retrieve uploaded media URLs");
        }
      } else {
        toast.loading("Publishing vibe...", { id: "create-post" });
      }

      const result = await createPost({
        content,
        ...(uploadedUrls.length > 0
          ? { imageUrl: uploadedUrls[0], imageUrls: uploadedUrls }
          : {}),
      });

      if (result.ok) {
        setPosts((prev) => [result.data, ...prev]);
        setContent("");
        setFiles([]);
        setPreviewUrls([]);
        setActiveSlide(0);
        toast.success("Vibe published successfully!", { id: "create-post" });
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error], { id: "create-post" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed creating post. Please try again.", { id: "create-post" });
    } finally {
      setLoading(false);
    }
  };

  const activeFile = files[activeSlide];
  const activePreviewUrl = previewUrls[activeSlide];

  return (
    <>
      <div className="relative z-20 focus-within:z-30 rounded-3xl border border-border/70 bg-card/60 dark:bg-card/30 backdrop-blur-xl p-4 sm:p-5 transition-colors duration-200 focus-within:border-foreground/25 focus-within:bg-card/80">
        <div className="flex items-start gap-3.5">
          {/* User Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border/70 shrink-0 mt-0.5">
            <Image
              src={user?.photo || "/user-placeholder.png"}
              fill
              sizes="40px"
              alt={user?.name || "Your avatar"}
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Input Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <MentionTextarea
              value={content}
              onChange={setContent}
              placeholder="What feels true to you right now? Share an unhurried thought..."
              disabled={loading}
              maxLength={maxChars}
              rows={3}
              minHeight="75px"
            />

            {/* Multi-Image Carousel Preview with Slide Navigation */}
            <AnimatePresence>
              {previewUrls.length > 0 && activePreviewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="relative mt-3 rounded-2xl overflow-hidden border border-border/80 bg-muted/20 group/preview select-none cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                  title="Click to view photo in full size"
                >
                  {/* Media Container: Full Width, Balanced Aspect Ratio */}
                  <div className="relative w-full max-h-80 sm:max-h-96 aspect-[16/10] sm:aspect-video flex items-center justify-center overflow-hidden bg-black/5 dark:bg-black/30">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activePreviewUrl}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={activePreviewUrl}
                          alt={`Attachment preview ${activeSlide + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 650px"
                          className="object-cover transition-transform duration-300 group-hover/preview:scale-[1.02]"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Ambient dark vignette for overlay legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-40 group-hover/preview:opacity-60 transition-opacity duration-200 pointer-events-none" />
                  </div>

                  {/* Left / Right Carousel Arrow Buttons */}
                  {previewUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        className={cn(
                          overlayButton,
                          "absolute left-2.5 top-1/2 -translate-y-1/2 z-20 opacity-80 hover:opacity-100",
                        )}
                        aria-label="Previous image"
                        title="Previous photo"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleNextSlide}
                        className={cn(
                          overlayButton,
                          "absolute right-2.5 top-1/2 -translate-y-1/2 z-20 opacity-80 hover:opacity-100",
                        )}
                        aria-label="Next image"
                        title="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Top Overlay: Attachment Metadata Pill & Remove Button */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                    {/* File Metadata & Multi-image counter pill */}
                    <div className={cn(overlayChip, "flex items-center gap-1.5 max-w-[70%] truncate")}>
                      <ImagePlus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      {previewUrls.length > 1 && (
                        <span className="font-medium text-white shrink-0">
                          {activeSlide + 1}/{previewUrls.length} ·
                        </span>
                      )}
                      <span className="truncate">{activeFile?.name || "Photo attachment"}</span>
                      {activeFile?.size && (
                        <span className="text-white/60 text-[10px] shrink-0">
                          · {(activeFile.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      )}
                    </div>

                    {/* Remove Current Photo Button */}
                    {!loading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(activeSlide);
                        }}
                        className="p-1.5 rounded-full bg-black/65 hover:bg-rose-600 text-white backdrop-blur-md border border-white/15 transition-[color,background-color,border-color,transform] pointer-events-auto hover:scale-105 active:scale-95"
                        aria-label={`Remove photo ${activeSlide + 1}`}
                        title="Remove this photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Bottom Center: Slide Dot Indicators */}
                  {previewUrls.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 z-10">
                      {previewUrls.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlide(idx);
                          }}
                          className={cn(
                            "rounded-full transition-[width,background-color] duration-200",
                            idx === activeSlide ? "w-5 h-1.5 bg-foreground" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80",
                          )}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Bottom Right: Click to Preview Indicator */}
                  <div className="absolute bottom-3 right-3 pointer-events-none z-10">
                    <div className={cn(overlayChip, "flex items-center gap-1.5 group-hover/preview:bg-black/80 transition-colors duration-200")}>
                      <Maximize2 className="w-3.5 h-3.5 text-white/90" />
                      <span>Click to view</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Composer Controls Bar */}
            <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
              {/* Left Action Buttons */}
              <div className="flex items-center gap-1.5">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleButtonClick}
                  disabled={loading || files.length >= maxImages}
                  className={toolbarButton}
                  title={
                    files.length >= maxImages
                      ? `Max ${maxImages} images reached`
                      : files.length > 0
                        ? "Add more photos"
                        : "Add images"
                  }
                >
                  <ImagePlus className="w-4 h-4" strokeWidth={1.75} />
                  <span className="hidden sm:inline">
                    {files.length > 0
                      ? `Media (${files.length}/${maxImages})`
                      : "Media"}
                  </span>
                </button>

                <EmojiPicker
                  disabled={loading}
                  onSelectEmoji={(emoji) => {
                    if (content.length + emoji.length <= maxChars) {
                      setContent((prev) => prev + emoji);
                    }
                  }}
                />
              </div>

              {/* Right Action & Word Count */}
              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span
                    className={cn(
                      "text-xs font-mono transition-colors",
                      isOverLimit ? "text-rose-500 font-medium" : charsLeft < 20 ? "text-amber-500 font-medium" : "text-muted-foreground/60",
                    )}
                  >
                    {charsLeft}
                  </span>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  size="sm"
                  className="rounded-full px-5 py-2 font-medium text-xs sm:text-sm bg-foreground text-background hover:bg-foreground/90 transition-transform duration-200 active:scale-95 disabled:opacity-40 border-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="w-3.5 h-3.5 mr-1.5" />
                      <span>Post</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for inspecting drafted attachments in full resolution */}
      {previewUrls.length > 0 && (
        <ImageLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={previewUrls}
          initialIndex={activeSlide}
          alt={activeFile?.name || "Draft attachment preview"}
          author={{
            name: user?.name,
            username: user?.username || "you",
            photo: user?.photo,
          }}
          time="Draft attachment"
        />
      )}
    </>
  );
}
