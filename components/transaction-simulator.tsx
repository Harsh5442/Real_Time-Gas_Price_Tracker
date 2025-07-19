"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGasStore } from "@/lib/store/gas-store"
import { Calculator, Crown, DollarSign } from "lucide-react"

export function TransactionSimulator() {
  const [amount, setAmount] = useState("0.5")
  const [gasLimit, setGasLimit] = useState("21000")
  const { chains, usdPrice } = useGasStore()

  const calculateCosts = () => {
    const amountNum = Number.parseFloat(amount) || 0
    const gasLimitNum = Number.parseInt(gasLimit) || 21000

    return Object.entries(chains).map(([chainName, chainData]) => {
      const totalGwei = chainData.baseFee + chainData.priorityFee
      const gasCostETH = (totalGwei * gasLimitNum) / 1e9
      const gasCostUSD = gasCostETH * usdPrice
      const totalCostUSD = amountNum * usdPrice + gasCostUSD

      return {
        chain: chainName,
        gasCostETH,
        gasCostUSD,
        totalCostUSD,
        totalGwei,
        savings: 0, // Will be calculated below
      }
    })
  }

  const costs = calculateCosts()
  const cheapestChain = costs.reduce((min, current) => (current.gasCostUSD < min.gasCostUSD ? current : min))
  const mostExpensive = costs.reduce((max, current) => (current.gasCostUSD > max.gasCostUSD ? current : max))

  // Calculate savings
  costs.forEach((cost) => {
    cost.savings = mostExpensive.gasCostUSD - cost.gasCostUSD
  })

  const presetAmounts = ["0.1", "0.5", "1.0", "5.0"]
  const presetGasLimits = [
    { label: "Transfer", value: "21000" },
    { label: "ERC20", value: "65000" },
    { label: "Swap", value: "150000" },
    { label: "NFT Mint", value: "200000" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Transaction Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (ETH/MATIC)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.5"
          />
          <div className="flex gap-1">
            {presetAmounts.map((preset) => (
              <Button key={preset} variant="outline" size="sm" onClick={() => setAmount(preset)}>
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gasLimit">Gas Limit</Label>
          <Input
            id="gasLimit"
            type="number"
            value={gasLimit}
            onChange={(e) => setGasLimit(e.target.value)}
            placeholder="21000"
          />
          <div className="grid grid-cols-2 gap-1">
            {presetGasLimits.map((preset) => (
              <Button key={preset.value} variant="outline" size="sm" onClick={() => setGasLimit(preset.value)}>
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cost Comparison
          </h4>
          {costs
            .sort((a, b) => a.gasCostUSD - b.gasCostUSD)
            .map((cost, index) => (
              <div key={cost.chain} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize flex items-center gap-2">
                    {cost.chain}
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                  </span>
                  <div className="flex gap-2">
                    {cost.chain === cheapestChain.chain && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Cheapest</Badge>
                    )}
                    {cost.savings > 0 && (
                      <Badge variant="outline" className="text-green-600">
                        Save ${cost.savings.toFixed(4)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Gas Cost:</span>
                    <div className="font-semibold">${cost.gasCostUSD.toFixed(6)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Cost:</span>
                    <div className="font-semibold">${cost.totalCostUSD.toFixed(4)}</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {cost.totalGwei.toFixed(3)} Gwei • {cost.gasCostETH.toFixed(8)} ETH gas
                </div>
              </div>
            ))}
        </div>

        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            Maximum savings: ${(Math.max(...costs.map((c) => c.gasCostUSD)) - cheapestChain.gasCostUSD).toFixed(6)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
