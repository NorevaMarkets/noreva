import { redirect } from "next/navigation";

/**
 * Trade index page - redirects to the most popular stock (NVDA)
 * This allows /trade to work as a landing page for the trading terminal
 */
export default function TradeIndexPage() {
  // Redirect to NVIDIA as the default/most popular stock
  // Could be made dynamic in the future (e.g., based on volume or user preference)
  redirect("/trade/NVDA");
}

