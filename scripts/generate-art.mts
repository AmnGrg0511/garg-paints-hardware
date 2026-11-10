/**
 * Regenerates the raster art from generated SVG sources:
 *  - public/products/*.webp           base product tiles (800px)
 *  - public/products/madrasi-*.webp   per-shade tiles (800px)
 *  - public/products/cmc-*.webp       per-grade tiles (800px)
 *  - public/art/dana-texture.png      granule speckle overlay tile
 *  - src/app/icon.png                 512px app icon
 *  - public/og.png                    1200x630 social card
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const FONT = "Inter, DejaVu Sans, Arial, sans-serif";

type Shade = {
  key: string;
  name: string;
  hex: string;
  /** Dark ink for text on the white label panel. */
  ink: string;
  /** Shade-name accent colour on the white label. */
  accent: string;
  fabric: string;
  border: string;
  stitch: string;
  topFold: string;
};

const madrasiShades: Shade[] = [
  {
    key: "white",
    name: "WHITE",
    hex: "#F2ECDD",
    ink: "#4A4235",
    accent: "#4A4235",
    fabric: "#F4EFE3",
    border: "#C9BFA9",
    stitch: "#A99F87",
    topFold: "#D8CFBA",
  },
  {
    key: "red",
    name: "RED",
    hex: "#A84328",
    ink: "#4A4235",
    accent: "#A84328",
    fabric: "#A84328",
    border: "#7E3220",
    stitch: "#6B2717",
    topFold: "#8C341F",
  },
  {
    key: "yellow",
    name: "YELLOW",
    hex: "#F0A868",
    ink: "#4A4235",
    accent: "#B36A1E",
    fabric: "#F0A868",
    border: "#C9813F",
    stitch: "#B3763C",
    topFold: "#D58F51",
  },
  {
    key: "green",
    name: "GREEN",
    hex: "#3D6B41",
    ink: "#4A4235",
    accent: "#3D6B41",
    fabric: "#3D6B41",
    border: "#2E5232",
    stitch: "#263F28",
    topFold: "#33593A",
  },
  {
    key: "black",
    name: "BLACK",
    hex: "#2B2B2E",
    ink: "#4A4235",
    accent: "#2B2B2E",
    fabric: "#2B2B2E",
    border: "#1C1C1F",
    stitch: "#141416",
    topFold: "#212124",
  },
];

const weave = `<pattern id="weave" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="14" height="14" fill="none"/>
      <path d="M0 3.5 H14 M3.5 0 V14" stroke="#000000" stroke-opacity="0.10" stroke-width="2"/>
    </pattern>`;

const sackShade = `<linearGradient id="sackShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.28"/>
      <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.2"/>
    </linearGradient>`;

function sackDefs(extra = ""): string {
  return `<defs>
    ${extra}
    ${weave}
    ${sackShade}
  </defs>`;
}

/** One woven sack with the singular-style label: chip + name + MADRASI DANA. */
function sack(
  x: number,
  y: number,
  shade: Shade,
  scale = 1,
  idSuffix = "",
): string {
  const w = 300 * scale;
  const h = 380 * scale;
  return `<g transform="translate(${x} ${y})">
    <path d="M0 ${h * 0.09} Q${-4 * scale} ${h * 0.03} ${w * 0.1} ${h * 0.02} L${w * 0.9} ${h * 0.02} Q${w + 4 * scale} ${h * 0.03} ${w} ${h * 0.09} L${w * 1.03} ${h * 0.94} Q${w} ${h} ${w * 0.88} ${h} L${w * 0.12} ${h} Q0 ${h} ${-3 * scale} ${h * 0.94} Z"
          fill="${shade.fabric}" stroke="${shade.border}" stroke-width="${4 * scale}"/>
    <path d="M0 ${h * 0.09} Q${-4 * scale} ${h * 0.03} ${w * 0.1} ${h * 0.02} L${w * 0.9} ${h * 0.02} Q${w + 4 * scale} ${h * 0.03} ${w} ${h * 0.09} L${w * 1.03} ${h * 0.94} Q${w} ${h} ${w * 0.88} ${h} L${w * 0.12} ${h} Q0 ${h} ${-3 * scale} ${h * 0.94} Z"
          fill="url(#weave${idSuffix})"/>
    <path d="M0 ${h * 0.09} Q${-4 * scale} ${h * 0.03} ${w * 0.1} ${h * 0.02} L${w * 0.9} ${h * 0.02} Q${w + 4 * scale} ${h * 0.03} ${w} ${h * 0.09} L${w * 1.03} ${h * 0.94} Q${w} ${h} ${w * 0.88} ${h} L${w * 0.12} ${h} Q0 ${h} ${-3 * scale} ${h * 0.94} Z"
          fill="url(#sackShade${idSuffix})"/>
    <rect x="${w * 0.04}" y="0" width="${w * 0.92}" height="${h * 0.055}" rx="${8 * scale}" fill="${shade.topFold}"/>
    <polyline points="${Array.from(
      { length: 14 },
      (_, i) => `${w * (0.05 + i * 0.067)},${h * 0.052 * (i % 2 ? 0.4 : 1)}`,
    ).join(" ")}"
              fill="none" stroke="${shade.stitch}" stroke-width="${4.5 * scale}" stroke-linecap="round"/>
    <rect x="${w * 0.05}" y="${h * 0.1}" width="${w * 0.08}" height="${h * 0.8}" rx="${6 * scale}" fill="#FFFFFF" opacity="${shade.key === "white" ? "0.5" : "0.22"}"/>
    <!-- Label patch, same style as the singular bags -->
    <rect x="${w * 0.16}" y="${h * 0.36}" width="${w * 0.68}" height="${h * 0.32}" rx="${10 * scale}" fill="#FFFFFF" stroke="${shade.border}" stroke-width="${3 * scale}"/>
    <circle cx="${w * 0.3}" cy="${h * 0.45}" r="${18 * scale}" fill="${shade.hex}" stroke="${shade.border}" stroke-width="${3 * scale}"/>
    <text x="${w * 0.44}" y="${h * 0.44}" font-family="${FONT}" font-size="${20 * scale}" font-weight="700" letter-spacing="${0.6 * scale}" fill="#4A4235">MADRASI</text>
    <text x="${w * 0.44}" y="${h * 0.52}" font-family="${FONT}" font-size="${15 * scale}" font-weight="700" letter-spacing="${1.2 * scale}" fill="#4A4235">DANA</text>
    <text x="${w * 0.5}" y="${h * 0.63}" text-anchor="middle" font-family="${FONT}" font-size="${17 * scale}" font-weight="700" letter-spacing="${2 * scale}" fill="${shade.accent}">${shade.name}</text>
  </g>`;
}

function granules(cx: number, cy: number, fill: string, n = 8): string {
  const dots = Array.from({ length: n }, (_, i) => {
    const dx = (i * 37) % 120 - 60;
    const dy = ((i * 53) % 26) - 6;
    return `<circle cx="${cx + dx}" cy="${cy + dy}" r="${5 + (i % 3)}" fill="${fill}"/>`;
  }).join("\n    ");
  return dots;
}

// ---------------------------------------------------------------------------
// Single-shade madrasi tiles
// ---------------------------------------------------------------------------
for (const shade of madrasiShades) {
  const grainFill = shade.key === "white" ? "#C9B493" : shade.hex;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="Madrasi dana wall texture sack in ${shade.name.toLowerCase()}">
  ${sackDefs(
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#F7F2E8"/>
      <stop offset="1" stop-color="#E9DFCC"/>
    </linearGradient>`,
  )}
  <rect width="800" height="800" fill="url(#bg)"/>
  <ellipse cx="400" cy="716" rx="250" ry="32" fill="#5C4A33" opacity="0.16"/>
  ${sack(236, 220, shade, 1.12)}
  <path d="M330 690 Q334 714 394 714 L476 714 Q536 714 544 692 Q558 718 470 726 L384 726 Q334 720 330 690 Z" fill="${grainFill}" opacity="0.95"/>
  ${granules(396, 712, grainFill)}
</svg>
`;
  await writeFile(`public/products/madrasi-dana-${shade.key}.svg`, svg);
  await sharp(Buffer.from(svg))
    .resize(800, 800)
    .webp({ quality: 84 })
    .toFile(`public/products/madrasi-dana-${shade.key}.webp`);
  console.log(`products/madrasi-dana-${shade.key}.webp`);
}

// ---------------------------------------------------------------------------
// CMC: two big sacks — white grade + yellow grade, each with its own label
// ---------------------------------------------------------------------------
type Grade = {
  key: string;
  name: string;
  chip: string;
  chipBorder: string;
  powder: string;
};

const cmcGrades: Grade[] = [
  {
    key: "white",
    name: "WHITE",
    chip: "#F4F5F7",
    chipBorder: "#B9C2CC",
    powder: "#EDF0F4",
  },
  {
    key: "yellow",
    name: "YELLOW",
    chip: "#F2C230",
    chipBorder: "#C79F1E",
    powder: "#EFDCA6",
  },
];

function cmcSack(x: number, y: number, grade: Grade, scale = 1): string {
  const w = 300 * scale;
  const h = 360 * scale;
  return `<g transform="translate(${x} ${y})">
    <path d="M0 ${h * 0.07} Q${-4 * scale} ${h * 0.02} ${w * 0.1} ${h * 0.01} L${w * 0.9} ${h * 0.01} Q${w + 4 * scale} ${h * 0.02} ${w} ${h * 0.07} L${w * 1.02} ${h * 0.94} Q${w} ${h} ${w * 0.88} ${h} L${w * 0.12} ${h} Q0 ${h} ${-2 * scale} ${h * 0.94} Z"
          fill="url(#kraft)" stroke="#8F6C3E" stroke-width="${4 * scale}"/>
    <rect x="${w * 0.04}" y="0" width="${w * 0.92}" height="${h * 0.08}" rx="${8 * scale}" fill="url(#flap)" stroke="#8F6C3E" stroke-width="${3 * scale}"/>
    <g fill="#7C5C33">
      ${Array.from(
        { length: 9 },
        (_, i) => `<circle cx="${w * (0.1 + i * 0.1)}" cy="${h * 0.04}" r="${3.5 * scale}"/>`,
      ).join("")}
    </g>
    <rect x="${w * 0.06}" y="${h * 0.14}" width="${w * 0.88}" height="${h * 0.5}" rx="${10 * scale}" fill="#FFFFFF" stroke="#D9CBAF" stroke-width="${3 * scale}"/>
    <text x="${w * 0.5}" y="${h * 0.26}" text-anchor="middle" font-family="${FONT}" font-size="${42 * scale}" font-weight="700" letter-spacing="${3 * scale}" fill="#2E3A4E">CMC</text>
    <text x="${w * 0.5}" y="${h * 0.33}" text-anchor="middle" font-family="${FONT}" font-size="${13 * scale}" font-weight="700" letter-spacing="${0.8 * scale}" fill="#5C6B82">CARBOXYMETHYL</text>
    <text x="${w * 0.5}" y="${h * 0.38}" text-anchor="middle" font-family="${FONT}" font-size="${13 * scale}" font-weight="700" letter-spacing="${0.8 * scale}" fill="#5C6B82">CELLULOSE</text>
    <rect x="${w * 0.36}" y="${h * 0.41}" width="${w * 0.28}" height="${3 * scale}" fill="#D9CBAF"/>
    <rect x="${w * 0.3}" y="${h * 0.45}" width="${w * 0.4}" height="${h * 0.14}" rx="${8 * scale}" fill="#FFFFFF" stroke="#C9BFA9" stroke-width="${2.5 * scale}"/>
    <circle cx="${w * 0.38}" cy="${h * 0.52}" r="${10 * scale}" fill="${grade.chip}" stroke="${grade.chipBorder}" stroke-width="${2 * scale}"/>
    <text x="${w * 0.46}" y="${h * 0.525}" font-family="${FONT}" font-size="${14 * scale}" font-weight="700" letter-spacing="${1 * scale}" fill="#5C6B82">${grade.name}</text>
  </g>`;
}

const cmcSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="Two CMC powder sacks — white and yellow grades">
  ${sackDefs(
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#F4F7FA"/>
      <stop offset="1" stop-color="#E3EAF2"/>
    </linearGradient>
    <linearGradient id="kraft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#D2A97C"/>
      <stop offset="0.5" stop-color="#C1955F"/>
      <stop offset="1" stop-color="#A67F4C"/>
    </linearGradient>
    <linearGradient id="flap" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#B9905C"/>
      <stop offset="1" stop-color="#9C7442"/>
    </linearGradient>`,
  )}
  <rect width="800" height="800" fill="url(#bg)"/>
  <ellipse cx="400" cy="712" rx="270" ry="32" fill="#33415C" opacity="0.14"/>
  ${cmcSack(76, 180, cmcGrades[0], 1.1)}
  ${cmcSack(414, 196, cmcGrades[1], 1.1)}
  <path d="M180 690 Q186 714 252 714 L318 714 Q386 714 392 692 Q400 718 310 726 L236 726 Q186 720 180 690 Z" fill="${cmcGrades[0].powder}"/>
  <path d="M520 700 Q526 716 578 716 L636 716 Q690 716 696 698 Q702 720 626 726 L566 726 Q526 720 520 700 Z" fill="${cmcGrades[1].powder}"/>
</svg>
`;
await writeFile("public/products/cmc-powder.svg", cmcSvg);
await sharp(Buffer.from(cmcSvg))
  .resize(800, 800)
  .webp({ quality: 84 })
  .toFile("public/products/cmc-powder.webp");
console.log("products/cmc-powder.webp (two big sacks)");

// Per-grade CMC tiles (single sack) for the variant switcher.
for (const grade of cmcGrades) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="CMC powder sack, ${grade.name.toLowerCase()} grade">
  ${sackDefs(
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#F4F7FA"/>
      <stop offset="1" stop-color="#E3EAF2"/>
    </linearGradient>
    <linearGradient id="kraft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#D2A97C"/>
      <stop offset="0.5" stop-color="#C1955F"/>
      <stop offset="1" stop-color="#A67F4C"/>
    </linearGradient>
    <linearGradient id="flap" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#B9905C"/>
      <stop offset="1" stop-color="#9C7442"/>
    </linearGradient>`,
  )}
  <rect width="800" height="800" fill="url(#bg)"/>
  <ellipse cx="400" cy="712" rx="250" ry="32" fill="#33415C" opacity="0.14"/>
  ${cmcSack(236, 230, grade, 1.12)}
  <path d="M320 690 Q326 714 392 714 L450 714 Q518 714 524 692 Q530 718 440 726 L384 726 Q326 720 320 690 Z" fill="${grade.powder}"/>
</svg>
`;
  await writeFile(`public/products/cmc-powder-${grade.key}.svg`, svg);
  await sharp(Buffer.from(svg))
    .resize(800, 800)
    .webp({ quality: 84 })
    .toFile(`public/products/cmc-powder-${grade.key}.webp`);
  console.log(`products/cmc-powder-${grade.key}.webp`);
}


// ---------------------------------------------------------------------------
// Chamki: golden + silver pouch tiles and the two-pouch collective
// ---------------------------------------------------------------------------
type ChamkiColour = {
  key: string;
  name: string;
  flakeTop: string;
  flakeBottom: string;
  spill: string;
  accent: string;
};

const chamkiColours: ChamkiColour[] = [
  {
    key: "gold",
    name: "GOLDEN",
    flakeTop: "#F6D87C",
    flakeBottom: "#C08F1E",
    spill: "#E4B33F",
    accent: "#E9C356",
  },
  {
    key: "silver",
    name: "SILVER",
    flakeTop: "#F2F5F9",
    flakeBottom: "#9AA6B8",
    spill: "#C9D6E4",
    accent: "#C7D3E2",
  },
];

function chamkiPouch(
  x: number,
  y: number,
  colour: ChamkiColour,
  scale = 1,
  idSuffix = "",
): string {
  const w = 250 * scale;
  const h = 400 * scale;
  return `<g transform="translate(${x} ${y})">
    <path d="M0 ${h * 0.08} Q0 0 ${w * 0.14} 0 L${w * 0.86} 0 Q${w} 0 ${w} ${h * 0.08} L${w * 1.04} ${h * 0.92} Q${w} ${h} ${w * 0.88} ${h} L${w * 0.12} ${h} Q0 ${h} ${-w * 0.04} ${h * 0.92} Z"
          fill="url(#pouchFill${idSuffix})" stroke="${colour.flakeBottom}" stroke-opacity="0.55" stroke-width="${3.5 * scale}"/>
    <rect x="${w * 0.07}" y="${-h * 0.03}" width="${w * 0.86}" height="${h * 0.05}" rx="${10 * scale}" fill="none" stroke="${colour.flakeBottom}" stroke-opacity="0.5" stroke-width="${3 * scale}" stroke-dasharray="${12 * scale} ${8 * scale}"/>
    <path d="M${w * 0.08} ${h * 0.1} L${w * 0.08} ${h * 0.9} L${w * 0.16} ${h * 0.9} L${w * 0.16} ${h * 0.1} Z" fill="#FFFFFF" opacity="0.1"/>
    <path d="M${w * 0.9} ${h * 0.12} L${w * 0.9} ${h * 0.88} L${w * 0.83} ${h * 0.88} L${w * 0.83} ${h * 0.12} Z" fill="#000000" opacity="0.18"/>
    <rect x="${w * 0.14}" y="${h * 0.4}" width="${w * 0.72}" height="${h * 0.26}" rx="${10 * scale}" fill="url(#labelFill${idSuffix})" stroke="${colour.flakeBottom}" stroke-opacity="0.4" stroke-width="${2.5 * scale}"/>
    <text x="${w * 0.5}" y="${h * 0.5}" text-anchor="middle" font-family="${FONT}" font-size="${34 * scale}" font-weight="700" letter-spacing="${3 * scale}" fill="${colour.accent}">CHAMKI</text>
    <text x="${w * 0.5}" y="${h * 0.57}" text-anchor="middle" font-family="${FONT}" font-size="${14 * scale}" font-weight="700" letter-spacing="${2 * scale}" fill="#9AA6B8">${colour.name}</text>
    ${Array.from(
      { length: 9 },
      (_, i) => {
        const fx = w * (0.18 + ((i * 0.29) % 0.66));
        const fy = h * (0.72 + ((i * 0.13) % 0.2));
        const fs = (7 + (i % 3) * 2) * scale;
        return `<path transform="translate(${fx} ${fy})" fill="url(#flakeFill${idSuffix})" d="M0 ${-fs} L${fs * 0.28} ${-fs * 0.28} L${fs} 0 L${fs * 0.28} ${fs * 0.28} L0 ${fs} L${-fs * 0.28} ${fs * 0.28} L${-fs} 0 L${-fs * 0.28} ${-fs * 0.28} Z"/>`;
      },
    ).join("")}
  </g>`;
}

function chamkiDefs(colour: ChamkiColour, idSuffix = ""): string {
  return `<defs>
    <linearGradient id="bg${idSuffix}" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#232A36"/>
      <stop offset="1" stop-color="#141922"/>
    </linearGradient>
    <linearGradient id="pouchFill${idSuffix}" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#FFFFFF" stop-opacity="0.16"/>
      <stop offset="0.35" stop-color="#FFFFFF" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="labelFill${idSuffix}" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#2C3542"/>
      <stop offset="1" stop-color="#1B2230"/>
    </linearGradient>
    <linearGradient id="flakeFill${idSuffix}" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${colour.flakeTop}"/>
      <stop offset="1" stop-color="${colour.flakeBottom}"/>
    </linearGradient>
  </defs>`;
}

// Per-colour tiles (variant switcher)
for (const colour of chamkiColours) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="Chamki glitter powder pouch, ${colour.name.toLowerCase()} finish">
  ${chamkiDefs(colour)}
  <rect width="800" height="800" fill="url(#bg)"/>
  <ellipse cx="400" cy="708" rx="230" ry="28" fill="#000000" opacity="0.45"/>
  ${chamkiPouch(275, 150, colour, 1.0)}
  <g fill="url(#flakeFill)">
    <path transform="translate(300 690)" fill="url(#flakeFill)" d="M0 -9 L2.5 -2.5 9 0 2.5 2.5 0 9 -2.5 2.5 -9 0 -2.5 -2.5 Z"/>
    <path transform="translate(348 706)" fill="url(#flakeFill)" d="M0 -8 L2.2 -2.2 8 0 2.2 2.2 0 8 -2.2 2.2 -8 0 -2.2 -2.2 Z"/>
    <path transform="translate(398 694)" fill="url(#flakeFill)" d="M0 -9 L2.5 -2.5 9 0 2.5 2.5 0 9 -2.5 2.5 -9 0 -2.5 -2.5 Z"/>
    <path transform="translate(446 706)" fill="url(#flakeFill)" d="M0 -8 L2.2 -2.2 8 0 2.2 2.2 0 8 -2.2 2.2 -8 0 -2.2 -2.2 Z"/>
    <path transform="translate(494 692)" fill="url(#flakeFill)" d="M0 -9 L2.5 -2.5 9 0 2.5 2.5 0 9 -2.5 2.5 -9 0 -2.5 -2.5 Z"/>
    <circle cx="324" cy="712" r="6" fill="url(#flakeFill)"/>
    <circle cx="372" cy="716" r="5" fill="url(#flakeFill)"/>
    <circle cx="422" cy="712" r="6" fill="url(#flakeFill)"/>
    <circle cx="470" cy="716" r="5" fill="url(#flakeFill)"/>
  </g>
</svg>
`;
  await writeFile(`public/products/chamki-powder-${colour.key}.svg`, svg);
  await sharp(Buffer.from(svg))
    .resize(800, 800)
    .webp({ quality: 84 })
    .toFile(`public/products/chamki-powder-${colour.key}.webp`);
  console.log(`products/chamki-powder-${colour.key}.webp`);
}

// Collective: two pouches, golden + silver
{
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="Golden and silver chamki glitter powder pouches">
  ${chamkiDefs(chamkiColours[0], "")}
  <linearGradient id="flakeFillS" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${chamkiColours[1].flakeTop}"/>
      <stop offset="1" stop-color="${chamkiColours[1].flakeBottom}"/>
    </linearGradient>
  <rect width="800" height="800" fill="url(#bg)"/>
  <ellipse cx="400" cy="712" rx="300" ry="30" fill="#000000" opacity="0.45"/>
  ${chamkiPouch(70, 170, chamkiColours[0], 1.02)}
  ${chamkiPouch(415, 186, chamkiColours[1], 1.02, "S")}
  <g fill="url(#flakeFill)">
    <path transform="translate(190 700)" d="M0 -8 L2.2 -2.2 8 0 2.2 2.2 0 8 -2.2 2.2 -8 0 -2.2 -2.2 Z"/>
    <path transform="translate(240 712)" d="M0 -7 L2 -2 7 0 2 2 0 7 -2 2 -7 0 -2 -2 Z"/>
    <circle cx="268" cy="708" r="5" />
  </g>
  <g fill="url(#flakeFillS)">
    <path transform="translate(530 700)" d="M0 -8 L2.2 -2.2 8 0 2.2 2.2 0 8 -2.2 2.2 -8 0 -2.2 -2.2 Z"/>
    <path transform="translate(580 712)" d="M0 -7 L2 -2 7 0 2 2 0 7 -2 2 -7 0 -2 -2 Z"/>
    <circle cx="610" cy="708" r="5" />
  </g>
</svg>
`;
  await sharp(Buffer.from(svg))
    .resize(800, 800)
    .webp({ quality: 84 })
    .toFile("public/products/chamki-powder.webp");
  console.log("products/chamki-powder.webp (two pouches)");
}

// ---------------------------------------------------------------------------
// Madrasi collective: five bigger, tightly packed sacks, singular-style labels
// ---------------------------------------------------------------------------
const madrasiCollective = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="Madrasi dana wall texture sacks in white, red, yellow, green and black">
  ${sackDefs(
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#F7F2E8"/>
      <stop offset="1" stop-color="#E9DFCC"/>
    </linearGradient>`,
  )}
  <rect width="800" height="800" fill="url(#bg)"/>
  <ellipse cx="400" cy="740" rx="320" ry="34" fill="#5C4A33" opacity="0.16"/>
  <!-- Back row: green + black, taller in frame -->
  ${sack(150, 130, madrasiShades[3], 1.06, "-b1")}
  ${sack(428, 142, madrasiShades[4], 1.06, "-b2")}
  <!-- Front row: white + red + yellow, tightly packed -->
  ${sack(30, 356, madrasiShades[0], 1.22, "-f1")}
  ${sack(292, 372, madrasiShades[1], 1.22, "-f2")}
  ${sack(554, 356, madrasiShades[2], 1.22, "-f3")}
  <g fill="#C9B493">
    <circle cx="270" cy="736" r="9"/><circle cx="300" cy="742" r="8"/><circle cx="330" cy="734" r="9"/>
    <circle cx="492" cy="742" r="8"/><circle cx="520" cy="736" r="7"/>
  </g>
</svg>
`;
await sharp(Buffer.from(madrasiCollective))
  .resize(800, 800)
  .webp({ quality: 84 })
  .toFile("public/products/madrasi-dana.webp");
console.log("products/madrasi-dana.webp (five big sacks)");

// ---------------------------------------------------------------------------
// Granule speckle overlay tile for colour backdrops (dots + impurities)
// ---------------------------------------------------------------------------
{
  const SIZE = 320;
  const raw = Buffer.alloc(SIZE * SIZE * 4);
  let seed = 0x2545f491;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const put = (x: number, y: number, r: number, dark: boolean, alpha: number) => {
    // Wrap-around so the tile seams stay invisible.
    for (const ox of [-SIZE, 0, SIZE]) {
      for (const oy of [-SIZE, 0, SIZE]) {
        const cx = x + ox;
        const cy = y + oy;
        const r2 = r * r;
        for (let py = Math.max(0, Math.floor(cy - r)); py < Math.min(SIZE, Math.ceil(cy + r)); py += 1) {
          for (let px = Math.max(0, Math.floor(cx - r)); px < Math.min(SIZE, Math.ceil(cx + r)); px += 1) {
            const dx = px - cx;
            const dy = py - cy;
            if (dx * dx + dy * dy <= r2) {
              const i = py * SIZE + px;
              if (dark) {
                raw[i * 4] = 24; raw[i * 4 + 1] = 16; raw[i * 4 + 2] = 8;
              } else {
                raw[i * 4] = 255; raw[i * 4 + 1] = 249; raw[i * 4 + 2] = 238;
              }
              raw[i * 4 + 3] = Math.max(raw[i * 4 + 3], Math.round(alpha));
            }
          }
        }
      }
    }
  };

  // Granule clusters: short random walks of dots, like dana aggregate.
  for (let c = 0; c < 46; c += 1) {
    let cx = random() * SIZE;
    let cy = random() * SIZE;
    const steps = 3 + Math.floor(random() * 5);
    for (let i = 0; i < steps; i += 1) {
      cx = (cx + (random() - 0.5) * 22 + SIZE) % SIZE;
      cy = (cy + (random() - 0.5) * 22 + SIZE) % SIZE;
      const r = 1.2 + random() * 2.6;
      const dark = random() > 0.42;
      put(cx, cy, r, dark, 60 + random() * 50);
    }
  }
  // A few larger stones.
  for (let i = 0; i < 10; i += 1) {
    put(random() * SIZE, random() * SIZE, 3 + random() * 2.4, random() > 0.5, 70);
  }
  // Soft impurity patches (irregular tonal blotches).
  for (let i = 0; i < 6; i += 1) {
    const cx = random() * SIZE;
    const cy = random() * SIZE;
    const r = 14 + random() * 20;
    put(cx, cy, r, random() > 0.5, 26);
  }

  const png = await sharp(raw, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png()
    .toBuffer();
  await writeFile("public/art/dana-texture.png", png);
  console.log("art/dana-texture.png (granular)");
}

// ---------------------------------------------------------------------------
// App icon + OG card
// ---------------------------------------------------------------------------
{
  const svg = await readFile("public/logo-mark.svg");
  const png = await sharp(svg).resize(512, 512).png().toBuffer();
  await writeFile("src/app/icon.png", png);
  console.log("src/app/icon.png");
}

{
  const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#EDF2FB"/>
    </linearGradient>
    <linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#2456D6"/>
      <stop offset="1" stop-color="#142E78"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#band)"/>
  <rect x="0" y="620" width="1200" height="10" fill="url(#band)"/>
  <g transform="translate(96 96) scale(0.86)">
    <rect width="512" height="512" rx="104" fill="url(#band)"/>
    <path d="M168 196 C168 128 344 128 344 196" fill="none" stroke="#BFD0EE" stroke-width="20" stroke-linecap="round"/>
    <rect x="136" y="196" width="240" height="222" rx="30" fill="#FFFFFF"/>
    <rect x="128" y="180" width="256" height="42" rx="21" fill="#EDF2FA" stroke="#C6D2E6" stroke-width="6"/>
    <rect x="136" y="272" width="240" height="66" fill="#1B3FA0"/>
    <path d="M300 220 C306 268 302 306 298 336 C294 366 322 366 318 336 C314 302 312 262 316 220 C312 208 306 208 300 220 Z" fill="#F2C14E"/>
    <ellipse cx="308" cy="218" rx="34" ry="10" fill="#F2C14E"/>
    <rect x="156" y="216" width="24" height="180" rx="12" fill="#FFFFFF" opacity="0.55"/>
  </g>
  <g transform="translate(920 372)">
    <rect x="0" y="0" width="84" height="84" rx="18" fill="#F2ECDD"/>
    <rect x="98" y="0" width="84" height="84" rx="18" fill="#A84328"/>
    <rect x="196" y="0" width="84" height="84" rx="18" fill="#F0A868"/>
    <rect x="49" y="98" width="84" height="84" rx="18" fill="#3D6B41"/>
    <rect x="147" y="98" width="84" height="84" rx="18" fill="#2B2B2E"/>
  </g>
  <text x="620" y="212" font-family="${FONT}" font-size="64" font-weight="700" letter-spacing="-1" fill="#10192E">Garg Paints &amp; Hardware</text>
  <text x="620" y="266" font-family="${FONT}" font-size="30" font-weight="700" letter-spacing="4" fill="#2456D6">PAINT ADDITIVES · TEXTURES · TOOLS</text>
  <text x="620" y="330" font-family="${FONT}" font-size="27" fill="#52617A">Madrasi dana, Pidicryl binders, CMC, chamki and</text>
  <text x="620" y="368" font-family="${FONT}" font-size="27" fill="#52617A">stainless steel gurmalas — listed rates, GST invoice,</text>
  <text x="620" y="406" font-family="${FONT}" font-size="27" fill="#52617A">order enquiries 24x7 in Ballabgarh, Faridabad.</text>
</svg>
`;
  await sharp(Buffer.from(ogSvg)).png({ quality: 92 }).toFile("public/og.png");
  console.log("public/og.png");
}
