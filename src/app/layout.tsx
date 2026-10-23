import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Make My Marriage | Bring your wedding plans together",
  description:
    "Plan your Indian wedding together. Bring events, guests, tasks, expenses, vendors, and wedding memories into one shared workspace.",
  openGraph: {
    title: "Make My Marriage | Bring your wedding plans together",
    description:
      "One shared wedding workspace for couples and families.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
