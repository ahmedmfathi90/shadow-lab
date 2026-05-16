import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Sphere, Plane, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface ShadowSceneProps {
  lightSize: number;
  objectDistance: number;
}

// We use multiple point lights to simulate an "Area" light.
// This naturally creates an Umbra (where all shadows overlap) 
// and a Penumbra (where only some shadows overlap).
function ExtendedLight({ size, zPos }: { size: number, zPos: number }) {
  const intensity = 80; // Spread intensity among the lights
  const distance = 40;
  
  // 5 lights: center, top, bottom, left, right
  const positions = [
    [0, 0, 0],
    [size, 0, 0],
    [-size, 0, 0],
    [0, size, 0],
    [0, -size, 0],
  ];

  return (
    <group position={[0, 0, zPos]}>
      {/* Visual representation of the light source */}
      <mesh>
        <sphereGeometry args={[Math.max(0.2, size), 16, 16]} />
        <meshBasicMaterial color="#ffffcc" />
      </mesh>
      
      {positions.map((pos, idx) => (
        <pointLight
          key={idx}
          position={pos as [number, number, number]}
          intensity={intensity / positions.length}
          distance={distance}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      ))}
    </group>
  );
}

function AnimatedGroup({ objectDistance }: { objectDistance: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Smoothly move the object
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        objectDistance,
        delta * 5
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* The Opaque Object (Apple/Ball) */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#4ade80" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* A little stem to make it look like an apple/fruit just for fun */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

export default function ShadowScene({ lightSize, objectDistance }: ShadowSceneProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl relative group">
      <Canvas 
        shadows 
        camera={{ 
          position: window.innerWidth < 768 ? [-12, 8, 12] : [-8, 6, 8], 
          fov: window.innerWidth < 768 ? 50 : 45 
        }}
        dpr={[1, 2]} // Better performance on mobile
      >
        {/* Ambient light so things aren't pitch black, but very low to keep shadows strong */}
        <ambientLight intensity={0.1} />
        
        <ExtendedLight size={lightSize} zPos={8} />

        <AnimatedGroup objectDistance={objectDistance} />

        {/* The Wall (Screen) */}
        <mesh position={[0, 0, -5]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#e2e8f0" roughness={1} />
        </mesh>
        
        {/* Floor */}
        <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={30}
        />
      </Canvas>
      <div className="absolute top-4 right-4 pointer-events-none text-white/50 text-xs sm:text-sm bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm">
        اسحب الشاشة للتدوير ↻
      </div>
    </div>
  );
}
