import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { terrainHeight } from "../lib/noise";
import { vehicleNames } from "../data/names";

function makeVehicle(name: string, kind: "tractor" | "harvester" | "truck") {
  return { name, kind };
}

function VehicleBody({ kind }: { kind: "tractor" | "harvester" | "truck" }) {
  const color = kind === "tractor" ? "#b84c35" : kind === "harvester" ? "#f0a72c" : "#6e767e";
  return (
    <group>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.7, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh position={[-0.25, 1.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.8, 0.9]} />
        <meshStandardMaterial color={"#2f3940"} roughness={0.72} metalness={0.1} />
      </mesh>
      <mesh position={[0.9, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.35, 1.0]} />
        <meshStandardMaterial color={"#a8b1b8"} roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[-0.95, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.22, 18]} />
        <meshStandardMaterial color={"#1f1f1f"} roughness={1} />
      </mesh>
      <mesh position={[0.95, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.22, 18]} />
        <meshStandardMaterial color={"#1f1f1f"} roughness={1} />
      </mesh>
      {kind !== "truck" ? (
        <>
          <mesh position={[-0.95, 0.35, 0.68]} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.25, 10]} />
            <meshStandardMaterial color={"#1f1f1f"} roughness={1} />
          </mesh>
          <mesh position={[0.95, 0.35, 0.68]} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.25, 10]} />
            <meshStandardMaterial color={"#1f1f1f"} roughness={1} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function Vehicle({ path, index, kind }: { path: THREE.CatmullRomCurve3; index: number; kind: "tractor" | "harvester" | "truck" }) {
  const groupRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => index * 0.17, [index]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = (clock.getElapsedTime() * 0.03 + phase) % 1;
    const pos = path.getPointAt(t);
    const ahead = path.getPointAt((t + 0.01) % 1);
    groupRef.current.position.set(pos.x, pos.y + 0.12, pos.z);
    groupRef.current.lookAt(ahead.x, ahead.y, ahead.z);
  });

  return (
    <group ref={groupRef}>
      <VehicleBody kind={kind} />
    </group>
  );
}

export default function Fleet() {
  const roadPath = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const t = i / 160;
      const z = THREE.MathUtils.lerp(-75, 75, t);
      const x = Math.sin(z * 0.05) * 28;
      const y = terrainHeight(x, z, 160) + 0.7;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const fieldPath = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const x = THREE.MathUtils.lerp(-55, 55, t);
      const z = Math.sin(x * 0.06) * 22 - 14;
      const y = terrainHeight(x, z, 160) + 0.62;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  return (
    <group>
      {[0, 1, 2].map((i) => (
        <Vehicle key={`tractor-${i}`} path={roadPath} index={i} kind="tractor" />
      ))}
      {[0, 1].map((i) => (
        <Vehicle key={`harvester-${i}`} path={fieldPath} index={i + 3} kind="harvester" />
      ))}

      <Html position={[-28, terrainHeight(-28, 0, 160) + 4.2, -6]} center transform sprite>
        <div style={{
          padding: "8px 10px",
          borderRadius: 12,
          background: "rgba(22, 30, 44, 0.40)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          backdropFilter: "blur(14px)",
          fontSize: 12
        }}>
          Flota activa · {vehicleNames.tractor[0]}
        </div>
      </Html>
    </group>
  );
}
