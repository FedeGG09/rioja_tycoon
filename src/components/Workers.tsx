import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { terrainHeight } from "../lib/noise";

function WorkerBody() {
  return (
    <group>
      <mesh position={[0, 1.18, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.16, 0.45, 4, 8]} />
        <meshStandardMaterial color={"#d2b08a"} roughness={1} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={"#f0c7a7"} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color={"#f2cf3f"} roughness={0.9} />
      </mesh>
      <mesh position={[-0.12, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.75, 8]} />
        <meshStandardMaterial color={"#41546a"} roughness={1} />
      </mesh>
      <mesh position={[0.12, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.75, 8]} />
        <meshStandardMaterial color={"#41546a"} roughness={1} />
      </mesh>
      <mesh position={[-0.22, 0.35, 0]} castShadow receiveShadow rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
        <meshStandardMaterial color={"#3f3330"} roughness={1} />
      </mesh>
      <mesh position={[0.22, 0.35, 0]} castShadow receiveShadow rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
        <meshStandardMaterial color={"#3f3330"} roughness={1} />
      </mesh>
    </group>
  );
}

function Worker({ position, phase }: { position: [number, number, number]; phase: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * 1.6 + phase) * 0.04;
    groupRef.current.rotation.y = Math.sin(t * 0.85 + phase) * 0.4;
  });

  return (
    <group ref={groupRef} position={position}>
      <WorkerBody />
    </group>
  );
}

export default function Workers() {
  const workers = useMemo(() => {
    const arr: { pos: [number, number, number]; phase: number }[] = [];
    const targets: [number, number][] = [
      [-16, -18],
      [-11, -12],
      [2, 12],
      [15, -4],
      [22, 16],
      [34, -10],
      [-38, 18],
      [46, -20],
    ];
    targets.forEach(([x, z], i) => {
      const y = terrainHeight(x, z, 160) + 0.15;
      arr.push({ pos: [x, y, z], phase: i * 0.9 });
    });
    return arr;
  }, []);

  return (
    <group>
      {workers.map((w, i) => (
        <Worker key={i} position={w.pos} phase={w.phase} />
      ))}

      <Html position={[18, terrainHeight(18, 16, 160) + 4.8, 16]} center transform sprite>
        <div style={{
          padding: "8px 10px",
          borderRadius: 12,
          background: "rgba(22, 30, 44, 0.40)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          backdropFilter: "blur(14px)",
          fontSize: 12
        }}>
          Cuadrilla de cosecha · turno activo
        </div>
      </Html>
    </group>
  );
}
