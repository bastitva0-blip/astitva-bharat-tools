"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import * as React from "react";

import {
  readAuroraPalette,
  useAuroraPalette,
  type AuroraPalette,
} from "@/lib/aurora-palette";

export type { AuroraPalette };
export { readAuroraPalette, useAuroraPalette };

export type AuroraIntensity = "subtle" | "medium" | "strong";
export type AuroraShape = "curtain" | "ribbon" | "halo" | "full";
export type AuroraPosition = "top" | "bottom" | "center" | "full";
export type AuroraLayers = 1 | 2 | 3;
export type AuroraParallax = "mouse" | "scroll" | "off";
export type AuroraGrain = "match" | "paper" | "off";

export interface AuroraBloomProps {
  intensity?: AuroraIntensity;
  shape?: AuroraShape;
  position?: AuroraPosition;
  layers?: AuroraLayers;
  speed?: number;
  palette?: "brand" | AuroraPalette | string[];
  parallax?: AuroraParallax;
  grain?: AuroraGrain;
  breathing?: boolean;
  className?: string;
}

const TWEEN_MS = 1200;

const INTENSITY_PARAMS: Record<
  AuroraIntensity,
  {
    frontOpacity: { light: number; dark: number };
    backOpacity: number;
    microOpacity: number;
    distortion: number;
    swirl: number;
    scale: number;
  }
> = {
  subtle: {
    frontOpacity: { light: 0.7, dark: 0.5 },
    backOpacity: 0.3,
    microOpacity: 0.25,
    distortion: 0.7,
    swirl: 0.45,
    scale: 1.1,
  },
  medium: {
    frontOpacity: { light: 0.95, dark: 0.85 },
    backOpacity: 0.55,
    microOpacity: 0.4,
    distortion: 0.95,
    swirl: 0.65,
    scale: 1.35,
  },
  strong: {
    frontOpacity: { light: 1, dark: 1 },
    backOpacity: 0.7,
    microOpacity: 0.5,
    distortion: 1,
    swirl: 0.85,
    scale: 1.6,
  },
};

function useReducedMotion(): boolean {
  const [r, setR] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const h = (e: MediaQueryListEvent) => setR(e.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);
  return r;
}

export function AuroraBloom({
  intensity = "medium",
  shape = "curtain",
  position = "top",
  layers = 2,
  speed = 0.35,
  palette = "brand",
  parallax = "mouse",
  grain = "paper",
  breathing = true,
  className,
}: AuroraBloomProps) {
  const prefersReducedMotion = useReducedMotion();
  const livePalette = useAuroraPalette();

  const target = React.useMemo<AuroraPalette>(() => {
    if (palette === "brand") return livePalette;
    if (Array.isArray(palette)) {
      return {
        colors: palette.slice(0, 5) as AuroraPalette["colors"],
        ground: livePalette.ground,
        isDark: livePalette.isDark,
      };
    }
    return palette;
  }, [palette, livePalette]);

  const shown = useTweenedPalette(target, prefersReducedMotion ? 0 : TWEEN_MS);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const isVisible = useInViewport(rootRef);

  const parallaxOffset = useParallaxOffset(parallax, prefersReducedMotion);

  const ip = INTENSITY_PARAMS[intensity];
  const frontOpacity = shown.isDark ? ip.frontOpacity.dark : ip.frontOpacity.light;
  const blendMode: React.CSSProperties["mixBlendMode"] = shown.isDark
    ? "screen"
    : "multiply";

  const effectiveSpeed = prefersReducedMotion || !isVisible ? 0 : speed;

  const backColors = React.useMemo(() => {
    const c = shown.colors;
    return [c[3] ?? c[0], c[0], c[2], c[4] ?? c[0], c[1]];
  }, [shown.colors]);

  const maskImage = computeMaskImage(shape, position);
  const edgeWash = computeEdgeWash(position, shown.ground);

  const containerStyle: React.CSSProperties = {
    maskImage,
    WebkitMaskImage: maskImage,
    transform: parallaxOffset
      ? `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`
      : undefined,
    transition: "transform 200ms cubic-bezier(0.2, 0, 0.38, 0.9)",
    animation:
      breathing && !prefersReducedMotion
        ? "bharattools-aurora-breathing 6s ease-in-out infinite"
        : undefined,
    transformOrigin: "50% 30%",
  };

  return (
    <>
      <style>{`
        @keyframes bharattools-aurora-breathing {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }
      `}</style>

      <div
        ref={rootRef}
        aria-hidden="true"
        data-aurora-bloom=""
        className={
          "pointer-events-none absolute inset-0 z-0 overflow-hidden " +
          (className ?? "")
        }
        style={containerStyle}
      >
        <div className="absolute inset-0" style={{ background: shown.ground }} />

        {layers >= 2 && (
          <MeshGradient
            colors={backColors}
            distortion={Math.min(1, ip.distortion - 0.3)}
            swirl={Math.min(1, ip.swirl + 0.2)}
            grainMixer={grain === "paper" ? 0.15 : 0}
            grainOverlay={grain === "paper" ? 0.1 : 0}
            speed={effectiveSpeed * 0.4}
            scale={ip.scale + 0.85}
            rotation={35}
            offsetX={0.12}
            offsetY={position === "bottom" ? 0.25 : -0.25}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              mixBlendMode: blendMode,
              opacity: ip.backOpacity,
              filter: "blur(40px)",
            }}
          />
        )}

        <MeshGradient
          colors={shown.colors}
          distortion={ip.distortion}
          swirl={ip.swirl}
          grainMixer={grain === "paper" ? 0.3 : 0}
          grainOverlay={grain === "paper" ? 0.22 : 0}
          speed={effectiveSpeed}
          scale={ip.scale}
          rotation={0}
          offsetY={
            position === "bottom"
              ? 0.08
              : position === "center" || position === "full"
                ? 0
                : -0.08
          }
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            mixBlendMode: blendMode,
            opacity: frontOpacity,
          }}
        />

        {layers >= 3 && (
          <MeshGradient
            colors={shown.colors}
            distortion={Math.min(1, ip.distortion + 0.05)}
            swirl={Math.min(1, ip.swirl - 0.15)}
            grainMixer={grain === "paper" ? 0.45 : 0}
            grainOverlay={grain === "paper" ? 0.35 : 0}
            speed={effectiveSpeed * 1.4}
            scale={Math.max(0.6, ip.scale - 0.6)}
            rotation={-15}
            offsetX={-0.1}
            offsetY={
              position === "bottom"
                ? 0.18
                : position === "center" || position === "full"
                  ? 0.05
                  : -0.18
            }
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              mixBlendMode: blendMode,
              opacity: ip.microOpacity,
            }}
          />
        )}

        {grain === "match" && <DevalokGrainOverlay isDark={shown.isDark} />}

        {edgeWash && (
          <div className={edgeWash.className} style={{ background: edgeWash.gradient }} />
        )}
      </div>
    </>
  );
}

function computeMaskImage(
  shape: AuroraShape,
  position: AuroraPosition,
): string | undefined {
  if (shape === "full") return undefined;
  const anchor = positionAnchor(position);
  if (shape === "curtain") {
    return `radial-gradient(120% 75% at ${anchor}, black 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.35) 65%, transparent 92%)`;
  }
  if (shape === "ribbon") {
    const y = position === "top" ? "15%" : position === "bottom" ? "85%" : "50%";
    return `linear-gradient(to bottom, transparent 0%, transparent calc(${y} - 30%), black ${y}, transparent calc(${y} + 30%), transparent 100%)`;
  }
  if (shape === "halo") {
    return `radial-gradient(40% 40% at ${anchor}, black 0%, rgba(0,0,0,0.6) 50%, transparent 100%)`;
  }
  return undefined;
}

function positionAnchor(position: AuroraPosition): string {
  switch (position) {
    case "top":
      return "50% -10%";
    case "bottom":
      return "50% 110%";
    case "center":
      return "50% 50%";
    case "full":
      return "50% 50%";
  }
}

function computeEdgeWash(
  position: AuroraPosition,
  ground: string,
): { className: string; gradient: string } | null {
  if (position === "full" || position === "center") return null;
  const groundAlpha = withAlpha(ground, 0.6);
  if (position === "top") {
    return {
      className: "absolute inset-x-0 bottom-0 h-1/2",
      gradient: `linear-gradient(to bottom, transparent 0%, ${groundAlpha} 60%, ${ground} 100%)`,
    };
  }
  return {
    className: "absolute inset-x-0 top-0 h-1/2",
    gradient: `linear-gradient(to top, transparent 0%, ${groundAlpha} 60%, ${ground} 100%)`,
  };
}

const DEVALOK_NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.45' numOctaves='3' seed='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`;

function DevalokGrainOverlay({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: DEVALOK_NOISE_SVG,
        backgroundSize: "160px 160px",
        opacity: isDark ? 0.18 : 0.14,
        mixBlendMode: "overlay",
        filter: "contrast(180%) brightness(105%)",
      }}
    />
  );
}

function useTweenedPalette(target: AuroraPalette, durationMs: number): AuroraPalette {
  const [shown, setShown] = React.useState<AuroraPalette>(target);
  const fromRef = React.useRef<AuroraPalette>(target);
  const shownRef = React.useRef<AuroraPalette>(target);
  const rafRef = React.useRef(0);
  const lastTargetKey = React.useRef<string>(paletteKey(target));

  React.useEffect(() => {
    shownRef.current = shown;
  }, [shown]);

  React.useEffect(() => {
    const targetKey = paletteKey(target);
    if (targetKey === lastTargetKey.current) return;
    lastTargetKey.current = targetKey;

    if (durationMs <= 0) {
      setShown(target);
      fromRef.current = target;
      return;
    }

    fromRef.current = shownRef.current;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = easeInOutCubic(t);
      const colors = fromRef.current.colors.map((from, i) =>
        lerpHex(from, target.colors[i] ?? from, eased),
      ) as AuroraPalette["colors"];
      const ground = lerpHex(fromRef.current.ground, target.ground, eased);
      setShown({ colors, ground, isDark: target.isDark });
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return shown;
}

function paletteKey(p: AuroraPalette): string {
  return `${p.isDark ? "d" : "l"}|${p.colors.join(",")}|${p.ground}`;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${toHex2(r)}${toHex2(g)}${toHex2(bl)}`;
}

function parseHex(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) || 0;
  const g = parseInt(m.slice(2, 4), 16) || 0;
  const b = parseInt(m.slice(4, 6), 16) || 0;
  return [r, g, b];
}

function toHex2(n: number): string {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
}

function withAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const aHex = Math.round(a * 255).toString(16).padStart(2, "0");
  return `${hex}${aHex}`;
}

function useInViewport(ref: React.RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = React.useState(true);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      { rootMargin: "50px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

interface ParallaxOffset {
  x: number;
  y: number;
}

function useParallaxOffset(
  mode: AuroraParallax,
  prefersReducedMotion: boolean,
): ParallaxOffset | null {
  const [offset, setOffset] = React.useState<ParallaxOffset | null>(null);
  const pendingRef = React.useRef<ParallaxOffset | null>(null);
  const rafRef = React.useRef(0);

  React.useEffect(() => {
    if (mode === "off" || prefersReducedMotion) {
      setOffset(null);
      return;
    }
    if (typeof window === "undefined") return;

    const flush = () => {
      rafRef.current = 0;
      if (pendingRef.current) setOffset(pendingRef.current);
    };
    const schedule = (next: ParallaxOffset) => {
      pendingRef.current = next;
      if (rafRef.current === 0) rafRef.current = requestAnimationFrame(flush);
    };

    if (mode === "mouse") {
      const onMove = (e: MouseEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        schedule({ x: -nx * 20, y: -ny * 14 });
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      return () => {
        window.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(rafRef.current);
      };
    }

    if (mode === "scroll") {
      const onScroll = () => {
        const y = window.scrollY * 0.15;
        schedule({ x: 0, y: -y });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(rafRef.current);
      };
    }
  }, [mode, prefersReducedMotion]);

  return offset;
}
