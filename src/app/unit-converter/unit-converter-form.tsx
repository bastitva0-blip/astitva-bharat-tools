"use client";

import { useState, useCallback } from "react";
import { fire } from "@/lib/analytics/events";

// ---- Conversion tables ----
// Each unit has a factor to convert it to the base SI unit for that category.
// Temperature is handled separately (non-linear).

type UnitDef = { label: string; factor: number; note?: string };

const LENGTH_UNITS: Record<string, UnitDef> = {
  mm: { label: "Millimetre (mm)", factor: 0.001 },
  cm: { label: "Centimetre (cm)", factor: 0.01 },
  m: { label: "Metre (m)", factor: 1 },
  km: { label: "Kilometre (km)", factor: 1000 },
  inch: { label: "Inch (in)", factor: 0.0254 },
  foot: { label: "Foot (ft)", factor: 0.3048 },
  yard: { label: "Yard (yd)", factor: 0.9144 },
  mile: { label: "Mile (mi)", factor: 1609.344 },
};

const WEIGHT_UNITS: Record<string, UnitDef> = {
  mg: { label: "Milligram (mg)", factor: 0.000001 },
  g: { label: "Gram (g)", factor: 0.001 },
  kg: { label: "Kilogram (kg)", factor: 1 },
  tonne: { label: "Metric Tonne (t)", factor: 1000 },
  oz: { label: "Ounce (oz)", factor: 0.028349523 },
  lb: { label: "Pound (lb)", factor: 0.45359237 },
  maan: { label: "Maan (Indian)", factor: 40, note: "1 maan = 40 kg" },
  ser: { label: "Ser (Indian)", factor: 0.9331, note: "1 ser ≈ 0.933 kg" },
};

const AREA_UNITS: Record<string, UnitDef> = {
  "cm2": { label: "Square Centimetre (cm²)", factor: 0.0001 },
  "m2": { label: "Square Metre (m²)", factor: 1 },
  "km2": { label: "Square Kilometre (km²)", factor: 1_000_000 },
  "sqft": { label: "Square Foot (sq ft)", factor: 0.092903 },
  "sqyard": { label: "Square Yard (sq yd)", factor: 0.836127 },
  acre: { label: "Acre", factor: 4046.856 },
  hectare: { label: "Hectare (ha)", factor: 10000 },
  bigha: { label: "Bigha (UP)", factor: 2529, note: "1 bigha (UP) = 2529 m²" },
  gunta: { label: "Gunta / Guntha", factor: 101.17, note: "1 gunta = 101.17 m²" },
  cent: { label: "Cent", factor: 40.4686, note: "1 cent = 40.47 m²" },
};

const VOLUME_UNITS: Record<string, UnitDef> = {
  ml: { label: "Millilitre (mL)", factor: 0.001 },
  l: { label: "Litre (L)", factor: 1 },
  m3: { label: "Cubic Metre (m³)", factor: 1000 },
  "gallon-us": { label: "Gallon (US)", factor: 3.78541 },
  "gallon-imp": { label: "Gallon (Imperial)", factor: 4.54609 },
  cup: { label: "Cup (US)", factor: 0.236588 },
  floz: { label: "Fluid Ounce (US fl oz)", factor: 0.029574 },
};

type Category = "length" | "weight" | "area" | "volume" | "temperature" | "indian-numbers";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "length", label: "Length" },
  { id: "weight", label: "Weight" },
  { id: "area", label: "Area" },
  { id: "volume", label: "Volume" },
  { id: "temperature", label: "Temperature" },
  { id: "indian-numbers", label: "Indian Numbers" },
];

function getUnitsForCategory(cat: Category): Record<string, UnitDef> | null {
  switch (cat) {
    case "length": return LENGTH_UNITS;
    case "weight": return WEIGHT_UNITS;
    case "area": return AREA_UNITS;
    case "volume": return VOLUME_UNITS;
    default: return null;
  }
}

function convertLinear(value: number, from: string, to: string, units: Record<string, UnitDef>): number {
  const fromFactor = units[from]?.factor ?? 1;
  const toFactor = units[to]?.factor ?? 1;
  return (value * fromFactor) / toFactor;
}

function toFahrenheit(c: number) { return c * 9 / 5 + 32; }
function toCelsius(f: number) { return (f - 32) * 5 / 9; }
function toKelvin(c: number) { return c + 273.15; }
function fromKelvin(k: number) { return k - 273.15; }

function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value;
  // Convert to Celsius first
  let celsius: number;
  if (from === "c") celsius = value;
  else if (from === "f") celsius = toCelsius(value);
  else celsius = fromKelvin(value);
  // Then to target
  if (to === "c") return celsius;
  if (to === "f") return toFahrenheit(celsius);
  return toKelvin(celsius);
}

function formatNum(n: number): string {
  if (!isFinite(n)) return "—";
  // If the number is very large or very small, use exponential notation
  if (Math.abs(n) > 1e15 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(6);
  }
  // Use up to 8 significant figures
  const str = n.toPrecision(8).replace(/\.?0+$/, "");
  return str;
}

interface IndianNumberResult {
  lakh: string;
  crore: string;
  million: string;
  billion: string;
  words: string;
}

function toIndianNumbers(n: number): IndianNumberResult {
  const lakh = n / 1e5;
  const crore = n / 1e7;
  const million = n / 1e6;
  const billion = n / 1e9;

  function fmtIn(v: number) {
    return v.toLocaleString("en-IN", { maximumFractionDigits: 4 });
  }
  function fmtInt(v: number) {
    return v.toLocaleString("en", { maximumFractionDigits: 4 });
  }

  return {
    lakh: fmtIn(lakh),
    crore: fmtIn(crore),
    million: fmtInt(million),
    billion: fmtInt(billion),
    words: numberToIndianWords(n),
  };
}

function numberToIndianWords(n: number): string {
  if (isNaN(n) || !isFinite(n)) return "";
  const absN = Math.abs(Math.round(n));
  if (absN === 0) return "Zero";
  const crore = Math.floor(absN / 1e7);
  const lakh = Math.floor((absN % 1e7) / 1e5);
  const thousand = Math.floor((absN % 1e5) / 1e3);
  const rest = absN % 1e3;
  const parts: string[] = [];
  if (crore > 0) parts.push(`${crore.toLocaleString("en-IN")} crore`);
  if (lakh > 0) parts.push(`${lakh} lakh`);
  if (thousand > 0) parts.push(`${thousand} thousand`);
  if (rest > 0) parts.push(String(rest));
  return (n < 0 ? "Minus " : "") + parts.join(", ");
}

export function UnitConverterForm() {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [fromValue, setFromValue] = useState("1");
  const [fired, setFired] = useState(false);

  const units = getUnitsForCategory(category);
  const unitKeys = units ? Object.keys(units) : [];

  const handleCategoryChange = useCallback((cat: Category) => {
    setCategory(cat);
    // Reset to sensible defaults per category
    if (cat === "length") { setFromUnit("m"); setToUnit("km"); }
    else if (cat === "weight") { setFromUnit("kg"); setToUnit("lb"); }
    else if (cat === "area") { setFromUnit("m2"); setToUnit("sqft"); }
    else if (cat === "volume") { setFromUnit("l"); setToUnit("gallon-us"); }
    else if (cat === "temperature") { setFromUnit("c"); setToUnit("f"); }
    else { setFromUnit(""); setToUnit(""); }
    setFromValue("1");
  }, []);

  const trackConversion = useCallback(() => {
    if (!fired) {
      fire("process_start", { tool_id: "unit-converter" });
      setFired(true);
    }
  }, [fired]);

  const handleFromValue = useCallback((v: string) => {
    setFromValue(v);
    if (v.trim() !== "") trackConversion();
  }, [trackConversion]);

  const handleSwap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  // Compute result
  let result = "";
  let note = "";
  const numVal = parseFloat(fromValue);

  if (!isNaN(numVal)) {
    if (category === "temperature") {
      result = formatNum(convertTemperature(numVal, fromUnit, toUnit));
    } else if (category === "indian-numbers") {
      // handled below
    } else if (units) {
      result = formatNum(convertLinear(numVal, fromUnit, toUnit, units));
    }
    if (units) {
      const fromNote = units[fromUnit]?.note;
      const toNote = units[toUnit]?.note;
      if (fromNote || toNote) note = [fromNote, toNote].filter(Boolean).join(" · ");
    }
  }

  const indianResult = category === "indian-numbers" && !isNaN(numVal) ? toIndianNumbers(numVal) : null;

  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors ${
              category === cat.id
                ? "bg-primary-500 text-white"
                : "bg-surface-2 text-surface-fg hover:bg-surface-3 border border-surface-border"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-surface-border bg-surface-1 p-6 space-y-5">
        {category === "indian-numbers" ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="indian-input" className="block mb-1.5 text-body-sm font-medium text-surface-fg">
                Enter a number
              </label>
              <input
                id="indian-input"
                type="number"
                value={fromValue}
                onChange={(e) => handleFromValue(e.target.value)}
                className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. 1000000"
              />
            </div>
            {indianResult && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Lakh", value: `${indianResult.lakh} lakh` },
                  { label: "Crore", value: `${indianResult.crore} crore` },
                  { label: "Million", value: `${indianResult.million} million` },
                  { label: "Billion", value: `${indianResult.billion} billion` },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-surface-2 px-4 py-3">
                    <p className="text-body-xs text-surface-fg-muted">{item.label}</p>
                    <p className="text-body-sm font-semibold text-surface-fg mt-0.5">{item.value}</p>
                  </div>
                ))}
                {indianResult.words && (
                  <div className="col-span-2 rounded-lg bg-surface-2 px-4 py-3">
                    <p className="text-body-xs text-surface-fg-muted">In words (Indian system)</p>
                    <p className="text-body-sm font-semibold text-surface-fg mt-0.5">{indianResult.words}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : category === "temperature" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="temp-from-unit" className="block mb-1.5 text-body-sm font-medium text-surface-fg">From</label>
                <select
                  id="temp-from-unit"
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="c">Celsius (°C)</option>
                  <option value="f">Fahrenheit (°F)</option>
                  <option value="k">Kelvin (K)</option>
                </select>
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => handleFromValue(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Value"
                />
              </div>
              <div>
                <label htmlFor="temp-to-unit" className="block mb-1.5 text-body-sm font-medium text-surface-fg">To</label>
                <select
                  id="temp-to-unit"
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="c">Celsius (°C)</option>
                  <option value="f">Fahrenheit (°F)</option>
                  <option value="k">Kelvin (K)</option>
                </select>
                <div className="mt-2 block w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-body-sm text-surface-fg font-semibold min-h-[38px]">
                  {result || "—"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSwap}
              className="flex items-center gap-1.5 text-body-sm text-primary-600 hover:text-primary-700 font-medium"
              aria-label="Swap units"
            >
              ⇄ Swap
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="from-unit" className="block mb-1.5 text-body-sm font-medium text-surface-fg">From</label>
                <select
                  id="from-unit"
                  value={fromUnit}
                  onChange={(e) => { setFromUnit(e.target.value); trackConversion(); }}
                  className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {unitKeys.map((k) => (
                    <option key={k} value={k}>{units![k].label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => handleFromValue(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Value"
                />
              </div>
              <div>
                <label htmlFor="to-unit" className="block mb-1.5 text-body-sm font-medium text-surface-fg">To</label>
                <select
                  id="to-unit"
                  value={toUnit}
                  onChange={(e) => { setToUnit(e.target.value); trackConversion(); }}
                  className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {unitKeys.map((k) => (
                    <option key={k} value={k}>{units![k].label}</option>
                  ))}
                </select>
                <div className="mt-2 block w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-body-sm text-surface-fg font-semibold min-h-[38px]">
                  {result || "—"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSwap}
              className="flex items-center gap-1.5 text-body-sm text-primary-600 hover:text-primary-700 font-medium"
              aria-label="Swap units"
            >
              ⇄ Swap
            </button>
            {note && (
              <p className="text-body-xs text-surface-fg-muted">{note}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
