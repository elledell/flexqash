"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState, Suspense } from "react";
import { api } from "../../convex/_generated/api";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { signOut } = useAuthActions();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const me = useQuery(api.users.me);
  const membershipStatus = useQuery(api.membership.status);

  const isBlocked = 
    me && 
    membershipStatus && 
    me.role !== "admin" && 
    !membershipStatus.active;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    } else if (isBlocked) {
      router.replace("/membership");
    }
  }, [isLoading, isAuthenticated, isBlocked, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  if (isLoading || !me || membershipStatus === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] text-[#112a46] font-medium">
        Loading...
      </div>
    );
  }

  if (isBlocked || !isAuthenticated) return null;

  const isActive = (path: string) => pathname?.startsWith(path);

  const navItemClass = (path: string) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
      isActive(path) && !searchParams?.has("status")
        ? "bg-gradient-to-r from-[#1abc9c]/20 to-transparent text-[#1abc9c] border-l-4 border-[#1abc9c]"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const subLinkClass = (levelPath: string, targetStatus: string) => 
    `flex items-center gap-2 text-sm transition-colors ${
      pathname?.includes(levelPath) && searchParams?.get("status") === targetStatus 
        ? "font-bold text-[#1abc9c]" 
        : "font-medium text-gray-500 hover:text-[#112a46]"
    }`;

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-gray-100 bg-white shadow-sm transition-transform duration-300 md:static md:flex md:translate-x-0 ${
          isMobileMenuOpen ? "flex translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Area */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-50 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-[#112a46]">
              <span className="text-[#1abc9c]">FLEX</span>QASH
            </span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="mx-4 mt-6 flex shrink-0 items-center gap-3 rounded-2xl bg-gradient-to-r from-[#112a46] to-[#1a3a5e] p-4 text-white shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1abc9c] text-lg font-bold uppercase shadow-sm">
            {(me?.username || me?.name || "U").charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-bold">
              {me?.username || me?.name || "Member"}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-300">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#1abc9c]"></span> Verified
            </span>
          </div>
          <div className="ml-auto text-lg shrink-0">
            {me?.country === "KE" ? "🇰🇪" : me?.country === "UG" ? "🇺🇬" : "🌍"}
          </div>
        </div>

        {/* Admin Portal Gateway - Only visible to Admins */}
        {me?.role === "admin" && (
          <div className="mx-4 mt-4">
            <Link 
              href="/admin" 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#112a46] py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-[#1a3a5e]"
            >
              ⚙️ Switch to Admin Panel
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Main</div>
          <nav className="space-y-1 mb-8">
            <Link href="/dashboard" className={navItemClass("/dashboard")}>📊 Dashboard</Link>
          </nav>

          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Accounts</div>
          <nav className="space-y-1 mb-8">
            <Link href="/deposit" className={navItemClass("/deposit")}>💳 Deposit</Link>
            <Link href="/withdraw" className={navItemClass("/withdraw")}>🏦 Withdraw</Link>
            <Link href="/ranks" className={navItemClass("/ranks")}>🏆 Ranks</Link>
            <Link href="/claim-bonus" className={navItemClass("/claim-bonus")}>🎁 Claim Bonus</Link>
          </nav>
          
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Network</div>
          <nav className="mb-8 space-y-4">
            {/* Level 1 Group */}
            <div className="group flex flex-col">
              <Link href="/team/1" className={navItemClass("/team/1")}>
                <span className="text-lg">👥</span> Level 1 Team
              </Link>
              {/* Automatically stays open if we are on the /team/1 page, otherwise hoverable on desktop */}
              <div className={`ml-12 flex-col space-y-3 mt-3 mb-2 ${pathname.startsWith("/team/1") ? "flex" : "hidden lg:group-hover:flex"}`}>
                <Link href="/team/1?status=active" className={subLinkClass("/team/1", "active")}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span> Active
                </Link>
                <Link href="/team/1?status=inactive" className={subLinkClass("/team/1", "inactive")}>
                  <span className="h-1.5 w-1.5 rounded-full border border-current"></span> Inactive
                </Link>
              </div>
            </div>

            {/* Level 2 Group */}
            <div className="group flex flex-col">
              <Link href="/team/2" className={navItemClass("/team/2")}>
                <span className="text-lg">👥</span> Level 2 Team
              </Link>
              <div className={`ml-12 flex-col space-y-3 mt-3 mb-2 ${pathname.startsWith("/team/2") ? "flex" : "hidden lg:group-hover:flex"}`}>
                <Link href="/team/2?status=active" className={subLinkClass("/team/2", "active")}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span> Active
                </Link>
                <Link href="/team/2?status=inactive" className={subLinkClass("/team/2", "inactive")}>
                  <span className="h-1.5 w-1.5 rounded-full border border-current"></span> Inactive
                </Link>
              </div>
            </div>

            {/* Level 3 Group */}
            <div className="group flex flex-col">
              <Link href="/team/3" className={navItemClass("/team/3")}>
                <span className="text-lg">👥</span> Level 3 Team
              </Link>
              <div className={`ml-12 flex-col space-y-3 mt-3 mb-2 ${pathname.startsWith("/team/3") ? "flex" : "hidden lg:group-hover:flex"}`}>
                <Link href="/team/3?status=active" className={subLinkClass("/team/3", "active")}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span> Active
                </Link>
                <Link href="/team/3?status=inactive" className={subLinkClass("/team/3", "inactive")}>
                  <span className="h-1.5 w-1.5 rounded-full border border-current"></span> Inactive
                </Link>
              </div>
            </div>
          </nav>

          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Products</div>
          <nav className="space-y-1 mb-8">
            <Link href="/products/kiswahili" className={navItemClass("/products/kiswahili")}>🇹🇿 Teach Kiswahili <span className="ml-auto rounded bg-[#1abc9c] px-1.5 py-0.5 text-[10px] text-white">new</span></Link>
            <Link href="/products/chat" className={navItemClass("/products/chat")}>🌐 Chat with Foreigners</Link>
            <Link href="/products/marketing" className={navItemClass("/products/marketing")}>🎓 Digital Marketing <span className="ml-auto rounded bg-[#1abc9c] px-1.5 py-0.5 text-[10px] text-white">new</span></Link>
            <Link href="/products/forex" className={navItemClass("/products/forex")}>🏦 Forex Lessons</Link>
            <Link href="/products/cbc" className={navItemClass("/products/cbc")}>📚 CBC Materials</Link>
            <Link href="/products/aviator" className={navItemClass("/products/aviator")}>📈 Aviator <span className="ml-auto rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">Hot</span></Link>
            <Link href="/products/spin" className={navItemClass("/products/spin")}>🎡 Spin & Win</Link>
            <Link href="/products/bets" className={navItemClass("/products/bets")}>⚡ Fixed Bets</Link>
            <Link href="/products/soccer" className={navItemClass("/products/soccer")}>⚽ Soccer</Link>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-50 p-4 space-y-2">
          <Link href="/profile" className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">👤 Profile</Link>
          <Link href="/contact" className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">🎧 Contact Us</Link>
          <button
            onClick={() => signOut().then(() => router.push("/"))}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white/50 px-4 md:px-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm md:hidden hover:text-[#1abc9c]"
            >
              ☰
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:text-[#1abc9c]">🌙</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:text-[#1abc9c]">⚙️</button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Wrap in Suspense to safely use useSearchParams in Next.js App Router
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">Loading...</div>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}