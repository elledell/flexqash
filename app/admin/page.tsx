"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

const COUNTRIES = [
  { code: "ALL", name: "All Countries", currency: "" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "UG", name: "Uganda", currency: "UGX" },
  { code: "TZ", name: "Tanzania", currency: "TZS" },
  { code: "MW", name: "Malawi", currency: "MWK" },
  { code: "ZM", name: "Zambia", currency: "ZMW" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
];

export default function AdminDashboardPage() {
  const [country, setCountry] = useState("ALL");
  const data = useQuery(api.adminDashboard.getOverview, { countryCode: country });

  const selectedCurrency = COUNTRIES.find(c => c.code === country)?.currency || "MIXED";

  if (data === undefined) {
    return <div className="font-bold text-[#112a46]">Loading Dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header & Country Switcher */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#112a46]">Overview</h1>
        
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#112a46] shadow-sm outline-none focus:border-[#1abc9c]"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Top Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-green-100 bg-green-50/30 p-6">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">👥</span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-[#112a46]">{data.totalUsers.toLocaleString()}</h2>
          <p className="mt-1 text-xs text-gray-400">+0 in 24h</p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-6">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">Total Deposits</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">💳</span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-[#112a46]">
            {selectedCurrency !== "MIXED" ? `${selectedCurrency} ` : ""}
            {data.totalDeposits >= 1000 ? (data.totalDeposits/1000).toFixed(1) + 'k' : data.totalDeposits.toLocaleString()}
          </h2>
          <p className="mt-1 text-xs text-gray-400">{data.transactionCount} transactions</p>
        </div>
      </div>

      {/* Placeholder Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-64 flex flex-col">
          <h3 className="mb-4 text-sm font-medium text-[#112a46]">Weekly User Registrations</h3>
          <div className="flex-1 flex items-end justify-between gap-2 border-l border-b border-gray-200 px-2 pb-2 relative">
            {/* Fake grid lines */}
            <div className="absolute w-full border-t border-dashed border-gray-200 bottom-1/4"></div>
            <div className="absolute w-full border-t border-dashed border-gray-200 bottom-2/4"></div>
            <div className="absolute w-full border-t border-dashed border-gray-200 bottom-3/4"></div>
            
            {/* Fake bars */}
            <div className="w-full bg-[#3b82f6] rounded-t-sm z-10" style={{ height: '30%' }}></div>
            <div className="w-full bg-[#3b82f6] rounded-t-sm z-10" style={{ height: '70%' }}></div>
            <div className="w-full bg-[#3b82f6] rounded-t-sm z-10" style={{ height: '70%' }}></div>
            <div className="w-full opacity-0"></div>
            <div className="w-full opacity-0"></div>
            <div className="w-full opacity-0"></div>
          </div>
          <div className="flex justify-between px-2 pt-2 text-[10px] text-gray-400">
            <span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-64 flex flex-col">
          <h3 className="mb-4 text-sm font-medium text-[#112a46]">Weekly Deposits</h3>
          <div className="flex-1 flex items-end justify-between gap-2 border-l border-b border-gray-200 px-2 pb-2 relative">
            <div className="absolute w-full border-t border-dashed border-gray-200 bottom-1/4"></div>
            <div className="absolute w-full border-t border-dashed border-gray-200 bottom-2/4"></div>
            <div className="absolute w-full border-t border-dashed border-gray-200 bottom-3/4"></div>
            {/* Flat line representing 0 */}
            <div className="w-full border-b-2 border-[#3b82f6] z-10 mb-[-1px]"></div>
          </div>
          <div className="flex justify-between px-2 pt-2 text-[10px] text-gray-400">
            <span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h3 className="font-medium text-[#112a46]">Recent Activity</h3>
          <button className="text-sm font-medium text-gray-500 hover:text-[#112a46]">Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fcfb] text-[#1abc9c] text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Country Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No activity found for this region.</td>
                </tr>
              ) : (
                data.recentActivity.map((act, i) => (
                  <tr key={act._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-600">{act.phone}</td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-[#1abc9c] px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
                        {act.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#112a46]">{act.currency} {act.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-600">{act.countryCode}</td>
                    <td className="px-6 py-4">
                      {act.status === "failed" ? (
                        <div>
                          <span className="rounded-md border border-orange-200 text-orange-600 px-2 py-1 text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                            <span className="text-orange-500">!</span> Cancelled
                          </span>
                        </div>
                      ) : (
                        <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${act.status === 'paid' ? 'text-emerald-600 border border-emerald-200' : 'text-amber-600 border border-amber-200'}`}>
                          {act.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {new Date(act.time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}