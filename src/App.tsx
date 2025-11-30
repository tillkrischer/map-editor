import { useEffect, useRef, useState, type ChangeEvent } from "react";

type RGB = [number, number, number];
type Palette = RGB[] // 16 entries
type Tile = number[]; // 64 entries, each 0-15

export function App() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="w-screen h-screen flex divide-x divide-gray-200">
      <div className="flex-1 h-full">
        <canvas ref={canvasRef} className="border-2 border-red-500" />
      </div>
      <div className="w-[550px] h-full">
        <Sidebar
          palettes={palettes}
          setPalettes={setPalettes}
          tiles={tiles}
          setTiles={setTiles}
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
}) {
  const { palettes, setPalettes, tiles, setTiles } = props;

  return (
    <div>
      <h1 className="text-l font-bold">Tiles</h1>
      <TilesUploadButton setTiles={setTiles} />
      <Tiles tiles={tiles} palettes={palettes} />
      <h1 className="text-l font-bold">Palettes</h1>
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

  useEffect(() => {
    const canvas = document.getElementById(
      "tile-canvas",
    ) as HTMLCanvasElement | null;
    if (selectedPaletteIndex >= palettes.length) return;
    drawTiles(canvas, palettes[selectedPaletteIndex], tiles, magnification);
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
        id="tile-canvas"
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

  useEffect(() => {
    const canvas = document.getElementById(
      "palette-canvas",
    ) as HTMLCanvasElement | null;
    drawPalette(canvas, palettes, BLOCK_SIZE);
  }, [palettes, BLOCK_SIZE]);

  if (palettes.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      {JSON.stringify(palettes.length)} palettes loaded
      <canvas
        id="palette-canvas"
        style={{ width }}
        width={width}
        height={height}
      />
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
