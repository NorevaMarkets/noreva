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
| **Portfolio** | Managing your tokenized stock holdings |
| **FAQ** | Common questions answered |

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [Nextra 2](https://nextra.site/) - Documentation framework
- [MDX](https://mdxjs.com/) - Markdown with JSX
- Custom dark theme matching noreva.markets

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
- **X (Twitter):** [x.com](https://x.com)
