
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";

const roleDashboard: Record<string, string> = {
  ADMIN: "/admin",
  SUB_ADMIN: "/sub-admin/dashboard",
  CLIENT: "/client/services",
  BDE: "/bde/dashboard",
  TRAINER: "/trainer/dashboard",
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Login failed. Please try again.");
        return;
      }

      const dashboard = roleDashboard[result.user?.role];

      if (!dashboard) {
        setError("Your account does not have a valid portal role.");
        return;
      }

      router.replace(dashboard);
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 size-[500px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-blue-800 p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 size-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-20 size-80 rounded-full border border-white/10" />

          <div className="relative">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
              <GraduationCap className="size-8" />
            </div>

            <h1 className="mt-7 text-3xl font-bold tracking-tight">
              CLP Portal
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-7 text-indigo-100">
              Corporate Learning & Training Portal
              <br />
              One platform for training, coordination and
              organisational development.
            </p>
          </div>

          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-3">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <p className="font-semibold">Secure Access</p>
                <p className="text-xs text-indigo-100">
                  Role-based portal permissions
                </p>
              </div>
            </div>

            <div className="border-t border-white/20 pt-5 text-xs text-indigo-100">
              NLETA · Corporate Learning Portal
            </div>
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center p-7 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-9 lg:hidden">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <GraduationCap className="size-7" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-900">
                CLP Portal
              </h1>
            </div>

            <div>
              <p className="text-sm font-semibold text-indigo-600">
                WELCOME BACK
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your registered credentials to access your workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="size-5" />
                  </>
                )}
              </button>
            </form>

            {/* Client Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-indigo-600 transition hover:text-violet-700"
                >
                  Create Account
                </Link>
              </p>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-5 text-center">
              <p className="text-xs text-slate-400">
                Secure access · Authorised users only
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">
                © 2026 NLETA. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
