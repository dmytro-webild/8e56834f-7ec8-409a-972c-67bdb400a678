import { logistics } from "./logistics";
import { tech } from "./tech";
import { energy } from "./energy";
import { health } from "./health";
import { finance } from "./finance";
import { architecture } from "./architecture";
import { auto } from "./auto";
import { aviation } from "./aviation";
import { abstract } from "./abstract";
import { earth, landscaping } from "./earth";
import { construction, electrical, roofing } from "./trades";
import type { ParticleSet } from "./types";

export type { HeroLayout, ParticleRole, ParticleSet, ShapeBuilder, ShapeMotion, ShapeResult } from "./types";
export { cloud, modelShape, sampleSoup } from "./sample";

export const PARTICLE_SETS: Record<string, ParticleSet> = {
  logistics,
  tech,
  energy,
  health,
  finance,
  architecture,
  auto,
  aviation,
  abstract,
  earth,
  roofing,
  electrical,
  landscaping,
  construction,
};
