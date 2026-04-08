import React from 'react';
import './Controls.css';
import type { Point } from '../types';

interface ControlsProps {
  gridWidth: number;
  gridHeight: number;
  start: Point | null;
  end: Point | null;
  obstacleCount: number;
  onGenerateObstacles: (count: number) => void;
  onClearAll: () => void;
  onRunAStar: () => void;
  onRunDijkstra: () => void;
  isRunning: boolean;
  pathFound: boolean | null;
  distance: number;
}

export const Controls: React.FC<ControlsProps> = ({
  start,
  end,
  obstacleCount,
  onGenerateObstacles,
  onClearAll,
  onRunAStar,
  onRunDijkstra,
  isRunning,
  pathFound,
  distance,
}) => {
  const readyToRun = start && end && !isRunning;

  return (
    <div className="controls-panel">
      <div className="controls-section">
        <h3>Instructions</h3>
        <ul className="instructions">
          <li>Click on the grid to set the <span className="green">start</span> point</li>
          <li>Click again to set the <span className="red">end</span> point</li>
          <li>Generate obstacles or click to place them</li>
          <li>Run either algorithm to find the shortest path</li>
        </ul>
      </div>

      <div className="controls-section">
        <h3>Map Setup</h3>
        <div className="control-group">
          <label>Start Point: {start ? `(${start.x}, ${start.y})` : 'Not set'}</label>
        </div>
        <div className="control-group">
          <label>End Point: {end ? `(${end.x}, ${end.y})` : 'Not set'}</label>
        </div>
        <div className="control-group">
          <label>Obstacles: {obstacleCount}</label>
          <button
            onClick={() => onGenerateObstacles(Math.floor(Math.random() * 50) + 20)}
            disabled={isRunning}
            className="btn btn-secondary"
          >
            Generate Random Obstacles
          </button>
        </div>
      </div>

      <div className="controls-section">
        <h3>Algorithms</h3>
        <button
          onClick={onRunAStar}
          disabled={!readyToRun}
          className="btn btn-primary"
        >
          Run A* Algorithm
        </button>
        <button
          onClick={onRunDijkstra}
          disabled={!readyToRun}
          className="btn btn-primary"
        >
          Run Dijkstra's Algorithm
        </button>
      </div>

      {pathFound === true && (
        <div className="controls-section result-success">
          <h3>✓ Path Found!</h3>
          <p>Distance: {distance.toFixed(2)}</p>
        </div>
      )}

      {pathFound === false && (
        <div className="controls-section result-error">
          <h3>✗ No Path Found</h3>
          <p>The destination is unreachable.</p>
        </div>
      )}

      <div className="controls-section">
        <button
          onClick={onClearAll}
          disabled={isRunning}
          className="btn btn-danger"
        >
          Clear All
        </button>
      </div>

      <div className="controls-section legend">
        <h3>Legend</h3>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundImage: 'linear-gradient(135deg, #b8c832, #a8b820)', border: '2px solid #b8c832' }}></div>
          <span>Start</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundImage: 'linear-gradient(135deg, #c9d63a, #b8c832)', border: '2px solid #c9d63a' }}></div>
          <span>End</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundColor: '#0d1a14', border: '1px solid #050908' }}></div>
          <span>Obstacle</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundColor: 'rgba(184, 200, 50, 0.3)', border: '1px solid rgba(184, 200, 50, 0.5)' }}></div>
          <span>Visited</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundColor: '#8a8c7e', border: '1px solid #7a7c6e' }}></div>
          <span>Path</span>
        </div>
      </div>
    </div>
  );
};
