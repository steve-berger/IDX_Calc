import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IDX Calc – Indexanpassung Österreich",
  description: "Wertsicherungsrechner für österreichische Indexanpassungen (VPI)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              IDX Calc
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/customers"
                className="text-muted hover:text-foreground transition-colors"
              >
                Kunden
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
