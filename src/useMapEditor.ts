import { createContext, useContext } from "react";

export type RGB = [number, number, number];
export type Palette = RGB[];
export type Tile = number[];
export type TileMapEntry = {
  tileIndex: number;
  horizontalFlip: boolean;
  verticalFlip: boolean;
  paletteIndex: number;
};
export type TileMap = TileMapEntry[][];

type MapEditorContextType = {
  palettes: Palette[];
  setPalettes: React.Dispatch<React.SetStateAction<Palette[]>>;
  tiles: Tile[];
  setTiles: React.Dispatch<React.SetStateAction<Tile[]>>;
  tileMap: TileMap;
  setTileMap: React.Dispatch<React.SetStateAction<TileMap>>;
  currentTileCoords: { x: number; y: number } | null;
  setCurrentTileCoords: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  currentTileEntry: TileMapEntry | null;
};

export const MapEditorContext = createContext<MapEditorContextType | undefined>(
  undefined,
);

export function useMapEditor() {
  const context = useContext(MapEditorContext);
  if (context === undefined) {
    throw new Error("useMapEditor must be used within a MapEditorProvider");
  }
  return context;
}
