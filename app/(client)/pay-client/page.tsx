"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export default function PayClientPage() {
  const me = useQuery(api.users.me);
  const activateClient = useMutation(api.payClient.activateUserWithBalance);
  
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await activateClient({ targetUsername: username });
      setSuccess(`Successfully activated @${result.targetUsername}! ${result.currency} ${result.cost.toLocaleString()} was deducted from your balance.`);
      setUsername(""); // Clear the input after success
    } catch (err) {
      setError(err instanceof ConvexError ? String(err.data) : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!me) {
    return <div className="flex min-h-[50vh] items-center justify-center font-bold text-[#112a46]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Pay for Client</h1>
        <div className="text-sm font-medium text-gray-500">
          Main » <span className="text-[#1abc9c]">Pay Client</span>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-gray-100 bg-white p-6 shadow-md sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e0f2f1] text-3xl">
            🤝
          </div>
          <h2 className="text-xl font-black text-[#112a46]">Activate a Downline</h2>
          <p className="mt-2 text-sm text-gray-500">
            Pay the activation fee for a client from any country using your available balance. Just enter their username below.
          </p>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-bold text-gray-700">
              Client's Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. lenah_254"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#112a46] outline-none transition focus:border-[#1abc9c] focus:bg-white focus:ring-2 focus:ring-[#1abc9c]/20"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 border border-emerald-100">
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full rounded-xl bg-[#3498db] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#2980b9] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Verifying & Paying..." : "Pay Now"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium text-gray-500">
          <Link href="/dashboard" className="transition hover:text-[#1abc9c] hover:underline">
            Go Back
          </Link>
          <p>
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-[#3498db] transition hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}