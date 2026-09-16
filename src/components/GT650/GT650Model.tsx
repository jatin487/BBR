import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface GT650ModelProps {
  color: 'chrome' | 'black' | 'red' | 'white';
  isSpinning360: boolean;
  onSpinComplete: () => void;
  scrollRotation?: number;
}

const colorThemes = {
  chrome: {
    tank: '#ffffff',
    roughness: 0.02,
    metalness: 0.99,
    cowl: '#ffffff',
    cowlMetal: 0.99,
    stripe: '#0f172a'
  },
  black: {
    tank: '#16181f',
    roughness: 0.12,
    metalness: 0.85,
    cowl: '#16181f',
    cowlMetal: 0.85,
    stripe: '#f59e0b'
  },
  red: {
    tank: '#dc2626',
    roughness: 0.14,
    metalness: 0.75,
    cowl: '#dc2626',
    cowlMetal: 0.75,
    stripe: '#ffffff'
  },
  white: {
    tank: '#f8fafc',
    roughness: 0.12,
    metalness: 0.75,
    cowl: '#f8fafc',
    cowlMetal: 0.75,
    stripe: '#dc2626'
  }
};

// High-Fidelity Photorealistic Continental GT 650 Procedural Mesh
function PhotorealisticGT650Mesh({ theme }: { theme: typeof colorThemes['chrome'] }) {
  const frontWheelGroup = useRef<THREE.Group>(null);
  const rearWheelGroup = useRef<THREE.Group>(null);
  const bikeGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (bikeGroup.current) {
      bikeGroup.current.position.y = -0.58 + Math.sin(state.clock.elapsedTime * 2) * 0.004;
    }
    if (frontWheelGroup.current && rearWheelGroup.current) {
      frontWheelGroup.current.rotation.z += 0.005;
      rearWheelGroup.current.rotation.z += 0.005;
    }
  });

  // Materials designed for HDR reflections
  const mirrorChrome = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 1.0,
    roughness: 0.03,
    envMapIntensity: 2.2
  });

  const brushedSteel = new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    metalness: 0.92,
    roughness: 0.18,
    envMapIntensity: 1.5
  });

  const paintedTank = new THREE.MeshStandardMaterial({
    color: theme.tank,
    metalness: theme.metalness,
    roughness: theme.roughness,
    envMapIntensity: 2.5
  });

  const paintedCowl = new THREE.MeshStandardMaterial({
    color: theme.cowl,
    metalness: theme.cowlMetal,
    roughness: theme.roughness,
    envMapIntensity: 2.2
  });

  const glossStripe = new THREE.MeshStandardMaterial({
    color: theme.stripe,
    metalness: 0.6,
    roughness: 0.2
  });

  const engineBlack = new THREE.MeshStandardMaterial({
    color: '#15171d',
    metalness: 0.88,
    roughness: 0.25,
    envMapIntensity: 1.0
  });

  const goldPiggyback = new THREE.MeshStandardMaterial({
    color: '#d97706',
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 2.0
  });

  const rubberTyre = new THREE.MeshStandardMaterial({
    color: '#0e1014',
    roughness: 0.85,
    metalness: 0.05
  });

  const ribbedLeather = new THREE.MeshStandardMaterial({
    color: '#1c1f26',
    roughness: 0.78,
    metalness: 0.08
  });

  const amberLens = new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    emissive: '#d97706',
    emissiveIntensity: 0.9,
    roughness: 0.1
  });

  return (
    <group ref={bikeGroup} scale={1.25} position={[0, -0.58, 0]}>
      {/* ================= 1. DOUBLE CRADLE TUBULAR FRAME ================= */}
      <mesh position={[0, 0.92, 0]} material={engineBlack}>
        <boxGeometry args={[1.8, 0.28, 0.34]} />
      </mesh>
      {/* Front Cradle Down-Tubes */}
      <group position={[0.55, 0.65, 0]}>
        <mesh position={[0, 0, 0.14]} rotation={[0, 0, 0.44]} material={engineBlack}>
          <cylinderGeometry args={[0.038, 0.038, 0.85, 20]} />
        </mesh>
        <mesh position={[0, 0, -0.14]} rotation={[0, 0, 0.44]} material={engineBlack}>
          <cylinderGeometry args={[0.038, 0.038, 0.85, 20]} />
        </mesh>
      </group>
      {/* Rear Subframe Loop */}
      <mesh position={[-0.48, 0.82, 0]} rotation={[0, 0, -0.36]} material={engineBlack}>
        <cylinderGeometry args={[0.038, 0.038, 0.72, 20]} />
      </mesh>

      {/* ================= 2. 648cc PARALLEL TWIN ENGINE ================= */}
      <group position={[0.08, 0.65, 0]}>
        {/* Black Cylinder Block with Polished Silver Cooling Fins */}
        <mesh material={engineBlack}>
          <boxGeometry args={[0.76, 0.58, 0.52]} />
        </mesh>
        {[-0.2, -0.12, -0.04, 0.04, 0.12, 0.2].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} material={mirrorChrome}>
            <boxGeometry args={[0.8, 0.016, 0.55]} />
          </mesh>
        ))}

        {/* Polished Chrome Cylinder Head */}
        <mesh position={[0, 0.35, 0]} material={mirrorChrome}>
          <boxGeometry args={[0.68, 0.15, 0.46]} />
        </mesh>

        {/* Right Domed Polished Clutch Casing with Embossed RE Plaque */}
        <group position={[0.06, -0.1, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.26, 0.28, 0.12, 36]} />
          </mesh>
          <mesh position={[0, 0.065, 0]} material={brushedSteel}>
            <cylinderGeometry args={[0.16, 0.16, 0.018, 32]} />
          </mesh>
        </group>

        {/* Left Alternator Cover */}
        <group position={[0.06, -0.1, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.24, 0.26, 0.12, 36]} />
          </mesh>
        </group>

        {/* ================= 3. TWIN CHROME EXHAUST SYSTEM ================= */}
        {/* Right Header Pipe */}
        <group position={[0.42, 0.35, 0.22]} rotation={[0, 0, 0.62]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.04, 0.04, 0.55, 24]} />
          </mesh>
        </group>
        <group position={[0.26, -0.22, 0.28]} rotation={[0, 0, -1.57]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.04, 0.04, 0.75, 24]} />
          </mesh>
        </group>
        {/* Right Upswept Brushed Megaphone Silencer */}
        <group position={[-0.45, -0.12, 0.34]} rotation={[0, 0.06, -0.18]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.048, 0.092, 1.48, 32]} />
          </mesh>
          <mesh position={[0, -0.76, 0]} material={engineBlack}>
            <cylinderGeometry args={[0.092, 0.065, 0.06, 32]} />
          </mesh>
        </group>

        {/* Left Header Pipe & Silencer */}
        <group position={[0.42, 0.35, -0.22]} rotation={[0, 0, 0.62]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.04, 0.04, 0.55, 24]} />
          </mesh>
        </group>
        <group position={[0.26, -0.22, -0.28]} rotation={[0, 0, -1.57]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.04, 0.04, 0.75, 24]} />
          </mesh>
        </group>
        <group position={[-0.45, -0.12, -0.34]} rotation={[0, -0.06, -0.18]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.048, 0.092, 1.48, 32]} />
          </mesh>
          <mesh position={[0, -0.76, 0]} material={engineBlack}>
            <cylinderGeometry args={[0.092, 0.065, 0.06, 32]} />
          </mesh>
        </group>
      </group>

      {/* ================= 4. CHROME TRIANGULAR SIDE COVERS ================= */}
      <group position={[-0.22, 0.75, 0]}>
        {/* Right Chrome Side Panel */}
        <mesh position={[0, 0, 0.22]} rotation={[0, 0, 0.08]} material={mirrorChrome}>
          <boxGeometry args={[0.38, 0.28, 0.035]} />
        </mesh>
        <mesh position={[0, 0, 0.242]} material={goldPiggyback}>
          <cylinderGeometry args={[0.055, 0.055, 0.015, 24]} />
        </mesh>

        {/* Left Chrome Side Panel */}
        <mesh position={[0, 0, -0.22]} rotation={[0, 0, 0.08]} material={mirrorChrome}>
          <boxGeometry args={[0.38, 0.28, 0.035]} />
        </mesh>
        <mesh position={[0, 0, -0.242]} material={goldPiggyback}>
          <cylinderGeometry args={[0.055, 0.055, 0.015, 24]} />
        </mesh>
      </group>

      {/* ================= 5. SCULPTED MR CLEAN FUEL TANK ================= */}
      <group position={[0.25, 1.34, 0]}>
        {/* Sculpted Main Tank Geometry */}
        <mesh rotation={[0, 0, -0.12]} material={paintedTank}>
          <boxGeometry args={[1.04, 0.46, 0.52]} />
        </mesh>
        {/* Rounded Tank Crown Arch */}
        <mesh position={[0, 0.22, 0]} rotation={[0, 0, -0.12]} material={paintedTank}>
          <cylinderGeometry args={[0.2, 0.26, 0.82, 32]} />
        </mesh>

        {/* Royal Enfield Badge Cutout Plate on Tank */}
        <mesh position={[0.08, 0.08, 0.265]} rotation={[0, 0, -0.12]} material={engineBlack}>
          <boxGeometry args={[0.44, 0.12, 0.008]} />
        </mesh>
        <mesh position={[0.08, 0.08, -0.265]} rotation={[0, 0, -0.12]} material={engineBlack}>
          <boxGeometry args={[0.44, 0.12, 0.008]} />
        </mesh>

        {/* Monza Style Chrome Fuel Cap */}
        <mesh position={[0.16, 0.31, 0]} material={mirrorChrome}>
          <cylinderGeometry args={[0.085, 0.085, 0.045, 28]} />
        </mesh>

        {/* Knee Indent Rubber Pads */}
        <mesh position={[-0.14, -0.06, 0.268]} material={engineBlack}>
          <boxGeometry args={[0.38, 0.24, 0.018]} />
        </mesh>
        <mesh position={[-0.14, -0.06, -0.268]} material={engineBlack}>
          <boxGeometry args={[0.38, 0.24, 0.018]} />
        </mesh>
      </group>

      {/* ================= 6. CAFE RACER SADDLE & REAR COWL ================= */}
      <group position={[-0.56, 1.32, 0]}>
        {/* Tuck & Roll Leather Saddle */}
        <mesh position={[0.12, 0, 0]} rotation={[0, 0, 0.05]} material={ribbedLeather}>
          <boxGeometry args={[0.66, 0.15, 0.38]} />
        </mesh>

        {/* Aerodynamic Cafe Racer Seat Cowl */}
        <mesh position={[-0.36, 0.06, 0]} rotation={[0, 0, 0.12]} material={paintedCowl}>
          <boxGeometry args={[0.4, 0.2, 0.36]} />
        </mesh>

        {/* Rear Chrome Grab Loop */}
        <mesh position={[-0.45, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} material={mirrorChrome}>
          <torusGeometry args={[0.22, 0.024, 16, 32]} />
        </mesh>

        {/* Red Rectangular Tail Lamp */}
        <mesh position={[-0.6, 0.06, 0]} material={mirrorChrome}>
          <boxGeometry args={[0.08, 0.1, 0.16]} />
        </mesh>
        <mesh position={[-0.645, 0.06, 0]}>
          <boxGeometry args={[0.02, 0.08, 0.14]} />
          <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={2.8} />
        </mesh>

        {/* Rear Amber Turn Indicators */}
        <group position={[-0.52, 0.05, 0.24]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={mirrorChrome}>
            <cylinderGeometry args={[0.018, 0.018, 0.12, 16]} />
          </mesh>
          <mesh position={[0, 0, 0.06]} material={amberLens}>
            <cylinderGeometry args={[0.04, 0.04, 0.06, 20]} />
          </mesh>
        </group>
        <group position={[-0.52, 0.05, -0.24]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={mirrorChrome}>
            <cylinderGeometry args={[0.018, 0.018, 0.12, 16]} />
          </mesh>
          <mesh position={[0, 0, -0.06]} material={amberLens}>
            <cylinderGeometry args={[0.04, 0.04, 0.06, 20]} />
          </mesh>
        </group>
      </group>

      {/* ================= 7. COCKPIT, FORKS, STEM MIRRORS & HEADLAMP ================= */}
      <group position={[1.18, 1.16, 0]} rotation={[0, 0, -0.34]}>
        {/* Telescopic Chrome Forks */}
        <mesh position={[0, -0.48, 0.2]} material={mirrorChrome}>
          <cylinderGeometry args={[0.042, 0.042, 1.3, 24]} />
        </mesh>
        <mesh position={[0, -0.48, -0.2]} material={mirrorChrome}>
          <cylinderGeometry args={[0.042, 0.042, 1.3, 24]} />
        </mesh>

        {/* Black Rubber Accordion Gaiters */}
        {[-0.2, -0.3, -0.4].map((y, idx) => (
          <group key={idx}>
            <mesh position={[0, y, 0.2]} material={engineBlack}>
              <cylinderGeometry args={[0.055, 0.055, 0.07, 20]} />
            </mesh>
            <mesh position={[0, y, -0.2]} material={engineBlack}>
              <cylinderGeometry args={[0.055, 0.055, 0.07, 20]} />
            </mesh>
          </group>
        ))}

        {/* Clip-on Handlebars */}
        <mesh position={[-0.05, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} material={engineBlack}>
          <cylinderGeometry args={[0.03, 0.03, 0.98, 24]} />
        </mesh>

        {/* High-Stalk Circular Mirrors */}
        <group position={[-0.02, 0.48, 0.42]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.015, 0.015, 0.26, 16]} />
          </mesh>
          <mesh position={[0, 0.13, 0]} rotation={[0.2, 0, 0]} material={mirrorChrome}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 28]} />
          </mesh>
        </group>
        <group position={[-0.02, 0.48, -0.42]}>
          <mesh material={mirrorChrome}>
            <cylinderGeometry args={[0.015, 0.015, 0.26, 16]} />
          </mesh>
          <mesh position={[0, 0.13, 0]} rotation={[-0.2, 0, 0]} material={mirrorChrome}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 28]} />
          </mesh>
        </group>

        {/* Twin Dials with Chrome Bezels */}
        <mesh position={[-0.08, 0.4, 0.1]} rotation={[0.4, 0, 0]} material={mirrorChrome}>
          <cylinderGeometry args={[0.085, 0.085, 0.06, 24]} />
        </mesh>
        <mesh position={[-0.08, 0.4, -0.1]} rotation={[0.4, 0, 0]} material={mirrorChrome}>
          <cylinderGeometry args={[0.085, 0.085, 0.06, 24]} />
        </mesh>

        {/* Round Chrome Headlamp Bucket */}
        <mesh position={[0.2, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} material={mirrorChrome}>
          <cylinderGeometry args={[0.2, 0.15, 0.25, 32]} />
        </mesh>
        <mesh position={[0.33, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <circleGeometry args={[0.185, 36]} />
          <meshStandardMaterial
            color="#FFF8E7"
            emissive="#FFD54F"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>

        {/* Front Amber Indicators */}
        <group position={[0.12, 0.08, 0.28]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={mirrorChrome}>
            <cylinderGeometry args={[0.018, 0.018, 0.12, 16]} />
          </mesh>
          <mesh position={[0, 0, 0.06]} material={amberLens}>
            <cylinderGeometry args={[0.04, 0.04, 0.06, 20]} />
          </mesh>
        </group>
        <group position={[0.12, 0.08, -0.28]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={mirrorChrome}>
            <cylinderGeometry args={[0.018, 0.018, 0.12, 16]} />
          </mesh>
          <mesh position={[0, 0, -0.06]} material={amberLens}>
            <cylinderGeometry args={[0.04, 0.04, 0.06, 20]} />
          </mesh>
        </group>
      </group>

      {/* ================= 8. FRONT 18" SPOKED WHEEL & DISC BRAKE ================= */}
      <group position={[1.48, 0.45, 0]}>
        <group ref={frontWheelGroup}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={rubberTyre}>
            <torusGeometry args={[0.52, 0.11, 20, 48]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={mirrorChrome}>
            <cylinderGeometry args={[0.42, 0.42, 0.06, 36]} />
          </mesh>
          {[0, Math.PI / 6, Math.PI / 3, Math.PI / 2, (2 * Math.PI) / 3, (5 * Math.PI) / 6].map((rot, i) => (
            <mesh key={i} rotation={[Math.PI / 2, rot, 0]} material={mirrorChrome}>
              <boxGeometry args={[0.014, 0.014, 0.84]} />
            </mesh>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={brushedSteel}>
            <cylinderGeometry args={[0.14, 0.14, 0.12, 24]} />
          </mesh>
        </group>

        {/* 320mm Disc & Gold Caliper */}
        <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]} material={brushedSteel}>
          <cylinderGeometry args={[0.32, 0.32, 0.02, 32]} />
        </mesh>
        <mesh position={[0.1, 0.22, 0.085]} material={goldPiggyback}>
          <boxGeometry args={[0.12, 0.18, 0.06]} />
        </mesh>

        {/* Chrome Front Mudguard */}
        <mesh position={[-0.08, 0.46, 0]} material={mirrorChrome}>
          <boxGeometry args={[0.68, 0.07, 0.28]} />
        </mesh>
      </group>

      {/* ================= 9. REAR 18" SPOKED WHEEL & GOLD PIGGYBACK SHOCKS ================= */}
      <group position={[-1.18, 0.45, 0]}>
        <group ref={rearWheelGroup}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={rubberTyre}>
            <torusGeometry args={[0.52, 0.13, 20, 48]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={mirrorChrome}>
            <cylinderGeometry args={[0.42, 0.42, 0.08, 36]} />
          </mesh>
          {[0, Math.PI / 6, Math.PI / 3, Math.PI / 2, (2 * Math.PI) / 3, (5 * Math.PI) / 6].map((rot, i) => (
            <mesh key={i} rotation={[Math.PI / 2, rot, 0]} material={mirrorChrome}>
              <boxGeometry args={[0.014, 0.014, 0.84]} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]} material={engineBlack}>
            <cylinderGeometry args={[0.26, 0.26, 0.02, 28]} />
          </mesh>
        </group>

        {/* Swingarm */}
        <mesh position={[0.55, 0.2, 0]} rotation={[0, 0, -0.22]} material={engineBlack}>
          <boxGeometry args={[0.98, 0.08, 0.3]} />
        </mesh>

        {/* Dual Gabriel Gas-Charged Shocks with Gold Canister & Chrome Coils */}
        <group position={[0.3, 0.45, 0.21]} rotation={[0, 0, 0.55]}>
          <mesh material={engineBlack}>
            <cylinderGeometry args={[0.045, 0.045, 0.58, 20]} />
          </mesh>
          <mesh position={[0, -0.05, 0]} material={mirrorChrome}>
            <cylinderGeometry args={[0.055, 0.055, 0.32, 20]} />
          </mesh>
          <mesh position={[0.08, 0.15, 0]} material={goldPiggyback}>
            <cylinderGeometry args={[0.038, 0.038, 0.24, 20]} />
          </mesh>
        </group>
        <group position={[0.3, 0.45, -0.21]} rotation={[0, 0, 0.55]}>
          <mesh material={engineBlack}>
            <cylinderGeometry args={[0.045, 0.045, 0.58, 20]} />
          </mesh>
          <mesh position={[0, -0.05, 0]} material={mirrorChrome}>
            <cylinderGeometry args={[0.055, 0.055, 0.32, 20]} />
          </mesh>
          <mesh position={[0.08, 0.15, 0]} material={goldPiggyback}>
            <cylinderGeometry args={[0.038, 0.038, 0.24, 20]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// GLTF model wrapper
function GLTFModelWrapper({ theme: _theme }: { theme: typeof colorThemes['chrome'] }) {
  const gltf = useGLTF('/models/gt650.glb');
  return <primitive object={gltf.scene} scale={1.25} position={[0, -0.7, 0]} />;
}


export const GT650Model: React.FC<GT650ModelProps> = ({
  color,
  isSpinning360,
  onSpinComplete,
  scrollRotation = 0
}) => {
  const modelGroupRef = useRef<THREE.Group>(null);
  const spinProgressRef = useRef(0);
  const [hasGLTF, setHasGLTF] = useState(false);

  useEffect(() => {
    fetch('/models/gt650.glb', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setHasGLTF(true);
      })
      .catch(() => setHasGLTF(false));
  }, []);

  useFrame((_, delta) => {
    if (!modelGroupRef.current) return;

    if (isSpinning360) {
      spinProgressRef.current += delta * ((Math.PI * 2) / 2.0);
      modelGroupRef.current.rotation.y = spinProgressRef.current;

      if (spinProgressRef.current >= Math.PI * 2) {
        spinProgressRef.current = 0;
        modelGroupRef.current.rotation.y = scrollRotation;
        onSpinComplete();
      }
    } else {
      modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        modelGroupRef.current.rotation.y,
        scrollRotation,
        0.08
      );
    }
  });

  const selectedTheme = colorThemes[color] || colorThemes['chrome'];

  return (
    <group ref={modelGroupRef}>
      {hasGLTF ? (
        <React.Suspense fallback={<PhotorealisticGT650Mesh theme={selectedTheme} />}>
          <GLTFModelWrapper theme={selectedTheme} />
        </React.Suspense>
      ) : (
        <PhotorealisticGT650Mesh theme={selectedTheme} />
      )}
    </group>
  );
};
