import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "CodeQuest — Learn. Practice. Level up.",
    description: "A focused, gamified space to learn code, practice every day, and turn progress into instinct.",
    openGraph: {
      title: "CodeQuest — Learn. Practice. Level up.",
      description: "Learn code in small, rewarding steps.",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "CodeQuest learning platform" }],
    },
    twitter: { card: "summary_large_image", title: "CodeQuest", images: ["/og.png"] },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
