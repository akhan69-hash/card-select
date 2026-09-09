import type { Metadata } from "next";
import { Russo_One, Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const russoOne = Russo_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Card Select — Clash Royale Card Codex",
  description:
    "Pick a card, watch it reveal as a tiltable diamond-quality card, and see its real win rate and usage from live-collected Clash Royale battles.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${russoOne.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0A14] text-white">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
