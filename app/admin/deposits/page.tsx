"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function DepositsAnalyticsPage() {
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl">
      {activeCountry ? (
        <CountryDetailView countryCode={activeCountry} onBack={() => setActiveCountry(null)} />
      ) : (
        <GlobalOverview onSelectCountry={setActiveCountry} />
      )}
    </div>
  );
}

// --- VIEW 1: GLOBAL OVERVIEW ---
function GlobalOverview({ onSelectCountry }: { onSelectCountry: (code: string) => void }) {
  const data = useQuery(api.adminDeposits.getFinanceOverview);

  if (data === undefined) return <div className="font-bold text-[#112a46]">Loading Analytics...</div>;

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#112a46]">Finance Analytics</h1>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">Total Transactions</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">📈</span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-[#112a46]">{data.totalTx.toLocaleString()}</h2>
          <p className="mt-1 text-xs text-gray-400">{data.completedTx.toLocaleString()} completed</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">Success Rate</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">☑️</span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-[#112a46]">{data.successRate}%</h2>
          <p className="mt-1 text-xs text-gray-400">Overall conversion</p>
        </div>
      </div>

      <h3 className="mb-4 font-bold text-[#112a46]">Country Performance Overview</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.countryBreakdown.map((c) => (
          <div key={c.code} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-600">{c.name}</span>
              <span className="rounded bg-[#1abc9c]/10 px-2 py-1 text-[10px] font-bold text-[#1abc9c]">Active</span>
            </div>
            
            <h4 className="text-xl font-extrabold text-[#1abc9c]">
              {c.currency} {c.volume >= 1000 ? (c.volume/1000).toFixed(1) + 'k' : c.volume.toLocaleString()}
            </h4>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">Total Volume</p>
            
            <p className="font-bold text-[#112a46]">{c.txCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-6">Transactions</p>
            
            <button 
              onClick={() => onSelectCountry(c.code)}
              className="mt-auto w-full rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-[#112a46]"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// --- VIEW 2: COUNTRY SPECIFIC ANALYTICS ---
function CountryDetailView({ countryCode, onBack }: { countryCode: string, onBack: () => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const data = useQuery(api.adminDeposits.getCountryDeposits, { countryCode, search, status });

  if (data === undefined) return <div className="font-bold text-[#112a46]">Loading Country Data...</div>;

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-[#1abc9c] transition"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-[#112a46]">{data.countryName} Analytics</h1>
        <button className="ml-auto rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50">
          📥 Export Data
        </button>
      </div>

      {/* Country Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-[#1abc9c]/10 p-6">
          <div className="flex justify-between items-start">
            <p className="text-sm font-bold text-[#16a085]">Total Volume</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1abc9c]/20 text-[#16a085]">$</span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-[#112a46]">
            {data.currency} {data.volume >= 1000 ? (data.volume/1000).toFixed(1) + 'k' : data.volume.toLocaleString()}
          </h2>
          <p className="mt-1 text-xs text-[#16a085]">{data.totalTx} total deposits</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">Completed Transactions</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">☑️</span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-[#112a46]">{data.completedTx}</h2>
          <p className="mt-1 text-xs text-gray-400">Successful deposits</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500">Success Rate</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">📈</span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-[#112a46]">{data.successRate}%</h2>
          <p className="mt-1 text-xs text-gray-400">Conversion rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-bold text-[#112a46] flex items-center gap-2">
          <span>filter</span> Search & Filter
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by phone, user, or receipt ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#1abc9c] focus:bg-white"
            />
          </div>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 outline-none focus:border-[#1abc9c]"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Cancelled / Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <h3 className="font-medium text-[#112a46]">Recent Transactions ({data.items.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fcfb] text-[#112a46] text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Receipt ID</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No transactions found.</td>
                </tr>
              ) : (
                data.items.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium">{t.phone}</td>
                    <td className="px-6 py-4 text-gray-500">{t.user}</td>
                    <td className="px-6 py-4 font-extrabold text-[#112a46]">{t.currency} {t.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold uppercase ${
                        t.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        t.status === 'failed' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {t.status === 'paid' ? 'Completed' : t.status === 'failed' ? 'Cancelled' : t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{t.receipt}</td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}