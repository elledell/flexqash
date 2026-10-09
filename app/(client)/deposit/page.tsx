"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { PAYMENT_INSTRUCTIONS, PaymentMethod } from "../../../convex/paymentInstructions";

export default function DepositPage() {
  const status = useQuery(api.membership.status);
  const deposits = useQuery(api.deposit.getUserDeposits);
  const submitManual = useMutation(api.deposit.submitManualDeposit);

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  if (!status || deposits === undefined) return <div className="p-8">Loading...</div>;

  const countryCode = status.provider === "mpesa" ? "KE" : (status as any).country ?? "UG";
  const instructions = PAYMENT_INSTRUCTIONS[countryCode] ?? { type: "coming_soon", methods: [] };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSubmit = async () => {
    if (!phone || !amount || Number(amount) <= 0) {
      setError("Please enter a valid phone number and amount.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await submitManual({
        methodTitle: selectedMethod?.title ?? "Manual Deposit",
        phone,
        amount: Number(amount),
        transactionId: transactionId || undefined,
      });
      setPhone("");
      setAmount("");
      setTransactionId("");
      setSelectedMethod(null);
      setSuccess("Deposit request submitted successfully! Awaiting admin approval.");
    } catch (e) {
      setError(e instanceof ConvexError ? String(e.data) : "Failed to record deposit.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Home</h1>
        <div className="text-sm font-medium text-gray-500">
          Dashboard » <span className="text-[#1abc9c]">Deposit</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:w-2/3">
        <h3 className="mb-6 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46]">
          {selectedMethod ? selectedMethod.title : "Fund Your Wallet"}
        </h3>

        {/* Payment Method Selector */}
        {!selectedMethod && instructions.type === "manual" ? (
          <div className="flex flex-col gap-3 mb-8">
            {instructions.methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method)}
                className="w-full sm:w-1/2 rounded-xl bg-[#1abc9c] py-3.5 text-center font-bold text-white shadow transition hover:bg-[#16a085]"
              >
                {method.buttonLabel}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {instructions.type === "manual" && (
              <button
                onClick={() => setSelectedMethod(null)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 underline mb-4 inline-block"
              >
                ← Change payment method
              </button>
            )}

            {/* Payment Instructions Box */}
            {selectedMethod && (
              <div className="rounded-lg bg-[#e0f7fa]/30 p-4 border border-[#1abc9c]/20 mb-6">
                <ol className="space-y-2 text-sm font-medium text-[#112a46]">
                  {selectedMethod.steps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-2 leading-relaxed">
                      <span>{step}</span>
                      {selectedMethod.copyableCode && step.includes(selectedMethod.copyableCode) && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedMethod.copyableCode!)}
                          className="ml-2 rounded border border-gray-300 bg-white px-2 py-1 text-[10px] font-bold text-gray-700 hover:bg-gray-100 uppercase"
                        >
                          {copied ? "Copied" : "Copy"}
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Deposit Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Enter Mobile</label>
                <input
                  type="text"
                  className="w-full sm:w-2/3 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1abc9c]"
                  placeholder="254142032284"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Enter Amount ({status.currency})</label>
                <input
                  type="number"
                  className="w-full sm:w-2/3 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1abc9c]"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {selectedMethod && (
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Transaction ID</label>
                  <input
                    type="text"
                    className="w-full sm:w-2/3 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1abc9c]"
                    placeholder="Paste receipt or ID here"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              )}
            </div>

            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            {success && <p className="text-sm font-bold text-[#1abc9c]">{success}</p>}

            <button
              onClick={handleManualSubmit}
              disabled={loading}
              className="mt-4 rounded-lg bg-[#1abc9c] px-8 py-3 font-bold text-white shadow-md transition hover:bg-[#16a085] disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        )}

        {/* Deposit History Table */}
        <div className="mt-12">
          <h4 className="mb-4 border-l-[3px] border-[#1abc9c] pl-3 text-sm font-bold text-[#112a46]">
            Deposit History
          </h4>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-bold">Amount</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Created Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {deposits && deposits.length > 0 ? (
                  deposits.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">
                        {tx.currency} {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                          tx.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(tx._creationTime).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      No deposits recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}