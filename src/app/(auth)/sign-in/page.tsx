"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import BrandLogo from "@/components/features/shell/brand-logo";

export default function SignInPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const isEmail = identifier.includes("@");

    try {
      if (isEmail) {
        const { error } = await authClient.signIn.email({
          email: identifier.trim().toLowerCase(),
          password,
          callbackURL: "/home",
        });

        if (error) {
          toast.error(error.message || "Invalid email or password.");
          setLoading(false);
          return;
        }
      } else {
        const { error } = await authClient.signIn.username({
          username: identifier.trim().toLowerCase(),
          password,
          callbackURL: "/home",
        });

        if (error) {
          toast.error(error.message || "Invalid username or password.");
          setLoading(false);
          return;
        }
      }

      toast.success("Welcome back!");
      // push + refresh rather than a hard reload: refresh drops the Router
      // Cache so the server re-renders with the session cookie just set.
      router.push("/home");
      router.refresh();
    } catch (err: unknown) {
      console.error("Sign in error:", err);
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
            <BrandLogo size={44} priority />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-foreground">
            Sign in to{" "}
            <span className="font-serif font-normal bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              VIBEE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enter your username or email to continue
          </p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username or Email Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="identifier"
              className="text-xs font-semibold text-foreground/80 tracking-wide"
            >
              Username or Email
            </label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              autoFocus
              disabled={loading}
              placeholder="e.g. danielevan or name@domain.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="h-11 rounded-xl bg-background/50 border-border/80 focus-visible:ring-primary/40 text-sm"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-foreground/80 tracking-wide"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl bg-background/50 border-border/80 focus-visible:ring-primary/40 pr-10 text-sm"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-bold text-primary hover:underline underline-offset-4"
          >
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}