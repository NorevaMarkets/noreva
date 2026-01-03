# Noreva Documentation

Official documentation for [Noreva](https://noreva.markets) - Trade tokenized stocks on Solana. 24/7.

## Live Site

**[docs.noreva.markets](https://docs.noreva.markets)**

## Documentation Pages

| Page | Description |
|------|-------------|
| **Introduction** | Overview of Noreva and supported tokens |
| **Getting Started** | Wallet setup and first steps |
| **Trading** | How spreads work and executing swaps |
| **Portfolio** | Managing holdings and Trading Dashboard |
| **Account** | Profile settings and authentication |
| **FAQ** | Common questions answered |

## Latest Features (v0.14.0)

- **Lightweight Charts** - Custom candlestick charts with Moralis OHLCV data
- **Multiple Timeframes** - 5M, 15M, 30M, 1H, 4H, 1D, 1W, 1MO intervals
- **Mobile-Optimized Trading** - Stock picker dropdown, tab navigation, fullscreen charts
- **Chart Source Toggle** - Switch between Token Price (Moralis) and Stock Price (TradingView)
- **Recent Trades** - Live trading activity (now shows last 10 trades)

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [Nextra 2](https://nextra.site/) - Documentation framework
- [MDX](https://mdxjs.com/) - Markdown with JSX
- Custom dark theme matching noreva.markets

## Main App Tech Stack

- Next.js 16 with App Router & Turbopack
- Tailwind CSS 4
- Framer Motion for animations
- Solana Web3.js + Wallet Adapter
- Lightweight Charts + TradingView
- Supabase (PostgreSQL)
- Moralis API (Portfolio, Trades)
- Helius RPC (Solana)

## Development

```bash
# Navigate to docs folder
cd docs

# Install dependencies
npm install

# Start development server (runs on port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

```
docs/
├── pages/
│   ├── _app.tsx           # App wrapper
│   ├── _meta.json         # Navigation config
│   ├── index.mdx          # Introduction
│   ├── getting-started.mdx
│   ├── trading.mdx
│   ├── portfolio.mdx
│   └── faq.mdx
├── public/
│   ├── logo.png           # Noreva logo
│   └── favicon.ico
├── styles/
│   └── globals.css        # Custom dark theme
├── theme.config.tsx       # Nextra theme config
├── next.config.mjs        # Next.js config
├── postcss.config.js      # PostCSS config
└── package.json
```

## Links

- **Main App:** [noreva.markets](https://noreva.markets)
- **GitHub:** [github.com/NorevaMarkets/noreva](https://github.com/NorevaMarkets/noreva)
- **X (Twitter):** [@NorevaMarkets](https://x.com/NorevaMarkets)
