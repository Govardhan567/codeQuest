import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://codequest-learning-hub.govardhannase.chatgpt.site"),
  title: "CodeQuest — Learn. Practice. Level up.",
  description: "A focused, gamified space to learn code, practice every day, and turn progress into instinct.",
  openGraph: {
    title: "CodeQuest — Learn. Practice. Level up.",
    description: "Learn code in small, rewarding steps.",
    images: [{ url: "/og-learn.png", width: 1200, height: 630, alt: "CodeQuest Python learning roadmap" }],
  },
  twitter: { card: "summary_large_image", title: "CodeQuest", images: ["/og-learn.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={cn("font-sans", inter.variable)}><body>{children}</body></html>;
}
