# Changelog

All notable changes to Noreva will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.4] - 2025-12-31

### Added
- **Global Stock Search** - Search field in header navigation for quick stock switching
  - Search by symbol (QQQx), name (NVIDIA), underlying (NVDA), or mint address
  - Available on desktop and mobile
- **Hero Background** - Added hero3.png background to CTA section on About page

### Changed
- **Navigation Layout** - Menu items centered, search + wallet on right side
- **Smaller Logo** - Reduced header logo size for cleaner look
- **Hero Text Refresh** - "Stocks on-chain. No closing bell." with updated copy
- **Default Slippage** - Increased to 1% for better route finding

### Removed
- **10 Tokens** - Removed tokens without actual liquidity: INTCx, CRMx, AVGOx, JPMx, GSx, BACx, PLTRx, WMTx, PFEx, VTIx
- Now 17 verified tradable tokens

## [0.5.3] - 2025-12-31

### Added
- **Verified Mint Addresses** - Added manually verified Solana mint addresses for all tokens
- **Expanded Token Whitelist** - Added new verified tokens

### Fixed
- **Jupiter Routing** - Now uses verified mint addresses instead of API-provided addresses

### Removed
- Removed bTSLA, bGME, TQQQx (no liquidity found)

## [0.5.2] - 2025-12-31

### Fixed
- **Partner Slider** - Fixed infinite scroll animation on About page (was stopping after one cycle)

## [0.5.1] - 2025-12-30

### Changed
- **Only Tradable Tokens** - Now only shows tokens with confirmed Jupiter liquidity
- Removed tokens without active markets to prevent "No route found" errors
- Whitelist includes xStock format: NVDAx, AAPLx, MSFTx, TSLAx, GOOGLx, AMZNx, METAx, COINx, AMDx, SPYx, QQQx, IWMx, PLTRx, HOODx, MSTRx, and more
- More stocks coming soon

## [0.5.0] - 2025-12-30

### Added
- **Official X Account** - [x.com](https://x.com) linked across site and docs

### Changed
- **Branding Update** - Consistent terminology across all user-facing text
- **New Logo & Favicon** - Updated branding assets for main site and docs
- **Larger Header Logo** - Increased to 66px, removed text "Noreva" (now in logo)
- **Navigation** - Simplified navigation, removed "Live on Solana Mainnet" badge
- **Hero Text** - Updated hero section messaging

### Updated
- README files with new branding and X link
- All documentation pages updated

## [0.4.2] - 2025-12-30

### Fixed
- Swap panel: Fixed quote fetching loop that caused constant "Fetching quote..." flickering
- Removed `status` from useEffect dependencies to prevent infinite re-render cycle

## [0.4.1] - 2025-12-30

### Fixed
- About page: Corrected TradFi comparison text (removed inaccurate settlement claim)
- Docs: Removed broken image reference in Getting Started guide

## [0.4.0] - 2025-12-30

### Added
- **About Page** - Completely redesigned with modern layout
  - Hero section with bold statement
  - TradFi vs Noreva comparison
  - Tech Stack slider with partner logos (Solana, Phantom, Solflare, Backed Finance, Swarm Markets, Helius, Birdeye, TradingView)
  - Bento grid feature showcase
  - Regulated Token Providers section with background image
- **Partner Logos** - Added SVG/PNG logos in `/public/partner/`
- **About Link** - Added to navigation and footer

### Changed
- Renamed `/learn` route to `/about`
- "Learn More" button on homepage now links to docs.noreva.markets
- Navigation: Stocks, Portfolio, About, Docs

## [0.3.0] - 2025-12-30

### Added
- **Documentation Site** - Complete docs at [docs.noreva.markets](https://docs.noreva.markets)
  - Introduction & Getting Started guides
  - Trading documentation with spread explanation
  - Portfolio management guide
  - FAQ section
- **Custom Docs Theme** - Dark theme matching main site design
- **Navigation Links** - Links to noreva.markets throughout docs
- **X (Twitter) Contact** - Added social link in FAQ

### Changed
- Improved navigation styling in main app header
- Cleaner menu items with active state indicator

### Technical
- Nextra 2 for documentation framework
- Deployed as separate Vercel project
- Custom PostCSS configuration

## [0.2.1] - 2025-12-30

### Security
- **API Key Rotation** - Removed hardcoded Helius RPC API key from source code
- All API keys now exclusively loaded from environment variables
- **Note:** The previously exposed Helius API key has been invalidated and replaced

### Fixed
- Swap success/error feedback now stays visible instead of immediately resetting

### Changed
- `wallet-provider.tsx`, `jupiter-swap.ts`, `portfolio/route.ts` now use `process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`

## [0.2.0] - 2025-12-30

### Added
- **Vercel Deployment** - App is now live at [noreva.vercel.app](https://noreva.vercel.app)
- Environment variables configured on Vercel for secure API key storage

### Fixed
- Fixed TypeScript error with `currentPrice` prop in `TradingChart` component
- Fixed Portfolio API internal fetch using correct request origin instead of localhost

### Changed
- Updated README with live demo link and correct environment variables
- API routes now use request origin for internal API calls (Vercel compatibility)

## [0.1.0] - 2025-12-30

### Added
- **Stock Tracking** - Real-time monitoring of tokenized stocks (bAAPL, bMSFT, bNVDA, etc.)
- **Spread Analysis** - Compare token prices vs underlying stock prices
- **Portfolio Page** - Track your tokenized stock holdings from connected wallet
- **Wallet Integration** - Connect with Phantom or Solflare wallets
- **TradingView Charts** - Professional charting with technical analysis
- **Jupiter Integration** - Swap tokens directly via Jupiter DEX
- **Premium Dark Theme** - Gold/amber accent design optimized for trading
- **Responsive Design** - Mobile and desktop support

### Technical
- Next.js 16 with App Router and Turbopack
- Tailwind CSS 4 for styling
- TypeScript for type safety
- Solana Web3.js for blockchain interaction
- Solana Wallet Adapter for wallet connections

### APIs Integrated
- Twelve Data API for stock market data
- Finnhub API for stock quotes
- Jupiter API for DEX swaps
- Helius RPC for Solana data

---
