import { useState, type ReactNode } from "react";
import { MapEditorContext, type Palette, type Tile, type TileMap } from "./useMapEditor";

export function MapEditorProvider(props: { children: ReactNode }) {
  const { children } = props;

  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [tileMap, setTileMap] = useState<TileMap>(
    new Array(32).fill(0).map(() =>
      new Array(32).fill({
        tileIndex: 1,
        horizontalFlip: false,
        verticalFlip: false,
        paletteIndex: 0,
      }),
    ),
  );
  const [currentTileCoords, setCurrentTileCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);


  const currentTileEntry =
    currentTileCoords !== null
      ? tileMap[currentTileCoords.y][currentTileCoords.x]
      : null;

  return (
    <MapEditorContext.Provider
      value={{
        palettes,
        setPalettes,
        tiles,
        setTiles,
        tileMap,
        setTileMap,
        currentTileCoords,
        setCurrentTileCoords,
        currentTileEntry
      }}
    >
      {children}
    </MapEditorContext.Provider>
  );
}

