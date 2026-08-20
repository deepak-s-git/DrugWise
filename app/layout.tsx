import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { Chatbot } from "@/components/ui/chatbot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DrugWise — Medicine Intelligence Platform",
  description:
    "Search thousands of Indian medicines by brand, composition, strength or manufacturer. Open-source pharmaceutical intelligence.",
  keywords: [
    "medicine",
    "pharmaceutical",
    "India",
    "drug information",
    "medicine search",
    "blister scanner",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-on-surface font-sans">
        <SmoothScroll>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <Chatbot />
        </SmoothScroll>
      </body>
    </html>
  );
}
