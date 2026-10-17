"use client";

import "flag-icons/css/flag-icons.min.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../convex/_generated/api";
import { COUNTRIES } from "../../../convex/countries";
import { inputClass, labelClass, primaryButton } from "../../components/ui";
import PasswordInput from "../../components/PasswordInput";
import CountrySelect from "../../components/CountrySelect";

function SignUpForm() {
  const { signIn } = useAuthActions();
  const validateAvailability = useMutation(api.users.validateSignUpAvailability);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auto-capture the referral code from the URL if it exists
  const defaultReferral = searchParams.get("ref") || "";

  const [countryCode, setCountryCode] = useState<string>("KE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fallback to the first country if INT or something else is missing
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    const username = String(form.get("username") ?? "").trim().toLowerCase();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    
    // Clean up the phone number input
    const digits = String(form.get("mobile") ?? "").replace(/\D/g, "").replace(/^0+/, "");
    
    // Dynamically format the phone based on whether they chose International
    const phone = countryCode === "INT" ? `+${digits}` : `+${country.dial}${digits}`;

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores (no spaces).");
      return;
    }
    if (form.get("password") !== form.get("confirmPassword")) {
      setError("Passwords do not match.");
      return;
    }
    if (String(form.get("password")).length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // 1. Check uniqueness of username, email, and phone first
      await validateAvailability({ username, email, phone });

      // 2. Proceed with account creation
      form.set("username", username);
      form.set("phone", phone);
      form.delete("mobile");
      form.set("email", email);
      form.set("country", countryCode);
      form.set("flow", "signUp");
      
      // Inject the hidden referral code into the backend payload if it exists
      if (defaultReferral) {
        form.set("invitedByCode", defaultReferral);
      }

      await signIn("password", form);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ConvexError
          ? String(err.data)
          : "Could not create your account. Check your details, or sign in if you already have one."
      );
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-xl font-extrabold text-brand-900">Sign Up</h1>
      <p className="mb-6 mt-1 text-center text-sm text-brand-400">Create your free account</p>

      {/* Modern Referral Banner (Only visible if a valid ref link is used) */}
      {defaultReferral && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-[#eefaf6] px-5 py-4 border border-[#d2f4ea]">
          <div className="flex shrink-0 items-center justify-center text-[#16a085]">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-sm text-brand-900 leading-tight">
            You're joining through <br/>
            <strong className="text-base font-extrabold">{defaultReferral}</strong>.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            required
            minLength={3}
            placeholder="e.g. lenah_254"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-brand-400">Letters, numbers, and underscores only.</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="country">Country</label>
          <CountrySelect value={countryCode} onChange={setCountryCode} />
          <p className="mt-1 text-xs text-brand-400">
            Your country sets your currency ({country.currency}) and dashboard. It can't be changed later.
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="mobile">Mobile</label>
          {countryCode === "INT" ? (
            <input
              id="mobile"
              name="mobile"
              type="tel"
              required
              placeholder="e.g. +1 234 567 8900 (Include country code)"
              className={inputClass}
            />
          ) : (
            <div className="flex">
              <span className="flex shrink-0 items-center gap-2 rounded-l-lg border border-r-0 border-brand-100 bg-brand-50 px-3 text-sm font-semibold text-brand-900">
                <span className={`fi fi-${country.code.toLowerCase()} rounded-sm`} />
                +{country.dial}
              </span>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                required
                placeholder="712345678"
                className={`${inputClass} rounded-l-none`}
              />
            </div>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required placeholder="Enter email address" className={inputClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="password">Password</label>
          <PasswordInput id="password" name="password" minLength={8} placeholder="At least 8 characters" autoComplete="new-password" />
        </div>

        <div>
          <label className={labelClass} htmlFor="confirmPassword">Confirm Password</label>
          <PasswordInput id="confirmPassword" name="confirmPassword" placeholder="Confirm password" autoComplete="new-password" />
        </div>

        <label className="flex items-start gap-2 text-sm text-brand-500 pt-2">
          <input type="checkbox" required className="mt-1 h-4 w-4 accent-brand-500" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold underline">Terms &amp; Conditions</Link> and{" "}
            <Link href="/privacy" className="font-semibold underline">Privacy Policy</Link>.
          </span>
        </label>

        {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

        <button type="submit" disabled={loading} className={primaryButton}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-brand-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-bold text-brand-500 underline">Sign In</Link>
      </p>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-semibold text-brand-500">Loading form...</div>}>
      <SignUpForm />
    </Suspense>
  );
}