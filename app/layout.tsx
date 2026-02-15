import "./globals.css";
import { ReactNode } from "react";
import AppHeader from "@/components/AppHeader";
import { Fraunces, Work_Sans } from "next/font/google";

const displayFont = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display"
});

const bodyFont = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body"
});

import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://unihub.app";

export const metadata: Metadata = {
  title: {
    default: "UniHub — Student Marketplace",
    template: "%s | UniHub",
  },
  description: "A student-only marketplace for buying, selling, and renting on campus.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "UniHub",
    title: "UniHub — Student Marketplace",
    description: "Buy, sell, and rent with students on your campus.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "UniHub — Student Marketplace",
    description: "Buy, sell, and rent with students on your campus.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <AppHeader />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
