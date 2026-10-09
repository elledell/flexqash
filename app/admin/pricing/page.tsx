"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function AdminPricing() {
  const me = useQuery(api.users.me);
  const rows = useQuery(api.membership.adminPrices);
  const setPrice = useMutation(api.membership.setPrice);
  
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});

  if (me === undefined || rows === undefined) {
    return <div className="p-8 font-bold text-[#112a46]">Loading pricing data...</div>;
  }
  if (me?.role !== "admin" || rows === null) {
    return <div className="p-8 font-bold text-red-500">Not authorized.</div>;
  }

  async function save(code: string) {
    const value = Number(edits[code]);
    try {
      await setPrice({ country: code, amount: value });
      setMsg((m) => ({ ...m, [code]: "Successfully Saved!" }));
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMsg((m) => ({ ...m, [code]: "" }));
      }, 3000);
    } catch (e) {
      setMsg((m) => ({ ...m, [code]: e instanceof ConvexError ? String(e.data) : "Could not save" }));
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#112a46]">Membership Pricing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set the one-time membership activation amount per country, in the local currency. Changes apply immediately to new payments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((r) => (
          <div key={r.code} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="font-extrabold text-[#112a46]">{r.name}</p>
              <p className="text-xs font-bold text-[#1abc9c]">
                {r.currency} • {r.provider === "mpesa" ? "M-Pesa Gateway" : "Manual / Selar Gateway"}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                step={1}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[#1abc9c]"
                placeholder={r.amount !== null ? String(r.amount) : "Amount not set"}
                value={edits[r.code] ?? ""}
                onChange={(e) => setEdits((s) => ({ ...s, [r.code]: e.target.value }))}
              />
              <button
                className="rounded-lg bg-[#112a46] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1a3a5e] disabled:opacity-50"
                disabled={!edits[r.code]}
                onClick={() => save(r.code)}
              >
                Save
              </button>
            </div>

            <div className="flex h-5 items-center">
              {msg[r.code] ? (
                <span className={`text-xs font-bold ${msg[r.code] === "Successfully Saved!" ? "text-[#1abc9c]" : "text-red-500"}`}>
                  {msg[r.code]}
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-400">
                  {r.amount !== null ? `Current Price: ${r.currency} ${r.amount.toLocaleString()}` : "No price set."}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}