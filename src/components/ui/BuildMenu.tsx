import React from "react";
import { Hammer, ArrowUp, FlaskConical } from "lucide-react";
import { BUILDING_DEFS } from "../../game/definitions";
import type { BuildingType } from "../../game/types";
import { useGame } from "../../game/useGame";

export default function BuildMenu() {
  const {
    state,
    build,
    upgradeSelected,
    selectBuildType,
    buildOptions,
    selectedBuilding,
  } = useGame();

  const isBuildPhase = state.phase === "playing" && !state.isPaused;

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-30 w-[min(94vw,420px)] rounded-3xl border border-white/10 bg-black/55 p-4 text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-300/80">Construcción</p>
          <h3 className="mt-1 text-xl font-black">Edificios</h3>
        </div>
        <FlaskConical className="h-5 w-5 text-yellow-300/80" />
      </div>

      <div className="mt-4 grid gap-2">
        {buildOptions.map((option) => (
          <button
            key={option.type}
            disabled={!isBuildPhase || option.disabled}
            onClick={() => {
              selectBuildType(option.type);
              build(option.type);
            }}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-white">{option.label}</div>
                <div className="mt-1 text-xs text-white/60">
                  Coste ${option.cost} · Workers {option.workersRequired}
                </div>
              </div>
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: option.color }}
              />
            </div>
            {option.reason ? (
              <div className="mt-2 text-xs text-white/55">{option.reason}</div>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-white/70">Tile actual</span>
          <span className="text-sm font-semibold text-white">{state.selectedTile?.name ?? "Ninguno"}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-sm text-white/70">Edificio</span>
          <span className="text-sm font-semibold text-white">
            {selectedBuilding ? `${selectedBuilding.type} niv. ${selectedBuilding.level}` : "Vacío"}
          </span>
        </div>

        <button
          onClick={upgradeSelected}
          disabled={!isBuildPhase || !selectedBuilding}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-3 py-2 text-sm font-semibold text-black transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ArrowUp className="h-4 w-4" />
          Mejorar edificio
        </button>
      </div>
    </div>
  );
}
