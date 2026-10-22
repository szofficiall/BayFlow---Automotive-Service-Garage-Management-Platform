import type { ReactNode } from "react";
// @ts-expect-error The stylesheet is loaded by the framework at runtime.
import "./bayflow.css";

export const metadata = {
  title: "BayFlow | Premium Automotive Service Platform",
  description:
    "Book automotive services and manage garages, teams, repairs, parts and quality control in one connected experience.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
