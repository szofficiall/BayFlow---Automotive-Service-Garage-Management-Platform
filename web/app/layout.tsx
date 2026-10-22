
import type { Metadata } from "next";
import type { ReactNode } from "react";
// @ts-expect-error Next.js handles global CSS imports at runtime.
import "./bayflow.css";

export const metadata: Metadata = {
  title: "BayFlow | Automotive Service Platform",
  description:
    "A modern automotive service platform for booking appointments, managing garages, tracking repairs and quality control.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
