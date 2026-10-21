"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { PAYMENT_INSTRUCTIONS, PaymentMethod } from "../../../convex/paymentInstructions";
import { inputClass } from "../../components/ui";

export default function DepositPage() {
  const router = useRouter();

  const status = useQuery(api.membership.status);
  const deposits = useQuery(api.deposit.getUserDeposits);
  
  const startMpesaDeposit = useAction(api.payments.mpesa.startDeposit);
  const submitManual = useMutation(api.deposit.submitManualDeposit);

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  
  // For external gateways (Selar / Eversend)
  const [clickedGatewayMethod, setClickedGatewayMethod] = useState<any | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!status || deposits === undefined) {
    return <div className="flex min-h-screen items-center justify-center font-bold text-[#112a46]">Loading...</div>;
  }

  const countryCode = status.provider === "mpesa" ? "KE" : (status as any).country ?? "UG";
  const instructions = PAYMENT_INSTRUCTIONS[countryCode] ?? { type: "coming_soon", methods: [] };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateAmount = () => {
    const numAmount = Number(amount);
    if (!amount || numAmount < 100) {
      setError(`Minimum deposit amount is 100 ${status.currency ?? "KES"}.`);
      return false;
    }
    return true;
  }

  const handleMpesaSubmit = async () => {
    if (!phone) return setError("Please enter your M-Pesa phone number.");
    if (!validateAmount()) return;

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await startMpesaDeposit({ phone, amount: Number(amount) });
      setSuccess("Payment prompt sent! Please enter your PIN on your phone.");
      setAmount("");
      setPhone("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to send M-Pesa prompt.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!phone) return setError("Please enter the phone number used to pay.");
    if (!transactionId) return setError("Please enter the Transaction ID or Receipt.");
    if (!validateAmount()) return;

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await submitManual({
        methodTitle: selectedMethod?.title ?? "Manual Mobile Money",
        phone,
        amount: Number(amount),
        transactionId,
      });
      setPhone("");
      setAmount("");
      setTransactionId("");
      setSelectedMethod(null);
      setSuccess("Deposit request submitted successfully! Awaiting admin approval.");
    } catch (e) {
      setError(e instanceof ConvexError ? String(e.data) : "Failed to record deposit.");
    } finally {
      setLoading(false);
    }
  };

  const handleGatewaySubmit = async () => {
    if (!transactionId) return setError("Please paste the confirmation message to verify.");
    if (!validateAmount()) return;

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await submitManual({
        methodTitle: clickedGatewayMethod?.title || "External Gateway Deposit",
        phone: phone || "N/A", 
        amount: Number(amount),
        transactionId,
      });
      setPhone("");
      setAmount("");
      setTransactionId("");
      setClickedGatewayMethod(null);
      setSuccess("Deposit request submitted! Awaiting admin approval.");
    } catch (e) {
      setError(e instanceof ConvexError ? String(e.data) : "Failed to submit deposit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-[#f4f7fb] px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm sm:p-8 border border-gray-100">
        
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#112a46]">Deposit Funds</h1>
          <button onClick={() => router.push("/dashboard")} className="text-sm font-medium text-gray-500 hover:text-[#1abc9c]">
            « Dashboard
          </button>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold text-[#1abc9c]">Fund Your Wallet</h2>
          <p className="mt-1 text-sm font-semibold text-gray-500">Minimum deposit is 100 {status.currency ?? "KES"}</p>
        </div>

        {/* 1. KENYA: AUTOMATED M-PESA */}
        {countryCode === "KE" && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              Enter your amount and phone number to receive an instant M-Pesa STK push.
            </p>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Amount ({status.currency ?? "KES"})</label>
              <input
                type="number"
                className={inputClass}
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">M-Pesa Phone Number</label>
              <input
                type="text"
                className={inputClass}
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {error && <p className="text-xs font-bold text-red-600">{error}</p>}
            {success && <p className="text-xs font-bold text-emerald-600">{success}</p>}

            <button
              disabled={loading || !phone || !amount}
              onClick={handleMpesaSubmit}
              className="w-full rounded-xl bg-[#1abc9c] py-3 text-center font-bold text-white shadow transition hover:bg-[#16a085] disabled:opacity-50"
            >
              {loading ? "Sending prompt..." : "Pay with M-Pesa"}
            </button>
          </div>
        )}

        {/* 2. MANUAL COUNTRIES (UG, TZ, MW, etc.) */}
        {instructions.type === "manual" && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            {!selectedMethod ? (
              <div className="flex flex-col gap-3">
                {instructions.methods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className="w-full rounded-xl bg-[#1abc9c] py-3.5 text-center font-bold text-white shadow transition hover:bg-[#16a085]"
                  >
                    {method.buttonLabel}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700 underline"
                >
                  ← Back to payment methods
                </button>

                <h3 className="font-bold text-[#1abc9c]">{selectedMethod.title}</h3>

                <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <ol className="space-y-2 text-sm font-medium text-[#112a46]">
                    {selectedMethod.steps.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-2 leading-relaxed">
                        <span>{step}</span>
                        {selectedMethod.copyableCode && step.includes(selectedMethod.copyableCode) && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedMethod.copyableCode!)}
                            className="ml-2 rounded border border-gray-300 bg-white px-2 py-1 text-[10px] font-bold text-gray-700 hover:bg-gray-100 uppercase shadow-sm"
                          >
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-bold text-[#112a46] mb-1">Deposit Amount ({status.currency})</label>
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="e.g. 5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#112a46] mb-1">Phone Number Used to Pay:</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. 07XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#112a46] mb-1">Transaction Message/Receipt:</label>
                    <textarea
                      className={`${inputClass} h-20 resize-none`}
                      placeholder="Paste the confirmation message..."
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
                {success && <p className="text-sm text-[#1abc9c] font-bold">{success}</p>}

                <button
                  onClick={handleManualSubmit}
                  disabled={loading}
                  className="w-full rounded-xl bg-[#1abc9c] py-3.5 text-center font-bold text-white shadow transition hover:bg-[#16a085] disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Confirm Deposit"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. EXTERNAL GATEWAYS (SELAR / EVERSEND) */}
        {(instructions.type === "selar" || instructions.type === "eversend") && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            {!clickedGatewayMethod ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-600">
                  Click the link below to pay. After completing payment, return here to submit your confirmation receipt.
                </p>
                {instructions.methods.map((method: any) => (
                  <a
                    key={method.id}
                    href={method.selarUrl || method.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setClickedGatewayMethod(method)}
                    className="block w-full rounded-xl bg-[#1abc9c] py-3.5 text-center font-bold text-white shadow transition hover:bg-[#16a085]"
                  >
                    {method.buttonLabel}
                  </a>
                ))}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="rounded-lg bg-[#e0f7fa]/30 p-4 border border-[#1abc9c]/20 mb-4 text-sm text-[#112a46]">
                  <strong>Step 2:</strong> Paste your confirmation message or email receipt below to record your deposit.
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#112a46] mb-1">Deposit Amount ({status.currency})</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#112a46] mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. 07XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#112a46] mb-1">Confirmation Message / Receipt</label>
                  <textarea
                    className={`${inputClass} h-24 resize-none`}
                    placeholder="Paste the SMS or Email receipt text here..."
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                
                {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
                {success && <p className="text-sm text-[#1abc9c] font-bold">{success}</p>}
                
                <button
                  onClick={handleGatewaySubmit}
                  disabled={loading || !transactionId || !amount}
                  className="w-full rounded-xl bg-[#1abc9c] py-3.5 text-center font-bold text-white shadow transition hover:bg-[#16a085] disabled:opacity-50"
                >
                  {loading ? "Submitting Request..." : "Submit Deposit Request"}
                </button>
                
                <button
                  onClick={() => setClickedGatewayMethod(null)}
                  className="mt-2 block w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-700 underline"
                >
                  Back to payment link
                </button>
              </div>
            )}
          </div>
        )}

        {/* COMING SOON */}
        {instructions.type === "coming_soon" && countryCode !== "KE" && (
          <p className="mt-6 rounded-md bg-amber-50 p-4 text-center text-sm font-medium text-amber-700 border border-amber-100">
            Automated deposits for your region are coming soon. Contact customer care for manual assistance.
          </p>
        )}

        {/* Deposit History Table */}
        <div className="mt-10 border-t border-gray-100 pt-6">
          <h4 className="border-l-[3px] border-[#1abc9c] pl-3 text-sm font-bold text-[#112a46]">
            Your Deposit History
          </h4>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-400">
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {deposits && deposits.length > 0 ? (
                  deposits.map((tx) => (
                    <tr key={tx._id}>
                      <td className="py-3 font-bold">{tx.currency} {tx.amount.toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            tx.status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : tx.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-500">
                        {new Date(tx._creationTime).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-gray-400">
                      No deposits recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}