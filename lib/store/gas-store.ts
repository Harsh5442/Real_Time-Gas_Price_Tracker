import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { AlchemyGasClient } from "../alchemy-client"

export interface GasPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export interface ChainData {
  baseFee: number
  priorityFee: number
  history: GasPoint[]
  lastUpdated: number
}

export interface GasState {
  mode: "live" | "simulation"
  chains: {
    ethereum: ChainData
    polygon: ChainData
    arbitrum: ChainData
  }
  usdPrice: number
  isConnected: boolean
  alchemyClient?: AlchemyGasClient

  // Actions
  setMode: (mode: "live" | "simulation") => void
  updateChainData: (chain: keyof GasState["chains"], data: Partial<ChainData>) => void
  updateUSDPrice: (price: number) => void
  setConnected: (connected: boolean) => void
  initializeAlchemy: () => void
  getHistoricalData: (chain: keyof GasState["chains"]) => any[]
}

const ALCHEMY_API_KEY = "wHn4re0N30s9jOktSHqKg"

export const useGasStore = create<GasState>()(
  subscribeWithSelector((set, get) => ({
    mode: "live",
    chains: {
      ethereum: {
        baseFee: 0,
        priorityFee: 0,
        history: [],
        lastUpdated: 0,
      },
      polygon: {
        baseFee: 0,
        priorityFee: 0,
        history: [],
        lastUpdated: 0,
      },
      arbitrum: {
        baseFee: 0,
        priorityFee: 0,
        history: [],
        lastUpdated: 0,
      },
    },
    usdPrice: 3500,
    isConnected: false,

    setMode: (mode) => set({ mode }),

    updateChainData: (chain, data) =>
      set((state) => ({
        chains: {
          ...state.chains,
          [chain]: {
            ...state.chains[chain],
            ...data,
            lastUpdated: Date.now(),
          },
        },
      })),

    updateUSDPrice: (price) => set({ usdPrice: price }),

    setConnected: (connected) => set({ isConnected: connected }),

    getHistoricalData: (chain) => {
      const chainData = get().chains[chain]
      return chainData.history.map((point) => ({
        time: point.time / 1000,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      }))
    },

    initializeAlchemy: async () => {
      const { updateChainData, updateUSDPrice, setConnected } = get()

      try {
        setConnected(false)

        const client = new AlchemyGasClient(ALCHEMY_API_KEY)
        set({ alchemyClient: client })

        console.log("🚀 Initializing Alchemy gas tracking...")

        const chains = ["ethereum", "polygon", "arbitrum"]
        let successfulConnections = 0

        // Load initial historical data
        for (const chain of chains) {
          try {
            console.log(`📊 Loading ${chain} gas history...`)
            const history = await client.getGasHistory(chain, 50)

            if (history.length > 0) {
              const gasPoints: GasPoint[] = history.map((point) => ({
                time: point.timestamp,
                open: point.gasPrice,
                high: point.gasPrice,
                low: point.gasPrice,
                close: point.gasPrice,
              }))

              const latest = history[history.length - 1]
              updateChainData(chain as keyof GasState["chains"], {
                baseFee: latest.baseFee,
                priorityFee: latest.priorityFee,
                history: gasPoints,
              })

              successfulConnections++
              console.log(`✅ Loaded ${history.length} data points for ${chain}`)
            }
          } catch (error) {
            console.error(`❌ Failed to load ${chain} data:`, error)
          }
        }

        if (successfulConnections > 0) {
          setConnected(true)
          console.log(`🎉 Connected to ${successfulConnections}/${chains.length} chains`)
        }

        // Real-time updates
        const updateGasPrices = async () => {
          let activeConnections = 0

          for (const chain of chains) {
            try {
              const gasData = await client.getCurrentGasPrice(chain)

              updateChainData(chain as keyof GasState["chains"], {
                baseFee: gasData.baseFee,
                priorityFee: gasData.priorityFee,
              })

              // Add to history
              const currentData = get().chains[chain as keyof GasState["chains"]]
              const newPoint: GasPoint = {
                time: gasData.timestamp,
                open: gasData.gasPrice,
                high: gasData.gasPrice,
                low: gasData.gasPrice,
                close: gasData.gasPrice,
              }

              const updatedHistory = [...currentData.history, newPoint]
              if (updatedHistory.length > 100) {
                updatedHistory.shift()
              }

              updateChainData(chain as keyof GasState["chains"], {
                history: updatedHistory,
              })

              activeConnections++
            } catch (error) {
              console.error(`Error updating ${chain} gas price:`, error)
            }
          }

          setConnected(activeConnections > 0)
        }

        updateGasPrices()
        setInterval(updateGasPrices, 15000)

        // ETH price updates
        const updateETHPrice = async () => {
          try {
            const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
            const data = await response.json()
            if (data.ethereum?.usd) {
              updateUSDPrice(data.ethereum.usd)
            }
          } catch (error) {
            console.error("Failed to fetch ETH price:", error)
          }
        }

        updateETHPrice()
        setInterval(updateETHPrice, 30000)

        console.log("🎉 Alchemy gas tracking initialized successfully!")
      } catch (error) {
        console.error("Failed to initialize Alchemy:", error)
        setConnected(false)
      }
    },
  })),
)
