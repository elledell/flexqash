"use client";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#112a46]">Contact Us</h1>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          SUPPORT » <span className="text-[#1abc9c]">CONTACT US</span>
        </div>
      </div>

      <div className="mb-8 max-w-2xl">
        <h2 className="text-xl font-bold text-[#112a46] mb-2">How can we help you?</h2>
        <p className="text-sm text-gray-600">
          Our support team is available to assist you with any questions about your account, deposits, withdrawals, or products. Choose your preferred method of communication below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* WhatsApp Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/10 text-3xl text-[#25D366]">
            💬
          </div>
          <h3 className="mb-2 text-lg font-bold text-[#112a46]">WhatsApp Support</h3>
          <p className="mb-6 text-sm text-gray-500 flex-1">
            Get fast assistance from our support agents directly through WhatsApp. Available 24/7.
          </p>
          <a
            href="https://wa.me/254700000000"
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-xl bg-[#25D366] py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-[#20bd5a]"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* Email Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1abc9c]/10 text-3xl text-[#1abc9c]">
            ✉️
          </div>
          <h3 className="mb-2 text-lg font-bold text-[#112a46]">Email Support</h3>
          <p className="mb-6 text-sm text-gray-500 flex-1">
            Send us a detailed message and our team will get back to you within 24 hours.
          </p>
          <a
            href="mailto:support@flexqash.com"
            className="w-full rounded-xl bg-[#112a46] py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-[#0a1f38]"
          >
            support@flexqash.com
          </a>
        </div>
      </div>
    </div>
  );
}