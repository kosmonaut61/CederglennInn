import { Engine, DisplayMode, Vector, Loader } from "excalibur"
import { TileSystem } from "./tile-system"
import { Player, type PlayerEvents } from "./player"
import { PathfindingSystem } from "./pathfinding"

export interface GameConfig {
  width: number
  height: number
  canvasElement: HTMLCanvasElement
  pixelArt?: boolean
}

export interface GameCallbacks {
  onPlayerMoveComplete: (tileIndex: number) => void
  onPlayerMoveStart: () => void
  onPathfindingComplete: (duration: number, pathLength: number) => void
  onPathfindingError: (message: string) => void
}

export class PathfindingGameEngine {
  private engine: Engine
  private loader: Loader
  private tileSystem: TileSystem | null = null
  private player: Player | null = null
  private pathfindingSystem: PathfindingSystem | null = null
  private callbacks: GameCallbacks

  constructor(config: GameConfig, callbacks: GameCallbacks) {
    this.engine = new Engine({
      width: config.width,
      height: config.height,
      canvasElement: config.canvasElement,
      displayMode: DisplayMode.Fixed,
      pixelArt: config.pixelArt ?? true,
    })

    this.loader = new Loader()
    this.callbacks = callbacks
    this.setupCamera()
    this.setupClickHandler()
  }

  private setupCamera() {
    // Center camera on the game world and zoom in for pixel art
    this.engine.currentScene.camera.pos = new Vector(80, 80)
    this.engine.currentScene.camera.zoom = 3
  }

  private setupClickHandler() {
    // Handle tile clicks for pathfinding
    this.engine.input.pointers.primary.on("down", (evt) => {
      if (!this.tileSystem || !this.player || !this.pathfindingSystem) return
      if (!evt.worldPos) return

      // Don't process clicks while player is moving
      if (this.player.isMoving()) return

      // Get clicked tile
      const tilemap = this.tileSystem.getTileMap()
      const clickedTile = tilemap.getTileByPoint(evt.worldPos)
      if (!clickedTile) return

      const targetIndex = clickedTile.x + clickedTile.y * 10

      // Check if target is valid (not a tree)
      if (!this.pathfindingSystem.isValidTarget(targetIndex)) {
        this.callbacks.onPathfindingError("CLICKING A TREE WILL BE IGNORED")
        return
      }

      // Get current player position
      const currentIndex = this.player.getCurrentTileIndex()

      // Don't pathfind to current position
      if (currentIndex === targetIndex) return

      this.callbacks.onPathfindingComplete(0, 0) // Temporary call to trigger target update
      this.findAndExecutePath(currentIndex, targetIndex)
    })
  }

  public findAndExecutePath(
    startIndex: number,
    targetIndex: number,
    algorithm: "astar" | "dijkstra" = "astar",
    allowDiagonals = false,
  ): void {
    if (!this.pathfindingSystem || !this.player) return

    let result: { path: number[]; duration: number }

    if (algorithm === "dijkstra") {
      // Update diagonal settings for Dijkstra
      this.pathfindingSystem.updateDiagonalSettings(allowDiagonals)
      result = this.pathfindingSystem.findPathDijkstra(startIndex, targetIndex)
    } else {
      result = this.pathfindingSystem.findPathAStar(startIndex, targetIndex, allowDiagonals)
    }

    if (result.path.length === 0) {
      this.callbacks.onPathfindingError("UNREACHABLE TILE")
      return
    }

    // Clear any existing movement and set new path
    this.player.clearActionBuffer()
    this.player.playerActionBuffer = [...result.path]

    // Notify UI of pathfinding completion
    this.callbacks.onPathfindingComplete(result.duration, result.path.length)
  }

  public getEngine(): Engine {
    return this.engine
  }

  public getLoader(): Loader {
    return this.loader
  }

  public async start(): Promise<void> {
    await this.engine.start(this.loader)

    // Initialize game systems after engine starts
    this.initializeTileSystem()
    this.initializePlayer()
    this.initializePathfinding()
  }

  private initializeTileSystem(): void {
    this.tileSystem = new TileSystem()
    this.engine.add(this.tileSystem.getTileMap())
  }

  private initializePlayer(): void {
    const playerEvents: PlayerEvents = {
      onMoveComplete: (tileIndex: number) => {
        this.callbacks.onPlayerMoveComplete(tileIndex)
      },
      onMoveStart: () => {
        this.callbacks.onPlayerMoveStart()
      },
    }

    this.player = new Player(playerEvents)
    this.engine.add(this.player)
  }

  private initializePathfinding(): void {
    if (!this.tileSystem) return
    this.pathfindingSystem = new PathfindingSystem(this.tileSystem.getTileMap())
  }

  public getTileSystem(): TileSystem | null {
    return this.tileSystem
  }

  public getPlayer(): Player | null {
    return this.player
  }

  public getPathfindingSystem(): PathfindingSystem | null {
    return this.pathfindingSystem
  }

  public dispose(): void {
    this.engine.dispose()
  }

  public add(actor: any): void {
    this.engine.add(actor)
  }
}
