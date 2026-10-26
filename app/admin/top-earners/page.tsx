"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function TopEarnersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const earners = useQuery(api.adminDeposits.getTopEarners, { 
    searchTerm: searchTerm.length > 2 ? searchTerm : undefined 
  });

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#112a46]">Member Earnings Matrix</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Global network earnings ranked by KES standardized value
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by username, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm font-bold text-[#112a46] outline-none transition focus:border-[#1abc9c] focus:bg-white focus:ring-4 focus:ring-[#1abc9c]/10"
          />
        </div>
      </div>

      {/* Earners Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fcfb] text-[#1abc9c] text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-16 text-center">Rank</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4 text-center">Country</th>
                <th className="px-6 py-4 text-right">Native Earnings</th>
                <th className="px-6 py-4 text-right bg-emerald-50/50">KES Equivalent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {earners === undefined ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-bold text-[#112a46]">
                    Scanning global earnings...
                  </td>
                </tr>
              ) : earners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-bold text-gray-400">
                    No earnings found matching your search.
                  </td>
                </tr>
              ) : (
                earners.map((earner, index) => (
                  <tr key={earner._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black
                          ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                            index === 1 ? 'bg-gray-200 text-gray-700' : 
                            index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-400'}`}>
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#112a46]">@{earner.username}</p>
                      <p className="text-xs font-medium text-gray-500">{earner.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                        {earner.country}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-600">
                        {earner.currency} {earner.nativeTotal.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right bg-emerald-50/30">
                      <span className="font-black text-[#1abc9c]">
                        KES {earner.kesTotal.toLocaleString()}
                      </span>
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