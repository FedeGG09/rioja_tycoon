import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Html, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export type CropType = "vine" | "olive" | "idle";

export interface TileProps {
  id: string;
  position: [number, number, number];
  size: number;
  elevation: number;
  crop: CropType;
  production: number;
  moisture?: number;
  selected?: boolean;
  name?: string;
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

function WindPatch({ size, crop }: { size: number; crop: CropType }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} receiveShadow>
      <planeGeometry args={[size * 0.96, size * 0.96, 18, 18]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        uniforms={{
          uTime: { value: 0 },
          uStrength: { value: crop === "olive" ? 0.95 : 1.15 },
          uColor: { value: new THREE.Color(crop === "olive" ? "#8fc66a" : "#78b65a") },
        }}
        vertexShader={`
          uniform float uTime;
          uniform float uStrength;
          varying vec2 vUv;

          void main() {
            vUv = uv;
            vec3 p = position;
            float waveA = sin((p.x * 2.2) + (uTime * 1.7)) * 0.05;
            float waveB = cos((p.z * 1.7) + (uTime * 1.1)) * 0.045;
            float bend = (waveA + waveB) * uStrength;
            p.x += bend * uv.y;
            p.z += bend * 0.5 * uv.y;
            p.y += sin((p.x + p.z) * 2.0 + uTime * 2.2) * 0.02 * uv.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying vec2 vUv;

          void main() {
            float alpha = 0.06 + (1.0 - vUv.y) * 0.09;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  );
}

function VineyardRows({ size }: { size: number }) {
  const postRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);

  const { posts, leaves } = useMemo(() => {
    const posts: THREE.Matrix4[] = [];
    const leaves: THREE.Matrix4[] = [];
    const rows = 5;
    const cols = 10;
    const rowSpacing = size / 7.4;
    const colSpacing = size / 12;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -size * 0.38 + c * colSpacing;
        const z = -size * 0.3 + r * rowSpacing;
        posts.push(makeMatrix(x, 0.22, z, 0, 0, 0, 1));
        leaves.push(makeMatrix(x, 0.58, z, 0, 0, 0, 1));
      }
    }

    return { posts, leaves };
  }, [size]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (leafRef.current) {
      for (let i = 0; i < leafRef.current.count; i++) {
        const sway = Math.sin(t * 1.9 + i * 0.2) * 0.045;
        const x = (i % 10) * 0.92 - 4.6;
        const z = Math.floor(i / 10) * 0.96 - 1.9;
        leafRef.current.setMatrixAt(i, makeMatrix(x, 0.58, z, 0, sway, sway * 0.65, 1));
      }
      leafRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={postRef} args={[new THREE.CylinderGeometry(0.045, 0.055, 0.45, 6), undefined, posts.length]} castShadow receiveShadow>
        <meshStandardMaterial color={"#7f5a35"} roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={leafRef} args={[new THREE.BoxGeometry(0.55, 0.16, 0.32), undefined, leaves.length]} castShadow receiveShadow>
        <meshStandardMaterial color={"#587f3c"} roughness={1} metalness={0} />
      </instancedMesh>
    </group>
  );
}

function OliveGrid({ size }: { size: number }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const crownRef = useRef<THREE.InstancedMesh>(null);

  const { trunks, crowns } = useMemo(() => {
    const trunks: THREE.Matrix4[] = [];
    const crowns: THREE.Matrix4[] = [];
    const grid = 3;
    const gap = size / (grid + 1);

    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        const x = -size * 0.25 + c * gap;
        const z = -size * 0.25 + r * gap;
        trunks.push(makeMatrix(x, 0.24, z, 0, 0, 0, 1));
        crowns.push(makeMatrix(x, 0.84, z, 0, 0, 0, 1));
      }
    }

    return { trunks, crowns };
  }, [size]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (crownRef.current) {
      for (let i = 0; i < crownRef.current.count; i++) {
        const sway = Math.sin(t * 1.3 + i * 0.7) * 0.03;
        crownRef.current.setMatrixAt(i, makeMatrix(
          (i % 3) * 0.96 - 0.96,
          0.84,
          Math.floor(i / 3) * 0.96 - 0.96,
          sway * 0.3,
          sway,
          sway * 0.2,
          1,
        ));
      }
      crownRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[new THREE.CylinderGeometry(0.1, 0.13, 0.52, 6), undefined, trunks.length]} castShadow receiveShadow>
        <meshStandardMaterial color={"#6e4e36"} roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[new THREE.SphereGeometry(0.42, 14, 14), undefined, crowns.length]} castShadow receiveShadow>
        <meshStandardMaterial color={"#6d8f3f"} roughness={1} metalness={0.02} />
      </instancedMesh>
    </group>
  );
}

export default function Tile({
  position,
  size,
  elevation,
  crop,
  production,
  moisture = 0.5,
  selected = false,
  name = "Parcela",
}: TileProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.25 + position[0] * 0.05) * 0.02;
    groupRef.current.rotation.z = Math.sin(t * 0.35 + position[2] * 0.04) * 0.012;
  });

  const texture = useTexture("/textures/arid_ground_albedo.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);

  const label = crop === "vine" ? "VID" : crop === "olive" ? "OLIVOS" : "PARCELA";

  return (
    <group ref={groupRef} position={position}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.016, 0]} receiveShadow castShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          map={texture}
          color={selected ? "#90c366" : "#7a9d50"}
          roughness={1}
          metalness={0}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.018, 0]} receiveShadow>
        <planeGeometry args={[size * 0.98, size * 0.98]} />
        <meshStandardMaterial
          color={selected ? "#f4cf7a" : "#9cb765"}
          roughness={1}
          metalness={0}
          transparent
          opacity={0.09}
        />
      </mesh>

      <WindPatch size={size} crop={crop} />

      {crop === "vine" && <VineyardRows size={size} />}
      {crop === "olive" && <OliveGrid size={size} />}

      <Html position={[0, Math.max(1.25, elevation + 1.5), 0]} center distanceFactor={10} transform sprite>
        <div
          style={{
            minWidth: 180,
            padding: "10px 12px",
            borderRadius: 16,
            background: "rgba(14, 22, 34, 0.42)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 14px 35px rgba(0,0,0,0.22)",
            backdropFilter: "blur(16px)",
            color: "white",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 0.8, opacity: 0.78 }}>{label}</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{name}</div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{production} u/turno</div>
          <div style={{ fontSize: 11, opacity: 0.82, marginTop: 3 }}>
            cota {elevation.toFixed(1)} · humedad {(moisture * 100).toFixed(0)}%
          </div>
        </div>
      </Html>
    </group>
  );
}
