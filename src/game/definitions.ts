import type { BuildingType, WeatherType } from "./types";

export const BUILDING_DEFS: Record<
  BuildingType,
  {
    label: string;
    cost: number;
    upgradeCost: number;
    workersRequired: number;
    baseProduction: number;
    storageBonus: number;
    workerBonus: number;
    color: string;
  }
> = {
  Vineyard: {
    label: "Vineyard",
    cost: 120,
    upgradeCost: 90,
    workersRequired: 2,
    baseProduction: 12,
    storageBonus: 0,
    workerBonus: 0,
    color: "#6abf69",
  },
  Winery: {
    label: "Winery",
    cost: 180,
    upgradeCost: 140,
    workersRequired: 3,
    baseProduction: 8,
    storageBonus: 0,
    workerBonus: 0,
    color: "#d9b06f",
  },
  Warehouse: {
    label: "Warehouse",
    cost: 150,
    upgradeCost: 100,
    workersRequired: 1,
    baseProduction: 0,
    storageBonus: 80,
    workerBonus: 0,
    color: "#98a6b8",
  },
  House: {
    label: "House",
    cost: 80,
    upgradeCost: 60,
    workersRequired: 0,
    baseProduction: 0,
    storageBonus: 0,
    workerBonus: 2,
    color: "#c46b5a",
  },
};

export const WEATHER_LABELS: Record<WeatherType, string> = {
  sunny: "Soleado",
  cloudy: "Nublado",
  windy: "Viento",
  drought: "Sequía",
  storm: "Tormenta",
};

export const WEATHER_MULTIPLIER: Record<WeatherType, number> = {
  sunny: 1.1,
  cloudy: 1.0,
  windy: 1.05,
  drought: 0.72,
  storm: 0.55,
};

export const WINE_PRICE_PER_UNIT = 18;
export const SAVE_STORAGE_KEY = "rioja-tycoon-save-v1";
export const GRID_COUNT = 8;
export const TILE_SIZE = 12;
