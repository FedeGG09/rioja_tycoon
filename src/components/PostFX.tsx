import React from "react";
import { EffectComposer, Bloom, Vignette, SSAO } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export default function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <SSAO
        blendFunction={BlendFunction.MULTIPLY}
        samples={12}
        radius={0.18}
        intensity={22}
        luminanceInfluence={0.65}
        color="black"
      />
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.86}
        height={300}
      />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
}
