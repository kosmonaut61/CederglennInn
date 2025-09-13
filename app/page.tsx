"use client"

import dynamic from "next/dynamic"

const PathfindingGame = dynamic(() => import("@/components/pathfinding-game"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center gap-6">
      <div className="w-[800px] h-[600px] border border-border rounded-lg shadow-lg bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading game...</div>
      </div>
    </div>
  ),
})

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
