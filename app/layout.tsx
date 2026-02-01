import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "BuzzGram - Discover Local Businesses in Canada | Beauty, Food & Events",
  description: "Discover verified local businesses across Canada. Browse beauty services (nails, lashes, makeup, hair), food services (bakery, catering, chefs), and event services (decor, planning, photography). Connect instantly with top-rated businesses in Toronto, Vancouver, Calgary, Montreal, and Ottawa.",
  keywords: [
    "local businesses Canada",
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
  ],
  openGraph: {
    title: "BuzzGram - Discover Local Businesses in Canada",
    description:
      "Connect with verified local businesses across Canada. Browse beauty, food, and event services in Toronto, Vancouver, Calgary, Montreal, and Ottawa.",
    url: "https://buzz-gram-next-js.vercel.app",
    siteName: "BuzzGram",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzGram - Discover Local Businesses in Canada",
    description:
      "Connect with verified local businesses across Canada. Browse beauty, food, and event services.",
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
