import { rnd } from "./sample";
import { scatter } from "./parts";
import { grove, hills, lakeIsland } from "./alethiaHero";
import { landscapingRoles } from "./trades";
import type { ParticleSet, ShapeBuilder } from "./types";

const TILT = 0.45;

const asPlan = (s: ShapeBuilder): ShapeBuilder => async (count) => {
  const res = await s(count);
  const p = res.positions;
  const c = Math.cos(TILT);
  const n = Math.sin(TILT);
  for (let i = 0; i < p.length; i += 3) {
    const y = -p[i + 2];
    const z = p[i + 1];
    p[i + 1] = y * c - z * n + 0.1;
    p[i + 2] = y * n + z * c;
  }
  return { positions: p, motion: "static" };
};

const spinning = (s: ShapeBuilder): ShapeBuilder => async (count) => ({ ...(await s(count)), motion: "spin" });

const stratus: ShapeBuilder = (count) => {
  const bands = [-0.55, -0.15, 0.2, 0.5];
  return scatter(count, "flow", (v) => {
    const b = bands[Math.floor(rnd() * bands.length)];
    const x = (rnd() - 0.5) * 2;
    const z = rnd() * 2 - 1;
    const thick = 0.05 + 0.05 * (Math.sin(z * 7 + b * 9) * 0.5 + 0.5);
    v.set(x, b + 0.04 * Math.sin(x * 3 + z * 4) + (rnd() - 0.5) * thick, z);
  });
};

export const earth: ParticleSet = {
  id: "earth",
  label: "Earth",
  industries: ["environmental", "environment", "agriculture", "farming", "agritech", "forestry", "land management", "conservation", "carbon", "sustainability"],
  hero: hills(true),
  overview: asPlan(lakeIsland),
  scan: grove,
  ambient: stratus,
  close: spinning(lakeIsland),
  scanBox: true,
  heroLayout: "stacked",
  heroDensity: 0.74,
};

export const landscaping: ParticleSet = {
  ...earth,
  ...landscapingRoles,
  id: "landscaping",
  label: "Landscaping",
  industries: ["landscaping", "gardening", "lawn care", "tree service"],
};
