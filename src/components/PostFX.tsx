import React from "react";
import { EffectComposer, Bloom, SSAO, Vignette, BrightnessContrast, HueSaturation, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export default function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <ToneMapping
        blendFunction={BlendFunction.NORMAL}
        adaptive={true}
        resolution={256}
        middleGrey={0.6}
        maxLuminance={16}
        averageLuminance={1}
        adaptationRate={1}
      />

      <Bloom
        intensity={0.38}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.18}
      />

      <SSAO
        samples={16}
        rings={4}
        distanceThreshold={0.15}
        distanceFalloff={0.25}
        rangeThreshold={0.5}
        intensity={24}
        bias={0.04}
      />

      <BrightnessContrast
        brightness={0.02}
        contrast={0.08}
      />

      <HueSaturation
        hue={-0.02}
        saturation={0.06}
      />

      <Vignette
        eskil={false}
        offset={0.15}
        darkness={0.92}
      />
    </EffectComposer>
  );
}