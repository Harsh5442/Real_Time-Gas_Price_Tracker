import type { GasPoint } from "@/lib/store/gas-store"

export function generateSampleGasData(chainName: string): GasPoint[] {
  const now = Date.now()
  const fifteenMinutes = 15 * 60 * 1000
  const data: GasPoint[] = []

  // Generate 50 sample points over the last ~12 hours
  for (let i = 49; i >= 0; i--) {
    const time = now - i * fifteenMinutes

    // Different base gas prices for different chains
    let baseGas = 20
    if (chainName === "polygon") baseGas = 50
    if (chainName === "arbitrum") baseGas = 0.5

    // Add some realistic volatility
    const volatility = Math.sin(i * 0.1) * 5 + Math.random() * 10
    const gasPrice = Math.max(0.1, baseGas + volatility)

    // Create realistic OHLC data
    const variation = gasPrice * 0.1
    const open = gasPrice + (Math.random() - 0.5) * variation
    const close = gasPrice + (Math.random() - 0.5) * variation
    const high = Math.max(open, close) + Math.random() * variation * 0.5
    const low = Math.min(open, close) - Math.random() * variation * 0.5

    data.push({
      time,
      open: Math.max(0.1, open),
      high: Math.max(0.1, high),
      low: Math.max(0.1, low),
      close: Math.max(0.1, close),
    })
  }

  return data
}
