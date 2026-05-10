import React, { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  OrbitControls,
  Html,
  ContactShadows,
} from "@react-three/drei";

import Sky from "./Sky";
import World from "./World";
import Tile, { type CropType } from "./Tile";
import { IndustrialDistrict } from "./Buildings";
import Fleet from "./Vehicles";
import Workers from "./Workers";
import PostFX from "./PostFX";
import { terrainHeight, fbm } from "../lib/noise";
import { provinceNames } from "../data/names";

function SceneBadge() {
  return (
    <Html position={[0, 14, 0]} center distanceFactor={10} transform sprite>
      <div
        style={{
          minWidth: 260,
          padding: "14px 16px",
          borderRadius: 18,
          background: "rgba(12, 22, 36, 0.38)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
          backdropFilter: "blur(16px)",
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 0.8, opacity: 0.78 }}>LA RIOJA AGRO-TYCOON</div>
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 5 }}>Cinemática agro-industrial</div>
        <div style={{ fontSize: 12, opacity: 0.82, marginTop: 6 }}>
          Terreno procedural, viñedos, olivares, bodegas, plantas y logística.
        </div>
      </div>
    </Html>
  );
}

function ParcelGrid() {
  const tiles = useMemo(() => {
    const items: {
      id: string;
      position: [number, number, number];
      size: number;
      elevation: number;
      crop: CropType;
      production: number;
      moisture: number;
      selected?: boolean;
      name: string;
    }[] = [];
    const count = 8;
    const tileSize = 12.0;
    const start = -((count - 1) * tileSize) / 2;

    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        const x = start + col * tileSize;
        const z = start + row * tileSize + (row % 2 === 0 ? 0 : 1.2);
        const elevation = terrainHeight(x, z, 160);
        const crop: CropType = row % 3 === 0 || col % 4 === 0 ? "vine" : "olive";
        const production = Math.round((crop === "vine" ? 95 : 42) + fbm(x, z, 123, 3) * (crop === "vine" ? 55 : 20));
        const moisture = Math.max(0.18, Math.min(0.95, 0.28 + fbm(x * 0.4, z * 0.4, 55, 4) * 0.58));
        items.push({
          id: `tile-${row}-${col}`,
          position: [x, elevation + 0.06, z],
          size: tileSize * 0.92,
          elevation,
          crop,
          production,
          moisture,
          selected: row === 3 && col === 4,
          name: `${provinceNames[(row * count + col) % provinceNames.length]} ${crop === "vine" ? "Vides" : "Olivares"}`,
        });
      }
    }
    return items;
  }, []);

  return (
    <group>
      {tiles.map((tile) => (
        <Tile key={tile.id} {...tile} />
      ))}
    </group>
  );
}

export default function Scene3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#bfd9ec" }}>
      <Canvas
        shadows
        orthographic
        camera={{ position: [42, 40, 42], zoom: 48, near: 0.1, far: 500 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Sky />
          <ambientLight intensity={0.42} />
          <hemisphereLight intensity={0.52} skyColor={"#9bd0ff"} groundColor={"#6f5636"} />
          <directionalLight
            castShadow
            position={[34, 42, 18]}
            intensity={2.3}
            color={"#ffd8ad"}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={1}
            shadow-camera-far={160}
            shadow-camera-left={-72}
            shadow-camera-right={72}
            shadow-camera-top={72}
            shadow-camera-bottom={-72}
          />
          <directionalLight position={[-18, 22, -14]} intensity={0.55} color={"#8cc8ff"} />

          <World size={160} segments={220} />
          <ParcelGrid />
          <IndustrialDistrict />
          <Fleet />
          <Workers />

          <ContactShadows
            position={[0, -0.03, 0]}
            opacity={0.34}
            scale={120}
            blur={2.6}
            far={24}
            resolution={1024}
          />
          <SceneBadge />

          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom
            enableRotate
            minPolarAngle={0.82}
            maxPolarAngle={1.08}
            minAzimuthAngle={-0.95}
            maxAzimuthAngle={0.95}
            minZoom={28}
            maxZoom={78}
            zoomSpeed={0.55}
            rotateSpeed={0.45}
            target={[0, 2.3, 0]}
          />
          <PostFX />
        </Suspense>
      </Canvas>
    </div>
  );
}
