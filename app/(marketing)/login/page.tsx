"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Map, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const friendly = msg.includes("invalid-credential")
        ? "Incorrect email or password."
        : msg.includes("too-many-requests")
        ? "Too many attempts. Try again later."
        : "Sign in failed. Please try again.";
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push(next);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("popup-closed-by-user")) {
        // user cancelled — no toast
      } else {
        toast.error("Google sign in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden md:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <Map className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg">Safarkhar</span>
        </Link>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Safar ka har
            <br />
            kharcha track karo.
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Flights, trains, hotels aur highways — sab kuch ek jagah.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Transport modes", value: "10+" },
            { label: "Expense categories", value: "8" },
            { label: "Wallet types", value: "8" },
            { label: "Always free", value: "✓" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-primary-foreground/10 p-4"
            >
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-primary-foreground/70 mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link
            href="/"
            className="flex items-center gap-2 mb-8 md:hidden justify-center"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Map className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Safarkhar</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to continue tracking your trip expenses
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center gap-3 py-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                or continue with
              </span>
              <Separator className="flex-1" />
            </div>
            <Button
              variant="outline"
              className="w-full mt-3"
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              {googleLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              )}
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Sign up free
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
