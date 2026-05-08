export type JoinerLayout = "side-by-side" | "stacked";

export interface JoinerPreset {
  id: string;
  label: string;
  widthPx: number;
  heightPx: number;
  layout: JoinerLayout;
}

export const joinerPresets: JoinerPreset[] = [
  { id: "200x100", label: "200×100 (compact)", widthPx: 200, heightPx: 100, layout: "side-by-side" },
  { id: "300x150", label: "300×150 (standard)", widthPx: 300, heightPx: 150, layout: "side-by-side" },
  { id: "600x300", label: "600×300 (high-res)", widthPx: 600, heightPx: 300, layout: "side-by-side" },
  { id: "200x300", label: "200×300 (stacked)", widthPx: 200, heightPx: 300, layout: "stacked" },
];
