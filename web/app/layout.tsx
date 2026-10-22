import type { Metadata } from "next";
import type { ReactNode } from "react";
// @ts-ignore Next.js handles CSS imports; TypeScript may not have a declaration for this file.
import "./bayflow.css";

export const metadata: Metadata = {
  title: "BayFlow | Automotive Service Platform",
  description:
    "A modern automotive service platform for booking appointments, managing garages, tracking repairs, inventory, and quality control.",
  keywords: [
    "BayFlow",
    "Automotive Service",
    "Garage Management",
    "Car Repair",
    "Online Booking",
  ],
  authors: [
    {
      name: "Sultan Zaib",
      url: "https://github.com/szofficiall",
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
