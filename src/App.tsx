import { useRef, useState, type ChangeEvent } from "react";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="w-screen h-screen flex divide-x divide-gray-200">
      <div className="flex-1 h-full">
        <canvas ref={canvasRef} className="border-2 border-red-500" />
      </div>
      <div className="w-[300px] h-full">
        <Sidebar />
      </div>
    </div>
  );
}

type Palette = {
  filename: string;
  palette: [number, number, number][];
};

function Sidebar() {
  const [palettes, setPalettes] = useState<Palette[]>([]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) return;
    const uploadedFiles = Array.from(e.target.files ?? []);
    const newPalettes: Palette[] = await Promise.all(
      uploadedFiles.map(fileToPalette),
    );
    setPalettes((ps) => [...ps, ...newPalettes]);
  };

  return (
    <div>
      <ul className="list-disc list-inside space-y-1">
        {palettes.map((p, index) => (
          <li key={index}>{p.filename}</li>
        ))}
      </ul>
      <label className="relative inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm cursor-pointer hover:bg-indigo-700 transition focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
        <span className="text-sm font-medium">Upload Palette</span>
        <input
          type="file"
          accept="*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileUpload}
        />
      </label>
      {palettes.map((p) => (
        <Palette key={p.filename} palette={p} />
      ))}
    </div>
  );
}

function Palette(props: { palette: Palette }) {
  const { palette } = props;

  return (
    <div>
      <h3>{palette.filename}</h3>
      <div className="grid grid-cols-16 gap-1">
        {palette.palette.map(([r, g, b], index) => (
          <div
            key={index}
            className="w-6 h-6"
            style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

async function fileToPalette(file: File): Promise<Palette> {
  const bytes = await file.arrayBuffer();
  const shorts = new Uint16Array(bytes);
  const colors: [number, number, number][] = [];
  for (const short of shorts) {
    const rb = short & 0x1f;
    const gb = (short >> 5) & 0x1f;
    const bb = (short >> 10) & 0x1f;
    const r = Math.floor((rb * 255) / 31);
    const g = Math.floor((gb * 255) / 31);
    const b = Math.floor((bb * 255) / 31);
    colors.push([r, g, b]);
  }
  return {
    filename: file.name,
    palette: colors,
  };
}
