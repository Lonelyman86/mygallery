import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { StoreInitializer } from "@/components/StoreInitializer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Galeriku - Inspiration Gallery",
  description: "Share and discover visual inspirations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <StoreInitializer />

        <div className="min-h-screen bg-white">
            <Sidebar />
            <div className="main-content flex flex-col min-h-screen">
                <TopNav />
                <main className="flex-1 w-full max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
            <MobileNav />
        </div>
      </body>
    </html>
  );
}
