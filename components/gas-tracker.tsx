"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GasChart } from "./gas-chart"
import { GasMetrics } from "./gas-metrics"
import { TransactionSimulator } from "./transaction-simulator"
import { ModeToggle } from "./mode-toggle"
import { ConnectionStatus } from "./connection-status"
import { useGasStore } from "@/lib/store/gas-store"

export function GasTracker() {
  const { mode, chains, usdPrice, isConnected } = useGasStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-muted-foreground">{isConnected ? "Live Data" : "Connecting..."}</span>
          </div>
          <div className="text-sm text-muted-foreground">ETH/USD: ${usdPrice.toFixed(2)}</div>
        </div>
        <ModeToggle />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Gas Price Chart - Direct from Alchemy</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6">
                <GasChart />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ConnectionStatus />
          <GasMetrics />
          {mode === "simulation" && <TransactionSimulator />}
        </div>
      </div>

      <Tabs defaultValue="ethereum" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
          <TabsTrigger value="polygon">Polygon</TabsTrigger>
          <TabsTrigger value="arbitrum">Arbitrum</TabsTrigger>
        </TabsList>

        {Object.entries(chains).map(([chainName, chainData]) => (
          <TabsContent key={chainName} value={chainName}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{chainName} Network Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Base Fee</p>
                    <p className="text-2xl font-bold">{chainData.baseFee.toFixed(3)} Gwei</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority Fee</p>
                    <p className="text-2xl font-bold">{chainData.priorityFee.toFixed(3)} Gwei</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gas Price</p>
                    <p className="text-2xl font-bold text-primary">
                      {(chainData.baseFee + chainData.priorityFee).toFixed(3)} Gwei
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{new Date(chainData.lastUpdated).toLocaleTimeString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Data Points</p>
                    <p className="text-lg font-semibold">{chainData.history.length} historical points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
