"use client"

import { useEffect } from "react"
import { GasTracker } from "@/components/gas-tracker"
import { useGasStore } from "@/lib/store/gas-store"

export default function Home() {
  const { initializeAlchemy, setMode } = useGasStore()

  useEffect(() => {
    // Initialize Alchemy connections on mount
    initializeAlchemy()

    // Start in live mode
    setMode("live")
  }, [initializeAlchemy, setMode])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Real-Time Cross-Chain Gas Tracker</h1>
          <p className="text-muted-foreground">
            Live gas prices across Ethereum, Polygon, and Arbitrum with USD cost simulation
          </p>
        </div>
        <GasTracker />
      </div>
    </div>
  )
}
