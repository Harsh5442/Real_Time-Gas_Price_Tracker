"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SetupInstructions() {
  const envVars = [
    {
      name: "NEXT_PUBLIC_ETHEREUM_RPC",
      value: "wss://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
      description: "Ethereum mainnet WebSocket endpoint",
    },
    {
      name: "NEXT_PUBLIC_POLYGON_RPC",
      value: "wss://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
      description: "Polygon mainnet WebSocket endpoint",
    },
    {
      name: "NEXT_PUBLIC_ARBITRUM_RPC",
      value: "wss://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
      description: "Arbitrum mainnet WebSocket endpoint",
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Setup Instructions
          <Badge variant="outline">Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          To enable live data, add these environment variables to your{" "}
          <code className="bg-muted px-1 rounded">.env.local</code> file:
        </div>

        <div className="space-y-3">
          {envVars.map((envVar) => (
            <div key={envVar.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{envVar.name}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${envVar.name}=${envVar.value}`)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground pl-2 border-l-2 border-muted">{envVar.description}</div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 text-sm">
            <span>Get your API key from</span>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => window.open("https://alchemy.com", "_blank")}
            >
              Alchemy Dashboard
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
