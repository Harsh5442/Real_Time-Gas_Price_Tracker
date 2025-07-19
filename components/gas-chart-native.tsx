"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useGasStore } from "@/lib/store/gas-store"
import { Button } from "@/components/ui/button"

interface ChartPoint {
  timestamp: number
  gasPrice: number
  baseFee: number
  priorityFee: number
}

export function GasChartNative() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedChain, setSelectedChain] = useState<"ethereum" | "polygon" | "arbitrum">("ethereum")
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const { chains } = useGasStore()

  const getChartData = (): ChartPoint[] => {
    const chainData = chains[selectedChain]
    return chainData.history.map((point) => ({
      timestamp: point.time,
      gasPrice: point.close,
      baseFee: chainData.baseFee,
      priorityFee: chainData.priorityFee,
    }))
  }

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const data = getChartData()
    if (data.length === 0) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 60, bottom: 40, left: 60 }

    // Clear canvas
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, width, height)

    // Calculate scales
    const minPrice = Math.min(...data.map((d) => d.gasPrice))
    const maxPrice = Math.max(...data.map((d) => d.gasPrice))
    const priceRange = maxPrice - minPrice || 1

    const minTime = Math.min(...data.map((d) => d.timestamp))
    const maxTime = Math.max(...data.map((d) => d.timestamp))
    const timeRange = maxTime - minTime || 1

    // Draw grid
    ctx.strokeStyle = "#334155"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (height - padding.top - padding.bottom) * (i / 5)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      // Price labels
      const price = maxPrice - (priceRange * i) / 5
      ctx.fillStyle = "#94a3b8"
      ctx.font = "12px monospace"
      ctx.textAlign = "right"
      ctx.fillText(`${price.toFixed(1)}`, padding.left - 10, y + 4)
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + (width - padding.left - padding.right) * (i / 6)
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()

      // Time labels
      const time = minTime + (timeRange * i) / 6
      const timeStr = new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      ctx.fillStyle = "#94a3b8"
      ctx.font = "12px monospace"
      ctx.textAlign = "center"
      ctx.fillText(timeStr, x, height - padding.bottom + 20)
    }

    // Draw price line
    ctx.strokeStyle = getChainColor(selectedChain)
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = padding.left + ((point.timestamp - minTime) / timeRange) * (width - padding.left - padding.right)
      const y = padding.top + ((maxPrice - point.gasPrice) / priceRange) * (height - padding.top - padding.bottom)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw data points
    ctx.fillStyle = getChainColor(selectedChain)
    data.forEach((point) => {
      const x = padding.left + ((point.timestamp - minTime) / timeRange) * (width - padding.left - padding.right)
      const y = padding.top + ((maxPrice - point.gasPrice) / priceRange) * (height - padding.top - padding.bottom)

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw title
    ctx.fillStyle = "#f1f5f9"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`${selectedChain.toUpperCase()} Gas Prices`, padding.left, 20)

    // Draw current price
    const currentPrice = data[data.length - 1]?.gasPrice || 0
    ctx.fillStyle = getChainColor(selectedChain)
    ctx.font = "bold 14px monospace"
    ctx.textAlign = "right"
    ctx.fillText(`${currentPrice.toFixed(2)} Gwei`, width - padding.right, 20)
  }

  const getChainColor = (chain: string) => {
    switch (chain) {
      case "ethereum":
        return "#3b82f6"
      case "polygon":
        return "#8b5cf6"
      case "arbitrum":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setMousePos({ x: event.clientX, y: event.clientY })

    const data = getChartData()
    const padding = { top: 20, right: 60, bottom: 40, left: 60 }

    if (data.length === 0) return

    const minTime = Math.min(...data.map((d) => d.timestamp))
    const maxTime = Math.max(...data.map((d) => d.timestamp))
    const timeRange = maxTime - minTime || 1

    // Find closest data point
    const relativeX = (x - padding.left) / (rect.width - padding.left - padding.right)
    const targetTime = minTime + relativeX * timeRange

    let closestPoint = data[0]
    let minDistance = Math.abs(data[0].timestamp - targetTime)

    data.forEach((point) => {
      const distance = Math.abs(point.timestamp - targetTime)
      if (distance < minDistance) {
        minDistance = distance
        closestPoint = point
      }
    })

    setHoveredPoint(closestPoint)
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  useEffect(() => {
    drawChart()
  }, [selectedChain, chains])

  useEffect(() => {
    const handleResize = () => drawChart()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["ethereum", "polygon", "arbitrum"] as const).map((chain) => (
          <Button
            key={chain}
            variant={selectedChain === chain ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedChain(chain)}
            className="capitalize"
          >
            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getChainColor(chain) }} />
            {chain}
          </Button>
        ))}
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[400px] border border-border rounded-lg cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {hoveredPoint && (
          <div
            className="absolute bg-popover border border-border rounded-lg p-3 shadow-lg pointer-events-none z-10"
            style={{
              left: mousePos.x + 10,
              top: mousePos.y - 80,
            }}
          >
            <div className="text-sm space-y-1">
              <div className="font-semibold">{new Date(hoveredPoint.timestamp).toLocaleString()}</div>
              <div>
                Gas Price: <span className="font-mono">{hoveredPoint.gasPrice.toFixed(2)} Gwei</span>
              </div>
              <div>
                Base Fee: <span className="font-mono">{hoveredPoint.baseFee.toFixed(2)} Gwei</span>
              </div>
              <div>
                Priority Fee: <span className="font-mono">{hoveredPoint.priorityFee.toFixed(2)} Gwei</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Real-time gas prices from Alchemy • {getChartData().length} data points
      </div>
    </div>
  )
}
