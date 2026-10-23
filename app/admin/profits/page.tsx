"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ProfitsPage() {
  const transactions = useQuery(api.adminProfits.getTransactionProfits);

  if (transactions === undefined) {
    return <div className="flex h-64 items-center justify-center font-bold text-[#112a46]">Loading Profit Margins...</div>;
  }

  // Calculate the grand total KES profit across all transactions
  const totalGlobalProfitKES = transactions.reduce((sum, tx) => sum + tx.profitKES, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#112a46]">Management Profits</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Transaction-level breakdown converted to KES</p>
        </div>
        <div className="rounded-xl bg-[#1abc9c]/10 px-6 py-3 border border-[#1abc9c]/20">
          <p className="text-xs font-bold text-[#1abc9c] uppercase tracking-wider">Total Net Profit</p>
          <p className="text-xl font-black text-[#112a46]">KES {totalGlobalProfitKES.toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f4f7fb] text-xs font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Activation Fee</th>
                <th className="px-6 py-4 text-rose-500">L1 Payout</th>
                <th className="px-6 py-4 text-rose-500">L2 Payout</th>
                <th className="px-6 py-4 text-rose-500">L3 Payout</th>
                <th className="px-6 py-4 text-[#112a46]">Net (Native)</th>
                <th className="px-6 py-4 bg-[#1abc9c]/10 text-[#1abc9c] font-black">Net (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {transactions.map((tx) => (
                <tr key={tx._id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-[#112a46]">{tx.user}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                      {tx.country}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tx.currency} {tx.activationFee.toLocaleString()}</td>
                  <td className="px-6 py-4 text-rose-500/80">{tx.l1 > 0 ? `-${tx.l1.toLocaleString()}` : "-"}</td>
                  <td className="px-6 py-4 text-rose-500/80">{tx.l2 > 0 ? `-${tx.l2.toLocaleString()}` : "-"}</td>
                  <td className="px-6 py-4 text-rose-500/80">{tx.l3 > 0 ? `-${tx.l3.toLocaleString()}` : "-"}</td>
                  <td className="px-6 py-4 font-bold text-[#112a46]">{tx.currency} {tx.nativeProfit.toLocaleString()}</td>
                  <td className="px-6 py-4 bg-[#1abc9c]/5 text-[#1abc9c] font-black">
                    KES {tx.profitKES.toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No active transactions found.
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