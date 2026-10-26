"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const me = useQuery(api.users.me);

  // Security Lock
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    } else if (me !== undefined && me !== null && me.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, me, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading || me === undefined) {
    return <div className="flex min-h-screen items-center justify-center font-bold text-[#112a46]">Verifying Admin...</div>;
  }

  if (!isAuthenticated || me?.role !== "admin") return null;

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  const navItemClass = (path: string) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
      isActive(path)
        ? "bg-[#1abc9c]/10 text-[#1abc9c]"
        : "text-gray-500 hover:bg-gray-50 hover:text-[#112a46]"
    }`;

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] relative">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-gray-100 bg-white shadow-sm transition-transform duration-300 md:static md:flex md:translate-x-0 ${
          isMobileMenuOpen ? "flex translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-[#112a46]">
              <span className="text-[#1abc9c]">FLEX</span>QASH Admin
            </span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200">
          <Link href="/admin" className={navItemClass("/admin")}>
            <span className="text-lg">㗊</span> Dashboard
          </Link>

          <div className="mt-8 mb-2 px-4 text-xs font-bold tracking-widest text-gray-400 uppercase">Users & Support</div>
          <nav className="space-y-1">
            <Link href="/admin/users" className={navItemClass("/admin/users")}>👥 Users</Link>
            <Link href="/admin/messages" className={navItemClass("/admin/messages")}>✉️ Contact Messages</Link>
          </nav>

          <div className="mt-8 mb-2 px-4 text-xs font-bold tracking-widest text-gray-400 uppercase">Transactions</div>
          <nav className="space-y-1">
  <Link href="/admin/deposits" className={navItemClass("/admin/deposits")}>📊 Deposits</Link>
  <Link href="/admin/withdrawals" className={navItemClass("/admin/withdrawals")}>🏦 Withdrawals</Link>
  <Link href="/admin/transactions" className={navItemClass("/admin/transactions")}>🔔 Activation Requests</Link>
  <Link href="/admin/profits" className={navItemClass("/admin/profits")}>💰 Management Profits</Link>
  <Link href="/admin/top-earners" className={navItemClass("/admin/top-earners")}>🏆 Top Earners</Link>
</nav>
          
          <div className="mt-8 mb-2 px-4 text-xs font-bold tracking-widest text-gray-400 uppercase">Configuration</div>
          <nav className="space-y-1">
            <Link href="/admin/rates" className={navItemClass("/admin/rates")}>💱 Exchange Rates</Link>
            <Link href="/admin/pricing" className={navItemClass("/admin/pricing")}>⚙️ Membership Pricing</Link>
            <Link href="/admin/investments" className={navItemClass("/admin/investments")}>📈 Investment Packages</Link>
            <Link href="/admin/tasks" className={navItemClass("/admin/tasks")}>⚡ Task Settings</Link>
          </nav>
        </div>

        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => signOut().then(() => router.push("/"))}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-100"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between bg-white px-4 md:px-6 shadow-sm z-10">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 md:hidden"
          >
            ☰
          </button>
          <div className="ml-auto flex items-center gap-4">
            <span className="h-8 w-8 rounded-full bg-[#1abc9c]/20 text-[#1abc9c] flex items-center justify-center font-bold text-sm">A</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}