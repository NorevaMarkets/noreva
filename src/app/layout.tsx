import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { AccessGate } from "@/components/providers/access-gate";
import { siteConfig } from "@/config/site";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["tokenized stocks", "solana", "crypto", "trading", "stocks", "ETF", "NVIDIA", "Tesla", "Apple", "24/7 trading"],
  authors: [{ name: "Noreva" }],
  creator: "Noreva",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Noreva - Trade tokenized stocks on Solana 24/7",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@NorevaMarkets",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {/* 
          ACCESS GATE - Password protection for the entire app
          To disable: Set ACCESS_GATE_ENABLED to false in access-gate.tsx
          To remove completely: Remove <AccessGate> wrapper below
        */}
        <AccessGate>
        <WalletProvider>
          <div className="relative min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <PageTransitionProvider>
                {children}
              </PageTransitionProvider>
            </main>
            <Footer />
          </div>
            <Toaster 
              theme="dark"
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                },
                classNames: {
                  success: 'border-[var(--positive)]/30',
                  error: 'border-[var(--negative)]/30',
                  warning: 'border-[var(--accent)]/30',
                },
              }}
              richColors
            />
        </WalletProvider>
        </AccessGate>
      </body>
    </html>
  );
}
