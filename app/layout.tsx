import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { HomepageStructuredData } from "./layout-seo";

export const metadata: Metadata = {
  title: "BuzzGram - Discover Local Businesses in Toronto | Beauty, Food & Events",
  description: "Discover verified local businesses in Toronto. Browse beauty services (nails, lashes, makeup, hair), food services (bakery, catering, chefs), and event services (decor, planning, photography). Connect instantly with top-rated Toronto businesses on BuzzGram.",
  keywords: [
    "Toronto businesses",
    "local businesses Toronto",
    "nail salons Toronto",
    "lash extensions Toronto",
    "makeup artists Toronto",
    "hair salons Toronto",
    "bakery Toronto",
    "catering Toronto",
    "private chef Toronto",
    "event planners Toronto",
    "event decorators Toronto",
    "wedding photographers Toronto",
    "beauty services Toronto",
    "food services Toronto",
    "event services Toronto",
  ],
  openGraph: {
    title: "BuzzGram - Discover Local Businesses in Toronto",
    description:
      "Connect with verified local businesses in Toronto. Browse beauty, food, and event services. Get instant quotes from top-rated Toronto businesses.",
    url: "https://buzz-gram-next-js.vercel.app",
    siteName: "BuzzGram",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzGram - Discover Local Businesses in Toronto",
    description:
      "Connect with verified local businesses in Toronto. Browse beauty, food, and event services.",
  },
  alternates: {
    canonical: "https://buzz-gram-next-js.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Sign-In SDK */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
        {/* Cloudinary Upload Widget */}
        <Script
          src="https://upload-widget.cloudinary.com/global/all.js"
          strategy="beforeInteractive"
        />
        {/* Homepage Structured Data - Organization & WebSite schemas */}
        <HomepageStructuredData />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
