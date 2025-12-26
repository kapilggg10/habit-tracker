import type { ColorOption } from "@/types/habit";

export const PRESET_COLORS: ColorOption[] = [
  { name: "Ocean Blue", hex: "#60A5FA" },
  { name: "Emerald", hex: "#34D399" },
  { name: "Violet", hex: "#A78BFA" },
  { name: "Sunset", hex: "#FB923C" },
  { name: "Rose", hex: "#F472B6" },
  { name: "Cyan", hex: "#22D3EE" },
  { name: "Coral", hex: "#FB7185" },
  { name: "Amber", hex: "#FBBF24" },
  { name: "Indigo", hex: "#818CF8" },
  { name: "Lime", hex: "#A3E635" },
  { name: "Fuchsia", hex: "#E879F9" },
  { name: "Sky", hex: "#7DD3FC" },
];

export const DEFAULT_COLOR = PRESET_COLORS[0]!.hex;

