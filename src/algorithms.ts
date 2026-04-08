import type { PathfindingResult } from './types';
import { getConnectedNodes, getRoadDistance, getNodeById, mapNodes } from './mapData';

interface NodeState {
  id: string;
  g: number; // Cost from start
  h: number; // Heuristic cost to end (A*)
  f: number; // Total cost (g + h)
  parent: string | null;
}

function heuristic(nodeId: string, endId: string): number {
  const node = getNodeById(nodeId);
  const endNode = getNodeById(endId);
  if (!node || !endNode) return Infinity;
  // Euclidean distance heuristic
  return Math.hypot(node.x - endNode.x, node.y - endNode.y);
}

export function aStar(
  startId: string,
  endId: string
): PathfindingResult {
  if (!getNodeById(startId) || !getNodeById(endId)) {
    return { path: [], visited: [], algorithm: 'astar', distance: Infinity };
  }

  const openSet: NodeState[] = [];
  const closedSet = new Set<string>();
  const visited: string[] = [];

  const startNode: NodeState = {
    id: startId,
    g: 0,
    h: heuristic(startId, endId),
    f: heuristic(startId, endId),
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

    visited.push(current.id);

    if (current.id === endId) {
      const path: string[] = [];
      let node: NodeState | undefined = current;
      while (node) {
        path.unshift(node.id);
        node = node.parent ? openSet.find(n => n.id === node!.parent) || (closedSet.has(node.parent) ? { id: node.parent, g: 0, h: 0, f: 0, parent: null } : undefined) : undefined;
        if (node && node.parent === null && node.id !== startId) {
          // Search in closed set for parent tracking
          break;
        }
      }
      return { path, visited, algorithm: 'astar', distance: current.g };
    }

    openSet.splice(currentIndex, 1);
    closedSet.add(current.id);

    const neighbors = getConnectedNodes(current.id);
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor.id)) continue;

      const roadCost = getRoadDistance(current.id, neighbor.id);
      const g = current.g + roadCost;
      const h = heuristic(neighbor.id, endId);
      const f = g + h;

      let openNode = openSet.find(n => n.id === neighbor.id);
      if (openNode && g < openNode.g) {
        openNode.g = g;
        openNode.f = f;
        openNode.parent = current.id;
      } else if (!openNode) {
        const newNode: NodeState = {
          id: neighbor.id,
          g,
          h,
          f,
          parent: current.id,
        };
        openSet.push(newNode);
      }
    }
  }

  return { path: [], visited, algorithm: 'astar', distance: Infinity };
}

export function dijkstra(
  startId: string,
  endId: string
): PathfindingResult {
  if (!getNodeById(startId) || !getNodeById(endId)) {
    return { path: [], visited: [], algorithm: 'dijkstra', distance: Infinity };
  }

  const distances: Map<string, number> = new Map();
  const previousNodes: Map<string, string | null> = new Map();
  const unvisited = new Set<string>();
  const visited: string[] = [];

  // Initialize distances
  mapNodes.forEach(node => {
    distances.set(node.id, Infinity);
    previousNodes.set(node.id, null);
    unvisited.add(node.id);
  });

  distances.set(startId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let minDistance = Infinity;

    for (const id of unvisited) {
      const dist = distances.get(id) ?? Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        current = id;
      }
    }

    if (current === null || minDistance === Infinity) break;

    visited.push(current);

    if (current === endId) {
      const path: string[] = [];
      let currentId: string | null = endId;
      while (currentId !== null) {
        path.unshift(currentId);
        currentId = previousNodes.get(currentId) ?? null;
      }
      return { path, visited, algorithm: 'dijkstra', distance: distances.get(endId) ?? Infinity };
    }

    unvisited.delete(current);

    const neighbors = getConnectedNodes(current);
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.id)) continue;

      const roadCost = getRoadDistance(current, neighbor.id);
      const newDistance = (distances.get(current) ?? 0) + roadCost;
      const oldDistance = distances.get(neighbor.id) ?? Infinity;

      if (newDistance < oldDistance) {
        distances.set(neighbor.id, newDistance);
        previousNodes.set(neighbor.id, current);
      }
    }
  }

  return { path: [], visited, algorithm: 'dijkstra', distance: Infinity };
}
