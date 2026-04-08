import type { Point, Node, PathfindingResult } from './types';

const DIRECTIONS = [
  { x: 0, y: -1 }, // Up
  { x: 1, y: 0 },  // Right
  { x: 0, y: 1 },  // Down
  { x: -1, y: 0 }, // Left
  { x: 1, y: -1 }, // Up-Right
  { x: 1, y: 1 },  // Down-Right
  { x: -1, y: 1 }, // Down-Left
  { x: -1, y: -1 }, // Up-Left
];

const STRAIGHT_COST = 1;
const DIAGONAL_COST = Math.sqrt(2);

function getMovementCost(dx: number, dy: number): number {
  return Math.abs(dx) + Math.abs(dy) === 2 ? DIAGONAL_COST : STRAIGHT_COST;
}

function getNeighbors(
  point: Point,
  grid: boolean[][],
  width: number,
  height: number
): Point[] {
  const neighbors: Point[] = [];
  for (const dir of DIRECTIONS) {
    const x = point.x + dir.x;
    const y = point.y + dir.y;
    if (x >= 0 && x < width && y >= 0 && y < height && !grid[y][x]) {
      neighbors.push({ x, y });
    }
  }
  return neighbors;
}

function heuristic(a: Point, b: Point): number {
  // Euclidean distance
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function reconstructPath(node: Node): Point[] {
  const path: Point[] = [];
  let current: Node | null = node;
  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  return path;
}

export function aStar(
  start: Point,
  end: Point,
  grid: boolean[][],
  width: number,
  height: number
): PathfindingResult {
  const openSet: Node[] = [];
  const closedSet = new Set<string>();
  const visited: Point[] = [];

  const startNode: Node = {
    ...start,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
    parent: null,
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    // Find node with lowest f score
    let current = openSet[0];
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < current.f) {
        current = openSet[i];
        currentIndex = i;
      }
    }

    visited.push({ x: current.x, y: current.y });

    if (current.x === end.x && current.y === end.y) {
      const path = reconstructPath(current);
      const distance = current.g;
      return { path, visited, algorithm: 'astar', distance };
    }

    openSet.splice(currentIndex, 1);
    closedSet.add(`${current.x},${current.y}`);

    const neighbors = getNeighbors(current, grid, width, height);
    for (const neighbor of neighbors) {
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;

      const movementCost = getMovementCost(
        neighbor.x - current.x,
        neighbor.y - current.y
      );
      const g = current.g + movementCost;
      const h = heuristic(neighbor, end);
      const f = g + h;

      let openNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
      if (openNode && g < openNode.g) {
        openNode.g = g;
        openNode.f = f;
        openNode.parent = current;
      } else if (!openNode) {
        const newNode: Node = {
          ...neighbor,
          g,
          h,
          f,
          parent: current,
        };
        openSet.push(newNode);
      }
    }
  }

  return { path: [], visited, algorithm: 'astar', distance: Infinity };
}

export function dijkstra(
  start: Point,
  end: Point,
  grid: boolean[][],
  width: number,
  height: number
): PathfindingResult {
  const distances: Map<string, number> = new Map();
  const previousNodes: Map<string, Point | null> = new Map();
  const unvisited = new Set<string>();
  const visited: Point[] = [];

  // Initialize distances
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!grid[y][x]) {
        const key = `${x},${y}`;
        distances.set(key, Infinity);
        previousNodes.set(key, null);
        unvisited.add(key);
      }
    }
  }

  const startKey = `${start.x},${start.y}`;
  distances.set(startKey, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let minDistance = Infinity;

    for (const key of unvisited) {
      const dist = distances.get(key) ?? Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        current = key;
      }
    }

    if (current === null || minDistance === Infinity) break;

    const [x, y] = current.split(',').map(Number);
    visited.push({ x, y });

    if (x === end.x && y === end.y) {
      const path: Point[] = [];
      let currentKey: string | null = `${end.x},${end.y}`;
      while (currentKey !== null) {
        const [cx, cy] = currentKey.split(',').map(Number);
        path.unshift({ x: cx, y: cy });
        currentKey = previousNodes.get(currentKey) ? 
          `${(previousNodes.get(currentKey) as Point).x},${(previousNodes.get(currentKey) as Point).y}` : 
          null;
      }
      const distance = distances.get(currentKey ?? startKey) ?? Infinity;
      return { path, visited, algorithm: 'dijkstra', distance };
    }

    unvisited.delete(current);

    const currentPoint = { x, y };
    const neighbors = getNeighbors(currentPoint, grid, width, height);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (!unvisited.has(neighborKey)) continue;

      const movementCost = getMovementCost(
        neighbor.x - x,
        neighbor.y - y
      );
      const newDistance = (distances.get(current) ?? 0) + movementCost;
      const oldDistance = distances.get(neighborKey) ?? Infinity;

      if (newDistance < oldDistance) {
        distances.set(neighborKey, newDistance);
        previousNodes.set(neighborKey, currentPoint);
      }
    }
  }

  return { path: [], visited, algorithm: 'dijkstra', distance: Infinity };
}
