import { redirect } from "next/navigation";

interface StockPageProps {
  params: Promise<{ symbol: string }>;
}

/**
 * Redirect from old /stock/[symbol] URLs to new /trade/[symbol] trading terminal
 */
export default async function StockRedirectPage({ params }: StockPageProps) {
  const { symbol } = await params;
  redirect(`/trade/${symbol}`);
}
