import * as THREE from "three";
import { PARTICLE_SETS, type ParticleSet, type ShapeBuilder } from "@/components/kit/particleShapes";
import { cloud, type Add } from "@/components/kit/particleShapes/sample";
import { box } from "@/components/kit/particleShapes/parts";

const CLOSES = [0, 1.3, 0.6, 2.2, 3.2, 2.5, 3.9, 5.1, 4.3, 6.0, 7.4];
const STEP = 2.1;
const BODY = 1.25;
const WICK = 0.32;
const BAR = 0.2;

function hollow(add: Add, x: number, y0: number, y1: number) {
  const h = y1 - y0;
  const y = (y0 + y1) / 2;
  const s = BODY / 2 - BAR / 2;
  for (const a of [-1, 1]) for (const b of [-1, 1]) add(box(BAR, h, BAR, x + a * s, y, b * s));
  for (const yy of [y0, y1])
    for (const a of [-1, 1]) {
      add(box(BODY, BAR, BAR, x, yy, a * s));
      add(box(BAR, BAR, BODY, x + a * s, yy, 0));
    }
}

function buildCandles(add: Add) {
  const x0 = (-(CLOSES.length - 1) * STEP) / 2;
  let open = -0.7;
  CLOSES.forEach((close, i) => {
    const x = x0 + i * STEP;
    const lo = Math.min(open, close);
    const hi = Math.max(open, close, lo + 0.45);
    const top = hi + 0.55 + (i % 3) * 0.2;
    const bottom = lo - 0.45 - (i % 2) * 0.2;
    add(box(WICK, top - hi, WICK, x, (top + hi) / 2, 0), 40);
    add(box(WICK, lo - bottom, WICK, x, (lo + bottom) / 2, 0), 40);
    if (close >= open) add(box(BODY, hi - lo, BODY, x, (hi + lo) / 2, 0), 20);
    else hollow(add, x, lo, hi);
    open = close;
  });
  add(box((CLOSES.length - 1) * STEP + BODY * 2, 0.22, 0.22, 0, -2.2, 0), 40);
}

const candles: ShapeBuilder = (count) => ({ ...cloud((add) => buildCandles((g, t) => add(g.rotateY(0.4).rotateX(-0.22), t)), count, 0.5), motion: "static" });

const orient = (build: ShapeBuilder, m: THREE.Matrix4): ShapeBuilder => async (count) => {
  const res = await build(count);
  const p = res.positions;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.length; i += 3) {
    v.set(p[i], p[i + 1], p[i + 2]).applyMatrix4(m);
    p[i] = v.x;
    p[i + 1] = v.y;
    p[i + 2] = v.z;
  }
  return res;
};

const climb = new THREE.Matrix4().makeRotationZ(0.3).multiply(new THREE.Matrix4().makeRotationY(0.9)).multiply(new THREE.Matrix4().makeRotationX(-0.6));

export const GLYPH_MOBILE_POSE: Record<string, [number, number]> = {
  auto: [-0.25, 0.7],
  aviation: [0, 0.35],
};

export const GLYPH_SETS: Record<string, ParticleSet> = {
  finance: { ...PARTICLE_SETS.finance, hero: candles },
  architecture: PARTICLE_SETS.architecture,
  auto: PARTICLE_SETS.auto,
  aviation: { ...PARTICLE_SETS.aviation, hero: orient(PARTICLE_SETS.aviation.hero, climb) },
};
