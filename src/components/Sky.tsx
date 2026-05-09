import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function Sky() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.getElapsedTime();
    const sunset = 0.5 + 0.5 * Math.sin(t * 0.035);
    matRef.current.uniforms.uSunset.value = sunset;
    matRef.current.uniforms.uSunY.value = 0.26 + 0.08 * Math.sin(t * 0.022);
  });

  return (
    <mesh scale={1200} renderOrder={-1000}>
      <sphereGeometry args={[1, 64, 48]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        toneMapped={false}
        uniforms={{
          uSunset: { value: 0.4 },
          uSunY: { value: 0.28 },
        }}
        vertexShader={`
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          precision highp float;
          varying vec3 vPos;
          uniform float uSunset;
          uniform float uSunY;

          vec3 mix3(vec3 a, vec3 b, float t) { return a + (b - a) * t; }

          void main() {
            float h = normalize(vPos).y * 0.5 + 0.5;
            vec3 dayTop = vec3(0.08, 0.33, 0.83);
            vec3 dayBottom = vec3(0.74, 0.88, 1.0);
            vec3 duskTop = vec3(0.14, 0.14, 0.33);
            vec3 duskBottom = vec3(1.0, 0.52, 0.16);

            vec3 day = mix3(dayBottom, dayTop, smoothstep(0.05, 1.0, h));
            vec3 dusk = mix3(duskBottom, duskTop, smoothstep(0.05, 1.0, h));
            vec3 color = mix(day, dusk, uSunset);

            vec3 sunDir = normalize(vec3(0.3, uSunY, 0.15));
            float sun = pow(max(dot(normalize(vPos), sunDir), 0.0), 220.0);
            float halo = pow(max(dot(normalize(vPos), sunDir), 0.0), 18.0);

            color += sun * mix(vec3(1.6, 1.15, 0.56), vec3(0.8, 0.6, 0.35), uSunset);
            color += halo * mix(vec3(0.45, 0.18, 0.05), vec3(0.12, 0.05, 0.02), uSunset);

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}
