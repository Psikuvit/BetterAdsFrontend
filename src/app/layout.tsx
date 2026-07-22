import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { SITE_URL } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "BetterAds is a video advertising platform where advertisers upload ads, manage campaigns, and fund budget, and publishers register sites to display ads.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BetterAds",
    template: "%s | BetterAds",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "BetterAds",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "BetterAds",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BetterAds",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col text-foreground">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
