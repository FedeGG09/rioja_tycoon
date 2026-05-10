import React, { Suspense, useMemo } from "react";
import { AdaptiveDpr, AdaptiveEvents, ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Html as DreiHtml } from "@react-three/drei";
import Sky from "../Sky";
import World from "../World";
import Tile from "../Tile";
import { IndustrialDistrict } from "../Buildings";
import Fleet from "../Vehicles";
import Workers from "../Workers";
import PostFX from "../PostFX";
import { terrainHeight } from "../../lib/noise";
import { useGame } from "../../game/useGame";
import { BUILDING_DEFS } from "../../game/definitions";

function DynamicBuildings() {
  const { state, tiles } = useGame();

  const positionedBuildings = useMemo(() => {
    return state.buildings
      .map((building) => {
        const tile = tiles.find((item) => item.id === building.tileId);
        if (!tile) return null;
        return { building, tile };
      })
      .filter(Boolean) as Array<{ building: (typeof state.buildings)[number]; tile: (typeof tiles)[number] }>;
  }, [state.buildings, tiles]);

  return (
    <group>
      {positionedBuildings.map(({ building, tile }) => {
        const def = BUILDING_DEFS[building.type];
        const y = tile.position[1] + 0.52 + building.level * 0.08;
        return (
          <group key={building.id} position={[tile.position[0], y, tile.position[2]]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[tile.size * 0.34, 0.6 + building.level * 0.12, tile.size * 0.34]} />
              <meshStandardMaterial color={def.color} roughness={0.8} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.45 + building.level * 0.04, 0]} castShadow>
              <boxGeometry args={[tile.size * 0.24, 0.24, tile.size * 0.24]} />
              <meshStandardMaterial color="#ffffff" roughness={0.85} metalness={0.02} />
            </mesh>
            <DreiHtml center position={[0, 1.02 + building.level * 0.1, 0]}>
              <div className="rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-lg">
                {building.type} · N{building.level}
              </div>
            </DreiHtml>
          </group>
        );
      })}
    </group>
  );
}

function ParcelGrid() {
  const { tiles, selectTile, state } = useGame();

  return (
    <group>
      {tiles.map((tile) => (
        <group
          key={tile.id}
          position={tile.position}
          onClick={(event) => {
            event.stopPropagation();
            selectTile(tile);
          }}
        >
          <Tile
            id={tile.id}
            position={tile.position}
            size={tile.size}
            elevation={tile.elevation}
            crop={tile.crop}
            production={tile.production}
            moisture={tile.moisture}
            selected={state.selectedTile?.id === tile.id}
            name={tile.name}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} visible={false}>
            <planeGeometry args={[tile.size, tile.size]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          {state.selectedTile?.id === tile.id ? (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
              <ringGeometry args={[tile.size * 0.34, tile.size * 0.46, 32]} />
              <meshBasicMaterial color="#f4d35e" transparent opacity={0.95} side={2} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}

function SceneCore() {
  return (
    <>
      <Sky />
      <World />
      <ParcelGrid />
      <IndustrialDistrict />
      <DynamicBuildings />
      <Fleet />
      <Workers />
      <ContactShadows opacity={0.32} scale={50} blur={2.4} far={20} />
      <PostFX />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={54}
        maxDistance={180}
        minPolarAngle={0.28}
        maxPolarAngle={1.2}
        target={[0, 0, 0]}
      />
    </>
  );
}

export default function ParcelScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [52, 64, 80], fov: 48 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#0b1220"]} />
        <fog attach="fog" args={["#0b1220", 120, 240]} />
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <SceneCore />
        </Suspense>
      </Canvas>
    </div>
  );
}
