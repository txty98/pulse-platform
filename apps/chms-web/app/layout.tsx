import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Pulse RMS App",
  description: "Church operations, care, and relationship intelligence."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
