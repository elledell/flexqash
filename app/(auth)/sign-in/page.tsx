"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { inputClass, labelClass, primaryButton } from "../../components/ui";
import PasswordInput from "../../components/PasswordInput";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    form.set("email", String(form.get("email")).trim().toLowerCase());
    form.set("flow", "signIn");

    setLoading(true);
    try {
      await signIn("password", form);
      router.push("/dashboard"); // dashboard sends admins on to /admin
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-xl font-extrabold text-brand-900">Sign In</h1>
      <p className="mb-6 mt-1 text-center text-sm text-brand-400">Welcome back to FlexQash</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required placeholder="Enter your email" className={inputClass} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="password">Password</label>
            <Link href="/forgot-password" className="mb-1 text-sm font-bold text-red-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" name="password" placeholder="Password" autoComplete="current-password" />
        </div>

        {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={loading} className={primaryButton}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-brand-500">
        Don't have an account?{" "}
        <Link href="/sign-up" className="font-bold text-brand-500 underline">Sign Up</Link>
      </p>
    </>
  );
}