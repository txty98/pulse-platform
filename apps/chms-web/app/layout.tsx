import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Pulse RMS",
  description: "Multi-tenant church management with tenant isolation, roles, and attendance.",
  icons: {
    icon: "/brand/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
