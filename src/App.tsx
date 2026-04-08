import { useState, useCallback } from 'react';
import './App.css';
import { Grid } from './components/Grid';
import { Controls } from './components/Controls';
import { aStar, dijkstra } from './algorithms';
import type { Point, PathfindingResult } from './types';

const GRID_WIDTH = 40;
const GRID_HEIGHT = 25;
const CELL_SIZE = 20;

function App() {
  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<Point[]>([]);
  const [visited, setVisited] = useState<Point[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [pathFound, setPathFound] = useState<boolean | null>(null);

  const buildGrid = useCallback(() => {
    const grid: boolean[][] = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        row.push(obstacles.has(`${x},${y}`));
      }
      grid.push(row);
    }
    return grid;
  }, [obstacles]);

  const handleCellClick = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;

    // Can't place start/end on obstacles
    if (obstacles.has(key)) return;

    // Clear obstacles on the clicked cell
    const newObstacles = new Set(obstacles);
    newObstacles.delete(key);
    setObstacles(newObstacles);

    // Toggle start point
    if (start && start.x === x && start.y === y) {
      setStart(null);
      return;
    }

    // Toggle end point
    if (end && end.x === x && end.y === y) {
      setEnd(null);
      return;
    }

    // Set start if not set
    if (!start) {
      setStart({ x, y });
      return;
    }

    // Set end if not set
    if (!end) {
      setEnd({ x, y });
      return;
    }

    // If both are set, clicking selects new start
    if (start) {
      setStart({ x, y });
      setEnd(null);
    }
  }, [start, end, obstacles]);

  const generateObstacles = useCallback((count: number) => {
    const newObstacles = new Set<string>();
    let generated = 0;

    while (generated < count) {
      const x = Math.floor(Math.random() * GRID_WIDTH);
      const y = Math.floor(Math.random() * GRID_HEIGHT);
      const key = `${x},${y}`;

      // Don't place obstacles on start or end points
      if ((start && start.x === x && start.y === y) || 
          (end && end.x === x && end.y === y)) {
        continue;
      }

      if (!newObstacles.has(key)) {
        newObstacles.add(key);
        generated++;
      }
    }

    setObstacles(newObstacles);
  }, [start, end]);

  const runAlgorithm = useCallback(
    async (algorithmFn: typeof aStar | typeof dijkstra) => {
      if (!start || !end) return;

      setIsRunning(true);
      setPath([]);
      setVisited([]);
      setPathFound(null);

      // Use setTimeout to allow UI to update
      setTimeout(() => {
        const grid = buildGrid();
        const result: PathfindingResult = algorithmFn(
          start,
          end,
          grid,
          GRID_WIDTH,
          GRID_HEIGHT
        );

        setVisited(result.visited);
        setPath(result.path);
        setDistance(result.distance);
        setPathFound(result.path.length > 0);
        setIsRunning(false);
      }, 100);
    },
    [start, end, buildGrid]
  );

  const handleRunAStar = () => runAlgorithm(aStar);
  const handleRunDijkstra = () => runAlgorithm(dijkstra);

  const handleClearAll = useCallback(() => {
    setStart(null);
    setEnd(null);
    setObstacles(new Set());
    setPath([]);
    setVisited([]);
    setDistance(0);
    setPathFound(null);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗺️ Pathfinding Visualizer</h1>
        <p>A* & Dijkstra's Algorithm Comparison</p>
      </header>

      <div className="app-container">
        <div className="grid-container">
          <Grid
            width={GRID_WIDTH}
            height={GRID_HEIGHT}
            cellSize={CELL_SIZE}
            start={start}
            end={end}
            obstacles={obstacles}
            path={path}
            visited={visited}
            onCellClick={handleCellClick}
          />
        </div>

        <Controls
          gridWidth={GRID_WIDTH}
          gridHeight={GRID_HEIGHT}
          start={start}
          end={end}
          obstacleCount={obstacles.size}
          onGenerateObstacles={generateObstacles}
          onClearAll={handleClearAll}
          onRunAStar={handleRunAStar}
          onRunDijkstra={handleRunDijkstra}
          isRunning={isRunning}
          pathFound={pathFound}
          distance={distance}
        />
      </div>

      <footer className="app-footer">
        <p>Click on the grid to set start and end points. Generate or click to place obstacles.</p>
      </footer>
    </div>
  );
}

export default App;
