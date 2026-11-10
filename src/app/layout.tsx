import type { Metadata } from "next";
import type { Viewport } from "next";
import { Fraunces, Inter, Noto_Sans_Devanagari } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileOrderBar } from "@/components/layout/mobile-order-bar";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { SEO } from "@/components/SEO";
import { storeSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL, business } from "@/config/businessData";
import { LOCALE_KEY } from "@/i18n/dictionary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Only Inter is preloaded (48 KB): the display font is gone, the Devanagari
  // face loads on demand, and metric-adjusted fallbacks keep CLS near zero.
  preload: true,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  // Static instances (no variable instancing): far cheaper to shape and
  // rasterize on slow devices, and with preload there is no post-paint swap.
  weight: ["500", "600"],
  preload: true,
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-deva",
  display: "swap",
  // Only the hidden Hindi spans reference this font; loading it eagerly
  // would queue 100+ KB ahead of the LCP image for English-first visitors.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${business.name} — Paint Binders, Madrasi Dana & Plastering Tools, Ballabgarh`,
    template: `%s | ${business.name}`,
  },
  description: business.description,
  applicationName: business.name,
  authors: [{ name: business.proprietor.displayName }],
  creator: business.name,
  publisher: business.name,
  formatDetection: { telephone: true, address: true, email: false },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: business.name,
    locale: "en_IN",
    url: SITE_URL,
    title: `${business.name} — Paint binders and plastering supplies`,
    description: business.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${business.name}, ${business.locality}, ${business.city}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${business.name} — Paint binders and plastering supplies`,
    description: business.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F1E6" },
    { media: "(prefers-color-scheme: dark)", color: "#17120E" },
  ],
  colorScheme: "light dark",
};

const localeScript = `try{var l=localStorage.getItem("${LOCALE_KEY}");if(l==="hi"){document.documentElement.dataset.locale="hi"}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      data-locale="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* next-themes-style bootstrap: a raw inline script server-rendered
            once here. The root layout is not re-rendered during client
            navigation, so React never re-executes it, and it runs before
            hydration so the chosen language never flashes. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: localeScript }}
        />
        <Providers>
          <a
            href="#main-content"
            className="sr-only z-[100] rounded-full bg-primary px-5 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="flex-1 pb-24 md:pb-0">
            {children}
          </main>
          <SiteFooter />
          <MobileOrderBar />
          <FloatingWhatsApp />
        </Providers>
        <SEO data={[storeSchema(), websiteSchema()]} />
      </body>
    </html>
  );
}
