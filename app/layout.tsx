import "./globals.css";
import { ReactNode } from "react";
import AppHeader from "@/components/AppHeader";

export const metadata = {
  title: "UniHub Marketplace",
  description: "A student-only marketplace for buying, selling, and renting on campus."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
