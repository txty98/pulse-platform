import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Pulse RMS",
  description: "Simple, powerful church relationship management for real-world ministry.",
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
