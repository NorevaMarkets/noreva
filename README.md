# Noreva

**Trade tokenized stocks on Solana. 24/7.**

Noreva is a web application for tracking and trading tokenized stocks on the Solana blockchain. Compare real-time prices between tokenized stocks and their underlying securities, analyze spreads, and trade when traditional markets are closed.

**Live:** [noreva.markets](https://www.noreva.markets/) | **Docs:** [docs.noreva.markets](https://docs.noreva.markets) | **X:** [x.com](https://x.com)

## Features

- **Real-time Stock Tracking** - Monitor tokenized stocks like bAAPL, bMSFT, bNVDA and more
- **Spread Analysis** - See premium/discount between token and stock prices
- **Portfolio Management** - Track your holdings and P&L with Phantom/Solflare wallet
- **24/7 Trading** - Trade via Jupiter DEX when traditional markets are closed
- **TradingView Charts** - Professional charting with technical analysis tools
- **Beautiful Dark UI** - Premium gold/amber theme optimized for trading
- **Responsive Design** - Works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/NorevaMarkets/noreva.git
cd noreva

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file with your API keys:

```env
# Stock Data APIs
TWELVE_DATA_API_KEY=your_twelve_data_key
FINNHUB_API_KEY=your_finnhub_key

# Solana / Jupiter
JUPITER_API_KEY=your_jupiter_key
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=your_key
```

See `.env.example` for a complete template.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router & Turbopack
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: TypeScript
- **Blockchain**: Solana Web3.js
- **Wallet**: Solana Wallet Adapter (Phantom, Solflare)
- **Charts**: TradingView Lightweight Charts
- **Fonts**: Space Grotesk + JetBrains Mono

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (stocks, portfolio, prices)
│   ├── page.tsx           # Home page (stock list)
│   ├── portfolio/         # Portfolio page
│   └── about/             # About page
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── stats/         # Market statistics
│   │   ├── stock-detail/  # Stock detail modal & charts
│   │   ├── stock-list/    # Stock table and rows
│   │   └── trade/         # Trade panel
│   ├── layout/            # Layout components (header, footer)
│   ├── providers/         # React context providers
│   └── ui/                # Reusable UI components
├── config/                # App configuration
├── data/                  # Stock definitions
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api/              # API services (Jupiter, TradingView)
│   └── utils/            # Utility functions
└── types/                # TypeScript type definitions
```

## Design System

Noreva uses a premium dark theme with gold/amber accents:

```css
--background: #07070a;        /* Deep black */
--foreground: #fafafa;        /* White text */
--accent: #c4a84b;            /* Gold accent */
--positive: #4ade80;          /* Green (profit) */
--negative: #f87171;          /* Red (loss) */
```

## API Integration

### Twelve Data API
Real-time and historical stock market data. [Documentation](https://twelvedata.com/docs)

### Finnhub API
Stock quotes and company information. [Documentation](https://finnhub.io/docs/api)

### Jupiter API
DEX aggregation and swap quotes on Solana. [Documentation](https://station.jup.ag/docs/)

### Helius RPC
High-performance Solana RPC endpoint. [Documentation](https://docs.helius.dev/)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Disclaimer**: This is an experimental application. Tokenized stocks carry significant risk. Always do your own research before trading.
