import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 py-12 text-brand-100 sm:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-4 sm:grid-cols-2">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold text-white">
                Flex<span className="text-gold-500">Qash</span>
              </span>
              <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-gold-300">
                FOREX LESSONS
              </span>
            </Link>
            <p className="mt-4 text-sm font-medium leading-relaxed text-brand-300">
              Turn your phone into a money-making machine. Join thousands of earners across Africa today and start growing your income.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white">Platform</h3>
            <ul className="mt-4 space-y-3 text-sm font-medium text-brand-300">
              <li><a href="#how-it-works" className="transition-colors hover:text-gold-400">How It Works</a></li>
              <li><a href="#countries" className="transition-colors hover:text-gold-400">Supported Countries</a></li>
              <li><a href="#forex-lessons" className="transition-colors hover:text-gold-400">Forex Lessons</a></li>
              <li><a href="#faq" className="transition-colors hover:text-gold-400">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold text-white">Legal</h3>
            <ul className="mt-4 space-y-3 text-sm font-medium text-brand-300">
              <li><Link href="/terms" className="transition-colors hover:text-gold-400">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-gold-400">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="transition-colors hover:text-gold-400">Earnings Disclaimer</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white">Contact Us</h3>
            <ul className="mt-4 space-y-3 text-sm font-medium text-brand-300">
              <li>
                <span className="block text-white">Email:</span>
                support@flexqash.com
              </li>
              <li>
                <span className="block text-white">Phone:</span>
                +254 182 852 787
              </li>
              <li>
                <span className="block text-white">Location:</span>
                Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-brand-800 pt-8 sm:flex-row">
          <p className="text-xs font-medium text-brand-400">
            &copy; {currentYear} FlexQash. All rights reserved.
          </p>
          <p className="mt-2 text-xs font-medium text-brand-500 sm:mt-0">
            Designed for Africa.
          </p>
        </div>
      </div>
    </footer>
  );
}