import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
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
  const nodesGroupRef = useRef<THREE.Group | null>(null);
  const roadsGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1a14);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(550, 400, 600);
    camera.lookAt(550, 300, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(500, 600, 400);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create groups
    const roadsGroup = new THREE.Group();
    const nodesGroup = new THREE.Group();
    scene.add(roadsGroup);
    scene.add(nodesGroup);
    roadsGroupRef.current = roadsGroup;
    nodesGroupRef.current = nodesGroup;

    // Draw roads
    roads.forEach((road) => {
      const fromNode = getNodeById(road.fromId);
      const toNode = getNodeById(road.toId);
      if (!fromNode || !toNode) return;

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([
        fromNode.x, 0, fromNode.y,
        toNode.x, 0, toNode.y,
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const isOnPath = path.includes(fromNode.id) && path.includes(toNode.id);
      const material = new THREE.LineBasicMaterial({
        color: isOnPath ? 0xb8c832 : 0x3a4a3e,
        linewidth: isOnPath ? 3 : 2,
      });

      const line = new THREE.Line(geometry, material);
      roadsGroup.add(line);
    });

    // Draw nodes
    nodeMeshesRef.current.clear();
    mapNodes.forEach((node) => {
      const isStart = start === node.id;
      const isEnd = end === node.id;
      const isVisited = visited.includes(node.id);
      const isOnPath = path.includes(node.id);

      const geometry = new THREE.SphereGeometry(8, 32, 32);
      let color = 0x5a6a56; // Default gray

      if (isStart) {
        color = 0x7a9f6a; // Olive green for start
      } else if (isEnd) {
        color = 0xf0a844; // Orange for end
      } else if (isOnPath) {
        color = 0xb8c832; // Gold for path
      } else if (isVisited) {
        color = 0x4a5a4e; // Darker gray for visited
      }

      const material = new THREE.MeshPhongMaterial({
        color,
        emissive: isOnPath || isStart || isEnd ? color : 0x000000,
        emissiveIntensity: isOnPath || isStart || isEnd ? 0.5 : 0,
        shininess: 100,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.x, 8, node.y);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { nodeId: node.id };
      nodesGroup.add(mesh);
      nodeMeshesRef.current.set(node.id, mesh);

      // Add label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = '#b8c832';
      context.font = 'Bold 40px Arial';
      context.textAlign = 'center';
      context.fillText(node.name, 128, 45);

      const texture = new THREE.CanvasTexture(canvas);
      const labelGeometry = new THREE.PlaneGeometry(40, 12);
      const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(node.x, 20, node.y);
      nodesGroup.add(label);
    });

    // Mouse interaction
    const onMouseClick = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(nodesGroup.children);

      if (intersects.length > 0) {
        const clicked = intersects[0].object as THREE.Mesh;
        if (clicked.userData.nodeId) {
          onNodeClick(clicked.userData.nodeId);
        }
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Mouse move for camera controls
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;

      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;

      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseUp = () => {
      mouseDown = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // Zoom with scroll
    const onScroll = (event: WheelEvent) => {
      event.preventDefault();
      const currentDistance = camera.position.length();
      const newDistance = Math.max(300, Math.min(1500, currentDistance + event.deltaY * 0.5));
      const ratio = newDistance / currentDistance;

      camera.position.multiplyScalar(ratio);
    };

    renderer.domElement.addEventListener('wheel', onScroll, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth camera rotation
      const currentRotation = camera.position.clone();
      const distance = currentRotation.length();
      const currentAngleY = Math.atan2(currentRotation.x, currentRotation.z);
      const currentAngleX = Math.asin(currentRotation.y / distance);

      const newAngleY = currentAngleY + (targetRotationY - currentAngleY) * 0.1;
      const newAngleX = currentAngleX + (targetRotationX - currentAngleX) * 0.1;

      camera.position.x = Math.sin(newAngleY) * Math.cos(newAngleX) * distance;
      camera.position.y = Math.sin(newAngleX) * distance;
      camera.position.z = Math.cos(newAngleY) * Math.cos(newAngleX) * distance;
      camera.lookAt(550, 150, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onScroll);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [start, end, path, visited, onNodeClick]);

  return <div ref={containerRef} className="map3d-container" />;
};
