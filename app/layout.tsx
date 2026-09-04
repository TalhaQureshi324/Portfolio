import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import LenisProvider from "@/components/providers/LenisProvider";
import Navigation from "@/components/sections/Navigation";
import Footer from "@/components/sections/Footer";
import "@/styles/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Muhammad Talha Qureshi — AI/ML Engineer & Full-Stack Developer",
  description:
    "I build AI-powered products end to end — computer-vision screening systems, NLP pipelines and automation, and the web applications that deliver them.",
  keywords: [
    "AI Engineer",
    "Machine Learning",
    "Full-Stack Developer",
    "Computer Vision",
    "NLP",
    "Portfolio",
  ],
  authors: [{ name: "Muhammad Talha Qureshi" }],
  openGraph: {
    title: "Muhammad Talha Qureshi — AI/ML Engineer & Full-Stack Developer",
    description:
      "I build AI-powered products end to end — from computer vision to shipping web applications.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF9F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="bg-paper font-sans text-ink antialiased">
        <LenisProvider>
          <Navigation />
          {children}
          <Footer />
          <div className="grain" aria-hidden="true" />
        </LenisProvider>
      </body>
    </html>
  );
}
