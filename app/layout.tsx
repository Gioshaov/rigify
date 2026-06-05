import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { RootProviders } from "@/components/providers/RootProviders";

const hanken = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-hanken",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rigify — Premium Salon Marketplace",
  description: "Discover and book Georgia's best beauty and wellness professionals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`dark ${hanken.variable} ${mono.variable}`}>
      <body>
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
