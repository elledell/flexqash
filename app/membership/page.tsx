"use client";

import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { PAYMENT_INSTRUCTIONS, PaymentMethod } from "../../convex/paymentInstructions";
import { inputClass } from "../components/ui"; 

export default function MembershipPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const status = useQuery(api.membership.status);
  const transactions = useQuery(api.membership.getUserTransactions);

  const startMpesa = useAction(api.payments.mpesa.start);
  const submitManual = useMutation(api.membership.submitManualPayment);

  const [phone, setPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  
  const [clickedSelarId, setClickedSelarId] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/sign-in");
    if (status?.active) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, status, router]);

  if (!status || !transactions) return <div className="flex min-h-screen items-center justify-center font-bold text-[#112a46]">Loading...</div>;

  const countryCode = status.provider === "mpesa" ? "KE" : (status as any).country ?? "UG";
  const instructions = PAYMENT_INSTRUCTIONS[countryCode] ?? { type: "coming_soon", methods: [] };

  const isPendingApproval = transactions.some((tx) => tx.status === "pending" && tx.provider === "manual");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper function to cleanly extract Convex backend errors without the ugly prefixes
  const parseError = (e: any) => {
    if (e?.data) return String(e.data);
    const msg = e?.message || "";
    return msg.replace(/^Uncaught Error: ConvexError: /, '').replace(/^ConvexError: /, '') || "An error occurred.";
  };

  const handleManualSubmit = async () => {
    if (!phone) {
      setError("Please enter the phone number used to pay.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await submitManual({
        methodTitle: selectedMethod?.title ?? "Manual Mobile Money",
        phone,
        transactionId: transactionId || undefined,
      });
      setPhone("");
      setTransactionId("");
      setSuccess("Payment submitted! Awaiting admin approval.");
    } catch (e: any) {
      setError(parseError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSelarSubmit = async () => {
    if (!transactionId) {
      setError("Please paste the confirmation message to request activation.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await submitManual({
        methodTitle: "Selar Payment",
        phone: phone || "N/A", 
        transactionId: transactionId,
      });
      setPhone("");
      setTransactionId("");
      setClickedSelarId(null);
      setSuccess("Payment submitted! Awaiting admin approval.");
    } catch (e: any) {
      setError(parseError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fb] px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm sm:p-8 border border-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-[#112a46]">Welcome!</h1>
          <p className="mt-1 text-lg font-bold text-[#1abc9c]">Activate your account</p>
        </div>

        {isPendingApproval ? (
          <div className="mt-8 rounded-xl border border-[#1abc9c]/20 bg-[#1abc9c]/5 p-6 text-center">
            <svg className="mx-auto mb-3 h-10 w-10 text-[#1abc9c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-bold text-[#112a46]">Verification in Progress</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your payment has been received and is currently under review by an admin. You will be automatically redirected to your dashboard once approved.
            </p>
          </div>
        ) : (
          <>
            {/* 1. KENYA: STK PUSH */}
            {countryCode === "KE" && (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Enter your M-Pesa phone number to receive an instant payment prompt.
                </p>
                <input
                  className={inputClass}
                  placeholder="07XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                
                {error && <p className="text-xs font-bold text-red-600">{error}</p>}
                {success && <p className="text-xs font-bold text-emerald-600">{success}</p>}
                
                <button
                  disabled={loading || !phone}
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    setSuccess("");
                    try {
                      await startMpesa({ phone });
                      setSuccess("Prompt sent! Please check your phone to complete payment.");
                    } catch (e: any) {
                      setError(parseError(e));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full rounded-xl bg-[#1abc9c] py-3 text-center font-bold text-white shadow transition hover:bg-[#16a085] disabled:opacity-50"
                >
                  {loading ? "Sending prompt..." : "Pay with M-Pesa"}
                </button>
              </div>
            )}

            {/* 2. MANUAL COUNTRIES */}
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
                                className="ml-2 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-sm"
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
                        <label className="block text-sm font-semibold text-[#112a46] mb-1">
                          Enter number you used to pay below:
                        </label>
                        <input
                          className={inputClass}
                          placeholder="e.g. 07XXXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-[#112a46] mb-1">
                          Transaction Message (Optional):
                        </label>
                        <textarea
                          className={`${inputClass} h-20 resize-none`}
                          placeholder="Paste the confirmation message..."
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                        />
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
                    {success && <p className="text-sm text-emerald-600 font-bold">{success}</p>}

                    <button
                      onClick={handleManualSubmit}
                      disabled={loading}
                      className="w-full rounded-xl bg-[#1abc9c] py-3.5 text-center font-bold text-white shadow transition hover:bg-[#16a085] disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Confirm and Go to Dashboard"}
                    </button>
                    
                    <div className="flex items-center gap-2 pt-2 text-sm text-gray-600">
                      <span>If you need more information:</span>
                      <a
                        href="https://wa.me/254700000000"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded bg-[#f5b041] px-3 py-1 font-bold text-white shadow-sm hover:bg-[#eb984e]"
                      >
                        CLICK HERE
                      </a>
                      <span>to talk to customer care</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. SELAR WITH MESSAGE INPUT */}
            {instructions.type === "selar" && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                {!clickedSelarId ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-gray-600">
                      Click the button below to pay via Selar. After paying, return to this page to submit your receipt message.
                    </p>
                    {instructions.methods.map((method) => (
                      <a
                        key={method.id}
                        href={method.selarUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setClickedSelarId(method.id)}
                        className="block w-full rounded-xl bg-[#1abc9c] py-3.5 text-center font-bold text-white shadow transition hover:bg-[#16a085]"
                      >
                        {method.buttonLabel}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="rounded-lg bg-[#e0f7fa]/30 p-4 border border-[#1abc9c]/20 mb-4 text-sm text-[#112a46]">
                      <strong>Step 2:</strong> Paste your Selar confirmation message or email receipt below to request activation.
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#112a46] mb-1">Phone Number (Optional)</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. 07XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#112a46] mb-1">Selar Confirmation Message</label>
                      <textarea
                        className={`${inputClass} h-24 resize-none`}
                        placeholder="Paste the SMS or Email receipt text here..."
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                    </div>
                    
                    {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
                    {success && <p className="text-sm text-emerald-600 font-bold">{success}</p>}
                    
                    <button
                      onClick={handleSelarSubmit}
                      disabled={loading || !transactionId}
                      className="w-full rounded-xl bg-[#1abc9c] py-3.5 text-center font-bold text-white shadow transition hover:bg-[#16a085] disabled:opacity-50"
                    >
                      {loading ? "Submitting Request..." : "Submit Activation Request"}
                    </button>
                    
                    <button
                      onClick={() => setClickedSelarId(null)}
                      className="mt-2 block w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-700 underline"
                    >
                      Back to payment link
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* COMING SOON */}
            {instructions.type === "coming_soon" && (
              <p className="mt-6 rounded-md bg-amber-50 p-4 text-center text-sm font-medium text-amber-700">
                Automated payments for your region are coming soon. Contact customer care for manual activation.
              </p>
            )}
          </>
        )}

        {/* Transaction History Table */}
        <div className="mt-10 border-t border-gray-100 pt-6">
          <h4 className="border-l-[3px] border-[#1abc9c] pl-3 text-sm font-bold text-[#112a46]">
            Your Transactions Will Appear Here
          </h4>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-400">
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td className="py-3">{tx.methodTitle ?? tx.provider}</td>
                      <td className="py-3">{tx.currency} {tx.amount}</td>
                      <td className="py-3">{tx.phone}</td>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-gray-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => signOut().then(() => router.push("/"))}
            className="text-sm font-semibold text-[#112a46] hover:text-[#1abc9c] underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}