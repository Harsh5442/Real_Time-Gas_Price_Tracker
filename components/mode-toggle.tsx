"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGasStore } from "@/lib/store/gas-store"
import { Activity, Calculator } from "lucide-react"

export function ModeToggle() {
  const { mode, setMode } = useGasStore()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={mode === "live" ? "default" : "outline"}
        size="sm"
        onClick={() => setMode("live")}
        className="flex items-center gap-2"
      >
        <Activity className="w-4 h-4" />
        Live Mode
        {mode === "live" && <Badge className="ml-1 bg-green-500">Active</Badge>}
      </Button>

      <Button
        variant={mode === "simulation" ? "default" : "outline"}
        size="sm"
        onClick={() => setMode("simulation")}
        className="flex items-center gap-2"
      >
        <Calculator className="w-4 h-4" />
        Simulation
        {mode === "simulation" && <Badge className="ml-1 bg-blue-500">Active</Badge>}
      </Button>
    </div>
  )
}
