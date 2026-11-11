"use client";

import { useEffect, useRef, useState } from "react";
import { WALL_SHADES } from "@/store/wall-shade";
import { useInView } from "@/lib/use-in-view";
import {
  ChamkiFinishPicker,
  SparkleFlake,
  chamkiColourFor,
  type ChamkiMode,
} from "@/components/sections/chamki-shared";
import { OrderKitButton } from "@/components/sections/order-kit-button";
import { cn } from "@/lib/utils";

const CYCLE_MS = 4200;

const SPARKLE_SPOTS: Array<[number, number, number, number]> = [
  [74, 142, 4, 0],
  [128, 154, 4.6, 0.9],
  [178, 166, 3.6, 0.2],
  [86, 196, 4, 0.7],
  [142, 192, 3.6, 1.5],
  [98, 250, 3.8, 0.1],
  [132, 264, 4.4, 0.8],
];

/** Tiny glitter dots: deterministic positions so SSR and client agree. */
function seededDots(
  count: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  seed: number,
): Array<[number, number, number, number]> {
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  return Array.from({ length: count }, () => [
    +(x0 + rand() * (x1 - x0)).toFixed(1),
    +(y0 + rand() * (y1 - y0)).toFixed(1),
    +(0.5 + rand() * 0.8).toFixed(2),
    +(rand() * 1.9).toFixed(2),
  ]);
}

const FACADE_GLITTER_DOTS = seededDots(26, 58, 194, 118, 290, 0x2545f491);

/** Mix two hex colours. amount = share of `to`. */
function mixHex(from: string, to: string, amount: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const a = parse(from);
  const b = parse(to);
  const out = a.map((channel, i) =>
    Math.round(channel + (b[i] - channel) * amount),
  );
  return `#${out.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

const lighten = (hex: string, a: number) => mixHex(hex, "#FFFFFF", a);
const darken = (hex: string, a: number) => mixHex(hex, "#0B0F14", a);

/**
 * Modern facade demo for the About page. The rendered feature wall carries
 * the selected madrasi dana shade while the rest of the house re-tones with
 * matching contrast colours derived from the same shade, so the building
 * always reads as one coherent composition.
 */
export function FacadeVisualizer({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);

  const { ref, inView } = useInView<HTMLDivElement>();
  const shade = WALL_SHADES[active] ?? WALL_SHADES[0];

  useEffect(() => {
    if (hold || paused || !inView) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % WALL_SHADES.length);
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [hold, paused, inView]);

  const [chamkiPin, setChamkiPin] = useState<ChamkiMode>(null);
  const chamkiColour = chamkiColourFor(active, chamkiPin);

  // Derived palette: the whole house responds to the selected shade.
  const wallMain = lighten(shade.hex, 0.88);
  const wallUpper = lighten(shade.hex, 0.93);
  const trim = darken(shade.hex, 0.55);
  const door = darken(shade.hex, 0.18);
  const rail = darken(shade.hex, 0.62);
  const planter = darken(shade.hex, 0.35);

  return (
    <div
      ref={ref}
      data-visible={inView}
      className={cn("reveal", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* One continuous card: illustration flows into the shade controls. */}
      <div className="surface-card overflow-hidden rounded-3xl">
        <svg viewBox="0 0 480 348" className="block h-auto w-full" role="img" aria-label={`Modern house with the render wall finished in ${shade.name.toLowerCase()} madrasi dana`}>
          <defs>
            <linearGradient id="fc2-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#D3E6F5" />
              <stop offset="1" stopColor="#EDF4FA" />
            </linearGradient>
            <linearGradient id="fc2-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#DFEBF6" />
              <stop offset="0.5" stopColor="#BFD9F0" />
              <stop offset="1" stopColor="#EAF2F9" />
            </linearGradient>
            <pattern id="fc2-granules" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="5" r="1.6" fill="#FFFFFF" fillOpacity="0.4" />
              <circle cx="15" cy="3" r="1.2" fill="#000000" fillOpacity="0.18" />
              <circle cx="22" cy="12" r="1.8" fill="#FFFFFF" fillOpacity="0.3" />
              <circle cx="9" cy="18" r="1.4" fill="#000000" fillOpacity="0.16" />
              <circle cx="18" cy="22" r="1.2" fill="#FFFFFF" fillOpacity="0.34" />
            </pattern>
            <linearGradient id="fc2-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F6D87C" />
              <stop offset="1" stopColor="#C08F1E" />
            </linearGradient>
            <linearGradient id="fc2-silver" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F2F5F9" />
              <stop offset="1" stopColor="#9AA6B8" />
            </linearGradient>
            <pattern id="fc2-granules2" width="37" height="37" patternUnits="userSpaceOnUse" patternTransform="rotate(24) scale(1.35)">
              <circle cx="6" cy="8" r="1.9" fill="#000000" fillOpacity="0.13" />
              <circle cx="20" cy="4" r="1.5" fill="#FFFFFF" fillOpacity="0.32" />
              <circle cx="31" cy="16" r="2" fill="#000000" fillOpacity="0.12" />
              <circle cx="13" cy="26" r="1.6" fill="#FFFFFF" fillOpacity="0.3" />
              <circle cx="28" cy="30" r="1.3" fill="#000000" fillOpacity="0.14" />
            </pattern>
          </defs>

          {/* Sky + ground */}
          <rect x="0" y="0" width="480" height="292" fill="url(#fc2-sky)" />
          <rect x="0" y="292" width="480" height="56" fill="#CBD3BE" />
          <rect x="0" y="292" width="480" height="5" fill="#B9C2AB" />
          {/* Paved walkway on the right, widening toward the viewer and
              aligned with the entrance portal so it reads as the approach. */}
          <polygon points="372,298 430,298 446,348 356,348" fill="#D8D4C7" />
          <g stroke="#C2BEAF" strokeWidth="2">
            <path d="M367 314 H435" /><path d="M361 331 H441" />
          </g>

          {/* Building mass: main block + upper recess */}
          <rect x="34" y="96" width="412" height="200" fill={wallMain} style={{ transition: "fill 700ms ease" }} />
          <rect x="34" y="96" width="412" height="200" fill="none" stroke="#0F172A" strokeOpacity="0.06" strokeWidth="2" />

          {/* Roof slab */}
          <rect x="22" y="80" width="436" height="20" rx="4" fill={trim} style={{ transition: "fill 700ms ease" }} />
          <rect x="22" y="80" width="436" height="5" rx="2.5" fill={darken(shade.hex, 0.68)} />

          {/* Feature render wall — the repaintable dana surface */}
          <g>
            <rect x="52" y="112" width="148" height="184" fill={shade.hex} style={{ transition: "fill 700ms ease" }} />
            <rect x="52" y="112" width="148" height="184" fill="url(#fc2-granules)" opacity="0.55" />
            <rect x="52" y="112" width="148" height="184" fill="url(#fc2-granules2)" opacity="0.5" />
            <g opacity="0.28">
              <circle cx="86" cy="140" r="7" fill="#FFFFFF" opacity="0.2" />
              <circle cx="162" cy="130" r="5" fill="#000000" opacity="0.12" />
              <circle cx="126" cy="272" r="8" fill="#000000" opacity="0.1" />
              <circle cx="178" cy="238" r="6" fill="#FFFFFF" opacity="0.18" />
            </g>
            {/* Tiny twinkling glitter dots across the render */}
            <g aria-hidden="true">
                {FACADE_GLITTER_DOTS.map(([cx, cy, r, delay], i) => (
                  <circle
                    key={`dot-${i}`}
                    className="gph-sparkle"
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={chamkiColour === "gold" ? "#FFE9A8" : "#F0F6FC"}
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
                {SPARKLE_SPOTS.map(([cx, cy, size, delay]) => (
                  <SparkleFlake
                    key={`flake-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    size={size}
                    colourId={chamkiColour === "gold" ? "fc2-gold" : "fc2-silver"}
                    delay={delay}
                  />
                ))}
          </g>
          </g>

          {/* Upper glazing band */}
          <g>
            <rect x="216" y="112" width="212" height="80" rx="3" fill="url(#fc2-glass)" />
            <rect x="216" y="112" width="212" height="80" rx="3" fill="none" stroke={trim} strokeWidth="5" />
            <path d="M322 112 V192" stroke={trim} strokeWidth="4" />
            <path d="M236 122 L278 186" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="6" />
            <path d="M250 122 L292 186" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="4" />
          </g>

          {/* Mid band with slats (contrasting trim tone) */}
          <rect x="216" y="192" width="212" height="10" fill={darken(shade.hex, 0.35)} />

          {/* Ground floor glazing */}
          <g>
            <rect x="216" y="210" width="130" height="86" rx="3" fill="url(#fc2-glass)" />
            <rect x="216" y="210" width="130" height="86" rx="3" fill="none" stroke={trim} strokeWidth="4" />
            <path d="M281 210 V296" stroke={trim} strokeWidth="3.5" />
            <path d="M236 218 L268 290" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="5" />
          </g>

          {/* Entrance: recessed portal + door */}
          <g>
            <rect x="356" y="200" width="90" height="96" fill={wallUpper} style={{ transition: "fill 700ms ease" }} />
            <rect x="368" y="210" width="66" height="86" rx="3" fill={door} style={{ transition: "fill 700ms ease" }} />
            <rect x="368" y="210" width="66" height="86" rx="3" fill="none" stroke={darken(shade.hex, 0.3)} strokeWidth="2" />
            <rect x="374" y="218" width="54" height="30" rx="2" fill="url(#fc2-glass)" opacity="0.9" />
            <circle cx="426" cy="262" r="3.2" fill="#E3C98A" />
            {/* House number, clear of the door edge */}
            <rect x="356" y="222" width="9" height="34" fill={rail} style={{ transition: "fill 700ms ease" }} />
          </g>

          {/* Canopy over the entrance */}
          <rect x="348" y="192" width="106" height="10" rx="3" fill={rail} style={{ transition: "fill 700ms ease" }} />

          {/* Planter on the path, clear of the entrance */}
          <g>
            <rect x="136" y="270" width="40" height="26" rx="4" fill={planter} style={{ transition: "fill 700ms ease" }} />
            <path d="M156 268c-2-14 4-24 2-31 6 7 8 19 5 31Z" fill="#3E7C4F" />
            <path d="M156 268c-9-10-10-21-15-26 10 3 17 15 15 26Z" fill="#4E9260" />
            <path d="M156 268c8-9 10-19 15-23-9 1-15 13-15 23Z" fill="#356B44" />
          </g>

          {/* Active shade pill — sized generously so text never leaves the box */}
          <g>
            <rect x="34" y="40" width="168" height="30" rx="15" fill="#0F172A" fillOpacity="0.74" />
            <circle cx="54" cy="55" r="8" fill={shade.hex} style={{ transition: "fill 700ms ease" }} stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.5" />
            <text x="70" y="59" fontFamily="Inter, DejaVu Sans, Arial, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="1.2" fill="#FFFFFF">
              {shade.name.toUpperCase()} · RENDER
            </text>
          </g>

          {/* Ground shadow */}
          {/* Ground shadow, anchored toward the entrance side */}
          <ellipse cx="330" cy="300" rx="210" ry="9" fill="#0F172A" opacity="0.08" />
        </svg>

        {/* Controls attached to the same card — no seams */}
        <div className="border-t border-border/70 bg-card p-4 sm:p-5">
          <fieldset>
            <legend className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              फ़ैसाडे पर रंग भरने के लिए शेड चुनें
            </legend>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {WALL_SHADES.map((option, i) => (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={i === active}
                  onClick={() => {
                    setActive(i);
                    setHold(true);
                    if (holdTimer.current) window.clearTimeout(holdTimer.current);
                    holdTimer.current = window.setTimeout(
                      () => setHold(false),
                      9000,
                    );
                  }}
                  className={cn(
                    "dana-texture inline-flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-semibold transition-all",
                    i === active
                      ? "border-primary ring-2 ring-ring/40"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <span
                    className="size-7 overflow-hidden rounded-full border border-black/10"
                    style={{ background: option.hex }}
                    aria-hidden
                  />
                  {option.name}
                  <span className="sr-only">— render the facade with this shade</span>
                </button>
              ))}
            </div>
          </fieldset>
          <ChamkiFinishPicker
            colour={chamkiColour}
            onPick={(colour) => {
              setChamkiPin(chamkiPin === colour ? null : colour);
            }}
          />
          <OrderKitButton className="mt-4" chamkiColour={chamkiColour} />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            शेड अपने आप बदलते रहते हैं; पक्का करने के लिए किसी एक पर tap करें। “इस सेटअप को
            ऑर्डर करें” आपके चुने शेड का बैग और स्टार्टर बाइंडर, सीएमसी,
            चमकी और गुरमाला जोड़ता है — हर मात्रा ऑर्डर लिस्ट में बदल सकती है।
            order list.
          </p>
        </div>
      </div>
    </div>
  );
}
