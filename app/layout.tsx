import type { Metadata } from "next";
import Script from "next/script";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { PageReveal } from "@/components/motion/page-reveal";
import "./globals.css";

const themeInit = `(() => { try { const saved = localStorage.getItem('mikhaleff-theme'); const theme = saved === 'light' || saved === 'dark' ? saved : 'dark'; document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; } catch (_) { document.documentElement.dataset.theme = 'dark'; document.documentElement.style.colorScheme = 'dark'; } })();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://mikhaleff.art"),
  title: { default: "Alexander Mikhaleff — Contemporary Artist", template: "%s — Alexander Mikhaleff" },
  description: "The official digital gallery and archive of contemporary artist Alexander Mikhaleff.",
  applicationName: "MIKHALEFF",
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head><Script id="theme-init" strategy="beforeInteractive">{themeInit}</Script></head>
      <body><SmoothScroll><PageReveal>{children}</PageReveal></SmoothScroll></body>
    </html>
  );
}
