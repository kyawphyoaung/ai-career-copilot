import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Career Co-Pilot",
  description: "Your personal AI-powered career assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <div className="flex h-screen">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-gray-800 p-6 flex flex-col">
            <h1 className="text-2xl font-bold text-white mb-8">Career Co-Pilot</h1>
            <nav className="space-y-4">
              <Link href="/" className="block py-2 px-4 rounded hover:bg-gray-700">
                Dashboard
              </Link>
              <Link href="/profile" className="block py-2 px-4 rounded hover:bg-gray-700">
                My Profile
              </Link>
              <Link href="/history" className="block py-2 px-4 rounded hover:bg-gray-700">
                History
              </Link>
              <Link href="/insights" className="block py-2 px-4 rounded hover:bg-gray-700">
                Insights
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
