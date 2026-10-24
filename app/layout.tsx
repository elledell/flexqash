import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlexQash | The Premier African Digital Earnings Platform",
  description: "Join FlexQash to earn through multi-level referrals, investments, and daily tasks. Secure, fast, and supporting multiple African currencies.",
  keywords: ["FlexQash", "Make money online Africa", "Digital earnings", "Referral platform", "Investments"],
  openGraph: {
    title: "FlexQash | The Premier African Digital Earnings Platform",
    description: "Join FlexQash to earn through multi-level referrals, investments, and daily tasks.",
    url: "https://flexqash.com",
    siteName: "FlexQash",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlexQash",
    description: "The Premier African Digital Earnings Platform",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-50 text-brand-900">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}