"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGasStore } from "@/lib/store/gas-store"
import { TrendingUp, TrendingDown, Minus, Zap } from "lucide-react"

export function GasMetrics() {
  const { chains, usdPrice } = useGasStore()

  const getGasUSD = (baseFee: number, priorityFee: number) => {
    const totalGwei = baseFee + priorityFee
    const gasLimit = 21000 // Standard ETH transfer
    const ethCost = (totalGwei * gasLimit) / 1e9 // Convert Gwei to ETH
    return ethCost * usdPrice
  }

  const getTrend = (history: any[]) => {
    if (history.length < 2) return "neutral"
    const current = history[history.length - 1]?.close || 0
    const previous = history[history.length - 2]?.close || 0
    if (current > previous * 1.02) return "up"
    if (current < previous * 0.98) return "down"
    return "neutral"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-green-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "down":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getSpeedLabel = (gasPrice: number, chain: string) => {
    let threshold = 20
    if (chain === "polygon") threshold = 50
    if (chain === "arbitrum") threshold = 1

    if (gasPrice > threshold * 2) return { label: "Fast", color: "text-red-500" }
    if (gasPrice > threshold) return { label: "Standard", color: "text-yellow-500" }
    return { label: "Slow", color: "text-green-500" }
  }

  return (
    <div className="space-y-4">
      {Object.entries(chains).map(([chainName, chainData]) => {
        const trend = getTrend(chainData.history)
        const gasUSD = getGasUSD(chainData.baseFee, chainData.priorityFee)
        const totalGas = chainData.baseFee + chainData.priorityFee
        const speed = getSpeedLabel(totalGas, chainName)

        return (
          <Card key={chainName}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {chainName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getTrendColor(trend)}>{getTrendIcon(trend)}</Badge>
                  <Badge className={`${speed.color} bg-transparent border`}>{speed.label}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gas Price</span>
                <span className="font-bold text-lg">{totalGas.toFixed(3)} Gwei</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transfer Cost</span>
                <span className="font-semibold text-green-600">${gasUSD.toFixed(4)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="text-muted-foreground">Base</div>
                  <div className="font-semibold">{chainData.baseFee.toFixed(3)}</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="text-muted-foreground">Priority</div>
                  <div className="font-semibold">{chainData.priorityFee.toFixed(3)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
