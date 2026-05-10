import React, { useRef } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw, Upload } from "lucide-react";
import { useGame } from "../../game/useGame";
import { SAVE_STORAGE_KEY } from "../../game/definitions";
import type { SaveGamePayload } from "../../game/types";

export default function PauseMenu() {
  const { state, togglePause, resetGame, loadFromJson } = useGame();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const payload = JSON.parse(text) as SaveGamePayload;
    loadFromJson(payload);
  };

  const handleLoadLocal = () => {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return;
    const payload = JSON.parse(raw) as SaveGamePayload;
    loadFromJson(payload);
  };

  if (!state.isPaused && state.phase === "playing") return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-[min(92vw,600px)] rounded-3xl border border-white/10 bg-zinc-950/95 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-300/80">Sistema</p>
            <h2 className="mt-1 text-3xl font-black">
              {state.phase === "menu" ? "Menú principal" : "Pausa"}
            </h2>
          </div>
          <Loader2 className="h-5 w-5 text-yellow-300/80" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            onClick={togglePause}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 font-semibold text-black transition hover:bg-yellow-200"
          >
            <Play className="h-4 w-4" />
            {state.phase === "menu" ? "Volver al juego" : "Reanudar"}
          </button>
          <button
            onClick={resetGame}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar partida
          </button>
          <button
            onClick={handleLoadLocal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <CheckCircle2 className="h-4 w-4" />
            Cargar autosave
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <Upload className="h-4 w-4" />
            Importar JSON
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </div>
  );
}
