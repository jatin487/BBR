import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface MotorcycleProps {
  color: string;
  headlightOn: boolean;
}

// Procedural stylized modern motorcycle model in Three.js
function StylizedMotorcycle({ color, headlightOn }: MotorcycleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frontWheelRef = useRef<THREE.Mesh>(null);
  const rearWheelRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle idle sway
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
    if (frontWheelRef.current && rearWheelRef.current) {
      frontWheelRef.current.rotation.z += 0.015;
      rearWheelRef.current.rotation.z += 0.015;
    }
  });

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.85,
    roughness: 0.2
  });

  const metalDark = new THREE.MeshStandardMaterial({
    color: '#1e2029',
    metalness: 0.9,
    roughness: 0.3
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    metalness: 0.95,
    roughness: 0.05
  });

  const tyreMaterial = new THREE.MeshStandardMaterial({
    color: '#111318',
    roughness: 0.85,
    metalness: 0.1
  });

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* --- CHASSIS & MAIN FRAME --- */}
      <mesh position={[0, 0.9, 0]} material={metalDark}>
        <boxGeometry args={[1.6, 0.4, 0.35]} />
      </mesh>

      {/* --- ENGINE BLOCK & CRANKCASE --- */}
      <group position={[0.1, 0.65, 0]}>
        <RoundedBox args={[0.7, 0.6, 0.5]} radius={0.08} smoothness={4} material={metalDark}>
          <meshStandardMaterial color="#1a1c23" metalness={0.9} roughness={0.3} />
        </RoundedBox>
        {/* Engine Cooling Fins */}
        {[-0.15, -0.05, 0.05, 0.15].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} material={chromeMaterial}>
            <boxGeometry args={[0.72, 0.02, 0.52]} />
          </mesh>
        ))}
        {/* Twin Exhaust Pipe */}
        <mesh position={[-0.4, -0.1, 0.28]} rotation={[0, 0, -0.1]} material={chromeMaterial}>
          <cylinderGeometry args={[0.06, 0.08, 1.2, 16]} />
        </mesh>
      </group>

      {/* --- FUEL TANK (Dynamic Color) --- */}
      <mesh position={[0.2, 1.3, 0]} rotation={[0, 0, -0.12]} material={bodyMaterial}>
        <boxGeometry args={[0.9, 0.45, 0.55]} />
      </mesh>
      {/* Tank Top Ridge */}
      <mesh position={[0.2, 1.5, 0]} rotation={[0, 0, -0.12]} material={bodyMaterial}>
        <cylinderGeometry args={[0.18, 0.26, 0.7, 16]} />
      </mesh>
      {/* Fuel Cap */}
      <mesh position={[0.3, 1.56, 0]} material={chromeMaterial}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
      </mesh>

      {/* --- SEAT (Cafe Racer Stitch style) --- */}
      <mesh position={[-0.45, 1.25, 0]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.85, 0.15, 0.42]} />
        <meshStandardMaterial color="#2d1b14" roughness={0.7} />
      </mesh>
      {/* Rear Cowl */}
      <mesh position={[-0.95, 1.28, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.35, 0.16, 0.38]} />
      </mesh>

      {/* --- FRONT FORKS & HANDLEBAR --- */}
      <group position={[1.1, 1.1, 0]} rotation={[0, 0, -0.35]}>
        {/* Telescopic Fork Left & Right */}
        <mesh position={[0, -0.4, 0.18]} material={chromeMaterial}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 16]} />
        </mesh>
        <mesh position={[0, -0.4, -0.18]} material={chromeMaterial}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 16]} />
        </mesh>
        {/* Handlebar */}
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalDark}>
          <cylinderGeometry args={[0.035, 0.035, 1.0, 16]} />
        </mesh>
        {/* Grips & Bar-end Mirrors */}
        <mesh position={[0, 0.3, 0.5]} rotation={[Math.PI / 2, 0, 0]} material={tyreMaterial}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
        </mesh>
        <mesh position={[0, 0.3, -0.5]} rotation={[Math.PI / 2, 0, 0]} material={tyreMaterial}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
        </mesh>
        {/* Headlamp Housing */}
        <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} material={metalDark}>
          <cylinderGeometry args={[0.18, 0.14, 0.22, 24]} />
        </mesh>
        {/* Headlamp Glass / Glowing Beam */}
        <mesh position={[0.26, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <circleGeometry args={[0.16, 24]} />
          <meshStandardMaterial
            color={headlightOn ? '#FFF4CC' : '#475569'}
            emissive={headlightOn ? '#FFD54F' : '#000000'}
            emissiveIntensity={headlightOn ? 2.5 : 0}
            toneMapped={false}
          />
        </mesh>
        {headlightOn && (
          <spotLight
            position={[0.3, 0.1, 0]}
            target-position={[4, -0.5, 0]}
            angle={0.6}
            penumbra={0.5}
            intensity={4}
            color="#FFF4D0"
          />
        )}
      </group>

      {/* --- FRONT WHEEL --- */}
      <group position={[1.4, 0.45, 0]}>
        <mesh ref={frontWheelRef} rotation={[Math.PI / 2, 0, 0]} material={tyreMaterial}>
          <torusGeometry args={[0.48, 0.11, 16, 32]} />
        </mesh>
        {/* Alloy Rim & Disc Brake */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={metalDark}>
          <cylinderGeometry args={[0.38, 0.38, 0.08, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]} material={chromeMaterial}>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 16]} />
        </mesh>
        {/* Front Mudguard */}
        <mesh position={[-0.05, 0.4, 0]} material={bodyMaterial}>
          <boxGeometry args={[0.6, 0.08, 0.26]} />
        </mesh>
      </group>

      {/* --- REAR WHEEL & SWINGARM --- */}
      <group position={[-1.1, 0.45, 0]}>
        <mesh ref={rearWheelRef} rotation={[Math.PI / 2, 0, 0]} material={tyreMaterial}>
          <torusGeometry args={[0.48, 0.13, 16, 32]} />
        </mesh>
        {/* Rear Alloy Rim & Sprocket */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={metalDark}>
          <cylinderGeometry args={[0.38, 0.38, 0.1, 16]} />
        </mesh>
        {/* Rear Swingarm */}
        <mesh position={[0.55, 0.2, 0]} rotation={[0, 0, -0.2]} material={metalDark}>
          <boxGeometry args={[0.9, 0.08, 0.28]} />
        </mesh>
        {/* Monoshock suspension */}
        <mesh position={[0.4, 0.4, 0]} rotation={[0, 0, 0.6]} material={chromeMaterial}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
        </mesh>
        {/* Tail Lamp (Red Glow) */}
        <mesh position={[-0.3, 0.8, 0]}>
          <boxGeometry args={[0.06, 0.08, 0.2]} />
          <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={2} />
        </mesh>
      </group>
    </group>
  );
}

export const BikeShowcase3D: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState('#FF5A1F'); // Velocity Orange
  const [headlightOn, setHeadlightOn] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const colors = [
    { name: 'Velocity Orange', hex: '#FF5A1F', border: 'border-orange-500' },
    { name: 'Stealth Black', hex: '#1E232E', border: 'border-slate-500' },
    { name: 'British Racing Green', hex: '#1B4332', border: 'border-emerald-600' },
    { name: 'Apex Yellow', hex: '#EAB308', border: 'border-yellow-400' },
    { name: 'Cyber Blue', hex: '#0284C7', border: 'border-sky-500' }
  ];

  return (
    <div className="relative w-full h-[460px] md:h-[540px] rounded-3xl overflow-hidden glass-card border border-orange-500/20 shadow-2xl">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [3.5, 1.8, 3.5], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#070A11']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
        <pointLight position={[-4, 4, -4]} intensity={0.9} color="#FF7A00" />
        <pointLight position={[3, 2, 4]} intensity={0.5} color="#00E5FF" />

        <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.25}>
          <StylizedMotorcycle color={selectedColor} headlightOn={headlightOn} />
        </Float>

        <ContactShadows
          position={[0, -0.65, 0]}
          opacity={0.65}
          scale={7}
          blur={1.8}
          far={3}
          color="#000000"
        />

        <OrbitControls
          enableZoom={false}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* Floating 3D Control Bar */}
      <div className="absolute top-4 left-4 right-4 md:left-6 md:right-6 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-auto shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interactive 3D Studio
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setHeadlightOn(!headlightOn)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border transition-all flex items-center gap-1.5 ${
              headlightOn
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/80 border-white/10 text-slate-400'
            }`}
          >
            💡 Headlight {headlightOn ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border transition-all ${
              autoRotate
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                : 'bg-slate-900/80 border-white/10 text-slate-400'
            }`}
          >
            🔄 {autoRotate ? 'Rotating' : 'Manual View'}
          </button>
        </div>
      </div>

      {/* Paint Selector Bottom Bar */}
      <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <p className="text-xs text-slate-400 font-medium">BBR Custom Fleet Paint Preview</p>
          <p className="text-sm font-bold text-white flex items-center gap-1.5">
            Royal Enfield & Cruiser Series
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 hidden sm:inline">Colorway:</span>
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => setSelectedColor(c.hex)}
              title={c.name}
              className={`w-7 h-7 rounded-full transition-all transform hover:scale-110 flex items-center justify-center ${
                selectedColor === c.hex
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {selectedColor === c.hex && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
