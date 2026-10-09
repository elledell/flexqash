"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function UsersManagementPage() {
  const [search, setSearch] = useState("");
  const data = useQuery(api.adminUsers.listUsers, { searchTerm: search });

  if (data === undefined) {
    return <div className="font-bold text-[#112a46]">Loading Users...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#112a46]">Users Management</h1>
      </div>

      {/* Top Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-green-100 bg-green-50/40 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Users</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100/50 text-green-600">👥</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold text-[#112a46]">{data.stats.totalUsers}</h2>
          <p className="mt-1 text-xs text-gray-500">+{data.stats.activeThisWeek} joined this week</p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Activated</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100/50 text-orange-600">☑️</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold text-[#112a46]">{data.stats.activatedUsers}</h2>
          <p className="mt-1 text-xs text-gray-500">{data.stats.activationRate}% activation rate</p>
        </div>

        <div className="rounded-2xl border border-yellow-100 bg-yellow-50/40 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active This Week</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-100/50 text-yellow-600">📈</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold text-[#112a46]">{data.stats.activeThisWeek}</h2>
          <p className="mt-1 text-xs text-gray-500">of {data.stats.totalUsers} total users</p>
        </div>
      </div>

      {/* Search and Table Area */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        
        {/* Search Bar Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-50 bg-white">
          <div className="relative flex-1 max-w-2xl">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by email or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#1abc9c] focus:bg-white transition-colors"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Test Only</span>
            <div className="h-6 w-11 rounded-full bg-gray-200 border border-gray-300 relative cursor-not-allowed opacity-70">
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm"></div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fcfb] text-[#112a46]">
              <tr>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Country</th>
                <th className="px-6 py-4 font-bold">Total Earned</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                data.items.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-500">
                        {user.country}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#112a46]">
                      {user.currency} {user.totalEarned.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "Activated" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                          <span className="text-emerald-500">✓</span> Activated
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-[#f97316] px-3 py-1 text-xs font-bold text-white shadow-sm">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-400 hover:text-[#112a46] font-bold tracking-widest px-2">
                        •••
                      </button>
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