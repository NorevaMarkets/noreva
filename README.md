# Noreva

**Trade tokenized stocks on Solana. 24/7.**

Noreva is a web application for tracking and trading tokenized stocks on the Solana blockchain. Compare real-time prices between tokenized stocks and their underlying securities, analyze spreads, and trade when traditional markets are closed.

**Live:** [noreva.markets](https://www.noreva.markets/) | **Docs:** [docs.noreva.markets](https://docs.noreva.markets) | **X:** [x.com](https://x.com)

## Features

### Trading
- **Real-time Stock Tracking** - Monitor tokenized stocks like AAPLx, TSLAx, NVDAx and more
- **Spread Analysis** - See premium/discount between token and stock prices
- **24/7 Trading** - Trade via Jupiter DEX when traditional markets are closed
- **TradingView Charts** - Professional charting (responsive on mobile!)
- **Trade History** - All your trades saved to database and viewable in portfolio
- **Stock Favorites** - Mark favorite stocks with a star, shown at top of list

### Market Data
- **Stock Fundamentals** - P/E Ratio, P/B, dividends, 52-week range, and more (via Finnhub)
- **News Feed** - Latest news for each stock from Finnhub and Yahoo Finance
- **Analyst Ratings** - Consensus recommendations and price targets
- **Earnings Calendar** - Upcoming earnings dates and historical EPS data
- **Insider Trading** - Recent insider transactions and sentiment

### User Features
- **Wallet Authentication** - Secure signature-based authentication (no passwords!)
- **User Profiles** - Save your name, email, X handle, website, and bio
- **Portfolio Management** - Track your holdings and P&L with Phantom/Solflare wallet

### Technical
- **Beautiful Dark UI** - Premium gold/amber theme optimized for trading
- **Fully Responsive** - Optimized for desktop, tablet, and mobile
- **Mobile Charts** - TradingView charts adapt to smaller screens
- **Local Stock Logos** - Fast loading with locally cached logos

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

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

See `.env.example` for a complete template.

### Database Setup (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com) or via Vercel Marketplace
2. Run the SQL in `supabase/schema.sql` to create tables and RLS policies
3. Add the environment variables to your `.env.local` and Vercel project

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router & Turbopack
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **Blockchain**: Solana Web3.js
- **Wallet**: Solana Wallet Adapter (Phantom, Solflare)
- **Charts**: TradingView Lightweight Charts
- **Authentication**: Wallet Signature Verification (nacl/tweetnacl)
- **Fonts**: Space Grotesk + JetBrains Mono

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── stocks/        # Stock data, fundamentals, news, etc.
│   │   ├── user/          # User profile CRUD
│   │   ├── trades/        # Trade history CRUD
│   │   ├── jupiter/       # Jupiter swap integration
│   │   └── portfolio/     # Wallet holdings
│   ├── page.tsx           # Home page (stock list)
│   ├── stock/[symbol]/    # Stock detail page
│   ├── portfolio/         # Portfolio page
│   ├── account/           # Account settings page
│   └── about/             # About page
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── stock-detail/  # Charts, fundamentals, news, trading
│   │   ├── stock-list/    # Stock table and rows
│   │   └── portfolio/     # Holdings, trade history
│   ├── layout/            # Layout components (header, footer)
│   ├── providers/         # React context providers
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
│   ├── use-wallet-auth    # Wallet signature authentication
│   ├── use-user           # User profile management
│   ├── use-trade-history  # Trade history
│   ├── use-stock-*        # Stock data hooks
│   └── ...
├── lib/
│   ├── api/              # API services
│   ├── auth/             # Signature verification
│   ├── supabase/         # Database clients
│   ├── swap/             # Jupiter swap logic
│   └── utils/            # Utility functions
├── types/                # TypeScript type definitions
└── public/logos/         # Locally cached stock logos
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
Comprehensive stock data including:
- Company profiles and fundamentals
- Real-time stock quotes
- News and press releases
- Analyst recommendations and price targets
- Earnings calendar
- Insider trading transactions
- Peer company data

[Documentation](https://finnhub.io/docs/api)

### Jupiter API
DEX aggregation and swap quotes on Solana. [Documentation](https://station.jup.ag/docs/)

### Helius RPC
High-performance Solana RPC endpoint. [Documentation](https://docs.helius.dev/)

### Supabase
PostgreSQL database with Row Level Security for:
- User profiles (wallet-linked)
- Trade history
- Session management

[Documentation](https://supabase.com/docs)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
