import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { fbm, terrainHeight } from "../lib/noise";
import { provinceNames } from "../data/names";
import {
  BUILDING_DEFS,
  GRID_COUNT,
  SAVE_STORAGE_KEY,
  TILE_SIZE,
  WEATHER_LABELS,
  WEATHER_MULTIPLIER,
  WINE_PRICE_PER_UNIT,
} from "./definitions";
import type {
  Building,
  BuildingType,
  GamePhase,
  GameState,
  GameTile,
  SaveGamePayload,
  WeatherType,
} from "./types";

type GameAction =
  | { type: "SELECT_TILE"; tile: GameTile | null }
  | { type: "SELECT_BUILD_TYPE"; buildType: BuildingType | null }
  | { type: "START_GAME" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "RESET_GAME" }
  | { type: "LOAD_GAME"; payload: SaveGamePayload }
  | { type: "BUILD"; buildType: BuildingType }
  | { type: "UPGRADE_SELECTED" }
  | { type: "TICK" }
  | { type: "ENQUEUE"; text: string; kind?: "info" | "success" | "warning" | "error" }
  | { type: "DISMISS_NOTIFICATION"; id: string };

interface GameContextValue {
  state: GameState;
  tiles: GameTile[];
  selectedBuilding: Building | null;
  selectedTileBuilding: Building | null;
  buildOptions: Array<{
    type: BuildingType;
    label: string;
    cost: number;
    upgradeCost: number;
    workersRequired: number;
    color: string;
    disabled: boolean;
    reason?: string;
  }>;
  startGame: () => void;
  resetGame: () => void;
  togglePause: () => void;
  selectTile: (tile: GameTile | null) => void;
  selectBuildType: (buildType: BuildingType | null) => void;
  build: (buildType: BuildingType) => void;
  upgradeSelected: () => void;
  tick: () => void;
  saveToLocalStorage: () => void;
  exportSave: () => SaveGamePayload;
  loadFromJson: (payload: SaveGamePayload) => void;
  dismissNotification: (id: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTiles(): GameTile[] {
  const items: GameTile[] = [];
  const start = -((GRID_COUNT - 1) * TILE_SIZE) / 2;

  for (let row = 0; row < GRID_COUNT; row++) {
    for (let col = 0; col < GRID_COUNT; col++) {
      const x = start + col * TILE_SIZE;
      const z = start + row * TILE_SIZE + (row % 2 === 0 ? 0 : 1.2);
      const elevation = terrainHeight(x, z, 160);
      const crop = row % 3 === 0 || col % 4 === 0 ? "vine" : "olive";
      const production = Math.round(
        (crop === "vine" ? 95 : 42) + fbm(x, z, 123, 3) * (crop === "vine" ? 55 : 20),
      );
      const moisture = clamp(0.28 + fbm(x * 0.4, z * 0.4, 55, 4) * 0.58, 0.18, 0.95);

      items.push({
        id: `tile-${row}-${col}`,
        row,
        col,
        position: [x, elevation + 0.06, z],
        size: TILE_SIZE * 0.92,
        elevation,
        crop,
        production,
        moisture,
        name: `${provinceNames[(row * GRID_COUNT + col) % provinceNames.length]} ${crop === "vine" ? "Vides" : "Olivares"}`,
      });
    }
  }

  return items;
}

function initialState(): GameState {
  return {
    money: 500,
    wine: 0,
    workers: 8,
    day: 1,
    selectedTile: null,
    buildings: [],
    isPaused: false,
    phase: "menu",
    selectedBuildType: null,
    grapes: 40,
    weather: "sunny",
    storageUsed: 0,
    storageCapacity: 120,
    notifications: [
      {
        id: randomId("msg"),
        text: "Rioja Tycoon listo para arrancar.",
        kind: "success",
      },
    ],
    lastEvent: "Arranque del proyecto",
  };
}

function serializeState(state: GameState, tiles: GameTile[]): SaveGamePayload {
  return {
    money: state.money,
    wine: state.wine,
    workers: state.workers,
    day: state.day,
    selectedTile: state.selectedTile,
    buildings: state.buildings,
    isPaused: state.isPaused,
    phase: state.phase,
    selectedBuildType: state.selectedBuildType,
    grapes: state.grapes,
    weather: state.weather,
    storageUsed: state.storageUsed,
    storageCapacity: state.storageCapacity,
    lastEvent: state.lastEvent,
    tiles,
  };
}

function buildFromSave(payload: SaveGamePayload): GameState {
  return {
    money: payload.money,
    wine: payload.wine,
    workers: payload.workers,
    day: payload.day,
    selectedTile: payload.selectedTile ?? null,
    buildings: payload.buildings,
    isPaused: payload.isPaused,
    phase: payload.phase,
    selectedBuildType: payload.selectedBuildType,
    grapes: payload.grapes,
    weather: payload.weather,
    storageUsed: payload.storageUsed,
    storageCapacity: payload.storageCapacity,
    notifications: [
      {
        id: randomId("msg"),
        text: "Partida cargada correctamente.",
        kind: "success",
      },
    ],
    lastEvent: payload.lastEvent,
  };
}

function deriveState(state: GameState, tiles: GameTile[]): GameState {
  const warehouseBonus = state.buildings
    .filter((b) => b.type === "Warehouse")
    .reduce((sum, building) => sum + BUILDING_DEFS.Warehouse.storageBonus * building.level, 0);

  return {
    ...state,
    storageCapacity: 120 + warehouseBonus,
    selectedTile: state.selectedTile
      ? tiles.find((tile) => tile.id === state.selectedTile?.id) ?? state.selectedTile
      : null,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_TILE":
      return {
        ...state,
        selectedTile: action.tile,
      };

    case "SELECT_BUILD_TYPE":
      return {
        ...state,
        selectedBuildType: action.buildType,
      };

    case "START_GAME":
      return {
        ...state,
        phase: "playing",
        isPaused: false,
        notifications: [
          ...state.notifications,
          {
            id: randomId("msg"),
            text: "La partida comenzó.",
            kind: "success",
          },
        ].slice(-6),
        lastEvent: "Juego iniciado",
      };

    case "TOGGLE_PAUSE":
      return {
        ...state,
        isPaused: !state.isPaused,
        phase: !state.isPaused ? "paused" : "playing",
        notifications: [
          ...state.notifications,
          {
            id: randomId("msg"),
            text: !state.isPaused ? "Juego en pausa." : "Juego reanudado.",
            kind: "info",
          },
        ].slice(-6),
      };

    case "RESET_GAME":
      return initialState();

    case "LOAD_GAME":
      return buildFromSave(action.payload);

    case "ENQUEUE":
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: randomId("msg"),
            text: action.text,
            kind: action.kind ?? "info",
          },
        ].slice(-6),
      };

    case "DISMISS_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((item) => item.id !== action.id),
      };

    case "BUILD": {
      const tile = state.selectedTile;
      if (!tile) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            {
              id: randomId("msg"),
              text: "Seleccioná una parcela para construir.",
              kind: "warning",
            },
          ].slice(-6),
        };
      }

      const existing = state.buildings.find((building) => building.tileId === tile.id);
      const def = BUILDING_DEFS[action.buildType];
      const cost = existing ? Math.round(def.upgradeCost * Math.max(1, existing.level)) : def.cost;

      if (state.money < cost) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            {
              id: randomId("msg"),
              text: `No alcanza el dinero para ${existing ? "mejorar" : "construir"} ${def.label}.`,
              kind: "error",
            },
          ].slice(-6),
        };
      }

      if (existing && existing.type !== action.buildType) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            {
              id: randomId("msg"),
              text: "Esa parcela ya tiene otro edificio. Elegí otra o mejorá el actual.",
              kind: "warning",
            },
          ].slice(-6),
        };
      }

      if (existing) {
        const upgraded: Building = {
          ...existing,
          level: existing.level + 1,
          production: existing.production + def.baseProduction,
          workersRequired: existing.workersRequired + def.workersRequired,
        };

        const updatedBuildings = state.buildings.map((building) =>
          building.id === existing.id ? upgraded : building,
        );

        const workersBonus = action.buildType === "House" ? def.workerBonus : 0;

        return {
          ...state,
          money: state.money - cost,
          workers: state.workers + workersBonus,
          buildings: updatedBuildings,
          notifications: [
            ...state.notifications,
            {
              id: randomId("msg"),
              text: `${def.label} mejorado al nivel ${upgraded.level}.`,
              kind: "success",
            },
          ].slice(-6),
          lastEvent: `Mejora de ${def.label}`,
        };
      }

      const building: Building = {
        id: randomId("building"),
        tileId: tile.id,
        type: action.buildType,
        level: 1,
        production: def.baseProduction,
        workersRequired: def.workersRequired,
        createdAt: Date.now(),
      };

      return {
        ...state,
        money: state.money - cost,
        workers: state.workers + (action.buildType === "House" ? def.workerBonus : 0),
        buildings: [...state.buildings, building],
        notifications: [
          ...state.notifications,
          {
            id: randomId("msg"),
            text: `${def.label} construido en ${tile.name}.`,
            kind: "success",
          },
        ].slice(-6),
        lastEvent: `Construcción de ${def.label}`,
      };
    }

    case "UPGRADE_SELECTED": {
      const tile = state.selectedTile;
      if (!tile) return state;
      const existing = state.buildings.find((building) => building.tileId === tile.id);
      if (!existing) return state;
      const def = BUILDING_DEFS[existing.type];
      const cost = Math.round(def.upgradeCost * existing.level);

      if (state.money < cost) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            {
              id: randomId("msg"),
              text: "No alcanza el dinero para mejorar.",
              kind: "error",
            },
          ].slice(-6),
        };
      }

      const upgraded: Building = {
        ...existing,
        level: existing.level + 1,
        production: existing.production + def.baseProduction,
        workersRequired: existing.workersRequired + def.workersRequired,
      };

      return {
        ...state,
        money: state.money - cost,
        buildings: state.buildings.map((building) =>
          building.id === existing.id ? upgraded : building,
        ),
        notifications: [
          ...state.notifications,
          {
            id: randomId("msg"),
            text: `${def.label} subió a nivel ${upgraded.level}.`,
            kind: "success",
          },
        ].slice(-6),
        lastEvent: `Mejora de ${def.label}`,
      };
    }

    case "TICK": {
      const weatherRoll = Math.random();
      let weather = state.weather;
      if (weatherRoll < 0.15) {
        const pool: WeatherType[] = ["sunny", "cloudy", "windy", "drought", "storm"];
        weather = pool[Math.floor(Math.random() * pool.length)];
      }

      const warehouseLevels = state.buildings
        .filter((building) => building.type === "Warehouse")
        .reduce((sum, building) => sum + building.level, 0);

      const vineyardBuildings = state.buildings.filter((building) => building.type === "Vineyard");
      const wineryBuildings = state.buildings.filter((building) => building.type === "Winery");
      const houseBuildings = state.buildings.filter((building) => building.type === "House");

      const totalWorkersRequired = state.buildings
        .filter((building) => building.type !== "House")
        .reduce((sum, building) => sum + building.workersRequired * building.level, 0);

      const workerFactor =
        totalWorkersRequired <= 0 ? 1 : clamp(state.workers / totalWorkersRequired, 0.25, 1);

      const weatherFactor = WEATHER_MULTIPLIER[weather];
      const grapeOutput = vineyardBuildings.reduce((sum, building) => {
        return sum + (building.production * building.level * workerFactor * weatherFactor) / 2;
      }, 0);

      const wineInputCapacity = wineryBuildings.reduce((sum, building) => {
        return sum + building.production * building.level * workerFactor;
      }, 0);

      const grapesAfterProduction = state.grapes + grapeOutput;
      const grapesUsed = Math.min(grapesAfterProduction, wineInputCapacity);
      const wineProduced = grapesUsed * 0.52;
      const remainingGrapes = grapesAfterProduction - grapesUsed;

      const rawWine = state.wine + wineProduced;
      const storageCapacity = 120 + warehouseLevels * BUILDING_DEFS.Warehouse.storageBonus;
      const storageUsed = clamp(remainingGrapes + rawWine, 0, storageCapacity);

      const maxSale = 10 + warehouseLevels * 4;
      const soldWine = Math.min(rawWine, maxSale);
      const moneyGain = soldWine * WINE_PRICE_PER_UNIT;

      const houseBonus = houseBuildings.reduce((sum, building) => {
        return sum + BUILDING_DEFS.House.workerBonus * building.level;
      }, 0);

      const weatherLabel = WEATHER_LABELS[weather];
      const eventText =
        weather !== state.weather
          ? `Clima: ${weatherLabel}.`
          : weather === "drought"
            ? "Baja la producción por sequía."
            : weather === "storm"
              ? "Tormenta sobre el valle."
              : "La producción sigue estable.";

      return {
        ...state,
        day: state.day + 1,
        money: Math.round(state.money + moneyGain),
        wine: Math.max(0, rawWine - soldWine),
        grapes: Math.max(0, remainingGrapes),
        workers: Math.max(state.workers, 4) + (houseBonus > 0 && state.workers < 20 ? 0 : 0),
        weather,
        storageCapacity,
        storageUsed: Math.round(storageUsed),
        notifications: [
          ...state.notifications,
          {
            id: randomId("msg"),
            text: `${eventText} +${Math.round(grapeOutput)} uva, +${Math.round(wineProduced)} vino, +$${Math.round(moneyGain)}.`,
            kind: weather === "storm" || weather === "drought" ? "warning" : "info",
          },
        ].slice(-6),
        lastEvent: eventText,
      };
    }

    default:
      return state;
  }
}

function useSafeLocalStorage() {
  return typeof window !== "undefined" ? window.localStorage : null;
}

function loadFromStorage(tiles: GameTile[]): GameState {
  const storage = useSafeLocalStorage();
  if (!storage) return initialState();

  try {
    const raw = storage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as SaveGamePayload;
    const state = buildFromSave(parsed);
    return deriveState(state, tiles);
  } catch {
    return initialState();
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const tiles = useMemo(() => createTiles(), []);
  const [state, dispatch] = useReducer(reducer, undefined, () => loadFromStorage(tiles));
  const initializedRef = useRef(false);

  const selectedTileBuilding = useMemo(
    () => (state.selectedTile ? state.buildings.find((building) => building.tileId === state.selectedTile?.id) ?? null : null),
    [state.buildings, state.selectedTile],
  );

  const selectedBuilding = selectedTileBuilding;

  const buildOptions = useMemo(() => {
    const occupied = state.selectedTile
      ? state.buildings.find((building) => building.tileId === state.selectedTile?.id) ?? null
      : null;

    return (Object.keys(BUILDING_DEFS) as BuildingType[]).map((type) => {
      const def = BUILDING_DEFS[type];
      const disabled = state.phase !== "playing" || state.isPaused || !state.selectedTile || (state.money < def.cost && !occupied);
      let reason = "";
      if (state.phase !== "playing") reason = "Iniciá la partida primero.";
      else if (state.isPaused) reason = "Reanudá el juego.";
      else if (!state.selectedTile) reason = "Seleccioná una parcela.";
      else if (occupied && occupied.type !== type) reason = "La parcela ya está ocupada.";
      else if (state.money < def.cost && !occupied) reason = "Faltan fondos.";

      return {
        type,
        label: def.label,
        cost: occupied ? Math.round(def.upgradeCost * occupied.level) : def.cost,
        upgradeCost: def.upgradeCost,
        workersRequired: def.workersRequired,
        color: def.color,
        disabled,
        reason: reason || undefined,
      };
    });
  }, [state.buildings, state.isPaused, state.money, state.phase, state.selectedTile]);

  const saveToLocalStorage = useCallback(() => {
    const storage = useSafeLocalStorage();
    if (!storage) return;
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(serializeState(state, tiles)));
  }, [state, tiles]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    saveToLocalStorage();
  }, [saveToLocalStorage, state]);

  useEffect(() => {
    if (state.phase !== "playing" || state.isPaused) return;
    const interval = window.setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [state.phase, state.isPaused]);

  const actions = useMemo<GameContextValue>(
    () => ({
      state: deriveState(state, tiles),
      tiles,
      selectedBuilding,
      selectedTileBuilding,
      buildOptions,
      startGame: () => dispatch({ type: "START_GAME" }),
      resetGame: () => dispatch({ type: "RESET_GAME" }),
      togglePause: () => dispatch({ type: "TOGGLE_PAUSE" }),
      selectTile: (tile) => dispatch({ type: "SELECT_TILE", tile }),
      selectBuildType: (buildType) => dispatch({ type: "SELECT_BUILD_TYPE", buildType }),
      build: (buildType) => dispatch({ type: "BUILD", buildType }),
      upgradeSelected: () => dispatch({ type: "UPGRADE_SELECTED" }),
      tick: () => dispatch({ type: "TICK" }),
      saveToLocalStorage,
      exportSave: () => serializeState(deriveState(state, tiles), tiles),
      loadFromJson: (payload) => dispatch({ type: "LOAD_GAME", payload }),
      dismissNotification: (id) => dispatch({ type: "DISMISS_NOTIFICATION", id }),
    }),
    [buildOptions, saveToLocalStorage, selectedBuilding, selectedTileBuilding, state, tiles],
  );

  return <GameContext.Provider value={actions}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const ctx = React.useContext(GameContext);
  if (!ctx) {
    throw new Error("useGameContext must be used inside GameProvider");
  }
  return ctx;
}
