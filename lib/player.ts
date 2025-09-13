import { Actor, Vector, EasingFunctions, type Engine } from "excalibur"
import { GameResources } from "./resources"

export interface PlayerEvents {
  onMoveComplete: (tileIndex: number) => void
  onMoveStart: () => void
}

export class Player extends Actor {
  public playerActionBuffer: number[] = []
  public playerActionStatus: "idle" | "moving" = "idle"
  private events: PlayerEvents

  constructor(events: PlayerEvents) {
    super({
      pos: new Vector(8, 8), // Start at tile 0,0 center
      width: 16,
      height: 16,
    })

    this.events = events
    
    // Ensure events are properly initialized
    if (!this.events) {
      this.events = {
        onMoveComplete: () => {},
        onMoveStart: () => {}
      }
    }
  }

  public onInitialize(_engine: Engine): void {
    // Call parent onInitialize first
    super.onInitialize(_engine)
    
    try {
      const playerSprite = GameResources.getPlayerSprite()
      this.graphics.use(playerSprite)
      console.log("[v0] Player sprite loaded successfully")
    } catch (error) {
      console.error("[v0] Failed to load player sprite:", error)
      // Fallback: create a simple colored rectangle if sprite fails
      this.graphics.use(this.graphics.current)
    }
  }

  public onPostUpdate(_engine: Engine, _delta: number): void {
    // Process movement queue
    if (this.playerActionBuffer.length > 0 && this.playerActionStatus === "idle") {
      this.playerActionStatus = "moving"
      this.events.onMoveStart()

      // Get next tile from action buffer and move to it
      const nextTile = this.playerActionBuffer.shift()!
      this.moveToTile(nextTile)
    }
  }

  private moveToTile(tileIndex: number): void {
    // Convert flat array index to x,y coordinates
    const x = tileIndex % 10
    const y = Math.floor(tileIndex / 10)

    // Calculate target position (center of tile)
    const target = new Vector(x * 16 + 8, y * 16 + 8)

    // Animate movement to target
    this.actions.easeTo(target, 500, EasingFunctions.EaseInOutCubic)

    // Set up completion callback
    setTimeout(() => {
      this.playerActionStatus = "idle"
      this.events.onMoveComplete(tileIndex)
    }, 500)
  }

  public getCurrentTileIndex(): number {
    const x = Math.floor((this.pos.x - 8) / 16)
    const y = Math.floor((this.pos.y - 8) / 16)
    return x + y * 10
  }

  public isMoving(): boolean {
    return this.playerActionStatus === "moving"
  }

  public clearActionBuffer(): void {
    this.playerActionBuffer = []
  }
}
