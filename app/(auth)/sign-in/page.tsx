"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../convex/_generated/api";
import { inputClass, labelClass, primaryButton } from "../../components/ui";
import PasswordInput from "../../components/PasswordInput";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const resolveIdentifier = useMutation(api.users.resolveLoginIdentifier);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const identifier = String(form.get("identifier") ?? "").trim();

    setLoading(true);
    try {
      // 1. Resolve username or email into the account's registered email
      const resolvedEmail = await resolveIdentifier({ identifier });

      // 2. Pass the resolved email to Convex Auth
      form.set("email", resolvedEmail);
      form.delete("identifier");
      form.set("flow", "signIn");

      await signIn("password", form);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ConvexError
          ? String(err.data)
          : "Invalid username/email or password."
      );
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-xl font-extrabold text-brand-900">Sign In</h1>
      <p className="mb-6 mt-1 text-center text-sm text-brand-400">Welcome back to FlexQash</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="identifier">Email or Username</label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            placeholder="Enter your email or username"
            autoComplete="username"
            className={inputClass}
          />
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
        <Link href="/sign-in" className="hidden" />
        <Link href="/sign-up" className="font-bold text-brand-500 underline">Sign Up</Link>
      </p>
    </>
  );
}