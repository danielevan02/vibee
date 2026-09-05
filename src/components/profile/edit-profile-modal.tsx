"use client";

import { useState } from "react";
import {
  X,
  User,
  FileText,
  Globe,
  MapPin,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateUserProfile } from "@/actions/user.action";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name?: string | null;
    bio?: string | null;
    website?: string | null;
    location?: string | null;
  };
  onSuccess: (updated: {
    name: string;
    bio: string | null;
    website: string | null;
    location: string | null;
  }) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentUser.name || "");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [website, setWebsite] = useState(currentUser.website || "");
  const [location, setLocation] = useState(currentUser.location || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const res = await updateUserProfile({
        name,
        bio,
        website,
        location,
      });

      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        onSuccess({
          name,
          bio: bio.trim() || null,
          website: website.trim() || null,
          location: location.trim() || null,
        });
        onClose();
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative z-10 w-full max-w-lg rounded-3xl border border-border/70 bg-card/95 backdrop-blur-2xl p-6 space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
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

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
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
                className="rounded-full text-xs font-semibold px-4 h-9 cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="rounded-full text-xs font-semibold px-5 h-9 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
