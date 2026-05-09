import React from "react";
import { EffectComposer, Bloom, SSAO, Vignette, ColorCorrection } from "@react-three/postprocessing";

export default function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.45} luminanceThreshold={0.24} luminanceSmoothing={0.16} />
      <SSAO samples={16} radius={0.32} intensity={26} luminanceInfluence={0.16} bias={0.04} />
      <Vignette eskil={false} offset={0.16} darkness={0.92} />
      <ColorCorrection powRGB={[1.02, 1.0, 0.98]} mulRGB={[1.07, 0.98, 0.92]} />
    </EffectComposer>
  );
}
