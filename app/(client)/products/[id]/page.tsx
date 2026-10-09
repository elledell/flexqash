"use client";

import Link from "next/link";
import { use } from "react";

export default function ProductPlaceholderPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the Promise required by Next.js 15
  const resolvedParams = use(params);
  
  // Format the URL slug into a readable title (e.g., "digital-marketing" -> "Digital Marketing")
  const productName = resolvedParams.id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg text-center">
        {/* Animated Icon Wrapper */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#1abc9c]/10 shadow-inner">
          <span className="text-4xl">🚀</span>
        </div>

        <h1 className="mb-4 text-3xl font-extrabold text-[#112a46]">
          {productName}
        </h1>
        
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm leading-relaxed text-gray-500">
            We are currently putting the finishing touches on <strong className="text-[#1abc9c]">{productName}</strong>. 
            This feature will be available very soon as part of our upcoming platform expansion.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#1abc9c]" style={{ animationDelay: "0ms" }}></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#1abc9c]" style={{ animationDelay: "150ms" }}></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#1abc9c]" style={{ animationDelay: "300ms" }}></span>
          </div>
        </div>

        <Link 
          href="/dashboard"
          className="inline-block rounded-xl bg-[#112a46] px-8 py-3.5 font-bold text-white shadow-md transition hover:bg-[#1a3a5e]"
        >
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  );
}