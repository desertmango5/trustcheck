import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustCheck",
  description: "Check before you trust."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
