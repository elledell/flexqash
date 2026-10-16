"use client";

import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import { api } from "../../../../convex/_generated/api";
import "flag-icons/css/flag-icons.min.css"; 

export default function TeamPage({ params }: { params: Promise<{ level: string }> }) {
  // Unwrap the Promise required by Next.js 15
  const resolvedParams = use(params);
  const level = parseInt(resolvedParams.level) || 1;
  
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  
  // Strictly enforce a status. Default to "active" if missing.
  const status = statusParam === "inactive" ? "inactive" : "active";

  const team = useQuery(api.team.getTeam, { level, status });
  const stats = useQuery(api.dashboard.getStats);

  if (team === undefined || stats === undefined) {
    return <div className="flex min-h-screen items-center justify-center font-bold text-[#112a46]">Loading team data...</div>;
  }

  if (stats === null) {
    return <div className="p-8 text-center text-red-500 font-bold">Error loading stats data.</div>;
  }

  const totalEarned = team.reduce((acc, member) => acc + member.earned, 0);
  const displayStatus = status ? status.toUpperCase() : "ALL";

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      {/* Header Breadcrumbs */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#112a46]">Home</h1>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          LEVEL {level} {displayStatus} USERS » <span className="text-[#1abc9c]">Home</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-2 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46] uppercase tracking-wide">
          LEVEL {level} {displayStatus} USERS
        </h3>
        
        <p className="mb-8 font-bold text-[#1abc9c] text-sm">
          Total Level {level} Earnings : {stats.currency} {totalEarned.toLocaleString()}
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-[#112a46]">
              <tr>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Username</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Mobile</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Earned</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Country</th>
                <th className="px-6 py-4 font-extrabold uppercase tracking-wider text-xs">Date of Reg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {team.length > 0 ? (
                team.map((user) => (
                  <tr key={user._id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-[#1abc9c] flex items-center gap-3">
                      <span className={`fi fi-${user.country.toLowerCase()} rounded-sm drop-shadow-sm text-lg`} />
                      - {user.username}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#112a46]">{user.mobile}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {stats.currency} {user.earned.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        user.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#112a46]">{user.country}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {new Date(user.dateOfReg).toISOString().split('T')[0]}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                    No {status || ""} users found in Level {level}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}