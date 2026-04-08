import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Map3D.css';
import { mapNodes, roads, getNodeById } from '../mapData';

interface Map3DProps {
  start: string | null;
  end: string | null;
  path: string[];
  visited: string[];
  onNodeClick: (nodeId: string) => void;
}

export const Map3D: React.FC<Map3DProps> = ({
  start,
  end,
  path,
  visited,
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const pointerRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const roadLinesRef = useRef<Array<{ fromId: string; toId: string; line: THREE.Line }>>([]);
  const hoveredNodeRef = useRef<THREE.Mesh | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const onNodeClickRef = useRef(onNodeClick);

  const visualStateRef = useRef<{
    start: string | null;
    end: string | null;
    pathSet: Set<string>;
    visitedSet: Set<string>;
    pathEdgeSet: Set<string>;
  }>({
    start: null,
    end: null,
    pathSet: new Set<string>(),
    visitedSet: new Set<string>(),
    pathEdgeSet: new Set<string>(),
  });

  const COLOR_NODE_DEFAULT = 0x5a6a56;
  const COLOR_NODE_START = 0x7a9f6a;
  const COLOR_NODE_END = 0xf0a844;
  const COLOR_NODE_PATH = 0xb8c832;
  const COLOR_NODE_VISITED = 0xd94b4b;
  const COLOR_ROAD_DEFAULT = 0x3a4a3e;
  const COLOR_ROAD_PATH = 0xb8c832;

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  useEffect(() => {
    const pathSet = new Set(path);
    const visitedSet = new Set(visited);
    const pathEdgeSet = new Set<string>();

    for (let i = 0; i < path.length - 1; i += 1) {
      const from = path[i];
      const to = path[i + 1];
      const key = from < to ? `${from}|${to}` : `${to}|${from}`;
      pathEdgeSet.add(key);
    }

    visualStateRef.current = {
      start,
      end,
      pathSet,
      visitedSet,
      pathEdgeSet,
    };

    nodeMeshesRef.current.forEach((mesh, nodeId) => {
      const isStart = start === nodeId;
      const isEnd = end === nodeId;
      const isOnPath = pathSet.has(nodeId);
      const isVisited = visitedSet.has(nodeId);

      let color = COLOR_NODE_DEFAULT;
      if (isStart) {
        color = COLOR_NODE_START;
      } else if (isEnd) {
        color = COLOR_NODE_END;
      } else if (isOnPath) {
        color = COLOR_NODE_PATH;
      } else if (isVisited) {
        color = COLOR_NODE_VISITED;
      }

      const material = mesh.material as THREE.MeshStandardMaterial;
      const isPrimaryHighlight = isStart || isEnd || isOnPath;
      material.color.setHex(color);
      material.emissive.setHex(isPrimaryHighlight ? color : isVisited ? 0x6b1919 : 0x000000);
      material.emissiveIntensity = isPrimaryHighlight ? 0.35 : isVisited ? 0.2 : 0.05;
    });

    roadLinesRef.current.forEach(({ fromId, toId, line }) => {
      const roadKey = fromId < toId ? `${fromId}|${toId}` : `${toId}|${fromId}`;
      const isPathRoad = pathEdgeSet.has(roadKey);
      const material = line.material as THREE.LineBasicMaterial;
      material.color.setHex(isPathRoad ? COLOR_ROAD_PATH : COLOR_ROAD_DEFAULT);
      material.opacity = isPathRoad ? 1 : 0.75;
    });
  }, [start, end, path, visited]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1a14);
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 4000);

    const bounds = mapNodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.x),
        maxX: Math.max(acc.maxX, node.x),
        minY: Math.min(acc.minY, node.y),
        maxY: Math.max(acc.maxY, node.y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const mapCenter = new THREE.Vector3(
      (bounds.minX + bounds.maxX) / 2,
      0,
      (bounds.minY + bounds.maxY) / 2
    );

    camera.position.set(mapCenter.x + 80, 460, mapCenter.z + 760);
    camera.lookAt(mapCenter.x, 30, mapCenter.z);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(mapCenter.x, 15, mapCenter.z);
    controls.minDistance = 260;
    controls.maxDistance = 1700;
    controls.minPolarAngle = Math.PI * 0.1;
    controls.maxPolarAngle = Math.PI * 0.49;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.95);
    directionalLight.position.set(mapCenter.x + 180, 720, mapCenter.z + 220);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xb8c832, 0.25);
    fillLight.position.set(mapCenter.x - 350, 280, mapCenter.z - 250);
    scene.add(fillLight);

    const groundGeometry = new THREE.PlaneGeometry(2200, 1400);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x132117,
      shininess: 8,
      transparent: true,
      opacity: 0.92,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(2200, 44, 0x2a4a36, 0x203628);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);

    const roadsGroup = new THREE.Group();
    const nodesGroup = new THREE.Group();
    const labelsGroup = new THREE.Group();
    scene.add(roadsGroup);
    scene.add(nodesGroup);
    scene.add(labelsGroup);

    const createLabel = (text: string) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        return null;
      }

      canvas.width = 512;
      canvas.height = 128;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'rgba(16, 32, 24, 0.75)';
      context.fillRect(12, 24, 488, 80);
      context.strokeStyle = 'rgba(184, 200, 50, 0.7)';
      context.lineWidth = 3;
      context.strokeRect(12, 24, 488, 80);
      context.fillStyle = '#dfe8a6';
      context.font = '700 38px Inter, Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(84, 21, 1);
      return sprite;
    };

    roadLinesRef.current = [];
    roads.forEach((road) => {
      const fromNode = getNodeById(road.fromId);
      const toNode = getNodeById(road.toId);
      if (!fromNode || !toNode) return;

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([
        fromNode.x, 2, fromNode.y,
        toNode.x, 2, toNode.y,
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({
        color: COLOR_ROAD_DEFAULT,
        transparent: true,
        opacity: 0.75,
      });

      const line = new THREE.Line(geometry, material);
      roadsGroup.add(line);
      roadLinesRef.current.push({ fromId: road.fromId, toId: road.toId, line });
    });

    nodeMeshesRef.current.clear();
    mapNodes.forEach((node, index) => {
      const geometry = new THREE.SphereGeometry(9, 28, 28);
      const material = new THREE.MeshStandardMaterial({
        color: COLOR_NODE_DEFAULT,
        emissive: 0x000000,
        emissiveIntensity: 0.05,
        roughness: 0.42,
        metalness: 0.14,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.x, 10, node.y);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        nodeId: node.id,
        hovered: false,
        phase: index * 0.35,
      };
      nodesGroup.add(mesh);
      nodeMeshesRef.current.set(node.id, mesh);

      const label = createLabel(node.name);
      if (label) {
        label.position.set(node.x, 31, node.y);
        labelsGroup.add(label);
      }
    });

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickNode = () => {
      const nodeMeshes = [...nodeMeshesRef.current.values()];
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const intersections = raycasterRef.current.intersectObjects(nodeMeshes, false);

      if (intersections.length === 0) {
        return null;
      }

      return intersections[0].object as THREE.Mesh;
    };

    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event);
      const nextHovered = pickNode();

      if (hoveredNodeRef.current === nextHovered) {
        return;
      }

      if (hoveredNodeRef.current) {
        hoveredNodeRef.current.userData.hovered = false;
      }

      hoveredNodeRef.current = nextHovered;
      if (hoveredNodeRef.current) {
        hoveredNodeRef.current.userData.hovered = true;
      }

      renderer.domElement.style.cursor = nextHovered ? 'pointer' : 'grab';
    };

    const onPointerDown = (event: PointerEvent) => {
      dragStartRef.current = { x: event.clientX, y: event.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerUp = (event: PointerEvent) => {
      const dragStart = dragStartRef.current;
      dragStartRef.current = null;

      const dragDistance = dragStart
        ? Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y)
        : Number.POSITIVE_INFINITY;

      updatePointer(event);

      if (dragDistance < 6) {
        const clickedNode = pickNode();
        const nodeId = clickedNode?.userData.nodeId;
        if (typeof nodeId === 'string') {
          onNodeClickRef.current(nodeId);
        }
      }

      renderer.domElement.style.cursor = hoveredNodeRef.current ? 'pointer' : 'grab';
    };

    const onPointerLeave = () => {
      dragStartRef.current = null;
      if (hoveredNodeRef.current) {
        hoveredNodeRef.current.userData.hovered = false;
      }
      hoveredNodeRef.current = null;
      renderer.domElement.style.cursor = 'grab';
    };

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;

      if (nextWidth === 0 || nextHeight === 0) {
        return;
      }

      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const currentState = visualStateRef.current;

      nodeMeshesRef.current.forEach((mesh, nodeId) => {
        const material = mesh.material as THREE.MeshStandardMaterial;
        const isStartNode = currentState.start === nodeId;
        const isEndNode = currentState.end === nodeId;
        const isPathNode = currentState.pathSet.has(nodeId);
        const isImportant = isStartNode || isEndNode || isPathNode;
        const phase = typeof mesh.userData.phase === 'number' ? mesh.userData.phase : 0;
        const pulse = isImportant ? 1 + Math.sin(elapsed * 3 + phase) * 0.08 : 1;
        const isHovered = Boolean(mesh.userData.hovered);
        const nextScale = isHovered ? pulse * 1.18 : pulse;

        mesh.scale.setScalar(nextScale);

        if (isImportant) {
          material.emissiveIntensity = 0.28 + (Math.sin(elapsed * 4 + phase) + 1) * 0.1;
        }
      });

      controls.update();

      renderer.render(scene, camera);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      resizeObserver.disconnect();
      controls.dispose();

      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite) {
          if ('geometry' in object && object.geometry) {
            object.geometry.dispose();
          }

          if ('material' in object && object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => {
              const texturedMaterial = material as THREE.Material & {
                map?: THREE.Texture;
                alphaMap?: THREE.Texture;
              };

              if (texturedMaterial.map) {
                texturedMaterial.map.dispose();
              }
              if (texturedMaterial.alphaMap) {
                texturedMaterial.alphaMap.dispose();
              }

              material.dispose();
            });
          }
        }
      });

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      hoveredNodeRef.current = null;
      nodeMeshesRef.current.clear();
      roadLinesRef.current = [];
      controlsRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="map3d-container" />;
};
