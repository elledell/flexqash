"use client";

import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import "flag-icons/css/flag-icons.min.css";
const CURRENCIES = [
  { code: "UGX", country: "UG", name: "Ugandan Shilling" },
  { code: "TZS", country: "TZ", name: "Tanzanian Shilling" },
  { code: "MWK", country: "MW", name: "Malawian Kwacha" },
  { code: "ZMW", country: "ZM", name: "Zambian Kwacha" },
  { code: "NGN", country: "NG", name: "Nigerian Naira" },
  { code: "GHS", country: "GH", name: "Ghanaian Cedi" },
  { code: "RWF", country: "RW", name: "Rwandan Franc" },
  { code: "BIF", country: "BI", name: "Burundian Franc" },
  { code: "BWP", country: "BW", name: "Botswana Pula" },
  { code: "XAF", country: "CM", name: "Central African CFA Franc" },
  { code: "SSP", country: "SS", name: "South Sudanese Pound" },
  { code: "CDF", country: "CD", name: "Congolese Franc" },
];

export default function AdminRatesPage() {
  const rates = useQuery(api.rates.getRates);
  const setRate = useMutation(api.rates.setRate);
  
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});

  if (rates === undefined) return <div className="p-8 font-bold text-[#112a46]">Loading rates...</div>;

  const handleSave = async (currency: string) => {
    const value = parseFloat(edits[currency]);
    if (!value || value <= 0) return;

    try {
      await setRate({ currency, rateToKES: value });
      setMsg((prev) => ({ ...prev, [currency]: "Saved!" }));
      setTimeout(() => setMsg((prev) => ({ ...prev, [currency]: "" })), 2000);
    } catch (e) {
      setMsg((prev) => ({ ...prev, [currency]: "Error saving" }));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#112a46]">Global Exchange Rates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set the conversion value of foreign currencies relative to 1 KES. This strictly calculates cross-border referral payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CURRENCIES.map((c) => {
          const currentRate = rates?.find((r) => r.currency === c.code)?.rateToKES;
          
          return (
            <div key={c.code} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`fi fi-${c.country.toLowerCase()} rounded-sm shadow-sm text-xl`} />
                <div>
                  <p className="font-extrabold text-[#112a46]">{c.name} ({c.code})</p>
                  <p className="text-xs font-bold text-[#1abc9c]">How much {c.code} equals 1 KES?</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex w-full items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden focus-within:border-[#1abc9c]">
                  <span className="bg-gray-100 px-3 py-2.5 text-sm font-bold text-gray-500 border-r border-gray-200">1 KES =</span>
                  <input
                    type="number"
                    step="0.01"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm font-bold text-[#112a46] outline-none"
                    placeholder={currentRate ? String(currentRate) : "e.g., 28.5"}
                    value={edits[c.code] ?? ""}
                    onChange={(e) => setEdits((s) => ({ ...s, [c.code]: e.target.value }))}
                  />
                </div>
                <button
                  className="rounded-lg bg-[#112a46] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1a3a5e] disabled:opacity-50"
                  disabled={!edits[c.code]}
                  onClick={() => handleSave(c.code)}
                >
                  Save
                </button>
              </div>

              <div className="flex h-5 items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  {currentRate ? `Current: 1 KES = ${currentRate} ${c.code}` : "Rate not set yet."}
                </span>
                {msg[c.code] && <span className="text-xs font-bold text-[#1abc9c]">{msg[c.code]}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}