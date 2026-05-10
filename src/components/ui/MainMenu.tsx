import React from "react";
import { Play, RotateCcw, Download } from "lucide-react";
import { useGame } from "../../game/useGame";

export default function MainMenu() {
  const { startGame, resetGame, exportSave } = useGame();

  const handleDownload = () => {
    const payload = exportSave();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rioja-tycoon-save.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-[min(92vw,760px)] rounded-3xl border border-white/10 bg-zinc-950/90 p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/80">Rioja Tycoon</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
          Tycoon del vino, la tierra y la logística.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
          Construí viñedos, bodegas, depósitos y casas. Hacé crecer la economía día a día sobre
          la escena 3D ya existente.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <button
            onClick={startGame}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 font-semibold text-black transition hover:bg-yellow-200"
          >
            <Play className="h-4 w-4" />
            Jugar
          </button>
          <button
            onClick={resetGame}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Nuevo inicio
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
            Exportar save
          </button>
        </div>
      </div>
    </div>
  );
}
