import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { factoryNames, siloNames, wineryNames, type SiteLabel } from "../data/names";
import { terrainHeight, fbm } from "../lib/noise";

type SiteKind = SiteLabel["kind"];

type Site = {
  id: string;
  kind: SiteKind;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
};

function BuildingPlate({ kind, size = 1 }: { kind: SiteKind; size?: number }) {
  const color =
    kind === "winery" ? "#b08759" :
    kind === "factory" ? "#7c8187" :
    kind === "silo" ? "#8c8f92" :
    "#9a7f5d";

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} receiveShadow>
      <boxGeometry args={[size, 0.1, size * 0.9]} />
      <meshStandardMaterial color={color} roughness={1} metalness={0.02} />
    </mesh>
  );
}

function Winery({ scale = 1 }: { scale?: number }) {
  const roofRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (roofRef.current) roofRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.6) * 0.01;
  });

  return (
    <group scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 1.8, 5.2]} />
        <meshStandardMaterial color={"#a77f57"} roughness={0.95} metalness={0.03} />
      </mesh>
      <mesh position={[2.7, 1.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.2, 4.4]} />
        <meshStandardMaterial color={"#9a6d43"} roughness={0.98} metalness={0.02} />
      </mesh>
      <mesh ref={roofRef} position={[0, 2.0, 0]} castShadow receiveShadow>
        <coneGeometry args={[4.8, 2, 4]} />
        <meshStandardMaterial color={"#6f4534"} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[-2.7, 1.5, -1.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 3, 6]} />
        <meshStandardMaterial color={"#f1e7d4"} roughness={1} />
      </mesh>
      <mesh position={[-2.5, 1.45, 1.7]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 2.9, 6]} />
        <meshStandardMaterial color={"#efe4c7"} roughness={1} />
      </mesh>
    </group>
  );
}

function Factory({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.4, 2.0, 5.8]} />
        <meshStandardMaterial color={"#7f848a"} roughness={1} metalness={0.07} />
      </mesh>
      <mesh position={[-2.8, 1.55, 1.8]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 3.1, 2.2]} />
        <meshStandardMaterial color={"#90959b"} roughness={1} metalness={0.08} />
      </mesh>
      <mesh position={[3.3, 1.95, -1.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.55, 4, 8]} />
        <meshStandardMaterial color={"#b4b8bd"} roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh position={[4.0, 4.1, -1.6]} castShadow receiveShadow>
        <coneGeometry args={[0.7, 1.2, 8]} />
        <meshStandardMaterial color={"#6a6f73"} roughness={1} />
      </mesh>
      <mesh position={[0.8, 1.65, 3.1]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.8, 0.7]} />
        <meshStandardMaterial color={"#545b62"} roughness={1} />
      </mesh>
    </group>
  );
}

function Silo({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      {[-1.4, 0, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 1.55, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.72, 0.82, 3.1, 12]} />
          <meshStandardMaterial color={"#c4c7c9"} roughness={0.9} metalness={0.05} />
        </mesh>
      ))}
      <mesh position={[0, 3.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 0.35, 1.3]} />
        <meshStandardMaterial color={"#90969b"} roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[0, 4.1, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.4, 0.9, 4]} />
        <meshStandardMaterial color={"#8a8f94"} roughness={1} />
      </mesh>
    </group>
  );
}

function FarmDepot({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 1.6, 3.8]} />
        <meshStandardMaterial color={"#a48764"} roughness={1} metalness={0.01} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
        <coneGeometry args={[3.2, 1.4, 4]} />
        <meshStandardMaterial color={"#8f5833"} roughness={1} />
      </mesh>
    </group>
  );
}

export function IndustrialDistrict() {
  const sites = useMemo<Site[]>(() => {
    const items: Site[] = [];

    const add = (kind: SiteKind, name: string, x: number, z: number, rot = 0, scale = 1) => {
      const y = terrainHeight(x, z, 160) + 0.08;
      items.push({
        id: `${kind}-${name}-${x}-${z}`,
        kind,
        name,
        position: [x, y, z],
        rotation: [0, rot, 0],
        scale,
      });
    };

    add("winery", wineryNames[0], -38, -18, 0.22, 1.18);
    add("winery", wineryNames[3], -22, 10, -0.18, 1.1);
    add("winery", wineryNames[7], 26, -12, 0.12, 1.2);
    add("winery", wineryNames[10], 34, 16, -0.1, 1.05);

    add("factory", factoryNames[0], 48, -18, 0.04, 1.12);
    add("factory", factoryNames[1], 40, 26, -0.2, 1.04);
    add("factory", factoryNames[4], -52, 22, 0.12, 1.1);

    add("silo", siloNames[0], -46, -32, 0.02, 1.12);
    add("silo", siloNames[2], 14, 38, -0.08, 1.2);
    add("silo", siloNames[5], -8, 44, 0.14, 1.0);

    add("farm", "Finca Los Viñedos del Oeste", -60, 4, 0.0, 1.08);
    add("farm", "Establecimiento del Bermejo", 12, -44, 0.08, 1.0);
    add("farm", "Campo San Martín", 58, 8, -0.06, 1.0);

    return items;
  }, []);

  return (
    <group>
      {sites.map((site) => (
        <group key={site.id} position={site.position} rotation={site.rotation} scale={site.scale}>
          <BuildingPlate kind={site.kind} size={site.kind === "silo" ? 8.5 : site.kind === "factory" ? 10 : 9} />
          {site.kind === "winery" && <Winery scale={1} />}
          {site.kind === "factory" && <Factory scale={1} />}
          {site.kind === "silo" && <Silo scale={1} />}
          {site.kind === "farm" && <FarmDepot scale={1} />}

          <Html position={[0, 4.8, 0]} center distanceFactor={12} transform sprite>
            <div style={{
              minWidth: 190,
              padding: "10px 12px",
              borderRadius: 16,
              background: "rgba(17, 26, 40, 0.44)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 14px 28px rgba(0,0,0,0.24)",
              backdropFilter: "blur(16px)",
              color: "white",
              fontFamily: "Inter, system-ui, sans-serif"
            }}>
              <div style={{fontSize: 11, opacity: 0.76, letterSpacing: 0.7}}>
                {site.kind === "winery" ? "BODEGA" : site.kind === "factory" ? "PLANTA" : site.kind === "silo" ? "SILO" : "ESTABLECIMIENTO"}
              </div>
              <div style={{fontWeight: 700, marginTop: 3, fontSize: 16}}>{site.name}</div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
