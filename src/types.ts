export interface Point {
  x: number;
  y: number;
}

export interface Node extends Point {
  g: number; // Cost from start
  h: number; // Heuristic cost to end (A*)
  f: number; // Total cost (g + h)
  parent: Node | null;
}

export interface PathfindingResult {
  path: Point[];
  visited: Point[];
  algorithm: 'astar' | 'dijkstra';
  distance: number;
}

export type CellType = 'empty' | 'obstacle' | 'start' | 'end' | 'path' | 'visited';
