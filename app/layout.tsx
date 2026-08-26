import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import LenisProvider from "@/components/providers/LenisProvider";
import Navigation from "@/components/sections/Navigation";
import TerminalOverlay from "@/components/ui/TerminalOverlay";
import "@/styles/globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Talha Qureshi — AI Systems Engineer & Full-Stack Architect",
  description:
    "Engineering scalable AI pipelines and production-grade full-stack applications. Deep Learning (CV, NLP), distributed backends, and high-conversion frontends.",
  keywords: [
    "AI Engineer",
    "Full-Stack Architect",
    "Machine Learning",
    "Next.js",
    "PyTorch",
    "Deepfake Detection",
    "NLP",
  ],
  authors: [{ name: "Talha Qureshi" }],
  openGraph: {
    title: "Talha Qureshi — AI Systems Engineer & Full-Stack Architect",
    description:
      "Engineering scalable AI pipelines and production-grade full-stack applications.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#090A0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${jetbrains.variable}`}>
      <body className="bg-obsidian font-sans text-slate-300 antialiased">
        <LenisProvider>
          <Navigation />
          {children}
          <TerminalOverlay />
          <div className="noise-overlay" aria-hidden="true" />
        </LenisProvider>
      </body>
    </html>
  );
}
