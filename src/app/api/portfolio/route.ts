import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

const HELIUS_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "";

// All known xStock mint addresses with their info
const XSTOCKS: Record<string, { symbol: string; name: string; underlying: string }> = {
  "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh": { symbol: "NVDAx", name: "NVIDIA xStock", underlying: "NVDA" },
  "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp": { symbol: "AAPLx", name: "Apple xStock", underlying: "AAPL" },
  "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX": { symbol: "MSFTx", name: "Microsoft xStock", underlying: "MSFT" },
  "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB": { symbol: "TSLAx", name: "Tesla xStock", underlying: "TSLA" },
  "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg": { symbol: "AMZNx", name: "Amazon xStock", underlying: "AMZN" },
  "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu": { symbol: "METAx", name: "Meta xStock", underlying: "META" },
  "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN": { symbol: "GOOGLx", name: "Google xStock", underlying: "GOOGL" },
  "XsEH7wWfJJu2ZT3UCFeVfALnVA6CP5ur7Ee11KmzVpL": { symbol: "NFLXx", name: "Netflix xStock", underlying: "NFLX" },
  "XsjFwUPiLofddX5cWFHW35GCbXcSu1BCUGfxoQAQjeL": { symbol: "ORCLx", name: "Oracle xStock", underlying: "ORCL" },
  "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu": { symbol: "COINx", name: "Coinbase xStock", underlying: "COIN" },
  "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ": { symbol: "MSTRx", name: "MicroStrategy xStock", underlying: "MSTR" },
  "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg": { symbol: "HOODx", name: "Robinhood xStock", underlying: "HOOD" },
  "XsaHND8sHyfMfsWPj6kSdd5VwvCayZvjYgKmmcNL5qh": { symbol: "XOMx", name: "Exxon xStock", underlying: "XOM" },
  "XsaBXg8dU5cPM6ehmVctMkVqoiRG2ZjMo1cyBJ3AykQ": { symbol: "KOx", name: "Coca-Cola xStock", underlying: "KO" },
  "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ": { symbol: "QQQx", name: "Nasdaq ETF xStock", underlying: "QQQ" },
  "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W": { symbol: "SPYx", name: "S&P 500 ETF xStock", underlying: "SPY" },
  "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re": { symbol: "GLDx", name: "Gold ETF xStock", underlying: "GLD" },
};

// Fetch current prices from Backed Finance API
async function fetchPrices(): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  const underlyings = [...new Set(Object.values(XSTOCKS).map(s => s.underlying))];
  
  try {
    const symbolsStr = underlyings.join(",");
    const response = await fetch(
      `https://api.backed.fi/api/v1/collateral/quote?symbol=${symbolsStr}`,
      { headers: { Accept: "application/json" } }
    );
    
    if (response.ok) {
      const data = await response.json();
      // Handle both single and multi-symbol responses
      if (underlyings.length === 1 && data.quote !== undefined) {
        prices.set(underlyings[0], parseFloat(data.quote));
      } else if (typeof data === "object") {
        for (const [key, value] of Object.entries(data)) {
          const quote = value as any;
          if (quote && (quote.quote !== undefined || quote.price !== undefined)) {
            prices.set(key, parseFloat(quote.quote || quote.price));
          }
        }
      }
    }
  } catch (error) {
    console.error("[Portfolio] Price fetch error:", error);
  }
  
  return prices;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("wallet");

  if (!walletAddress) {
    return NextResponse.json({ success: false, error: "Missing wallet address" }, { status: 400 });
  }

  console.log(`[Portfolio] Checking wallet: ${walletAddress}`);

  try {
    const publicKey = new PublicKey(walletAddress);
    const connection = new Connection(HELIUS_RPC, "confirmed");
    
    // Fetch all token accounts for this wallet
    console.log("[Portfolio] Fetching token accounts from Helius...");
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });
    
    console.log(`[Portfolio] Found ${tokenAccounts.value.length} token accounts`);
    
    // Fetch prices
    const prices = await fetchPrices();
    console.log(`[Portfolio] Fetched ${prices.size} prices`);
    
    const holdings: any[] = [];
    
    for (const account of tokenAccounts.value) {
      const parsedInfo = account.account.data.parsed?.info;
      if (!parsedInfo) continue;
      
      const mint = parsedInfo.mint;
      const stock = XSTOCKS[mint];
      
      if (stock) {
        const balance = parsedInfo.tokenAmount?.uiAmount || 0;
        
        if (balance > 0) {
          const tokenPrice = prices.get(stock.underlying) || 0;
          const valueUsd = balance * tokenPrice;
          
          console.log(`[Portfolio] FOUND: ${stock.symbol} - Balance: ${balance}, Price: $${tokenPrice}, Value: $${valueUsd}`);
          
          holdings.push({
            symbol: stock.symbol,
            underlying: stock.underlying,
            name: stock.name,
            mintAddress: mint,
            balance,
            tokenPrice,
            stockPrice: tokenPrice,
            spread: 0,
            valueUsd,
            provider: "backed",
          });
        }
      }
    }
    
    // Sort by value
    holdings.sort((a, b) => b.valueUsd - a.valueUsd);
    const totalValue = holdings.reduce((sum, h) => sum + h.valueUsd, 0);
    
    console.log(`[Portfolio] Result: ${holdings.length} holdings, $${totalValue.toFixed(2)} total`);

    return NextResponse.json({
      success: true,
      holdings,
      totalValue,
      count: holdings.length,
      source: "helius_direct",
    });
  } catch (error) {
    console.error("[Portfolio] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
