"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import p5 from "p5"

interface GameState {
  playerX: number
  playerY: number
  targetX: number
  targetY: number
  isMoving: boolean
  moveSpeed: number
}

interface Tile {
  x: number
  y: number
  type: 'grass' | 'tree' | 'water'
  walkable: boolean
}

export default function SimpleGame() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const p5InstanceRef = useRef<p5 | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    playerX: 1,
    playerY: 1,
    targetX: 1,
    targetY: 1,
    isMoving: false,
    moveSpeed: 0.05
  })
  const [tiles, setTiles] = useState<Tile[][]>([])
  const [tileSize] = useState(32)
  const [gridWidth, setGridWidth] = useState(0)
  const [gridHeight, setGridHeight] = useState(0)
  const [images, setImages] = useState<{
    player?: p5.Image
    grass?: p5.Image
  }>({})

  useEffect(() => {
    if (!canvasRef.current) return

    const sketch = (p: p5) => {
      let playerImg: p5.Image | null = null
      let grassImg: p5.Image | null = null
      let gameTiles: Tile[][] = []

      p.preload = () => {
        // Load images
        playerImg = p.loadImage('/dude.png')
        grassImg = p.loadImage('/roguelike.png')
      }

      p.setup = () => {
        const canvasWidth = 800
        const canvasHeight = 600
        p.createCanvas(canvasWidth, canvasHeight)
        
        // Calculate grid dimensions
        const cols = Math.floor(canvasWidth / tileSize)
        const rows = Math.floor(canvasHeight / tileSize)
        
        setGridWidth(cols)
        setGridHeight(rows)
        
        // Generate tiles
        gameTiles = generateTiles(cols, rows)
        setTiles(gameTiles)
        
        console.log('P5.js game initialized')
      }

      p.draw = () => {
        // Clear background
        p.background(45, 80, 22) // Dark green
        
        // Draw tiles
        for (let y = 0; y < gameTiles.length; y++) {
          for (let x = 0; x < gameTiles[y].length; x++) {
            drawTile(p, gameTiles[y][x], x, y)
          }
        }
        
        // Draw player
        drawPlayer(p)
      }

      p.mousePressed = () => {
        const tileX = Math.floor(p.mouseX / tileSize)
        const tileY = Math.floor(p.mouseY / tileSize)
        
        if (isValidTarget(tileX, tileY, gameTiles)) {
          movePlayerTo(tileX, tileY)
        }
      }

      const generateTiles = (cols: number, rows: number): Tile[][] => {
        const newTiles: Tile[][] = []
        for (let y = 0; y < rows; y++) {
          newTiles[y] = []
          for (let x = 0; x < cols; x++) {
            let type: 'grass' | 'tree' | 'water' = 'grass'
            let walkable = true
            
            // Add some trees (15% chance)
            if (Math.random() < 0.15) {
              type = 'tree'
              walkable = false
            }
            
            // Add some water (8% chance)
            if (Math.random() < 0.08) {
              type = 'water'
              walkable = false
            }
            
            newTiles[y][x] = { x, y, type, walkable }
          }
        }
        
        // Ensure starting position is walkable
        newTiles[1][1] = { x: 1, y: 1, type: 'grass', walkable: true }
        
        return newTiles
      }

      const drawTile = (p: p5, tile: Tile, x: number, y: number) => {
        const pixelX = x * tileSize
        const pixelY = y * tileSize
        
        // Draw tile background
        switch (tile.type) {
          case 'grass':
            p.fill(74, 124, 89) // Green
            break
          case 'tree':
            p.fill(45, 80, 22) // Dark green
            break
          case 'water':
            p.fill(74, 144, 226) // Blue
            break
        }
        
        p.noStroke()
        p.rect(pixelX, pixelY, tileSize, tileSize)
        
        // Draw grid lines
        p.stroke(26, 26, 26)
        p.strokeWeight(1)
        p.noFill()
        p.rect(pixelX, pixelY, tileSize, tileSize)
      }

      const drawPlayer = (p: p5) => {
        const pixelX = gameState.playerX * tileSize
        const pixelY = gameState.playerY * tileSize
        
        if (playerImg) {
          // Draw player image
          p.image(playerImg, pixelX + 2, pixelY + 2, tileSize - 4, tileSize - 4)
        } else {
          // Draw simple colored circle as fallback
          p.fill(255, 107, 107) // Red
          p.noStroke()
          p.ellipse(
            pixelX + tileSize / 2,
            pixelY + tileSize / 2,
            tileSize * 0.6
          )
        }
      }

      const isValidTarget = (x: number, y: number, tiles: Tile[][]): boolean => {
        if (x < 0 || y < 0 || x >= tiles[0].length || y >= tiles.length) {
          return false
        }
        return tiles[y][x].walkable
      }

      const movePlayerTo = (targetX: number, targetY: number) => {
        if (gameState.isMoving) return
        
        setGameState(prev => ({
          ...prev,
          targetX,
          targetY,
          isMoving: true
        }))
        
        console.log(`Moving player to (${targetX}, ${targetY})`)
      }

      // Animation loop
      const animatePlayer = () => {
        setGameState(prev => {
          if (!prev.isMoving) return prev
          
          const dx = prev.targetX - prev.playerX
          const dy = prev.targetY - prev.playerY
          
          if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
            // Reached target
            return {
              ...prev,
              playerX: prev.targetX,
              playerY: prev.targetY,
              isMoving: false
            }
          } else {
            // Move towards target
            return {
              ...prev,
              playerX: prev.playerX + dx * prev.moveSpeed,
              playerY: prev.playerY + dy * prev.moveSpeed
            }
          }
        })
        
        requestAnimationFrame(animatePlayer)
      }
      
      // Start animation loop
      animatePlayer()
    }

    p5InstanceRef.current = new p5(sketch, canvasRef.current)

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove()
      }
    }
  }, [])

  const resetPlayer = () => {
    setGameState(prev => ({
      ...prev,
      playerX: 1,
      playerY: 1,
      targetX: 1,
      targetY: 1,
      isMoving: false
    }))
  }

  const getPlayerStatusBadge = () => {
    if (gameState.isMoving) return <Badge className="bg-orange-500">Moving</Badge>
    return <Badge className="bg-green-500">Idle</Badge>
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Game Canvas */}
      <div className="relative">
        <div
          ref={canvasRef}
          className="border border-border rounded-lg shadow-lg bg-black"
        />
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          {getPlayerStatusBadge()}
        </div>
      </div>

      {/* Game Controls and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-4xl">
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
              <span className="text-sm">Player Position:</span>
              <Badge variant="secondary" className="font-mono">
                ({Math.floor(gameState.playerX)}, {Math.floor(gameState.playerY)})
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Target Position:</span>
              <Badge variant="secondary" className="font-mono">
                ({gameState.targetX}, {gameState.targetY})
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Status:</span>
              {getPlayerStatusBadge()}
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
              onClick={resetPlayer}
              disabled={gameState.isMoving}
              className="w-full"
              variant="outline"
            >
              Reset Player Position
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2 text-sm">Instructions</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Click on any green tile to move there</li>
                <li>• Trees and water block movement</li>
                <li>• The player will smoothly move to your target</li>
                <li>• Watch the stats update in real-time</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
