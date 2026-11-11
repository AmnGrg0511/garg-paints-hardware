"use client";

import { create } from "zustand";

export type WallShade = {
  key: string;
  name: string;
  nameHi: string;
  hex: string;
};

export const WALL_SHADES: WallShade[] = [
  { key: "white", name: "White", nameHi: "सफ़ेद", hex: "#F2ECDD" },
  { key: "yellow", name: "Yellow", nameHi: "पीला", hex: "#F0A868" },
  { key: "red", name: "Red", nameHi: "लाल", hex: "#A84328" },
  { key: "green", name: "Green", nameHi: "हरा", hex: "#3D6B41" },
  { key: "black", name: "Black", nameHi: "काला", hex: "#2B2B2E" },
];

type WallShadeState = {
  /** Index into WALL_SHADES currently shown on the wall. */
  index: number;
  /** Visitor has picked a shade manually — auto-cycling stops. */
  locked: boolean;
  setIndex: (index: number) => void;
  lock: (index: number) => void;
};

/**
 * Shared wall-shade state: the visualizer writes it while cycling or on
 * pick, and the hero backdrop reads it to tint the section background.
 */
export const useWallShade = create<WallShadeState>()((set) => ({
  index: 0,
  locked: false,
  setIndex: (index) => set({ index }),
  lock: (index) => set({ index, locked: true }),
}));
