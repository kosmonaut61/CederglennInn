import { ImageSource, SpriteSheet } from "excalibur"

// Import assets from the public directory
const dudeImageUrl = "/dude.png"
const roguelikeImageUrl = "/roguelike.png"

export class GameResources {
  public static plrImage: ImageSource
  public static kennyRougeLikePack: ImageSource
  public static rlSS: SpriteSheet
  private static initialized = false
  private static initializationPromise: Promise<void> | null = null

  public static async initialize(): Promise<void> {
    // Prevent multiple initializations
    if (this.initialized) return
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = this.performInitialization()
    await this.initializationPromise
  }

  private static async performInitialization(): Promise<void> {
    try {
      console.log("[v0] Loading game assets...")

      // Initialize image sources
      this.plrImage = new ImageSource(dudeImageUrl)
      this.kennyRougeLikePack = new ImageSource(roguelikeImageUrl)

      // Preload images to ensure they're available
      await Promise.all([this.plrImage.load(), this.kennyRougeLikePack.load()])

      // Create sprite sheet from the roguelike pack
      this.rlSS = SpriteSheet.fromImageSource({
        image: this.kennyRougeLikePack,
        grid: { columns: 57, rows: 31, spriteHeight: 16, spriteWidth: 16 },
        spacing: { margin: { x: 1, y: 1 } },
      })

      this.initialized = true
      console.log("[v0] Assets loaded successfully")
    } catch (error) {
      console.error("[v0] Failed to load assets:", error)
      throw new Error("Asset loading failed")
    }
  }

  public static getResources(): ImageSource[] {
    if (!this.initialized) {
      throw new Error("Resources not initialized. Call initialize() first.")
    }
    return [this.plrImage, this.kennyRougeLikePack]
  }

  public static isInitialized(): boolean {
    return this.initialized
  }

  public static getPlayerSprite() {
    if (!this.initialized) {
      throw new Error("Resources not initialized. Call initialize() first.")
    }
    return this.plrImage.toSprite()
  }

  public static getTileSprite(x: number, y: number) {
    if (!this.initialized) {
      throw new Error("Resources not initialized. Call initialize() first.")
    }
    return this.rlSS.getSprite(x, y)
  }

  // Asset validation and error handling
  public static validateAssets(): boolean {
    try {
      if (!this.plrImage || !this.kennyRougeLikePack || !this.rlSS) {
        return false
      }

      // Check if sprite sheet has expected dimensions
      const testSprite = this.rlSS.getSprite(0, 0)
      if (!testSprite) {
        console.warn("[v0] Sprite sheet validation failed")
        return false
      }

      return true
    } catch (error) {
      console.error("[v0] Asset validation error:", error)
      return false
    }
  }
}
