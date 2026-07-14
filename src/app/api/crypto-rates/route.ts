import { NextResponse } from "next/server";

// GET /api/crypto-rates — fetch current crypto to RUB rates
// Returns: { rates: { btc: number, usdt: number, ton: number }, source, updatedAt }
// Each value = price in RUB for 1 unit of crypto
export async function GET() {
  const fallbackRates = {
    btc: 8500000,   // ~$95k * 90 RUB
    usdt: 92,       // ~$1 * 92 RUB
    ton: 550,       // ~$6 * 92 RUB
  };

  // Try CoinGecko (free, no API key)
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether,toncoin&vs_currencies=rub",
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const rates = {
        btc: data?.bitcoin?.rub || fallbackRates.btc,
        usdt: data?.tether?.rub || fallbackRates.usdt,
        ton: data?.toncoin?.rub || fallbackRates.ton,
      };
      return NextResponse.json({
        rates,
        source: "coingecko",
        updatedAt: new Date().toISOString(),
      });
    }
  } catch {
    // CoinGecko failed, use fallback
  }

  return NextResponse.json({
    rates: fallbackRates,
    source: "fallback",
    updatedAt: new Date().toISOString(),
  });
}
