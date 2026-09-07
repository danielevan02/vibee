"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  User,
  FileText,
  Globe,
  MapPin,
  Loader2,
  Save,
  Camera,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateUserProfile } from "@/server/actions/user";
import { useUploadThing } from "@/lib/uploadthing-client";
import { toast } from "sonner";
import { ACTION_ERROR_MESSAGE } from "@/types/action";
import { motion, AnimatePresence } from "motion/react";

/** Matches the `profileImageUploader` route's ceiling, so an oversized file is
 *  refused here instead of after a pointless round-trip. */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export interface ProfileImageUpdate {
  name: string;
  bio: string | null;
  website: string | null;
  location: string | null;
  photo: string | null;
  coverImage: string | null;
}

interface EditProfileModalProps {
  onClose: () => void;
  currentUser: {
    name?: string | null;
    bio?: string | null;
    website?: string | null;
    location?: string | null;
    photo?: string | null;
    coverImage?: string | null;
  };
  onSuccess: (updated: ProfileImageUpdate) => void;
}

/**
 * A picked-but-not-yet-uploaded image.
 *
 * `file` is what will be uploaded, `preview` is what the reader sees now, and
 * the two together describe all three outcomes the action understands: keep
 * (nothing picked, preview unchanged), replace (a file), remove (preview null
 * where there used to be one).
 */
type ImageDraft = {
  file: File | null;
  preview: string | null;
};

export default function EditProfileModal({
  onClose,
  currentUser,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentUser.name || "");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [website, setWebsite] = useState(currentUser.website || "");
  const [location, setLocation] = useState(currentUser.location || "");
  const [loading, setLoading] = useState(false);

  const initialPhoto = currentUser.photo || null;
  const initialCover = currentUser.coverImage || null;

  const [photo, setPhoto] = useState<ImageDraft>({ file: null, preview: initialPhoto });
  const [cover, setCover] = useState<ImageDraft>({ file: null, preview: initialCover });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("profileImageUploader");

  // Object URLs are a manual resource: without this, every re-pick leaks the
  // previous blob for as long as the tab lives.
  const objectUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const pickImage = (
    event: React.ChangeEvent<HTMLInputElement>,
    apply: (draft: ImageDraft) => void,
  ) => {
    const file = event.target.files?.[0];
    // Let the same file be chosen again after a remove.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("That file is not an image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Images need to be 4MB or smaller.");
      return;
    }

    const preview = URL.createObjectURL(file);
    objectUrls.current.push(preview);
    apply({ file, preview });
  };

  /**
   * Turn a draft into what the action expects: `undefined` to leave the field
   * alone, a URL to set it, `null` to clear it.
   */
  const resolveImage = async (
    draft: ImageDraft,
    initial: string | null,
  ): Promise<string | null | undefined> => {
    if (draft.file) {
      const uploaded = await startUpload([draft.file]);
      const url = uploaded?.[0]?.ufsUrl;
      if (!url) throw new Error("Image upload failed");
      return url;
    }
    if (draft.preview === null && initial !== null) return null;
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const hasUpload = Boolean(photo.file || cover.file);

    try {
      setLoading(true);
      toast.loading(hasUpload ? "Uploading images..." : "Saving profile...", {
        id: "edit-profile",
      });

      // Upload first, so the profile is only written once the URLs exist.
      const [nextPhoto, nextCover] = await Promise.all([
        resolveImage(photo, initialPhoto),
        resolveImage(cover, initialCover),
      ]);

      const result = await updateUserProfile({
        name,
        bio,
        website,
        location,
        ...(nextPhoto !== undefined ? { photo: nextPhoto } : {}),
        ...(nextCover !== undefined ? { coverImage: nextCover } : {}),
      });

      if (result.ok) {
        toast.success("Profile updated successfully!", { id: "edit-profile" });
        // Report what the server actually stored, not what was typed.
        onSuccess({
          name: result.data.name,
          bio: result.data.bio,
          website: result.data.website,
          location: result.data.location,
          photo: result.data.photo,
          coverImage: result.data.coverImage,
        });
        onClose();
      } else {
        toast.error(ACTION_ERROR_MESSAGE[result.error], { id: "edit-profile" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile", { id: "edit-profile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="relative z-10 w-full max-w-lg max-h-[90dvh] overflow-y-auto subtle-scrollbar rounded-3xl border border-border/70 bg-card/95 backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cover + avatar, laid out the way they read on the profile itself,
              so what is being edited is obvious without a caption. */}
          <div className="relative">
            <div className="relative h-32 sm:h-36 w-full overflow-hidden rounded-t-3xl bg-gradient-to-r from-blue-600/25 via-sky-500/20 to-indigo-600/30">
              {cover.preview && (
                <Image
                  src={cover.preview}
                  alt="Cover preview"
                  fill
                  sizes="512px"
                  className="object-cover"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-black/25" />

              <div className="absolute inset-0 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={loading}
                  className="p-2.5 rounded-full bg-black/55 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 transition-colors disabled:opacity-50"
                  title="Change cover photo"
                  aria-label="Change cover photo"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {cover.preview && (
                  <button
                    type="button"
                    onClick={() => setCover({ file: null, preview: null })}
                    disabled={loading}
                    className="p-2.5 rounded-full bg-black/55 hover:bg-rose-600/80 text-white backdrop-blur-md border border-white/20 transition-colors disabled:opacity-50"
                    title="Remove cover photo"
                    aria-label="Remove cover photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/55 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 transition-colors disabled:opacity-50"
                title="Close"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar */}
            <div className="px-6 -mt-11">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={loading}
                className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-full border-4 border-card overflow-hidden bg-muted group/avatar disabled:opacity-50"
                title="Change profile photo"
                aria-label="Change profile photo"
              >
                <Image
                  src={photo.preview || "/user-placeholder.png"}
                  alt="Profile photo preview"
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </span>
              </button>
            </div>
          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickImage(e, setCover)}
          />
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickImage(e, setPhoto)}
          />

          <div className="p-6 pt-4 space-y-5">
            {/* Header */}
            <div className="pb-3 border-b border-border/40">
              <h2 className="font-serif font-normal text-xl sm:text-2xl text-foreground">
                Edit Profile
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize your public presence on{" "}
                <span className="font-serif font-normal bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                  VIBEE
                </span>
              </p>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Display Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-[color,background-color,border-color,box-shadow] text-foreground"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>Bio</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {bio.length}/160
                  </span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="What's your vibe? Tell the community about yourself..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-[color,background-color,border-color,box-shadow] text-foreground resize-none leading-relaxed"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={40}
                  placeholder="e.g. Jakarta, Indonesia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-[color,background-color,border-color,box-shadow] text-foreground"
                />
              </div>

              {/* Website Link */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span>Website</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  maxLength={80}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-[color,background-color,border-color,box-shadow] text-foreground"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-full text-xs font-semibold px-4 h-9"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="rounded-full text-xs font-semibold px-5 h-9 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
