export interface GameConfig {
  width: number
  height: number
  tileSize: number
  canvas: HTMLCanvasElement
}

export interface Position {
  x: number
  y: number
}

export interface Tile {
  x: number
  y: number
  type: 'grass' | 'tree' | 'water'
  walkable: boolean
}

export class SimpleGameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private config: GameConfig
  private tiles: Tile[][] = []
  private player: {
    x: number
    y: number
    targetX: number
    targetY: number
    isMoving: boolean
    moveSpeed: number
  }
  private images: {
    player?: HTMLImageElement
    grass?: HTMLImageElement
    tree?: HTMLImageElement
  } = {}
  private onPlayerMoveComplete?: (x: number, y: number) => void

  constructor(config: GameConfig) {
    this.config = config
    this.canvas = config.canvas
    this.ctx = this.canvas.getContext('2d')!
    
    // Initialize player
    this.player = {
      x: 1,
      y: 1,
      targetX: 1,
      targetY: 1,
      isMoving: false,
      moveSpeed: 0.1
    }

    this.setupCanvas()
    this.generateTiles()
    this.setupEventListeners()
    this.loadImages()
  }

  private setupCanvas() {
    this.canvas.width = this.config.width
    this.canvas.height = this.config.height
    this.canvas.style.border = '2px solid #333'
    this.canvas.style.cursor = 'pointer'
  }

  private generateTiles() {
    const cols = Math.floor(this.config.width / this.config.tileSize)
    const rows = Math.floor(this.config.height / this.config.tileSize)
    
    this.tiles = []
    for (let y = 0; y < rows; y++) {
      this.tiles[y] = []
      for (let x = 0; x < cols; x++) {
        // Create a simple pattern: mostly grass with some trees
        let type: 'grass' | 'tree' | 'water' = 'grass'
        let walkable = true
        
        // Add some trees (10% chance)
        if (Math.random() < 0.1) {
          type = 'tree'
          walkable = false
        }
        
        // Add some water (5% chance)
        if (Math.random() < 0.05) {
          type = 'water'
          walkable = false
        }
        
        this.tiles[y][x] = { x, y, type, walkable }
      }
    }
    
    // Ensure starting position is walkable
    this.tiles[1][1] = { x: 1, y: 1, type: 'grass', walkable: true }
  }

  private setupEventListeners() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / this.config.tileSize)
      const y = Math.floor((e.clientY - rect.top) / this.config.tileSize)
      
      if (this.isValidTarget(x, y)) {
        this.movePlayerTo(x, y)
      }
    })
  }

  private async loadImages() {
    try {
      // Load player image
      this.images.player = new Image()
      this.images.player.src = '/dude.png'
      
      // Load grass image
      this.images.grass = new Image()
      this.images.grass.src = '/roguelike.png'
      
      // Wait for images to load
      await Promise.all([
        new Promise(resolve => {
          if (this.images.player) {
            this.images.player.onload = resolve
          } else {
            resolve(undefined)
          }
        }),
        new Promise(resolve => {
          if (this.images.grass) {
            this.images.grass.onload = resolve
          } else {
            resolve(undefined)
          }
        })
      ])
      
      console.log('Images loaded successfully')
      this.startGameLoop()
    } catch (error) {
      console.error('Failed to load images:', error)
      this.startGameLoop() // Start anyway with colored rectangles
    }
  }

  private isValidTarget(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.tiles[0].length || y >= this.tiles.length) {
      return false
    }
    return this.tiles[y][x].walkable
  }

  private movePlayerTo(targetX: number, targetY: number) {
    if (this.player.isMoving) return
    
    this.player.targetX = targetX
    this.player.targetY = targetY
    this.player.isMoving = true
    
    console.log(`Moving player to (${targetX}, ${targetY})`)
  }

  private updatePlayer() {
    if (!this.player.isMoving) return
    
    const dx = this.player.targetX - this.player.x
    const dy = this.player.targetY - this.player.y
    
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
      // Reached target
      this.player.x = this.player.targetX
      this.player.y = this.player.targetY
      this.player.isMoving = false
      
      if (this.onPlayerMoveComplete) {
        this.onPlayerMoveComplete(this.player.x, this.player.y)
      }
    } else {
      // Move towards target
      this.player.x += dx * this.player.moveSpeed
      this.player.y += dy * this.player.moveSpeed
    }
  }

  private draw() {
    // Clear canvas
    this.ctx.fillStyle = '#2d5016'
    this.ctx.fillRect(0, 0, this.config.width, this.config.height)
    
    // Draw tiles
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        const tile = this.tiles[y][x]
        const pixelX = x * this.config.tileSize
        const pixelY = y * this.config.tileSize
        
        this.drawTile(tile, pixelX, pixelY)
      }
    }
    
    // Draw player
    this.drawPlayer()
  }

  private drawTile(tile: Tile, x: number, y: number) {
    switch (tile.type) {
      case 'grass':
        this.ctx.fillStyle = '#4a7c59'
        break
      case 'tree':
        this.ctx.fillStyle = '#2d5016'
        break
      case 'water':
        this.ctx.fillStyle = '#4a90e2'
        break
    }
    
    this.ctx.fillRect(x, y, this.config.tileSize, this.config.tileSize)
    
    // Draw border
    this.ctx.strokeStyle = '#1a1a1a'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(x, y, this.config.tileSize, this.config.tileSize)
  }

  private drawPlayer() {
    const pixelX = this.player.x * this.config.tileSize
    const pixelY = this.player.y * this.config.tileSize
    
    if (this.images.player) {
      // Draw player image
      this.ctx.drawImage(
        this.images.player,
        pixelX + 2,
        pixelY + 2,
        this.config.tileSize - 4,
        this.config.tileSize - 4
      )
    } else {
      // Draw simple colored circle as fallback
      this.ctx.fillStyle = '#ff6b6b'
      this.ctx.beginPath()
      this.ctx.arc(
        pixelX + this.config.tileSize / 2,
        pixelY + this.config.tileSize / 2,
        this.config.tileSize / 3,
        0,
        2 * Math.PI
      )
      this.ctx.fill()
    }
  }

  private gameLoop = () => {
    this.updatePlayer()
    this.draw()
    requestAnimationFrame(this.gameLoop)
  }

  private startGameLoop() {
    this.gameLoop()
  }

  public setOnPlayerMoveComplete(callback: (x: number, y: number) => void) {
    this.onPlayerMoveComplete = callback
  }

  public getPlayerPosition(): Position {
    return { x: this.player.x, y: this.player.y }
  }

  public isPlayerMoving(): boolean {
    return this.player.isMoving
  }

  public dispose() {
    // Clean up if needed
  }
}
