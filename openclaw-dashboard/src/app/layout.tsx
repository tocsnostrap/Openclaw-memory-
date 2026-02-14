import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "OpenClaw Mission Control",
  description: "AI Agent System Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-background`}>
        <Nav />
        <main className="pt-14 min-h-screen">
          <div className="max-w-[1800px] mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
