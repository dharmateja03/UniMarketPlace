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

export const metadata = {
  title: "UniHub Marketplace",
  description: "A student-only marketplace for buying, selling, and renting on campus."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
