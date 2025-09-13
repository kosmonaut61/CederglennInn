"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PathfindingGameEngine, type GameCallbacks } from "@/lib/game-engine"
import { GameResources } from "@/lib/resources"

interface GameStats {
  currentTileIndex: number
  targetTileIndex: number
  movesRemaining: number
  algoDuration: string
  showWarning: boolean
  warningText: string
  isPlayerMoving: boolean
}

export default function PathfindingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<PathfindingGameEngine | null>(null)
  const [gameStats, setGameStats] = useState<GameStats>({
    currentTileIndex: 0,
    targetTileIndex: 0,
    movesRemaining: 0,
    algoDuration: "0.0",
    showWarning: false,
    warningText: "",
    isPlayerMoving: false,
  })
  const [algorithm, setAlgorithm] = useState<"astar" | "dijkstra">("astar")
  const [allowDiagonals, setAllowDiagonals] = useState(false)
  const [isGameLoaded, setIsGameLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set client state
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Initialize game when component mounts and is on client
    if (isClient) {
      initializeGame()
    }

    return () => {
      // Cleanup game when component unmounts
      if (gameRef.current) {
        gameRef.current.dispose()
      }
    }
  }, [isClient])

  useEffect(() => {
    // Update diagonal settings when changed
    if (gameRef.current && isGameLoaded) {
      const pathfindingSystem = gameRef.current.getPathfindingSystem()
      if (pathfindingSystem) {
        pathfindingSystem.updateDiagonalSettings(allowDiagonals)
      }
    }
  }, [allowDiagonals, isGameLoaded])

  const initializeGame = async () => {
    if (!canvasRef.current || typeof window === 'undefined') return

    try {
      console.log("[v0] Initializing Excalibur game...")
      setLoadingError(null)

      await GameResources.initialize()

      if (!GameResources.validateAssets()) {
        throw new Error("Asset validation failed")
      }

      const gameCallbacks: GameCallbacks = {
        onPlayerMoveComplete: (tileIndex: number) => {
          console.log("[v0] Player moved to tile:", tileIndex)
          setGameStats((prev) => ({
            ...prev,
            currentTileIndex: tileIndex,
            movesRemaining: Math.max(0, prev.movesRemaining - 1),
            isPlayerMoving: false,
          }))
        },
        onPlayerMoveStart: () => {
          console.log("[v0] Player started moving")
          setGameStats((prev) => ({ ...prev, isPlayerMoving: true }))
        },
        onPathfindingComplete: (duration: number, pathLength: number) => {
          console.log("[v0] Pathfinding completed:", { duration, pathLength })
          setGameStats((prev) => ({
            ...prev,
            algoDuration: duration.toFixed(3),
            movesRemaining: pathLength,
          }))
        },
        onPathfindingError: (message: string) => {
          console.log("[v0] Pathfinding error:", message)
          showWarning(message)
        },
      }

      gameRef.current = new PathfindingGameEngine(
        {
          width: 800,
          height: 600,
          canvasElement: canvasRef.current,
          pixelArt: true,
        },
        gameCallbacks,
      )

      const resources = GameResources.getResources()
      const loader = gameRef.current.getLoader()
      resources.forEach((resource) => loader.addResource(resource))

      await gameRef.current.start()
      setIsGameLoaded(true)

      console.log("[v0] Game initialized successfully")
      console.log("[v0] All assets loaded and validated")
    } catch (error) {
      console.error("[v0] Failed to initialize game:", error)
      setLoadingError(error instanceof Error ? error.message : "Unknown error occurred")
    }
  }

  const showWarning = (text: string) => {
    setGameStats((prev) => ({ ...prev, showWarning: true, warningText: text }))
    setTimeout(() => {
      setGameStats((prev) => ({ ...prev, showWarning: false }))
    }, 2000)
  }

  const handleRandomPathfinding = () => {
    if (!gameRef.current || !isGameLoaded) return

    const player = gameRef.current.getPlayer()
    const pathfindingSystem = gameRef.current.getPathfindingSystem()
    if (!player || !pathfindingSystem || player.isMoving()) return

    const currentIndex = player.getCurrentTileIndex()
    let targetIndex: number
    let attempts = 0

    // Find a valid random target (not a tree and not current position)
    do {
      targetIndex = Math.floor(Math.random() * 100)
      attempts++
    } while ((targetIndex === currentIndex || !pathfindingSystem.isValidTarget(targetIndex)) && attempts < 50)

    if (attempts >= 50) {
      showWarning("Could not find valid random target")
      return
    }

    setGameStats((prev) => ({ ...prev, targetTileIndex: targetIndex }))
    gameRef.current.findAndExecutePath(currentIndex, targetIndex, algorithm, allowDiagonals)
  }

  const handleResetPlayer = () => {
    if (!gameRef.current || !isGameLoaded) return

    const player = gameRef.current.getPlayer()
    if (!player || player.isMoving()) return

    // Clear movement buffer and reset to starting position
    player.clearActionBuffer()
    player.pos.x = 8
    player.pos.y = 8

    setGameStats((prev) => ({
      ...prev,
      currentTileIndex: 0,
      targetTileIndex: 0,
      movesRemaining: 0,
      algoDuration: "0.0",
    }))
  }

  const getAlgorithmBadgeColor = () => {
    return algorithm === "astar" ? "bg-blue-500" : "bg-green-500"
  }

  const getPlayerStatusBadge = () => {
    if (!isGameLoaded) return <Badge variant="secondary">Loading...</Badge>
    if (gameStats.isPlayerMoving) return <Badge className="bg-orange-500">Moving</Badge>
    return <Badge className="bg-green-500">Idle</Badge>
  }

  if (!isClient) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-[800px] h-[600px] border border-border rounded-lg shadow-lg bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading game...</div>
        </div>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div className="flex flex-col items-center gap-6">
        <Alert className="max-w-2xl">
          <AlertDescription>
            Failed to load game: {loadingError}. Please refresh the page to try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => {
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }}>Reload Game</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-border rounded-lg shadow-lg bg-black cursor-pointer"
          style={{ imageRendering: "pixelated" }}
        />

        {/* Loading Overlay */}
        {!isGameLoaded && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="text-white text-lg">Loading game assets...</div>
          </div>
        )}

        {/* Warning Overlay */}
        {gameStats.showWarning && (
          <div className="absolute inset-x-0 bottom-4 text-center">
            <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md inline-block animate-pulse">
              {gameStats.warningText}
            </div>
          </div>
        )}

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          {getPlayerStatusBadge()}
          <Badge className={getAlgorithmBadgeColor()}>{algorithm.toUpperCase()}</Badge>
          {allowDiagonals && <Badge variant="outline">Diagonals</Badge>}
        </div>
      </div>

      {/* Game Controls and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Game Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Game Stats
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Current Tile:</span>
              <Badge variant="secondary" className="font-mono">
                {gameStats.currentTileIndex}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Target Tile:</span>
              <Badge variant="secondary" className="font-mono">
                {gameStats.targetTileIndex}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Moves Remaining:</span>
              <Badge variant={gameStats.movesRemaining > 0 ? "default" : "secondary"} className="font-mono">
                {gameStats.movesRemaining}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Algorithm Duration:</span>
              <Badge variant="outline" className="font-mono">
                {gameStats.algoDuration}ms
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Algorithm Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="algorithm">Pathfinding Algorithm</Label>
              <Select
                value={algorithm}
                onValueChange={(value: "astar" | "dijkstra") => setAlgorithm(value)}
                disabled={gameStats.isPlayerMoving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="astar">A* (A-Star)</SelectItem>
                  <SelectItem value="dijkstra">Dijkstra</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {algorithm === "astar"
                  ? "Heuristic-based, faster for single target"
                  : "Explores all paths, guarantees shortest route"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="diagonals"
                checked={allowDiagonals}
                onCheckedChange={(checked) => setAllowDiagonals(checked as boolean)}
                disabled={gameStats.isPlayerMoving}
              />
              <Label htmlFor="diagonals" className="text-sm">
                Allow Diagonal Movement
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Game Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Game Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleRandomPathfinding}
              disabled={!isGameLoaded || gameStats.isPlayerMoving}
              className="w-full"
              variant="default"
            >
              Random Pathfinding
            </Button>

            <Button
              onClick={handleResetPlayer}
              disabled={!isGameLoaded || gameStats.isPlayerMoving}
              className="w-full bg-transparent"
              variant="outline"
            >
              Reset Player Position
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2 text-sm">Instructions</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Click on any grass tile to move there</li>
                <li>• Trees block movement and pathfinding</li>
                <li>• Try different algorithms to compare performance</li>
                <li>• Enable diagonals for more direct paths</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
