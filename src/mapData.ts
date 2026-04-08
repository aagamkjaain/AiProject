import type { Point } from './types';

export interface MapNode extends Point {
  id: string;
  name: string;
}

export interface Road {
  fromId: string;
  toId: string;
  distance: number;
}

// Create a networks of destinations from Thane to Pune with accurate distances
// Main highway route west to east, with Imagica as the central hub
export const mapNodes: MapNode[] = [
  // Starting point - Thane West
  { id: 'thane', x: 80, y: 300, name: 'Thane' },
  { id: 'nthane', x: 120, y: 80, name: 'North Thane' },
  
  // Eastern Express Highway and connecting towns
  { id: 'kalyan', x: 170, y: 320, name: 'Kalyan' },
  { id: 'kalyaneast', x: 210, y: 100, name: 'Kalyan East' },
  { id: 'dombivali', x: 260, y: 340, name: 'Dombivali' },
  { id: 'ambernath', x: 320, y: 360, name: 'Ambernath' },
  { id: 'badlapur', x: 380, y: 300, name: 'Badlapur' },
  { id: 'bhupgaon', x: 420, y: 100, name: 'Bhupgaon' },
  { id: 'vangani', x: 460, y: 340, name: 'Vangani' },
  { id: 'khopoli', x: 520, y: 380, name: 'Khopoli' },
  
  // Mumbai-Pune Expressway section
  { id: 'lonavala', x: 580, y: 200, name: 'Lonavala' },
  { id: 'lonavalacheese', x: 540, y: 60, name: 'Lonavala Cheese' },
  { id: 'khandala', x: 640, y: 120, name: 'Khandala' },
  { id: 'khandalafruit', x: 680, y: 50, name: 'Khandala Fruit' },
  
  // **IMAGICA - Central Hub**
  { id: 'imagica', x: 720, y: 280, name: 'Imagica' },
  
  // Post-Imagica towards Pune
  { id: 'dehu', x: 760, y: 200, name: 'Dehu' },
  { id: 'talegaon', x: 800, y: 280, name: 'Talegaon' },
  { id: 'manchar', x: 820, y: 380, name: 'Manchar Lake' },
  { id: 'jejuri', x: 780, y: 360, name: 'Jejuri' },
  { id: 'pawankhind', x: 760, y: 420, name: 'Pawankhind' },
  
  // Pune outskirts and suburbs
  { id: 'koregaonpark', x: 840, y: 140, name: 'Koregaon Park' },
  { id: 'hinjewadi', x: 880, y: 100, name: 'Hinjewadi' },
  { id: 'chakan', x: 960, y: 180, name: 'Chakan' },
  
  // Pune area connections
  { id: 'katraj', x: 800, y: 300, name: 'Katraj' },
  { id: 'pimpricinch', x: 860, y: 340, name: 'Pimpri-Chinchwad' },
  { id: 'akurdi', x: 900, y: 400, name: 'Akurdi' },
  { id: 'hadapsar', x: 840, y: 440, name: 'Hadapsar' },
  
  // Central Pune - Historic areas
  { id: 'punecity', x: 980, y: 300, name: 'Pune City Center' },
  { id: 'shaniwarwada', x: 950, y: 360, name: 'Shaniwar Wada' },
  { id: 'dagdusheth', x: 880, y: 280, name: 'Dagdusheth Temple' },
  { id: 'westpune', x: 750, y: 480, name: 'West Pune' },
];

// Define roads (edges) connecting the nodes with realistic distances
export const roads: Road[] = [
  // Main highway route: Thane → Pune
  { fromId: 'thane', toId: 'kalyan', distance: 20 },
  { fromId: 'kalyan', toId: 'dombivali', distance: 15 },
  { fromId: 'dombivali', toId: 'ambernath', distance: 18 },
  { fromId: 'ambernath', toId: 'badlapur', distance: 20 },
  { fromId: 'badlapur', toId: 'vangani', distance: 18 },
  { fromId: 'vangani', toId: 'khopoli', distance: 22 },
  { fromId: 'khopoli', toId: 'lonavala', distance: 25 },
  { fromId: 'lonavala', toId: 'khandala', distance: 15 },
  { fromId: 'khandala', toId: 'imagica', distance: 20 },
  
  // Post-Imagica to Pune
  { fromId: 'imagica', toId: 'dehu', distance: 22 },
  { fromId: 'dehu', toId: 'talegaon', distance: 18 },
  { fromId: 'talegaon', toId: 'jejuri', distance: 20 },
  { fromId: 'jejuri', toId: 'koregaonpark', distance: 25 },
  { fromId: 'koregaonpark', toId: 'hinjewadi', distance: 18 },
  { fromId: 'hinjewadi', toId: 'chakan', distance: 20 },
  { fromId: 'chakan', toId: 'punecity', distance: 18 },
  
  // Alternative routes and branches
  { fromId: 'thane', toId: 'nthane', distance: 15 },
  { fromId: 'nthane', toId: 'kalyaneast', distance: 18 },
  { fromId: 'kalyaneast', toId: 'kalyan', distance: 25 },
  
  { fromId: 'badlapur', toId: 'bhupgaon', distance: 22 },
  { fromId: 'bhupgaon', toId: 'lonavala', distance: 35 },
  
  // Lonavala bypass routes
  { fromId: 'lonavala', toId: 'lonavalacheese', distance: 12 },
  { fromId: 'lonavalacheese', toId: 'bhupgaon', distance: 30 },
  
  { fromId: 'khandala', toId: 'khandalafruit', distance: 10 },
  { fromId: 'khandalafruit', toId: 'lonavalacheese', distance: 18 },
  
  // Routes around Imagica hub
  { fromId: 'imagica', toId: 'manchar', distance: 30 },
  { fromId: 'imagica', toId: 'pawankhind', distance: 28 },
  { fromId: 'manchar', toId: 'talegaon', distance: 35 },
  { fromId: 'pawankhind', toId: 'jejuri', distance: 25 },
  
  // Pune area connections
  { fromId: 'koregaonpark', toId: 'katraj', distance: 25 },
  { fromId: 'katraj', toId: 'hadapsar', distance: 30 },
  
  { fromId: 'chakan', toId: 'pimpricinch', distance: 22 },
  { fromId: 'pimpricinch', toId: 'akurdi', distance: 18 },
  { fromId: 'akurdi', toId: 'hadapsar', distance: 25 },
  
  // Central Pune connections
  { fromId: 'punecity', toId: 'shaniwarwada', distance: 8 },
  { fromId: 'punecity', toId: 'dagdusheth', distance: 12 },
  { fromId: 'punecity', toId: 'westpune', distance: 28 },
  { fromId: 'shaniwarwada', toId: 'dagdusheth', distance: 15 },
  
  { fromId: 'katraj', toId: 'punecity', distance: 35 },
  
  // Western route connections
  { fromId: 'dehu', toId: 'pawankhind', distance: 32 },
  { fromId: 'dehu', toId: 'westpune', distance: 40 },
  { fromId: 'westpune', toId: 'hadapsar', distance: 35 },
  { fromId: 'westpune', toId: 'shaniwarwada', distance: 45 },
  
  // Eastern connectivity
  { fromId: 'talegaon', toId: 'manchar', distance: 22 },
  { fromId: 'jejuri', toId: 'manchar', distance: 18 },
  { fromId: 'manchar', toId: 'pawankhind', distance: 25 },
  
  // Long-distance shortcuts for alternate routing
  { fromId: 'lonavala', toId: 'imagica', distance: 40 },
  { fromId: 'lonavalacheese', toId: 'imagica', distance: 60 },
  { fromId: 'khopoli', toId: 'imagica', distance: 45 },
];

export function getNodeById(id: string): MapNode | undefined {
  return mapNodes.find(node => node.id === id);
}

export function getConnectedNodes(nodeId: string): MapNode[] {
  const connectedIds = roads
    .filter(road => road.fromId === nodeId || road.toId === nodeId)
    .map(road => road.fromId === nodeId ? road.toId : road.fromId);
  
  return connectedIds.map(id => mapNodes.find(node => node.id === id)!).filter(Boolean);
}

export function getRoadDistance(fromId: string, toId: string): number {
  const road = roads.find(
    r => (r.fromId === fromId && r.toId === toId) || (r.fromId === toId && r.toId === fromId)
  );
  return road?.distance ?? Infinity;
}
