import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Html, useTexture } from "@react-three/drei";
import { terrainColorForHeight, terrainHeight, clamp } from "../lib/noise";

type TerrainProps = {
  size?: number;
  segments?: number;
};

function useTerrainTextures() {
  const textures = useTexture([
    "/textures/arid_ground_albedo.png",
    "/textures/gravel_road_albedo.png",
    "/textures/vineyard_albedo.png",
    "/textures/concrete_albedo.png",
    "/textures/corrugated_metal_albedo.png",
    "/textures/clay_tiles_albedo.png",
    "/textures/olive_leaf_albedo.png",
    "/textures/water_albedo.png",
    "/textures/road_marking.png",
    "/textures/roof_shadow.png",
    "/textures/sand_albedo.png",
  ]);

  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
  });

  const [arid, road, vineyard, concrete, metal, clay, olive, water, roadMark, roofShadow, sand] = textures;
  road.repeat.set(8, 8);
  arid.repeat.set(16, 16);
  vineyard.repeat.set(12, 12);
  concrete.repeat.set(6, 6);
  metal.repeat.set(4, 4);
  clay.repeat.set(6, 6);
  olive.repeat.set(8, 8);
  water.repeat.set(5, 5);
  roadMark.repeat.set(1, 1);
  roofShadow.repeat.set(4, 4);
  sand.repeat.set(10, 10);

  return { arid, road, vineyard, concrete, metal, clay, olive, water, roadMark, roofShadow, sand };
}

function makeMatrix(x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, s = 1) {
  const m = new THREE.Matrix4();
  m.compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(s, s, s),
  );
  return m;
}

function TerrainMesh({ size, segments }: TerrainProps) {
  const textures = useTerrainTextures();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainHeight(x, z, size);
      pos.setY(i, h);

      const [r, g, b] = terrainColorForHeight(h);
      const slope =
        Math.abs(terrainHeight(x + 0.5, z, size) - terrainHeight(x - 0.5, z, size)) +
        Math.abs(terrainHeight(x, z + 0.5, size) - terrainHeight(x, z - 0.5, size));
      const slopeBoost = clamp(slope / 6, 0, 1);
      const tint = new THREE.Color(r, g, b).lerp(new THREE.Color("#456b2d"), 0.08 + slopeBoost * 0.12);
      colors.push(tint.r, tint.g, tint.b);
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [size, segments]);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={1}
        metalness={0}
        map={textures.arid}
        roughnessMap={textures.sand}
      />
    </mesh>
  );
}

function River({ size }: { size: number }) {
  const curve = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i <= 260; i++) {
      const t = i / 260;
      const z = THREE.MathUtils.lerp(-size * 0.5, size * 0.5, t);
      const x = Math.sin(z * 0.05) * size * 0.18 + Math.cos(z * 0.018) * 2.0 - 2.2;
      const y = terrainHeight(x, z, size) - 0.55;
      arr.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(arr);
  }, [size]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 260, 1.45, 14, false]} />
      <meshPhysicalMaterial
        color={"#3f88bb"}
        transmission={0.26}
        roughness={0.12}
        thickness={1.2}
        ior={1.33}
        clearcoat={0.4}
        clearcoatRoughness={0.2}
      />
    </mesh>
  );
}

function RoadRibbon({ size }: { size: number }) {
  const points = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i <= 220; i++) {
      const t = i / 220;
      const z = THREE.MathUtils.lerp(-size * 0.5, size * 0.5, t);
      const x = Math.sin(z * 0.05) * size * 0.18 + Math.cos(z * 0.018) * 2.0;
      const y = terrainHeight(x, z, size) + 0.22;
      arr.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(arr);
  }, [size]);

  const bridgeMid = useMemo(() => points.getPoint(0.52), [points]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[points, 220, 1.55, 10, false]} />
        <meshStandardMaterial color={"#2c2d30"} roughness={1} metalness={0.01} />
      </mesh>

      <mesh>
        <tubeGeometry args={[points, 220, 1.72, 10, false]} />
        <meshStandardMaterial color={"#202124"} roughness={1} metalness={0} transparent opacity={0.38} />
      </mesh>

      <mesh position={[bridgeMid.x, bridgeMid.y + 0.1, bridgeMid.z]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[10, 0.7, 3.9]} />
        <meshStandardMaterial color={"#a6a0a0"} roughness={0.72} metalness={0.12} />
      </mesh>

      <group position={[bridgeMid.x, bridgeMid.y - 0.95, bridgeMid.z]}>
        {[-3.8, -1.25, 1.25, 3.8].map((x, idx) => (
          <mesh key={idx} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.34, 2.2, 8]} />
            <meshStandardMaterial color={"#6c5d53"} roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function FieldStrips({ size }: { size: number }) {
  const rows = useMemo(() => {
    const list: { position: [number, number, number]; rotation: [number, number, number]; crop: "vine" | "olive" }[] = [];
    for (let i = 0; i < 20; i++) {
      const x = -size * 0.38 + i * (size * 0.038);
      const z = -size * 0.32 + (i % 5) * 4.2;
      list.push({
        position: [x, terrainHeight(x, z, size) + 0.05, z],
        rotation: [0, 0.02 * ((i % 2) - 0.5), 0],
        crop: i % 4 === 0 ? "olive" : "vine",
      });
    }
    return list;
  }, [size]);

  return (
    <group>
      {rows.map((row, idx) => (
        <mesh
          key={idx}
          position={row.position}
          rotation={[-Math.PI / 2, row.rotation[1], row.rotation[2]]}
          receiveShadow
        >
          <planeGeometry args={[3.2, 26]} />
          <meshStandardMaterial color={row.crop === "vine" ? "#78a74f" : "#708b45"} roughness={1} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

function RocksAndShrubs({ size }: { size: number }) {
  const rockRef = useRef<THREE.InstancedMesh>(null);
  const shrubRef = useRef<THREE.InstancedMesh>(null);

  const rockMatrices = useMemo(() => {
    const items: THREE.Matrix4[] = [];
    for (let i = 0; i < 160; i++) {
      const x = (Math.random() - 0.5) * size * 0.88;
      const z = (Math.random() - 0.5) * size * 0.88;
      const h = terrainHeight(x, z, size);
      if (h < -0.4 || h > 10) continue;
      if (Math.random() > 0.82) continue;
      const s = 0.2 + Math.random() * 0.9;
      items.push(makeMatrix(x, h + 0.05, z, Math.random(), Math.random(), Math.random(), s));
    }
    return items;
  }, [size]);

  const shrubMatrices = useMemo(() => {
    const items: THREE.Matrix4[] = [];
    for (let i = 0; i < 640; i++) {
      const x = (Math.random() - 0.5) * size * 0.92;
      const z = (Math.random() - 0.5) * size * 0.92;
      const h = terrainHeight(x, z, size);
      const slope =
        Math.abs(terrainHeight(x + 1, z, size) - terrainHeight(x - 1, z, size)) +
        Math.abs(terrainHeight(x, z + 1, size) - terrainHeight(x, z - 1, size));
      if (h < -0.3 || slope > 4.5) continue;
      if (Math.random() > 0.78) continue;
      items.push(makeMatrix(x, h + 0.03, z, 0, Math.random() * Math.PI, 0, 0.18 + Math.random() * 0.24));
    }
    return items;
  }, [size]);

  useEffect(() => {
    if (rockRef.current) {
      rockMatrices.forEach((m, i) => rockRef.current?.setMatrixAt(i, m));
      rockRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [rockMatrices]);

  useEffect(() => {
    if (shrubRef.current) {
      shrubMatrices.forEach((m, i) => shrubRef.current?.setMatrixAt(i, m));
      shrubRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [shrubMatrices]);

  return (
    <group>
      <instancedMesh ref={rockRef} args={[new THREE.DodecahedronGeometry(1, 0), undefined, rockMatrices.length]} castShadow receiveShadow>
        <meshStandardMaterial color={"#8c7d6d"} roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={shrubRef} args={[new THREE.SphereGeometry(1, 6, 5), undefined, shrubMatrices.length]} castShadow receiveShadow>
        <meshStandardMaterial color={"#7a9b52"} roughness={1} metalness={0} />
      </instancedMesh>
    </group>
  );
}

function RoadSigns({ size }: { size: number }) {
  return (
    <group>
      <Html position={[size * 0.28, terrainHeight(size * 0.28, 0, size) + 3.2, 0]} center transform sprite>
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 12,
            background: "rgba(20, 30, 45, 0.45)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
            backdropFilter: "blur(14px)",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          Ruta 40 · Valle del Bermejo
        </div>
      </Html>
    </group>
  );
}

export default function World({ size = 160, segments = 240 }: TerrainProps) {
  return (
    <group>
      <TerrainMesh size={size} segments={segments} />
      <River size={size} />
      <RoadRibbon size={size} />
      <FieldStrips size={size} />
      <RocksAndShrubs size={size} />
      <RoadSigns size={size} />
    </group>
  );
}
