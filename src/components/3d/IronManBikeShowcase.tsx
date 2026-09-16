import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  Zap,
  Gauge,
  Compass,
  Cpu,
  Layers,
  ChevronRight,
  Eye,
  Volume2,
  VolumeX,
  Crosshair,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Vehicle, RateType } from '../../types';
import { VEHICLES } from '../../data/vehicles';

interface IronManBikeProps {
  color: string;
  wireframe: boolean;
  step: number;
  headlightOn: boolean;
}

// 3D Procedural Royal Enfield Cafe Racer with dynamic telemetry highlights
function IronManMotorcycle({ color, wireframe, step, headlightOn }: IronManBikeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frontWheelRef = useRef<THREE.Mesh>(null);
  const rearWheelRef = useRef<THREE.Mesh>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);

  // Target camera and orientation positions for each Iron Man HUD step
  const stepRotations = [
    { y: -0.4, x: 0.05, z: 0 },   // Step 0: Front 3/4 Cockpit
    { y: 0.0, x: -0.05, z: 0 },    // Step 1: Engine profile
    { y: 0.6, x: 0.1, z: 0 },     // Step 2: Rear Chassis & ABS
    { y: -1.2, x: 0.0, z: 0 }     // Step 3: Full dynamic angle
  ];

  useFrame((state, delta) => {
    if (groupRef.current) {
      const target = stepRotations[step] || stepRotations[0];
      // Smooth interpolation toward target stage angle
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        target.y + Math.sin(state.clock.elapsedTime * 0.8) * 0.04,
        3,
        delta
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        target.x,
        3,
        delta
      );
    }
    if (frontWheelRef.current && rearWheelRef.current) {
      frontWheelRef.current.rotation.z += 0.02;
      rearWheelRef.current.rotation.z += 0.02;
    }
    if (engineGlowRef.current) {
      engineGlowRef.current.intensity = 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.6;
    }
  });

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: wireframe ? '#00E5FF' : color,
    metalness: wireframe ? 0.2 : 0.9,
    roughness: wireframe ? 0.9 : 0.15,
    wireframe: wireframe
  });

  const metalDark = new THREE.MeshStandardMaterial({
    color: wireframe ? '#003B46' : '#12151e',
    metalness: 0.9,
    roughness: 0.35,
    wireframe: wireframe
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: wireframe ? '#00FFFF' : '#e2e8f0',
    metalness: 0.98,
    roughness: 0.05,
    wireframe: wireframe
  });

  const tyreMaterial = new THREE.MeshStandardMaterial({
    color: wireframe ? '#002B36' : '#0d0f14',
    roughness: 0.9,
    metalness: 0.1,
    wireframe: wireframe
  });

  return (
    <group ref={groupRef} position={[0, -0.65, 0]}>
      {/* --- CHASSIS & DUAL CRADLE TUBULAR FRAME --- */}
      <mesh position={[0, 0.9, 0]} material={metalDark}>
        <boxGeometry args={[1.65, 0.38, 0.36]} />
      </mesh>

      {/* --- 648CC PARALLEL TWIN ENGINE BLOCK --- */}
      <group position={[0.1, 0.65, 0]}>
        <RoundedBox args={[0.74, 0.64, 0.52]} radius={0.08} smoothness={4} material={metalDark}>
          <meshStandardMaterial color={wireframe ? '#00E5FF' : '#181b24'} metalness={0.9} roughness={0.3} wireframe={wireframe} />
        </RoundedBox>

        {/* Engine Cooling Fins with Chrome Tips */}
        {[-0.18, -0.09, 0.0, 0.09, 0.18].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} material={chromeMaterial}>
            <boxGeometry args={[0.76, 0.02, 0.54]} />
          </mesh>
        ))}

        {/* Pulsating Internal Arc Reactor / Core Glow */}
        <pointLight ref={engineGlowRef} position={[0, 0, 0]} color="#00E5FF" intensity={1.5} distance={1.8} />

        {/* Dual Chrome Exhaust Header & Muffler */}
        <mesh position={[-0.45, -0.1, 0.28]} rotation={[0, 0, -0.08]} material={chromeMaterial}>
          <cylinderGeometry args={[0.065, 0.085, 1.25, 16]} />
        </mesh>
        <mesh position={[-0.45, -0.1, -0.28]} rotation={[0, 0, -0.08]} material={chromeMaterial}>
          <cylinderGeometry args={[0.065, 0.085, 1.25, 16]} />
        </mesh>
      </group>

      {/* --- FUEL TANK (Continental Cafe Racer Tear-drop Shape) --- */}
      <mesh position={[0.22, 1.32, 0]} rotation={[0, 0, -0.1]} material={bodyMaterial}>
        <boxGeometry args={[0.92, 0.46, 0.56]} />
      </mesh>
      <mesh position={[0.22, 1.52, 0]} rotation={[0, 0, -0.1]} material={bodyMaterial}>
        <cylinderGeometry args={[0.18, 0.28, 0.72, 16]} />
      </mesh>
      {/* Monza Chrome Fuel Cap */}
      <mesh position={[0.32, 1.58, 0]} material={chromeMaterial}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
      </mesh>

      {/* --- SEAT (Cafe Racer Ribbed Cowl) --- */}
      <mesh position={[-0.45, 1.26, 0]} rotation={[0, 0, 0.04]}>
        <boxGeometry args={[0.85, 0.14, 0.42]} />
        <meshStandardMaterial color={wireframe ? '#005577' : '#221510'} roughness={0.8} wireframe={wireframe} />
      </mesh>
      <mesh position={[-0.96, 1.3, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.36, 0.16, 0.38]} />
      </mesh>

      {/* --- FRONT FORKS, CLIP-ON BARS & PROJECTOR LAMP --- */}
      <group position={[1.12, 1.12, 0]} rotation={[0, 0, -0.34]}>
        {/* Telescopic Fork Stanchions */}
        <mesh position={[0, -0.4, 0.18]} material={chromeMaterial}>
          <cylinderGeometry args={[0.042, 0.042, 1.2, 16]} />
        </mesh>
        <mesh position={[0, -0.4, -0.18]} material={chromeMaterial}>
          <cylinderGeometry args={[0.042, 0.042, 1.2, 16]} />
        </mesh>
        {/* Clip-on Bars */}
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalDark}>
          <cylinderGeometry args={[0.035, 0.035, 1.05, 16]} />
        </mesh>

        {/* Headlamp Housing with Glowing Ring */}
        <mesh position={[0.16, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} material={metalDark}>
          <cylinderGeometry args={[0.19, 0.15, 0.22, 24]} />
        </mesh>
        {/* Headlamp Lens (Cyan / Arc Reactor Hue) */}
        <mesh position={[0.27, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <circleGeometry args={[0.17, 24]} />
          <meshStandardMaterial
            color={headlightOn ? '#00F0FF' : '#334155'}
            emissive={headlightOn ? '#00D9FF' : '#000000'}
            emissiveIntensity={headlightOn ? 3.5 : 0}
            toneMapped={false}
          />
        </mesh>
        {headlightOn && (
          <spotLight
            position={[0.3, 0.1, 0]}
            target-position={[4.5, -0.5, 0]}
            angle={0.65}
            penumbra={0.4}
            intensity={5}
            color="#00F0FF"
          />
        )}
      </group>

      {/* --- FRONT WHEEL & DUAL BREMBO DISC --- */}
      <group position={[1.42, 0.45, 0]}>
        <mesh ref={frontWheelRef} rotation={[Math.PI / 2, 0, 0]} material={tyreMaterial}>
          <torusGeometry args={[0.48, 0.11, 16, 32]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={metalDark}>
          <cylinderGeometry args={[0.38, 0.38, 0.08, 16]} />
        </mesh>
        {/* Perforated Disc Rotor */}
        <mesh position={[0, 0, 0.065]} rotation={[Math.PI / 2, 0, 0]} material={chromeMaterial}>
          <cylinderGeometry args={[0.28, 0.28, 0.02, 16]} />
        </mesh>
        {/* Brembo Calliper (Glowing Gold/Cyan) */}
        <mesh position={[0.2, 0.15, 0.07]}>
          <boxGeometry args={[0.1, 0.14, 0.06]} />
          <meshStandardMaterial color="#FFB703" emissive="#FB8500" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* --- REAR WHEEL & SPROCKET DRIVE --- */}
      <group position={[-1.12, 0.45, 0]}>
        <mesh ref={rearWheelRef} rotation={[Math.PI / 2, 0, 0]} material={tyreMaterial}>
          <torusGeometry args={[0.48, 0.13, 16, 32]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={metalDark}>
          <cylinderGeometry args={[0.38, 0.38, 0.1, 16]} />
        </mesh>
        {/* Twin Gas Charged Rear Shocks */}
        <mesh position={[0.42, 0.42, 0.22]} rotation={[0, 0, 0.6]} material={chromeMaterial}>
          <cylinderGeometry args={[0.04, 0.04, 0.52, 12]} />
        </mesh>
        <mesh position={[0.42, 0.42, -0.22]} rotation={[0, 0, 0.6]} material={chromeMaterial}>
          <cylinderGeometry args={[0.04, 0.04, 0.52, 12]} />
        </mesh>
        {/* Neon Tail Blade */}
        <mesh position={[-0.32, 0.82, 0]}>
          <boxGeometry args={[0.06, 0.08, 0.22]} />
          <meshStandardMaterial color="#FF0055" emissive="#FF0055" emissiveIntensity={3} />
        </mesh>
      </group>
    </group>
  );
}

interface IronManShowcaseProps {
  onBookNow: (vehicle: Vehicle, rateType: RateType) => void;
}

const HUD_STAGES = [
  {
    id: 0,
    tag: 'STAGE 01 // COCKPIT & AERO',
    title: 'Cafe Racer Cockpit Matrix',
    subtitle: 'Twin-pod retro console with digital analytics and clip-on ergonomics.',
    metrics: [
      { label: 'HEADLAMP', value: 'Projector LED + Ring DRL', status: 'LOCKED' },
      { label: 'LEAN STABILITY', value: '52° Dynamic Bank Angle', status: 'OPTIMAL' },
      { label: 'WIND FACTOR', value: 'Low Drag Stance', status: 'CALIBRATED' }
    ]
  },
  {
    id: 1,
    tag: 'STAGE 02 // POWERTRAIN CORE',
    title: 'Parallel Twin 648cc Symphony',
    subtitle: '270-degree firing order delivering linear torque through mountain hairpins.',
    metrics: [
      { label: 'HORSEPOWER', value: '47 BHP @ 7250 RPM', status: 'PEAK' },
      { label: 'TORQUE PULL', value: '52 NM @ 5250 RPM', status: 'ACTIVE' },
      { label: 'SLIPPER CLUTCH', value: 'Assist Deceleration', status: 'ENGAGED' }
    ]
  },
  {
    id: 2,
    tag: 'STAGE 03 // CHASSIS & ABS DYNAMICS',
    title: 'Harris Performance Dual Cradle',
    subtitle: 'ByBre dual-channel ABS disc system engineered for Himalayan descents.',
    metrics: [
      { label: 'FRAME', value: 'Tubular Steel Double Cradle', status: 'RIGID' },
      { label: 'FRONT BRAKE', value: '320mm Floating Disc ABS', status: 'ONLINE' },
      { label: 'SUSPENSION', value: 'Twin Gas Shocks with Piggyback', status: 'TUNED' }
    ]
  },
  {
    id: 3,
    tag: 'STAGE 04 // READY FOR FLIGHT',
    title: 'Touring Ready • Instant Rental',
    subtitle: 'Full tank of fuel, twin sanitized helmets & 24/7 roadside assist ready.',
    metrics: [
      { label: 'DAILY TARIFF', value: '₹3,000 / 24 Hours', status: 'VERIFIED' },
      { label: 'SECURITY DEPOSIT', value: '₹3,000 (Refundable)', status: 'INSTANT' },
      { label: 'PICKUP HUB', value: 'Bhauwala, Dehradun', status: 'AVAILABLE' }
    ]
  }
];

export const IronManBikeShowcase: React.FC<IronManShowcaseProps> = ({ onBookNow }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [wireframe, setWireframe] = useState(false);
  const [headlightOn, setHeadlightOn] = useState(true);
  const [colorway, setColorway] = useState('#E2E8F0'); // Chrome Default
  const [isAudioSimulated, setIsAudioSimulated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const gt650Vehicle = VEHICLES.find((v) => v.id === 'gt-continental-650') || VEHICLES[0];

  // Colors
  const colorOptions = [
    { name: 'Mr Clean Chrome', hex: '#E2E8F0', glow: '#00F0FF' },
    { name: 'Apex Dark Magic', hex: '#1E232E', glow: '#F59E0B' },
    { name: 'Rocker Red Flame', hex: '#DC2626', glow: '#EF4444' }
  ];

  const currentStage = HUD_STAGES[activeStep];

  return (
    <section
      ref={sectionRef}
      className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden text-white"
    >
      {/* Background Radial Grid & Iron Man Arc HUD Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#00e5ff18_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Top Header Badge */}
      <div className="relative z-10 flex flex-col items-center text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(0,229,255,0.2)] backdrop-blur-xl"
        >
          <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>JARVIS 3D TELEMETRY MATRIX</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </motion.div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight">
          INTERACTIVE 3D <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400">HUD DIAGNOSTICS</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2 font-normal">
          Experience the Royal Enfield Continental GT 650 through real-time 3D telemetry, holographic subsystem scans, and interactive powertrain inspection.
        </p>
      </div>

      {/* Main Iron Man HUD Canvas Stage */}
      <div className="relative rounded-3xl bg-slate-950/90 border border-cyan-500/30 p-4 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(0,229,255,0.06)] backdrop-blur-2xl overflow-hidden">
        
        {/* HUD Holographic Corner Brackets */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Grid Layout: 3D Stage + HUD Diagnostics Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

          {/* ═══════════ LEFT: 3D INTERACTIVE CANVAS (7 COLS) ═══════════ */}
          <div className="lg:col-span-7 relative h-[420px] sm:h-[500px] rounded-2xl bg-black/60 border border-white/10 overflow-hidden group">
            
            {/* 3D Canvas */}
            <Canvas camera={{ position: [3.4, 1.6, 3.4], fov: 42 }}>
              <ambientLight intensity={wireframe ? 0.4 : 0.8} />
              <directionalLight position={[6, 8, 6]} intensity={1.8} />
              <pointLight position={[-4, 4, -4]} color="#00E5FF" intensity={1.2} />
              <pointLight position={[3, 2, 4]} color="#FF9E00" intensity={0.8} />

              <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
                <IronManMotorcycle
                  color={colorway}
                  wireframe={wireframe}
                  step={activeStep}
                  headlightOn={headlightOn}
                />
              </Float>

              <ContactShadows
                position={[0, -0.66, 0]}
                opacity={0.7}
                scale={6}
                blur={2}
                far={3}
                color="#000000"
              />

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                maxPolarAngle={Math.PI / 2 - 0.05}
                minPolarAngle={Math.PI / 4}
              />
            </Canvas>

            {/* Iron Man Rotating HUD Compass / Ring Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-cyan-500/20 border-dashed animate-spin" style={{ animationDuration: '30s' }} />
              <div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full border border-cyan-400/15" />
            </div>

            {/* Top Interactive HUD Quick Controls Bar */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
              <div className="px-3 py-1 rounded-lg bg-slate-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md flex items-center gap-2 pointer-events-auto">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>TELEMETRY FEED: 60 FPS</span>
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                {/* Wireframe / Hologram Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setWireframe(!wireframe)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 backdrop-blur-md ${
                    wireframe
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                      : 'bg-slate-950/80 border-white/15 text-slate-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>{wireframe ? 'WIREFRAME ON' : 'X-RAY MESH'}</span>
                </button>

                {/* Headlamp Toggle */}
                <button
                  type="button"
                  onClick={() => setHeadlightOn(!headlightOn)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 backdrop-blur-md ${
                    headlightOn
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-950/80 border-white/15 text-slate-400'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{headlightOn ? 'BEAM ON' : 'BEAM OFF'}</span>
                </button>
              </div>
            </div>

            {/* Bottom HUD Colorway Switcher */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-xl z-10">
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                COLOR MATRIX:
              </span>
              <div className="flex items-center gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setColorway(c.hex)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      colorway === c.hex
                        ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                        : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-white/30" style={{ background: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════ RIGHT: IRON MAN HUD DIAGNOSTICS & TELEMETRY (5 COLS) ═══════════ */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Stage Selector Tabs (01 to 04) */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10">
              {HUD_STAGES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(idx)}
                  className={`py-2 px-1 rounded-lg text-center transition-all ${
                    activeStep === idx
                      ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-mono font-bold shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white font-mono'
                  }`}
                >
                  <span className="text-[10px] block opacity-70">STEP</span>
                  <span className="text-xs font-bold font-mono">0{s.id + 1}</span>
                </button>
              ))}
            </div>

            {/* Active Subsystem Info Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4"
              >
                <div>
                  <div className="inline-flex items-center gap-2 text-cyan-400 text-[11px] font-mono font-bold tracking-wider">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{currentStage.tag}</span>
                  </div>
                  <h3 className="text-2xl font-black font-heading text-white mt-1">
                    {currentStage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                    {currentStage.subtitle}
                  </p>
                </div>

                {/* Telemetry Metrics Readout */}
                <div className="space-y-2.5 pt-2 border-t border-cyan-500/20">
                  {currentStage.metrics.map((m, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-white/8 flex items-center justify-between font-mono"
                    >
                      <div>
                        <span className="text-[10px] text-slate-400 block">{m.label}</span>
                        <span className="text-xs font-bold text-white">{m.value}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons: Reserve GT 650 & Sound Simulator */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookNow(gt650Vehicle, 'fullday');
                }}
                className="w-full flex-1 min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all touch-manipulation select-none cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Instant Reserve (₹3,000/day)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAudioSimulated(!isAudioSimulated)}
                className={`py-3.5 px-4 rounded-2xl border transition-all flex items-center justify-center gap-2 text-xs font-mono ${
                  isAudioSimulated
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {isAudioSimulated ? <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                <span>{isAudioSimulated ? 'TWIN EXHAUST ACTIVE' : 'TEST SOUND'}</span>
              </button>
            </div>

            {/* JARVIS Status Footer */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Fleet Verified · UPES Bhauwala Hub
              </span>
              <span>ID: BBR-GT650-MK1</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
