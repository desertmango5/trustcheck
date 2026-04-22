import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import HowTrustCheckModal from "@/components/HowTrustCheckModal";

export const metadata: Metadata = {
  title: "TrustCheck",
  description: "Check before you trust."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `(() => {
    try {
      const storedTheme = window.localStorage.getItem("trustcheck-theme");
      const theme =
        storedTheme === "dark" || storedTheme === "light"
          ? storedTheme
          : "dark";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {}
  })();`;

  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeToggle />
        <HowTrustCheckModal />
        {children}
      </body>
    </html>
  );
}
