import React from 'react';
import './Controls.css';
import { mapNodes } from '../mapData';

interface ControlsProps {
  start: string | null;
  end: string | null;
  onRunAStar: () => void;
  onRunDijkstra: () => void;
  onClearAll: () => void;
  isRunning: boolean;
  pathFound: boolean | null;
  distance: number;
}

export const Controls: React.FC<ControlsProps> = ({
  start,
  end,
  onRunAStar,
  onRunDijkstra,
  onClearAll,
  isRunning,
  pathFound,
  distance,
}) => {
  const startName = start ? mapNodes.find(n => n.id === start)?.name : null;
  const endName = end ? mapNodes.find(n => n.id === end)?.name : null;
  const readyToRun = start && end && !isRunning;
  const showDistance = pathFound === true && Number.isFinite(distance);
  const distanceText = showDistance ? `${distance.toFixed(1)} units` : '--';
  const distanceHint = isRunning
    ? 'Calculating route distance...'
    : showDistance
      ? 'Shortest route distance for the selected journey.'
      : 'Run A* or Dijkstra to calculate total distance travelled.';

  return (
    <div className="controls-panel">
      <div className="controls-section">
        <h3>Adventure Route Planner</h3>
        <p style={{ fontSize: '12px', color: '#8a8c7e', marginTop: '4px' }}>
          Find the shortest path between destinations
        </p>
      </div>

      <div className="controls-section">
        <h3>Route Setup</h3>
        <div className="control-group">
          <label>Starting Location:</label>
          <div className="location-display">
            {startName ? (
              <>
                <span className="location-badge" style={{ backgroundColor: '#b8c832' }}></span>
                {startName}
              </>
            ) : (
              <span style={{ color: '#8a8c7e' }}>Click a destination to start</span>
            )}
          </div>
        </div>
        <div className="control-group">
          <label>Destination:</label>
          <div className="location-display">
            {endName ? (
              <>
                <span className="location-badge" style={{ backgroundColor: '#f0a844' }}></span>
                {endName}
              </>
            ) : (
              <span style={{ color: '#8a8c7e' }}>Click a destination to end</span>
            )}
          </div>
        </div>
      </div>

      <div className="controls-section">
        <h3>Total Distance Travelled</h3>
        <div className="distance-display">{distanceText}</div>
        <p className="distance-caption">{distanceHint}</p>
      </div>

      <div className="controls-section">
        <h3>Pathfinding</h3>
        <button
          onClick={onRunAStar}
          disabled={!readyToRun}
          className="btn btn-primary"
        >
          A* Algorithm
        </button>
        <button
          onClick={onRunDijkstra}
          disabled={!readyToRun}
          className="btn btn-primary"
        >
          Dijkstra's Algorithm
        </button>
      </div>

      {pathFound === true && (
        <div className="controls-section result-success">
          <h3>✓ Route Found!</h3>
          <p>Distance: {distance.toFixed(1)} units</p>
        </div>
      )}

      {pathFound === false && (
        <div className="controls-section result-error">
          <h3>✗ No Route Found</h3>
          <p>These locations are not connected.</p>
        </div>
      )}

      <div className="controls-section">
        <button
          onClick={onClearAll}
          disabled={isRunning}
          className="btn btn-danger"
        >
          Clear Route
        </button>
      </div>

      <div className="controls-section legend">
        <h3>Legend</h3>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundImage: 'linear-gradient(135deg, #b8c832, #a8b820)', border: '2px solid #b8c832' }}></div>
          <span>Start Location</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundImage: 'linear-gradient(135deg, #f0a844, #e09834)', border: '2px solid #f0a844' }}></div>
          <span>Destination</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundColor: '#b8c832', border: '1px solid #c9d63a' }}></div>
          <span>Route</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundColor: 'rgba(217, 75, 75, 0.32)', border: '1px solid rgba(217, 75, 75, 0.75)' }}></div>
          <span>Explored</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ backgroundColor: '#3a4a3e', border: '1px solid #2a3a2e' }}></div>
          <span>Roadway</span>
        </div>
      </div>
    </div>
  );
};
