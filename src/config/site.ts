/**
 * Site configuration
 * Central place for app-wide settings
 */

export const siteConfig = {
  name: "Noreva",
  description: "Track tokenized stocks on Solana. Compare prices, spreads, and trade 24/7.",
  url: "https://noreva.markets",
  
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

