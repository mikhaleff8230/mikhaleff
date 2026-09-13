/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Script from "next/script";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { PageReveal } from "@/components/motion/page-reveal";
import "./globals.css";

const yandexMetrika = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(57658048,"init",{webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`;

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
      <body><Script id="yandex-metrika" strategy="afterInteractive">{yandexMetrika}</Script><noscript><div><img src="https://mc.yandex.ru/watch/57658048" style={{ position: "absolute", left: "-9999px" }} alt="" /></div></noscript><SmoothScroll><PageReveal>{children}</PageReveal></SmoothScroll></body>
    </html>
  );
}
