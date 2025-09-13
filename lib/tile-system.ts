import { TileMap } from "excalibur"
import { GameResources } from "./resources"

// Tile type definitions matching the original implementation
export class Grass {
  sprite = [5, 0]
  collider = false
}

export class Tree {
  sprite = [13, 9]
  collider = true
}

// Tile data array - matches the original 10x10 grid layout
export const tiles = [
  new Grass(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Tree(),
  new Tree(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Tree(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Tree(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Tree(),
  new Grass(),
  new Grass(),
  new Grass(),
  new Grass(),
]

export class TileSystem {
  private tilemap: TileMap

  constructor() {
    // Create a 10x10 tilemap with 16x16 pixel tiles
    this.tilemap = new TileMap({
      rows: 10,
      columns: 10,
      tileWidth: 16,
      tileHeight: 16,
    })

    this.initializeTiles()
  }

  private initializeTiles(): void {
    let tileIndex = 0

    for (const tile of this.tilemap.tiles) {
      const tileData = tiles[tileIndex]

      try {
        const grassSprite = GameResources.getTileSprite(tiles[0].sprite[0], tiles[0].sprite[1])
        const tileSprite = GameResources.getTileSprite(tileData.sprite[0], tileData.sprite[1])

        if (grassSprite && tileSprite) {
          // All tiles get grass as base layer
          tile.addGraphic(grassSprite)

          // Trees get an additional tree sprite and are marked as solid
          if (tileData instanceof Tree) {
            tile.addGraphic(tileSprite)
            tile.solid = true
          }
        } else {
          console.warn(`[v0] Failed to load sprite for tile ${tileIndex}`)
        }
      } catch (error) {
        console.error(`[v0] Error loading tile ${tileIndex}:`, error)
      }

      tileIndex++
    }
  }

  public getTileMap(): TileMap {
    return this.tilemap
  }

  public getTileByIndex(index: number): { x: number; y: number } {
    const x = index % 10
    const y = Math.floor(index / 10)
    return { x, y }
  }

  public getIndexByCoords(x: number, y: number): number {
    return x + y * 10
  }

  public isTileWalkable(index: number): boolean {
    return !(tiles[index] instanceof Tree)
  }

  public getTileData() {
    return tiles
  }
}
