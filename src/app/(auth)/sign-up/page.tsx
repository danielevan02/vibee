"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
      toast.error("Username can only contain letters, numbers, dots, and underscores.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        username: cleanUsername,
        email: email.trim().toLowerCase(),
        password,
        callbackURL: "/home",
      });

      if (error) {
        toast.error(error.message || "Failed to create account.");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! Welcome to VIBEE.");
      setTimeout(() => {
        window.location.href = "/home";
      }, 400);
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative rounded-3xl border border-border/70 bg-card/75 dark:bg-card/65 backdrop-blur-2xl p-6 sm:p-8">
        {/* Top Glow Accent */}
        <div className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent pointer-events-none rounded-full" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105 mb-1">
            <Image
              src="/black-logo.png"
              alt="VIBEE"
              width={44}
              height={44}
              className="w-11 h-11 object-contain dark:hidden"
              priority
            />
            <Image
              src="/white-logo.png"
              alt="VIBEE"
              width={44}
              height={44}
              className="w-11 h-11 object-contain hidden dark:block"
              priority
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Join thousands sharing vibes on{" "}
            <span className="font-serif font-normal bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              VIBEE
            </span>
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-xs font-semibold text-foreground/80 tracking-wide"
            >
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              autoFocus
              disabled={loading}
              placeholder="e.g. Daniel Evan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border/80 focus-visible:ring-primary/40 text-sm"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label
              htmlFor="username"
              className="text-xs font-semibold text-foreground/80 tracking-wide"
            >
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold select-none">
                @
              </span>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                disabled={loading}
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 rounded-xl bg-background/50 border-border/80 focus-visible:ring-primary/40 pl-8 text-sm lowercase"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-foreground/80 tracking-wide"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border/80 focus-visible:ring-primary/40 text-sm"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="new-password"
              className="text-xs font-semibold text-foreground/80 tracking-wide"
            >
              Password (min. 8 chars)
            </label>
            <div className="relative">
              <Input
                id="new-password"
                name="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-xl bg-background/50 border-border/80 focus-visible:ring-primary/40 pr-10 text-sm"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label
              htmlFor="confirm-password"
              className="text-xs font-semibold text-foreground/80 tracking-wide"
            >
              Confirm Password
            </label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={loading}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border/80 focus-visible:ring-primary/40 text-sm"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-[color,background-color,border-color,transform] duration-200 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-bold text-primary hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}