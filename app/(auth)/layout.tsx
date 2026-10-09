import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-500 to-brand-400 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <Link href="/" className="mb-6 block text-center text-2xl font-extrabold text-brand-500">
          Flex<span className="text-gold-500">Qash</span>
        </Link>
        {children}
      </div>
    </main>
  );
}