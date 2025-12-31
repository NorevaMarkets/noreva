"use client";

import { useMemo } from "react";

interface MarketDepthProps {
  price: number;
  spread?: number; // Optional spread percentage
  volume?: number; // Optional 24h volume
}

export function MarketDepth({ price, spread = 0, volume = 50000 }: MarketDepthProps) {
  // Generate realistic order levels based on actual price and spread
  const orderLevels = useMemo(() => {
    const levels = [];
    
    // Calculate bid-ask spread (typically 0.01% - 0.1% for liquid assets)
    const bidAskSpread = Math.max(0.0001, Math.abs(spread) / 100 * 0.1);
    
    // Best bid/ask around current price
    const bestBid = price * (1 - bidAskSpread / 2);
    const bestAsk = price * (1 + bidAskSpread / 2);
    
    // Volume scaling based on actual 24h volume
    const baseSize = Math.floor(volume / 1000);
    
    for (let i = 0; i < 8; i++) {
      // Price levels decrease for bids, increase for asks
      const bidPrice = bestBid - (i * price * 0.0005);
      const askPrice = bestAsk + (i * price * 0.0005);
      
      // Size increases further from mid price (more liquidity at worse prices)
      const sizeMultiplier = 1 + (i * 0.3);
      const buySize = Math.floor((baseSize + Math.random() * baseSize * 0.5) * sizeMultiplier);
      const sellSize = Math.floor((baseSize + Math.random() * baseSize * 0.5) * sizeMultiplier);
      
      levels.push({
        id: i + 1,
        bidPrice,
        askPrice,
        buySize,
        sellSize,
      });
    }
    
    return levels;
  }, [price, spread, volume]);

  // Calculate total depth
  const totalBids = useMemo(() => orderLevels.reduce((sum, l) => sum + l.buySize, 0), [orderLevels]);
  const totalAsks = useMemo(() => orderLevels.reduce((sum, l) => sum + l.sellSize, 0), [orderLevels]);
  const bidAskRatio = totalBids / (totalBids + totalAsks);

  return (
    <div className="p-3">
      {/* Header with Bid/Ask ratio indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Order Book
        </div>
        <div className="text-[9px] text-[var(--foreground-subtle)]">
          Bid/Ask: {(bidAskRatio * 100).toFixed(0)}% / {((1 - bidAskRatio) * 100).toFixed(0)}%
        </div>
      </div>

      {/* Bid/Ask ratio bar */}
      <div className="h-1 bg-[var(--negative)]/30 rounded-full mb-3 overflow-hidden">
        <div 
          className="h-full bg-[var(--positive)] transition-all duration-500"
          style={{ width: `${bidAskRatio * 100}%` }}
        />
      </div>

      {/* Table */}
      <div>
        {/* Column headers */}
        <div className="flex text-[9px] text-[var(--foreground-subtle)] uppercase mb-1 px-0.5">
          <div className="flex-1 text-left text-[var(--positive)]">Bids</div>
          <div className="w-16 text-center">Price</div>
          <div className="flex-1 text-right text-[var(--negative)]">Asks</div>
        </div>

        {/* Order levels - side by side */}
        <div className="space-y-0">
          {orderLevels.map((level, idx) => {
            const isMidPoint = idx === 0;
            const bidWidth = (level.buySize / Math.max(...orderLevels.map(l => l.buySize))) * 100;
            const askWidth = (level.sellSize / Math.max(...orderLevels.map(l => l.sellSize))) * 100;
            
            return (
              <div 
                key={level.id} 
                className={`flex items-center py-0.5 px-0.5 text-[10px] font-mono tabular-nums rounded relative ${
                  isMidPoint ? 'bg-[var(--accent)]/5' : ''
                }`}
              >
                {/* Bid side with depth bar */}
                <div className="flex-1 relative flex items-center">
                  <div 
                    className="absolute right-0 h-full bg-[var(--positive)]/10 rounded-l"
                    style={{ width: `${bidWidth}%` }}
                  />
                  <span className="relative z-10 text-[var(--foreground-muted)]">
                    {level.buySize.toLocaleString()}
                  </span>
                </div>
                
                {/* Price column */}
                <div className={`w-16 text-center ${
                  isMidPoint 
                    ? 'text-[var(--accent)] font-semibold' 
                    : 'text-[var(--foreground-muted)]'
                }`}>
                  {idx === 0 ? (
                    <span className="text-[var(--positive)]">${level.bidPrice.toFixed(2)}</span>
                  ) : (
                    <span className="text-[var(--negative)]">${level.askPrice.toFixed(2)}</span>
                  )}
                </div>
                
                {/* Ask side with depth bar */}
                <div className="flex-1 relative flex items-center justify-end">
                  <div 
                    className="absolute left-0 h-full bg-[var(--negative)]/10 rounded-r"
                    style={{ width: `${askWidth}%` }}
                  />
                  <span className="relative z-10 text-[var(--foreground-muted)]">
                    {level.sellSize.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mid price & Spread info */}
      <div className="mt-3 pt-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-[9px] text-[var(--foreground-subtle)] uppercase mb-0.5">Mid Price</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[var(--foreground)]">
              ${price.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-[var(--foreground-subtle)] uppercase mb-0.5">Spread</div>
            <div className={`text-sm font-semibold font-mono tabular-nums ${
              spread >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
            }`}>
              {spread >= 0 ? '+' : ''}{spread.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-2 text-[8px] text-[var(--foreground-subtle)] text-center opacity-50">
        Order book simulated • Real DEX liquidity may vary
      </div>
    </div>
  );
}
