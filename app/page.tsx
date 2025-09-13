import PathfindingGame from "@/components/pathfinding-game"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Pathfinding Game</h1>
          <p className="text-muted-foreground">Click on tiles to move the character using A* or Dijkstra pathfinding</p>
        </div>
        <PathfindingGame />
      </div>
    </main>
  )
}
