export interface SheetPreset {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
}

export interface PhotoSizePreset {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  custom?: boolean;
}

export const sheetPresets: SheetPreset[] = [
  { id: "a4", label: "A4", widthMm: 210, heightMm: 297 },
  { id: "4x6", label: "4×6 inch", widthMm: 101.6, heightMm: 152.4 },
];

export const photoSizePresets: PhotoSizePreset[] = [
  { id: "passport", label: "Passport (35×45 mm)", widthMm: 35, heightMm: 45 },
  { id: "aadhaar", label: "Aadhaar (35×45 mm)", widthMm: 35, heightMm: 45 },
  { id: "2x2", label: "2×2 inch (50.8 mm)", widthMm: 50.8, heightMm: 50.8 },
  { id: "custom", label: "Custom", widthMm: 35, heightMm: 45, custom: true },
];

export const PRINT_SHEET_MARGIN_MM = 5;
export const PRINT_SHEET_GAP_MM = 2;

export interface GridFit {
  rows: number;
  cols: number;
  total: number;
}

export function fitGrid(
  sheet: { widthMm: number; heightMm: number },
  photo: { widthMm: number; heightMm: number },
  marginMm = PRINT_SHEET_MARGIN_MM,
  gapMm = PRINT_SHEET_GAP_MM,
): GridFit {
  const usableW = sheet.widthMm - 2 * marginMm;
  const usableH = sheet.heightMm - 2 * marginMm;
  const cols = Math.max(0, Math.floor((usableW + gapMm) / (photo.widthMm + gapMm)));
  const rows = Math.max(0, Math.floor((usableH + gapMm) / (photo.heightMm + gapMm)));
  return { rows, cols, total: rows * cols };
}
