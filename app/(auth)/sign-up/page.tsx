"use client";

import "flag-icons/css/flag-icons.min.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { COUNTRIES } from "../../../convex/countries";
import { inputClass, labelClass, primaryButton } from "../../components/ui";
import PasswordInput from "../../components/PasswordInput";
import CountrySelect from "../../components/CountrySelect";

function SignUpForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auto-capture the referral code from the URL if it exists
  const defaultReferral = searchParams.get("ref") || "";

  const [countryCode, setCountryCode] = useState<string>("KE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const country = COUNTRIES.find((c) => c.code === countryCode)!;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    if (form.get("password") !== form.get("confirmPassword")) {
      setError("Passwords do not match.");
      return;
    }
    if (String(form.get("password")).length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const digits = String(form.get("mobile")).replace(/\D/g, "").replace(/^0+/, "");
    form.set("phone", `+${country.dial}${digits}`);
    form.delete("mobile");
    form.set("email", String(form.get("email")).trim().toLowerCase());
    form.set("country", countryCode);
    form.set("flow", "signUp");

    setLoading(true);
    try {
      await signIn("password", form);
      router.push("/dashboard");
    } catch {
      setError("Could not create your account. Check your details, or sign in if you already have one.");
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-center text-xl font-extrabold text-brand-900">Sign Up</h1>
      <p className="mb-6 mt-1 text-center text-sm text-brand-400">Create your free account</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="username">Username</label>
          <input id="username" name="username" required minLength={3} placeholder="Enter username" className={inputClass} />
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

        {/* New Referral Code Field */}
        <div>
          <label className={labelClass} htmlFor="invitedByCode">Referral Code (Optional)</label>
          <input 
            id="invitedByCode" 
            name="invitedByCode" 
            type="text" 
            defaultValue={defaultReferral} 
            placeholder="Enter invite code if you have one" 
            className={inputClass} 
          />
          <p className="mt-1 text-xs text-brand-400">Leave blank if you were not invited.</p>
        </div>

        <label className="flex items-start gap-2 text-sm text-brand-500">
          <input type="checkbox" required className="mt-1 h-4 w-4 accent-brand-500" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold underline">Terms &amp; Conditions</Link> and{" "}
            <Link href="/privacy" className="font-semibold underline">Privacy Policy</Link>.
          </span>
        </label>

        {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

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

// Wrap the form in a Suspense boundary to support Next.js useSearchParams
export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-brand-500">Loading form...</div>}>
      <SignUpForm />
    </Suspense>
  );
}