"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { calculateWithdrawalFee } from "../../../convex/financials";

export default function WithdrawPage() {
  const info = useQuery(api.withdrawals.getWithdrawalInfo);
  const history = useQuery(api.withdrawals.getUserWithdrawals);
  const requestWithdrawal = useMutation(api.withdrawals.requestWithdrawal);

  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [method, setMethod] = useState("Mobile Money");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (info === undefined || history === undefined) {
    return <div className="p-8 font-bold text-[#112a46]">Loading withdrawals...</div>;
  }

  if (info === null) {
    return <div className="p-8 text-red-500 font-bold">Please sign in to access withdrawals.</div>;
  }

  const numAmount = parseFloat(amount) || 0;
  const feeDetails = calculateWithdrawalFee(info.country, numAmount);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (numAmount < feeDetails.minWithdrawal) {
      setError(`Minimum withdrawal is ${info.currency} ${feeDetails.minWithdrawal.toLocaleString()}`);
      return;
    }
    if (numAmount > info.availableBalance) {
      setError("Insufficient available balance.");
      return;
    }
    if (!info.phone || !recipientName.trim()) {
      setError("Please ensure your profile has a phone number and provide the recipient's full name.");
      return;
    }

    setLoading(true);
    try {
      await requestWithdrawal({
        amount: numAmount,
        recipientPhone: info.phone, // Automatically uses their registered number
        recipientName,
        method,
      });
      setSuccess("Withdrawal submitted successfully. Status is currently pending admin payment.");
      setAmount("");
      setRecipientName("");
    } catch (err) {
      setError(err instanceof ConvexError ? String(err.data) : "Failed to submit withdrawal.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Withdraw Your Earnings</h1>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
          DASHBOARD » <span className="text-[#1abc9c]">WITHDRAW</span>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-2xl">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Available Balance</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#112a46]">
            {info.currency} {info.availableBalance.toLocaleString()}
          </h2>
          <p className="mt-1 text-xs text-gray-400">Available to withdraw anytime</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Withdrawn</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#1abc9c]">
            {info.currency} {info.totalWithdrawn.toLocaleString()}
          </h2>
          <p className="mt-1 text-xs text-gray-400">Successfully received payouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Withdrawal Form */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-6 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">
            REQUEST WITHDRAWAL
          </h3>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-600">
                Payment Channel
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[#1abc9c]"
              >
                <option value="Mobile Money">Mobile Money (M-Pesa / MTN / Airtel)</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-600">
                Recipient Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Account name registered with mobile money/bank"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1abc9c]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-600">
                Withdrawal Mobile Number
              </label>
              <input
                type="text"
                readOnly
                value={info.phone || "No phone linked"}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">Funds will be sent securely to your registered account number.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-600">
                Amount ({info.currency})
              </label>
              <input
                type="number"
                required
                placeholder={`Min: ${feeDetails.minWithdrawal}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1abc9c]"
              />
              <p className="mt-1 text-xs text-gray-400">
                Min withdrawal: {info.currency} {feeDetails.minWithdrawal.toLocaleString()}
              </p>
            </div>

            {/* Live Fee & Net Breakdown */}
            {numAmount > 0 && (
              <div className="rounded-xl border border-gray-100 bg-[#f4f7fb] p-4 text-sm font-medium text-[#112a46] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Deduction / Commission Fee:</span>
                  <span className="font-bold text-red-500">
                    - {info.currency} {feeDetails.fee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                  <span>Net Amount Sent to You:</span>
                  <span className="text-[#1abc9c]">
                    {info.currency} {feeDetails.netAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            {success && <p className="text-sm font-bold text-[#1abc9c]">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#112a46] py-3.5 font-bold text-white shadow-md transition hover:bg-[#1a3a5e] disabled:opacity-50"
            >
              {loading ? "Processing..." : "Submit Withdrawal Request"}
            </button>
          </form>
        </div>

        {/* Withdrawal Notice */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-fit">
          <h4 className="mb-3 font-bold text-[#112a46]">Fast Payouts</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Withdrawal requests are processed promptly by our finance team to your registered phone or account details. Commissions are automatically computed based on your country's tiered payout scale.
          </p>
        </div>
      </div>

      {/* Withdrawal History Table */}
      <div className="mt-12 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">
          WITHDRAWAL HISTORY
        </h3>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-[#112a46]">
              <tr>
                <th className="px-6 py-4 font-extrabold uppercase text-xs">Amount</th>
                <th className="px-6 py-4 font-extrabold uppercase text-xs">Fee</th>
                <th className="px-6 py-4 font-extrabold uppercase text-xs">Net Sent</th>
                <th className="px-6 py-4 font-extrabold uppercase text-xs">Status</th>
                <th className="px-6 py-4 font-extrabold uppercase text-xs">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {history.length > 0 ? (
                history.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-[#112a46]">
                      {tx.currency} {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-400">
                      {tx.currency} {tx.fee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#1abc9c]">
                      {tx.currency} {tx.netAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          tx.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : tx.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(tx._creationTime).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No withdrawals recorded yet.
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