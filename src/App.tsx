import React from "react";
import { GameProvider, useGameContext } from "./game/GameProvider";
import ParcelScene from "./components/game/ParcelScene";
import MainMenu from "./components/ui/MainMenu";
import HUD from "./components/ui/HUD";
import BuildMenu from "./components/ui/BuildMenu";
import PauseMenu from "./components/ui/PauseMenu";

function GameLayer() {
  const { state } = useGameContext();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#08111c] text-white">
      <ParcelScene />
      <HUD />
      <BuildMenu />
      {state.phase === "menu" ? <MainMenu /> : null}
      {(state.isPaused || state.phase === "menu") ? <PauseMenu /> : null}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameLayer />
    </GameProvider>
  );
}
