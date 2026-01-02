# Contributing to Noreva

Thank you for your interest in contributing to Noreva! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/noreva.git
   cd noreva
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your API keys to `.env.local`:
   - `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT` - Solana RPC endpoint
   - `TWELVE_DATA_API_KEY` - For stock price data
   - `FINNHUB_API_KEY` - Alternative stock data provider

3. Start the development server:
   ```bash
   npm run dev
   ```

## Code Guidelines

- **TypeScript**: All new code should be written in TypeScript
- **Formatting**: Run `npm run lint` before committing
- **Components**: Follow the existing component structure in `src/components/`
- **Styling**: Use Tailwind CSS classes, follow the existing design system

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Update CHANGELOG.md** with a note about your changes
3. **Test your changes** thoroughly
4. **Create a Pull Request** with a clear description of what you've changed

## Commit Messages

Use clear, descriptive commit messages:
- `feat: Add new feature X`
- `fix: Fix bug in Y`
- `docs: Update documentation for Z`
- `refactor: Refactor component A`

## Reporting Issues

When reporting issues, please include:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser and OS information

## Questions?

Feel free to open an issue or reach out on [X](https://x.com/NorevaMarkets).

---

Thank you for contributing! 🚀

