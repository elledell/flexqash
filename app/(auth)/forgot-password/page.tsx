"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { inputClass, labelClass, primaryButton } from "../../components/ui";
import PasswordInput from "../../components/PasswordInput";

export default function ForgotPasswordPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const value = String(form.get("email")).trim().toLowerCase();
    form.set("email", value);
    form.set("flow", "reset");
    try {
      await signIn("password", form);
    } catch {
      // Same message either way, so we never reveal which emails have accounts
    }
    setEmail(value);
    setStep("code");
    setLoading(false);
  }

  async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    if (form.get("newPassword") !== form.get("confirm")) {
      setError("Passwords do not match.");
      return;
    }
    form.delete("confirm");
    form.set("email", email);
    form.set("flow", "reset-verification");
    setLoading(true);
    try {
      await signIn("password", form);
      router.push("/dashboard");
    } catch {
      setError("That code is invalid or expired, or the password is too short (8+ characters).");
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-xl font-extrabold text-brand-900">Reset Password</h1>

      {step === "email" ? (
        <>
          <p className="mb-6 mt-1 text-center text-sm text-brand-400">
            Enter your email and we'll send you a reset code.
          </p>
          <form onSubmit={requestCode} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required placeholder="Enter your email" className={inputClass} />
            </div>
            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="mb-6 mt-1 text-center text-sm text-brand-400">
            If an account exists for {email}, a code is on its way. Enter it below with your new password.
          </p>
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="code">Reset code</label>
              <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" required placeholder="8-digit code" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="newPassword">New password</label>
              <PasswordInput id="newPassword" name="newPassword" minLength={8} autoComplete="new-password" />
            </div>
            <div>
              <label className={labelClass} htmlFor="confirm">Confirm new password</label>
              <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
            </div>
            {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? "Saving..." : "Set New Password"}
            </button>
          </form>
        </>
      )}

      <p className="mt-5 text-center text-sm text-brand-500">
        <Link href="/sign-in" className="font-bold underline">Back to Sign In</Link>
      </p>
    </>
  );
}