import React from "react";
import { Pause, Play, Save } from "lucide-react";
import { useGame } from "../../game/useGame";
import { WEATHER_LABELS } from "../../game/definitions";

export default function HUD() {
  const {
    state,
    togglePause,
    saveToLocalStorage,
    dismissNotification,
    selectedTileBuilding,
    selectedBuilding,
  } = useGame();

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div className="pointer-events-auto absolute left-4 top-4 w-[min(94vw,420px)] rounded-3xl border border-white/10 bg-black/55 p-4 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-300/80">Estado</p>
            <h2 className="mt-1 text-2xl font-black">Día {state.day}</h2>
          </div>

          <button
            onClick={() => {
              togglePause();
            }}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            {state.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {state.isPaused ? "Reanudar" : "Pausar"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Metric label="Dinero" value={`$${Math.round(state.money)}`} />
          <Metric label="Vino" value={`${state.wine.toFixed(1)} u`} />
          <Metric label="Uva" value={`${state.grapes.toFixed(1)} u`} />
          <Metric label="Workers" value={`${state.workers}`} />
          <Metric label="Clima" value={WEATHER_LABELS[state.weather]} />
          <Metric label="Capacidad" value={`${Math.round(state.storageUsed)}/${Math.round(state.storageCapacity)}`} />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/75">
          <div className="flex items-center justify-between gap-3">
            <span>Parcela</span>
            <span className="font-semibold text-white">{state.selectedTile?.name ?? "Ninguna"}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span>Edificio</span>
            <span className="font-semibold text-white">
              {selectedBuilding ? `${selectedBuilding.type} niv. ${selectedBuilding.level}` : "Vacío"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span>Producción</span>
            <span className="font-semibold text-white">
              {selectedTileBuilding ? `${selectedTileBuilding.production} / turno` : "—"}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={saveToLocalStorage}
            className="pointer-events-auto inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-3 py-2 text-sm font-semibold text-black transition hover:bg-yellow-200"
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
        </div>
      </div>

      <div className="pointer-events-auto absolute right-4 top-4 flex max-w-[320px] flex-col gap-2">
        {state.notifications.map((note) => (
          <button
            key={note.id}
            onClick={() => dismissNotification(note.id)}
            className="rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-left text-sm text-white shadow-xl backdrop-blur-md"
          >
            <span className="block text-[10px] uppercase tracking-[0.3em] text-yellow-300/70">
              {note.kind}
            </span>
            <span className="mt-1 block leading-5 text-white/90">{note.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">{label}</div>
      <div className="mt-1 text-base font-semibold text-white">{value}</div>
    </div>
  );
}
