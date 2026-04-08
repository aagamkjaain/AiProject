import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import { Map3D } from './components/Map3D';
import { Controls } from './components/Controls';
import { aStar, dijkstra } from './algorithms';
import type { PathfindingResult } from './types';

const VISITED_STEP_MS = 140;
const PATH_STEP_MS = 320;
const TRANSITION_PAUSE_MS = 420;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function App() {
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [pathFound, setPathFound] = useState<boolean | null>(null);
  const activeRunIdRef = useRef(0);

  useEffect(() => {
    return () => {
      activeRunIdRef.current += 1;
    };
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (isRunning) {
      return;
    }

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
  }, [start, end, isRunning]);

  const runAlgorithm = useCallback(
    (algorithmFn: typeof aStar | typeof dijkstra) => {
      if (!start || !end) return;

      const runId = activeRunIdRef.current + 1;
      activeRunIdRef.current = runId;

      setIsRunning(true);
      setPath([]);
      setVisited([]);
      setDistance(0);
      setPathFound(null);

      const result: PathfindingResult = algorithmFn(start, end);

      const animateResult = async () => {
        const seenVisited = new Set<string>();
        const orderedVisited = result.visited.filter((nodeId) => {
          if (seenVisited.has(nodeId)) {
            return false;
          }
          seenVisited.add(nodeId);
          return true;
        });

        for (const nodeId of orderedVisited) {
          if (activeRunIdRef.current !== runId) {
            return;
          }

          setVisited((prev) => (prev.includes(nodeId) ? prev : [...prev, nodeId]));
          await sleep(VISITED_STEP_MS);
        }

        if (result.path.length > 0) {
          await sleep(TRANSITION_PAUSE_MS);

          for (const nodeId of result.path) {
            if (activeRunIdRef.current !== runId) {
              return;
            }

            setPath((prev) => (prev.includes(nodeId) ? prev : [...prev, nodeId]));
            await sleep(PATH_STEP_MS);
          }
        }

        if (activeRunIdRef.current !== runId) {
          return;
        }

        setDistance(result.distance);
        setPathFound(result.path.length > 0);
        setIsRunning(false);
      };

      void animateResult();
    },
    [start, end]
  );

  const handleRunAStar = () => runAlgorithm(aStar);
  const handleRunDijkstra = () => runAlgorithm(dijkstra);

  const handleClearAll = useCallback(() => {
    activeRunIdRef.current += 1;
    setIsRunning(false);
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
