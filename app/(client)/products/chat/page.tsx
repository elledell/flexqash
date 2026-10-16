"use client";

import Link from "next/link";

export default function ChatFeaturePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg text-center animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Animated Icon Wrapper */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#1abc9c]/10 shadow-inner">
          <span className="text-4xl animate-pulse">💬</span>
        </div>

        <h1 className="mb-4 text-3xl font-extrabold text-[#112a46]">
          Chat & Earn
        </h1>
        
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="bg-[#112a46] py-4">
            <h2 className="text-lg font-black tracking-widest text-white uppercase">ChatMula Portal</h2>
          </div>
          
          <div className="p-8">
            <p className="mb-8 text-sm leading-relaxed text-gray-500">
              This feature is powered by our exclusive sister platform, <strong className="text-[#1abc9c]">ChatMula</strong>. 
              Click below to securely access the platform, connect with users globally, and start earning for your conversations.
            </p>

            <a 
              href="https://www.chatmula.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1abc9c] px-8 py-4 font-bold text-white shadow-md transition-all hover:bg-[#16a085] hover:-translate-y-1 hover:shadow-lg"
            >
              Open ChatMula.co 
              <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗️</span>
            </a>
          </div>
        </div>

        <Link 
          href="/dashboard"
          className="inline-block rounded-xl bg-white border border-gray-200 text-gray-600 px-8 py-3.5 font-bold shadow-sm transition hover:bg-gray-50"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}