/**
 * Site configuration
 * Central place for app-wide settings
 */

export const siteConfig = {
  name: "Noreva",
  description: "Trade tokenized stocks on Solana. 24/7 access to NVIDIA, Tesla, Apple and more. Instant settlement. Zero borders.",
  url: "https://noreva.markets",
  ogImage: "https://noreva.markets/banner.png",
  
  // API Endpoints
  api: {
    birdeye: "https://public-api.birdeye.so",
    jupiter: "https://quote-api.jup.ag/v6",
    coingecko: "https://api.coingecko.com/api/v3",
  },
  
  // Social Links
  links: {
    twitter: "https://x.com/NorevaMarkets",
    github: "https://github.com/NorevaMarkets/noreva",
  },
  
  // Refresh intervals (in ms)
  refreshIntervals: {
    prices: 30000,      // 30 seconds
    portfolio: 60000,   // 1 minute
    charts: 60000,      // 1 minute
  },
} as const;

export type SiteConfig = typeof siteConfig;

