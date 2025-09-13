import { ExcaliburAStar, ExcaliburGraph, type GraphTileMap } from "@excaliburjs/plugin-pathfinding"
import type { TileMap } from "excalibur"
import { tiles } from "./tile-system"

export class PathfindingSystem {
  private aStarGraph: ExcaliburAStar
  private dijkstraGraph: ExcaliburGraph
  private graphTileMap: GraphTileMap

  constructor(tilemap: TileMap) {
    // Initialize A* pathfinding
    this.aStarGraph = new ExcaliburAStar(tilemap)

    // Initialize Dijkstra pathfinding
    this.dijkstraGraph = new ExcaliburGraph()
    this.graphTileMap = {
      name: "pathfindingGrid",
      tiles: [...tiles],
      rows: 10,
      cols: 10,
    }

    // Add tilemap to Dijkstra graph (without diagonals by default)
    this.dijkstraGraph.addTileMap(this.graphTileMap)
  }

  public findPathAStar(
    startIndex: number,
    targetIndex: number,
    allowDiagonals = false,
  ): { path: number[]; duration: number } {
    const startNode = this.aStarGraph.getNodeByIndex(startIndex)
    const targetNode = this.aStarGraph.getNodeByIndex(targetIndex)

    if (!startNode || !targetNode) {
      return { path: [], duration: 0 }
    }

    const path = this.aStarGraph.astar(startNode, targetNode, allowDiagonals)
    const duration = this.aStarGraph.duration

    // Convert aStarNode array to number array
    const pathIndices = path.map((node) => Number.parseInt(node.id.toString()))

    return { path: pathIndices, duration }
  }

  public findPathDijkstra(startIndex: number, targetIndex: number): { path: number[]; duration: number } {
    const startNode = this.dijkstraGraph.nodes.get(`${startIndex}`)
    const targetNode = this.dijkstraGraph.nodes.get(`${targetIndex}`)

    if (!startNode || !targetNode) {
      return { path: [], duration: 0 }
    }

    const path = this.dijkstraGraph.shortestPath(startNode, targetNode)
    const duration = this.dijkstraGraph.duration

    // Convert GraphNode array to number array, skip first node (current position)
    const pathIndices = path.slice(1).map((node) => Number.parseInt(node.id.toString()))

    return { path: pathIndices, duration }
  }

  public updateDiagonalSettings(allowDiagonals: boolean): void {
    // Reset and reconfigure Dijkstra graph with diagonal settings
    this.dijkstraGraph.resetGraph()
    this.dijkstraGraph.addTileMap(this.graphTileMap, allowDiagonals)
  }

  public isValidTarget(tileIndex: number): boolean {
    return tileIndex >= 0 && tileIndex < tiles.length && !tiles[tileIndex].collider
  }
}
