interface AlchemyGasPrice {
  timestamp: number
  baseFee: number
  priorityFee: number
  gasPrice: number
}

interface AlchemyResponse {
  result: {
    baseFeePerGas: string
    gasPrice: string
    maxFeePerGas: string
    maxPriorityFeePerGas: string
  }
}

export class AlchemyGasClient {
  private apiKey: string
  private baseUrls: Record<string, string>

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrls = {
      ethereum: `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`,
      polygon: `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`,
      arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${apiKey}`,
    }
  }

  async getCurrentGasPrice(chain: string): Promise<AlchemyGasPrice> {
    try {
      const response = await fetch(this.baseUrls[chain], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_feeHistory",
          params: [1, "latest", [25, 50, 75]], // Get last block with percentiles
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      const baseFee = Number.parseInt(data.result.baseFeePerGas[0], 16) / 1e9 // Convert to Gwei
      const gasPrice = Number.parseInt(data.result.reward[0][1], 16) / 1e9 // 50th percentile

      return {
        timestamp: Date.now(),
        baseFee,
        priorityFee: gasPrice,
        gasPrice: baseFee + gasPrice,
      }
    } catch (error) {
      console.error(`Error fetching gas price for ${chain}:`, error)
      throw error
    }
  }

  async getGasHistory(chain: string, blockCount = 100): Promise<AlchemyGasPrice[]> {
    try {
      const response = await fetch(this.baseUrls[chain], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_feeHistory",
          params: [blockCount, "latest", [25, 50, 75]],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      const history: AlchemyGasPrice[] = []
      const currentTime = Date.now()
      const blockTime = chain === "ethereum" ? 12000 : chain === "polygon" ? 2000 : 250 // ms per block

      for (let i = 0; i < data.result.baseFeePerGas.length - 1; i++) {
        const baseFee = Number.parseInt(data.result.baseFeePerGas[i], 16) / 1e9
        const priorityFee = data.result.reward[i] ? Number.parseInt(data.result.reward[i][1], 16) / 1e9 : 0

        history.push({
          timestamp: currentTime - (blockCount - i) * blockTime,
          baseFee,
          priorityFee,
          gasPrice: baseFee + priorityFee,
        })
      }

      return history
    } catch (error) {
      console.error(`Error fetching gas history for ${chain}:`, error)
      return []
    }
  }
}
