import { Contract } from "@ethersproject/contracts"
import type { WebSocketProvider } from "@ethersproject/providers"

// Uniswap V3 Pool ABI (minimal for Swap events)
const POOL_ABI = [
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
]

export class UniswapPriceTracker {
  private provider: WebSocketProvider
  private poolContract: Contract

  constructor(provider: WebSocketProvider, poolAddress: string) {
    this.provider = provider
    this.poolContract = new Contract(poolAddress, POOL_ABI, provider)
  }

  async startTracking(onPriceUpdate: (price: number) => void) {
    // Listen for Swap events
    this.poolContract.on("Swap", (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick) => {
      try {
        // Calculate price from sqrtPriceX96
        // price = (sqrtPriceX96**2 * 10**12) / (2**192)
        const sqrtPrice = sqrtPriceX96.toBigInt()
        const price = Number((sqrtPrice * sqrtPrice * BigInt(10 ** 12)) / BigInt(2) ** BigInt(192))

        onPriceUpdate(price)
      } catch (error) {
        console.error("Error calculating price from Swap event:", error)
      }
    })
  }

  stop() {
    this.poolContract.removeAllListeners("Swap")
  }
}

export function calculateGasCostUSD(
  baseFeeGwei: number,
  priorityFeeGwei: number,
  gasLimit: number,
  ethPriceUSD: number,
): number {
  const totalGwei = baseFeeGwei + priorityFeeGwei
  const gasCostETH = (totalGwei * gasLimit) / 1e9 // Convert Gwei to ETH
  return gasCostETH * ethPriceUSD
}

export function formatGasPrice(gwei: number): string {
  if (gwei < 1) {
    return `${(gwei * 1000).toFixed(0)} mGwei`
  }
  return `${gwei.toFixed(2)} Gwei`
}

export function getChainConfig(chainName: string) {
  const configs = {
    ethereum: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      color: "#627eea",
    },
    polygon: {
      name: "Polygon",
      symbol: "MATIC",
      decimals: 18,
      color: "#8247e5",
    },
    arbitrum: {
      name: "Arbitrum",
      symbol: "ETH",
      decimals: 18,
      color: "#28a0f0",
    },
  }

  return configs[chainName as keyof typeof configs] || configs.ethereum
}
