import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Call Center Frontend",
  description: "Modern call center management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased bg-background text-text`}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-surface border-b border-border h-16 flex items-center px-8">
            <div className="text-2xl font-bold text-primary">Call Center</div>
          </header>

          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content */}
            <main className="flex-1 p-8 bg-background overflow-y-auto">
              {children}
            </main>
          </div>

          {/* Footer */}
          <footer className="bg-surface border-t border-border h-14 flex items-center justify-center">
            <div className="text-center text-text-muted w-full">
              © 2024 Call Center. Tüm hakları saklıdır.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
