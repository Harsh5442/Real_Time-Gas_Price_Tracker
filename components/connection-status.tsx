"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGasStore } from "@/lib/store/gas-store"
import { WifiOff, AlertCircle, CheckCircle, Activity } from "lucide-react"

export function ConnectionStatus() {
  const { isConnected, chains, alchemyClient } = useGasStore()

  const getChainStatus = () => {
    return {
      ethereum: chains.ethereum.lastUpdated > 0 && chains.ethereum.history.length > 0,
      polygon: chains.polygon.lastUpdated > 0 && chains.polygon.history.length > 0,
      arbitrum: chains.arbitrum.lastUpdated > 0 && chains.arbitrum.history.length > 0,
    }
  }

  const chainStatus = getChainStatus()
  const connectedCount = Object.values(chainStatus).filter(Boolean).length

  const getLastUpdateTime = (chain: keyof typeof chains) => {
    const lastUpdate = chains[chain].lastUpdated
    if (lastUpdate === 0) return "Never"

    const now = Date.now()
    const diff = now - lastUpdate

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isConnected ? (
            <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          Alchemy Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">API Status</span>
          <Badge
            className={
              isConnected
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-red-500/10 text-red-600 border-red-500/20"
            }
          >
            {isConnected ? "Live" : "Disconnected"}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Chain Data ({connectedCount}/3)</div>
          {Object.entries(chainStatus).map(([chain, connected]) => (
            <div key={chain} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm capitalize">{chain}</span>
                {connected ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">{getLastUpdateTime(chain as keyof typeof chains)}</div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Data Points</span>
            <span className="font-mono">
              E:{chains.ethereum.history.length} P:{chains.polygon.history.length} A:{chains.arbitrum.history.length}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Update Interval</span>
            <span className="text-green-600">15 seconds</span>
          </div>
        </div>

        {isConnected && alchemyClient && (
          <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-600">Live gas data from Alchemy eth_feeHistory API</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
