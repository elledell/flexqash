"use client";

import "flag-icons/css/flag-icons.min.css";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

const COUNTRIES = [
  { code: "ALL", name: "All Countries", currency: "" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "UG", name: "Uganda", currency: "UGX" },
  { code: "TZ", name: "Tanzania", currency: "TZS" },
  { code: "MW", name: "Malawi", currency: "MWK" },
  { code: "ZM", name: "Zambia", currency: "ZMW" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "RW", name: "Rwanda", currency: "RWF" },
  { code: "BI", name: "Burundi", currency: "BIF" },
  { code: "BW", name: "Botswana", currency: "BWP" },
  { code: "CM", name: "Cameroon", currency: "XAF" },
  { code: "SS", name: "South Sudan", currency: "SSP" },
  { code: "CD", name: "DR Congo", currency: "CDF" },
];

export default function AdminWithdrawalsPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [country, setCountry] = useState("ALL");
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const statusParam = filter === "all" ? undefined : filter;
  const data = useQuery(api.withdrawals.listAllWithdrawals, { 
    status: statusParam, 
    countryCode: country 
  });
  const updateStatus = useMutation(api.withdrawals.updateWithdrawalStatus);

  if (data === undefined) {
    return <div className="p-8 font-bold text-[#112a46]">Loading withdrawals...</div>;
  }

  // Calculate live stats for the header cards
  const approved = data.filter(d => d.status === "approved");
  const pending = data.filter(d => d.status === "pending");
  const rejected = data.filter(d => d.status === "rejected");

  const pendingAmount = pending.reduce((sum, tx) => sum + tx.amount, 0);
  const approvedAmount = approved.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Dynamic currency logic based on selection
  let displayCurrency = "MIXED";
  if (country !== "ALL") {
    displayCurrency = COUNTRIES.find(c => c.code === country)?.currency || "";
  } else if (data.length > 0) {
    displayCurrency = data[0].currency;
  }

  const handleApprove = async (id: string) => {
    if (!confirm("Confirm you have successfully sent the funds to this user?")) return;
    setProcessing(id);
    try {
      await updateStatus({ withdrawalId: id as any, status: "approved" });
      setSelectedTx(null);
    } catch (e) {
      alert("Error approving withdrawal");
    }
    setProcessing(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this request? The funds will not be sent.")) return;
    setProcessing(id);
    try {
      await updateStatus({ withdrawalId: id as any, status: "rejected" });
      setSelectedTx(null);
    } catch (e) {
      alert("Error rejecting withdrawal");
    }
    setProcessing(null);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header & Country Switcher */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-[#112a46]">Withdrawal Requests</h1>
        
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

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="mb-2 flex items-start justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Withdrawn</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-600">✓</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#112a46]">
            {displayCurrency !== "MIXED" ? `${displayCurrency} ` : ""}
            {approvedAmount.toLocaleString()}
          </h2>
          <p className="mt-1 text-xs text-gray-500">{approved.length} completed requests</p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-orange-100/30 p-5 shadow-sm transition hover:shadow-md">
          <div className="mb-2 flex items-start justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Pending Requests</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600">🕒</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#112a46]">{pending.length}</h2>
          <p className="mt-1 text-xs text-gray-500">
            {displayCurrency !== "MIXED" ? `${displayCurrency} ` : ""}
            {pendingAmount.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="mb-2 flex items-start justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Failed/Rejected</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600">✕</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#112a46]">{rejected.length}</h2>
          <p className="mt-1 text-xs text-gray-500">{data.length} total requests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === f ? "bg-[#112a46] text-white" : "bg-white text-gray-500 hover:bg-gray-50 shadow-sm border border-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main Table Area */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-50 p-5">
          <h3 className="font-medium text-[#112a46]">All Withdrawal Requests ({data.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fcfb] text-[#112a46] text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Requested</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-medium text-gray-400">
                    No {filter} withdrawal requests found for {country === "ALL" ? "any region" : COUNTRIES.find(c => c.code === country)?.name}.
                  </td>
                </tr>
              ) : (
                data.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-700 flex items-center gap-2">
                      <span className={`fi fi-${tx.countryCode.toLowerCase()} rounded-sm shadow-sm`} />
                      {tx.recipientPhone}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#112a46]">
                      {tx.currency} {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        tx.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        tx.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedTx(tx)}
                        className="text-sm font-bold text-[#112a46] hover:text-[#1abc9c] transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal for Viewing and Processing */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112a46]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#112a46]">Withdrawal Details</h2>
              <button 
                onClick={() => setSelectedTx(null)} 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="mb-8 space-y-4">
              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span className="text-sm font-medium text-gray-500">Requested By</span>
                <div className="text-right">
                  <span className="block font-bold text-[#112a46]">{selectedTx.username}</span>
                  <span className="text-xs text-gray-400">{selectedTx.userEmail}</span>
                </div>
              </div>
              
              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span className="text-sm font-medium text-gray-500">Country</span>
                <span className="flex items-center gap-2 font-bold text-[#112a46]">
                  <span className={`fi fi-${selectedTx.countryCode.toLowerCase()} rounded-sm`} />
                  {selectedTx.countryCode}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span className="text-sm font-medium text-gray-500">Send To (Name)</span>
                <span className="font-bold text-[#1abc9c]">{selectedTx.recipientName}</span>
              </div>

              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span className="text-sm font-medium text-gray-500">Send To (Number)</span>
                <span className="font-bold text-[#112a46]">{selectedTx.recipientPhone}</span>
              </div>

              <div className="flex justify-between border-b border-gray-50 pb-3 mt-4">
                <span className="text-sm font-medium text-gray-500">Gross Amount Requested</span>
                <span className="font-bold text-gray-400 line-through">{selectedTx.currency} {selectedTx.amount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span className="text-sm font-medium text-gray-500">Platform Fee Deduction</span>
                <span className="font-bold text-red-500">- {selectedTx.currency} {selectedTx.fee.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#1abc9c]/10 p-4 border border-[#1abc9c]/20">
                <span className="text-sm font-extrabold text-[#16a085]">AMOUNT TO SEND</span>
                <span className="text-2xl font-extrabold text-[#16a085]">{selectedTx.currency} {selectedTx.netAmount.toLocaleString()}</span>
              </div>
            </div>

            {selectedTx.status === "pending" ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => handleReject(selectedTx._id)}
                  disabled={processing === selectedTx._id}
                  className="flex-1 rounded-xl bg-red-50 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  Reject Request
                </button>
                <button 
                  onClick={() => handleApprove(selectedTx._id)}
                  disabled={processing === selectedTx._id}
                  className="flex-[2] rounded-xl bg-[#112a46] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1a3a5e] disabled:opacity-50"
                >
                  {processing === selectedTx._id ? "Processing..." : "Mark as Paid"}
                </button>
              </div>
            ) : (
               <button 
                  onClick={() => setSelectedTx(null)}
                  className="w-full rounded-xl bg-gray-100 py-3.5 text-sm font-bold text-gray-600 transition hover:bg-gray-200"
                >
                  Close Window
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}