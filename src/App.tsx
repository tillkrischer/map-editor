import { useEffect, useRef, useState, type ChangeEvent } from "react";

type RGB = [number, number, number];
type Palette = RGB[]; // 16 entries
type Tile = number[]; // 64 entries, each 0-15
type TileMapEntry = {
  tileIndex: number;
  horizontalFlip: boolean;
  verticalFlip: boolean;
  paletteIndex: number;
};
type TileMap = TileMapEntry[][]; // 32x32 entries

export function App() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [tileMap] = useState<TileMap>(
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
    <div className="w-screen h-screen flex divide-x divide-gray-200">
      <div className="flex-1 h-full">
        <MainCanvas
          palettes={palettes}
          tiles={tiles}
          tileMap={tileMap}
          onTileClick={setCurrentTileCoords}
        />
      </div>
      <div className="w-[596px] h-full overflow-y-auto">
        <Sidebar
          palettes={palettes}
          setPalettes={setPalettes}
          tiles={tiles}
          setTiles={setTiles}
          currentTileEntry={currentTileEntry}
          currentTileCoords={currentTileCoords}
        />
      </div>
    </div>
  );
}

function MainCanvas(props: {
  palettes: Palette[];
  tiles: Tile[];
  tileMap: TileMap;
  onTileClick: (coords: { x: number; y: number }) => void;
}) {
  const { palettes, tiles, tileMap, onTileClick } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawTileMap(canvasRef.current, palettes, tiles, tileMap);
  }, [palettes, tileMap, tiles]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert canvas coordinates to tile coordinates
    // Each tile is 8x8 pixels with magnification of 2
    const magnification = 2;
    const tileX = Math.floor(x / (8 * magnification));
    const tileY = Math.floor(y / (8 * magnification));

    if (tileX >= 0 && tileX < 32 && tileY >= 0 && tileY < 32) {
      onTileClick({ x: tileX, y: tileY });
    }
  };

  return (
    <div className="w-full flex justify-center pt-4">
      <canvas
        ref={canvasRef}
        className="border-2 border-red-500 cursor-pointer"
        height={512}
        width={512}
        onClick={handleClick}
      />
    </div>
  );
}

function drawTileMap(
  canvas: HTMLCanvasElement | null,
  palettes: Palette[],
  tiles: Tile[],
  tileMap: TileMap,
  magnification = 2,
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let ty = 0; ty < 32; ty++) {
    for (let tx = 0; tx < 32; tx++) {
      const entry = tileMap[ty][tx];
      const tile = tiles[entry.tileIndex];
      const palette = palettes[entry.paletteIndex];
      if (!tile || !palette) continue;

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const sx = entry.horizontalFlip ? 7 - x : x;
          const sy = entry.verticalFlip ? 7 - y : y;
          const colorIndex = tile[sy * 8 + sx];
          const [r, g, b] = palette[colorIndex];
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(
            tx * 8 * magnification + x * magnification,
            ty * 8 * magnification + y * magnification,
            magnification,
            magnification,
          );
        }
      }
    }
  }
}

function CurrentTileContainer(props: {
  tileEntry: TileMapEntry | null;
  coords: { x: number; y: number } | null;
  tiles: Tile[];
  palettes: Palette[];
}) {
  const { tileEntry, coords, tiles, palettes } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const magnification = 8;
  const size = 8 * magnification;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!tileEntry || coords === null) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const tile = tiles[tileEntry.tileIndex];
    const palette = palettes[tileEntry.paletteIndex];

    if (!tile || !palette) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Draw the tile
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const sx = tileEntry.horizontalFlip ? 7 - x : x;
        const sy = tileEntry.verticalFlip ? 7 - y : y;
        const colorIndex = tile[sy * 8 + sx];
        const [r, g, b] = palette[colorIndex];
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(
          x * magnification,
          y * magnification,
          magnification,
          magnification,
        );
      }
    }
  }, [tileEntry, tiles, palettes, coords]);

  return (
    <div className="border-2 border-gray-300 p-4 rounded-md mb-4">
      <h2 className="text-l font-bold mb-2">Current Tile</h2>
      <div className="flex flex-col gap-2">
        <div className="text-sm">
          <span className="font-medium">Position:</span> ({coords?.x}, {coords?.y}
          )
        </div>
        <div className="text-sm">
          <span className="font-medium">Tile Index:</span> {tileEntry?.tileIndex}
        </div>
        <div className="text-sm">
          <span className="font-medium">Palette Index:</span>{" "}
          {tileEntry?.paletteIndex}
        </div>
        <div className="text-sm">
          <span className="font-medium">Horizontal Flip:</span>{" "}
          {tileEntry?.horizontalFlip ? "Yes" : "No"}
        </div>
        <div className="text-sm">
          <span className="font-medium">Vertical Flip:</span>{" "}
          {tileEntry?.verticalFlip ? "Yes" : "No"}
        </div>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{width: size, height: size}}
          className="border border-gray-400 mt-2"
        />
      </div>
    </div>
  );
}

function Sidebar(props: {
  palettes: Palette[];
  setPalettes: React.Dispatch<React.SetStateAction<Palette[]>>;
  tiles: Tile[];
  setTiles: React.Dispatch<React.SetStateAction<Tile[]>>;
  currentTileEntry: TileMapEntry | null;
  currentTileCoords: { x: number; y: number } | null;
}) {
  const {
    palettes,
    setPalettes,
    tiles,
    setTiles,
    currentTileEntry,
    currentTileCoords,
  } = props;

  return (
    <div className="p-4">
      <CurrentTileContainer
        tileEntry={currentTileEntry}
        coords={currentTileCoords}
        tiles={tiles}
        palettes={palettes}
      />
      <TilesContainer palettes={palettes} tiles={tiles} setTiles={setTiles} />
      <PaletteContainer palettes={palettes} setPalettes={setPalettes} />
    </div>
  );
}

function TilesContainer(props: {
  palettes: Palette[];
  tiles: Tile[];
  setTiles: React.Dispatch<React.SetStateAction<Tile[]>>;
}) {
  const { palettes, setTiles, tiles } = props;
  return (
    <div className="border-2 border-gray-300 p-4 rounded-md mb-4">
      <h2 className="text-l font-bold">Tiles</h2>
      <TilesUploadButton setTiles={setTiles} />
      <Tiles tiles={tiles} palettes={palettes} />
    </div>
  );
}

function PaletteContainer(props: {
  palettes: Palette[];
  setPalettes: React.Dispatch<React.SetStateAction<Palette[]>>;
}) {
  const { palettes, setPalettes } = props;
  return (
    <div className="border-2 border-gray-300 p-4 rounded-md mb-4">
      <h2 className="text-l font-bold">Palettes</h2>
      <PaletteUploadButton setPalettes={setPalettes} />
      <Palette palettes={palettes} />
    </div>
  );
}

function Tiles(props: { tiles: Tile[]; palettes: Palette[] }) {
  const { tiles, palettes } = props;
  const magnification = 2;
  const width = 32 * 8 * magnification;
  const height = Math.ceil(tiles.length / 32) * 8 * magnification;

  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (selectedPaletteIndex >= palettes.length) return;
    drawTiles(
      canvasRef.current,
      palettes[selectedPaletteIndex],
      tiles,
      magnification,
    );
  }, [palettes, selectedPaletteIndex, tiles]);

  return (
    <div className="w-full flex flex-col">
      {JSON.stringify(tiles.length)} tiles loaded
      <div className="flex items-center">
        <label className="pr-4 text-sm font-medium">Palette: </label>
        <input
          type="number"
          min={0}
          max={palettes.length - 1}
          className="w-20 px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={selectedPaletteIndex}
          onChange={(e) =>
            setSelectedPaletteIndex(Math.max(0, Number(e.target.value)))
          }
        />
      </div>
      <canvas
        ref={canvasRef}
        className="my-2"
        style={{ width }}
        width={width}
        height={height}
      />
    </div>
  );
}

function drawTiles(
  canvas: HTMLCanvasElement | null,
  palette: Palette,
  tiles: Tile[],
  magnification: number,
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  tiles.forEach((tile, tIndex) => {
    const tileX = (tIndex % 32) * 8 * magnification;
    const tileY = Math.floor(tIndex / 32) * 8 * magnification;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const colorIndex = tile[y * 8 + x];
        const [r, g, b] = palette[colorIndex];
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(
          tileX + x * magnification,
          tileY + y * magnification,
          magnification,
          magnification,
        );
      }
    }
  });
}

function TilesUploadButton(props: {
  setTiles: React.Dispatch<React.SetStateAction<Tile[]>>;
}) {
  const { setTiles } = props;

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) return;
    const uploadedFiles = Array.from(e.target.files ?? []);
    const newTiles = (await Promise.all(uploadedFiles.map(fileToTiles))).flat();

    // todo: deduplicate tiles
    setTiles((tiles) => [...tiles, ...newTiles]);
  };

  return (
    <UploadButton handleFileUpload={handleFileUpload} text="Upload Tiles" />
  );
}

function PaletteUploadButton(props: {
  setPalettes: React.Dispatch<React.SetStateAction<Palette[]>>;
}) {
  const { setPalettes } = props;

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) return;
    const uploadedFiles = Array.from(e.target.files ?? []);
    const newPalettes = (
      await Promise.all(uploadedFiles.map(fileToPalettes))
    ).flat();

    // todo: deduplicate palettes
    setPalettes((ps) => [...ps, ...newPalettes]);
  };

  return (
    <UploadButton handleFileUpload={handleFileUpload} text="Upload Palette" />
  );
}

function UploadButton(props: {
  text: string;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}) {
  const { handleFileUpload, text } = props;
  return (
    <div>
      <label className="relative inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm cursor-pointer hover:bg-indigo-700 transition focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
        <span className="text-sm font-medium">{text}</span>
        <input
          type="file"
          accept="*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
}

function drawPalette(
  canvas: HTMLCanvasElement | null,
  palettes: Palette[],
  blockSize = 8,
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  palettes.forEach((palette, pIndex) => {
    palette.forEach((color, cIndex) => {
      const [r, g, b] = color;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(
        cIndex * (blockSize + 1) + 1,
        pIndex * (blockSize + 1) + 1,
        blockSize,
        blockSize,
      );
    });
  });
}

function Palette(props: { palettes: Palette[] }) {
  const BLOCK_SIZE = 10;
  const { palettes } = props;
  const height = palettes.length * BLOCK_SIZE + palettes.length + 1;
  const width = 16 * BLOCK_SIZE + 17;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawPalette(canvasRef.current, palettes, BLOCK_SIZE);
  }, [palettes, BLOCK_SIZE]);

  if (palettes.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      {JSON.stringify(palettes.length)} palettes loaded
      <canvas ref={canvasRef} style={{ width }} width={width} height={height} />
    </div>
  );
}

async function fileToPalettes(file: File): Promise<Palette[]> {
  const bytes = await file.arrayBuffer();
  const shorts = new Uint16Array(bytes);
  const palettes: Palette[] = [];
  let curr = 0;
  while (curr <= shorts.length - 16) {
    const colors: [number, number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const short = shorts[curr + i];
      const rb = short & 0x1f;
      const gb = (short >> 5) & 0x1f;
      const bb = (short >> 10) & 0x1f;
      const r = Math.floor((rb * 255) / 31);
      const g = Math.floor((gb * 255) / 31);
      const b = Math.floor((bb * 255) / 31);
      colors.push([r, g, b]);
    }
    curr += 16;
    palettes.push(colors as Palette);
  }
  return palettes;
}

async function fileToTiles(file: File): Promise<number[][]> {
  const bytes = await file.arrayBuffer();
  const byteArray = new Uint8Array(bytes);
  const tiles: number[][] = [];
  let curr = 0;
  while (curr <= byteArray.length - 32) {
    const tile: number[] = [];
    for (let i = 0; i < 32; i += 1) {
      const c = byteArray[curr + i];
      tile.push(c & 0xf);
      tile.push((c >> 4) & 0xf);
    }
    tiles.push(tile);
    curr += 32;
  }
  return tiles;
}
