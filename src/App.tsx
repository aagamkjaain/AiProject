import { useState, useCallback } from 'react';
import './App.css';
import { Map3D } from './components/Map3D';
import { Controls } from './components/Controls';
import { aStar, dijkstra } from './algorithms';
import type { PathfindingResult } from './types';

function App() {
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [pathFound, setPathFound] = useState<boolean | null>(null);

  const handleNodeClick = useCallback((nodeId: string) => {
    // Toggle start point
    if (start === nodeId) {
      setStart(null);
      return;
    }

    // Toggle end point
    if (end === nodeId) {
      setEnd(null);
      return;
    }

    // Set start if not set
    if (!start) {
      setStart(nodeId);
      return;
    }

    // Set end if not set
    if (!end) {
      setEnd(nodeId);
      return;
    }

    // If both are set, clicking selects new start
    setStart(nodeId);
    setEnd(null);
  }, [start, end]);

  const runAlgorithm = useCallback(
    (algorithmFn: typeof aStar | typeof dijkstra) => {
      if (!start || !end) return;

      setIsRunning(true);
      setPath([]);
      setVisited([]);
      setPathFound(null);

      // Use setTimeout to allow UI to update
      setTimeout(() => {
        const result: PathfindingResult = algorithmFn(start, end);

        setVisited(result.visited);
        setPath(result.path);
        setDistance(result.distance);
        setPathFound(result.path.length > 0);
        setIsRunning(false);
      }, 100);
    },
    [start, end]
  );

  const handleRunAStar = () => runAlgorithm(aStar);
  const handleRunDijkstra = () => runAlgorithm(dijkstra);

  const handleClearAll = useCallback(() => {
    setStart(null);
    setEnd(null);
    setPath([]);
    setVisited([]);
    setDistance(0);
    setPathFound(null);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI FT 3</h1>
      </header>

      <div className="app-layout">
        <div className="map-container">
          <Map3D
            start={start}
            end={end}
            path={path}
            visited={visited}
            onNodeClick={handleNodeClick}
          />
        </div>

        <aside className="controls-sidebar">
          <Controls
            start={start}
            end={end}
            onRunAStar={handleRunAStar}
            onRunDijkstra={handleRunDijkstra}
            onClearAll={handleClearAll}
            isRunning={isRunning}
            pathFound={pathFound}
            distance={distance}
          />
        </aside>
      </div>
    </div>
  );
}

export default App;
