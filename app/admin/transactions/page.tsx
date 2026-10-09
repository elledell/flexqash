"use client";

import "flag-icons/css/flag-icons.min.css";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

type Filter = "all" | "paid" | "pending" | "failed" | "review";

const badge: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  review: "bg-purple-100 text-purple-700",
};

export default function AdminTransactions() {
  const me = useQuery(api.users.me);
  const [filter, setFilter] = useState<Filter>("all");

  const data = useQuery(
    api.adminPayments.list,
    me?.role === "admin" ? (filter === "all" ? {} : { status: filter }) : "skip"
  );

  const approve = useMutation(api.adminPayments.approvePayment);
  const reject = useMutation(api.adminPayments.rejectPayment);
  const [processing, setProcessing] = useState<string | null>(null);

  if (me === undefined) return <div className="p-8 font-bold text-[#112a46]">Loading...</div>;
  if (me?.role !== "admin") return <div className="p-8 font-bold text-red-500">Not authorized.</div>;
  if (data === undefined) return <div className="p-8 font-bold text-[#112a46]">Loading transactions...</div>;

  const filters: Filter[] = ["all", "paid", "pending", "failed", "review"];

  const handleApprove = async (id: any) => {
    if (!confirm("Are you sure you want to approve this payment?")) return;
    setProcessing(id);
    try {
      await approve({ paymentId: id });
    } catch (error) {
      alert("Failed to approve payment.");
    }
    setProcessing(null);
  };

  const handleReject = async (id: any) => {
    const reason = prompt("Enter rejection reason:", "Invalid transaction ID");
    if (!reason) return;
    setProcessing(id);
    try {
      await reject({ paymentId: id, reason });
    } catch (error) {
      alert("Failed to reject payment.");
    }
    setProcessing(null);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#112a46]">Deposits & Activations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and process manual payment requests. Totals cover the latest 300 rows.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Paid</p>
          <p className="mt-1 text-2xl font-extrabold text-[#112a46]">{data.counts.paid}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending</p>
          <p className="mt-1 text-2xl font-extrabold text-[#1abc9c]">{data.counts.pending}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Needs Review</p>
          <p className="mt-1 text-2xl font-extrabold text-purple-600">{data.counts.review}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Collected</p>
          {Object.keys(data.paidTotals).length === 0 ? (
            <p className="mt-1 text-2xl font-extrabold text-[#112a46]">0</p>
          ) : (
            Object.entries(data.paidTotals).map(([cur, total]) => (
              <p key={cur} className="mt-1 text-lg font-extrabold text-[#112a46]">
                {cur} {total.toLocaleString()}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === f ? "bg-[#112a46] text-white" : "bg-white text-gray-500 hover:bg-gray-50 shadow-sm border border-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[1000px] text-left text-sm whitespace-nowrap">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-[#112a46]">
            <tr>
              <th className="px-6 py-4 font-extrabold">Date</th>
              <th className="px-6 py-4 font-extrabold">Member</th>
              <th className="px-6 py-4 font-extrabold">Amount</th>
              <th className="px-6 py-4 font-extrabold">Type</th>
              <th className="px-6 py-4 font-extrabold">Status</th>
              <th className="px-6 py-4 font-extrabold">Receipt</th>
              <th className="px-6 py-4 font-extrabold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-600">
            {data.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center font-medium text-gray-400">
                  No transactions found.
                </td>
              </tr>
            )}
            {data.items.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  {new Date(t.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-bold text-[#112a46]">
                    {t.countryCode && <span className={`fi fi-${t.countryCode.toLowerCase()} rounded-sm`} />}
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-400">{t.phone} • {t.method}</div>
                </td>
                <td className="px-6 py-4 font-extrabold text-[#112a46]">
                  {t.currency} {t.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    t.purpose === "deposit" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {t.purpose}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${badge[t.status] || "bg-gray-100 text-gray-600"}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-400">
                  {t.receipt || "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  {t.status === "pending" || t.status === "review" ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(t._id)}
                        disabled={processing === t._id}
                        className="rounded-lg bg-[#1abc9c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#16a085] disabled:opacity-50"
                      >
                        {processing === t._id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(t._id)}
                        disabled={processing === t._id}
                        className="rounded-lg bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">{t.resultDesc || "-"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}