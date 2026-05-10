export type BuildingType = "Vineyard" | "Winery" | "Warehouse" | "House";
export type WeatherType = "sunny" | "cloudy" | "windy" | "drought" | "storm";
export type GamePhase = "menu" | "playing" | "paused";

export interface GameTile {
  id: string;
  row: number;
  col: number;
  position: [number, number, number];
  size: number;
  elevation: number;
  crop: "vine" | "olive";
  production: number;
  moisture: number;
  selected?: boolean;
  name: string;
}

export interface Building {
  id: string;
  tileId: string;
  type: BuildingType;
  level: number;
  production: number;
  workersRequired: number;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  text: string;
  kind: "info" | "success" | "warning" | "error";
}

export interface GameState {
  money: number;
  wine: number;
  workers: number;
  day: number;
  selectedTile: GameTile | null;
  buildings: Building[];
  isPaused: boolean;
  phase: GamePhase;
  selectedBuildType: BuildingType | null;
  grapes: number;
  weather: WeatherType;
  storageUsed: number;
  storageCapacity: number;
  notifications: NotificationItem[];
  lastEvent: string;
}

export type SaveGamePayload = Pick<
  GameState,
  | "money"
  | "wine"
  | "workers"
  | "day"
  | "selectedTile"
  | "buildings"
  | "isPaused"
  | "phase"
  | "selectedBuildType"
  | "grapes"
  | "weather"
  | "storageUsed"
  | "storageCapacity"
  | "lastEvent"
> & {
  tiles: GameTile[];
};
