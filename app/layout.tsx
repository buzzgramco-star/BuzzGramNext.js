import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import CookieConsent from "@/components/CookieConsent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buzzgram.co";

export const metadata: Metadata = {
  title: "BuzzGram - Discover Home-Based & Instagram Businesses | Beauty, Food & Events",
  description: "The first platform to connect you with home-based and Instagram businesses. Find beauty services (nails, lashes, makeup, hair), food specialists (bakery, catering, chefs), and event planners (decor, planning, photography) across 10 major cities in the USA and Canada.",
  keywords: [
    "home-based businesses",
    "Instagram businesses",
    "beauty services",
    "food services",
    "event services",
    "nail salons",
    "lash extensions",
    "makeup artists",
    "hair salons",
    "bakery",
    "catering",
    "private chef",
    "event planners",
    "event decorators",
    "wedding photographers",
    "Toronto businesses",
    "Vancouver businesses",
    "New York businesses",
    "Los Angeles businesses",
  ],
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
  openGraph: {
    title: "BuzzGram - Discover Home-Based & Instagram Businesses",
    description:
      "The first platform to connect you with home-based and Instagram businesses. Browse beauty, food, and event services across 10 major cities in the USA and Canada.",
    url: siteUrl,
    siteName: "BuzzGram",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteUrl}/icon?size=1200`,
        width: 1200,
        height: 1200,
        alt: 'BuzzGram Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzGram - Discover Home-Based & Instagram Businesses",
    description:
      "The first platform for home-based and Instagram businesses. Find beauty, food, and event services across 10 major cities.",
    images: [`${siteUrl}/icon?size=1200`],
  },
  alternates: {
    canonical: siteUrl,
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
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
