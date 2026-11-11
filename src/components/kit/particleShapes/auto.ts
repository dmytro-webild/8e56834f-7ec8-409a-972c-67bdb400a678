import * as THREE from "three";
import { cloud, rnd, sampleSoup, type Add } from "./sample";
import { box, cylZ, extrude, plan, scatter, wrap } from "./parts";
import type { ParticleSet, ShapeBuilder } from "./types";

function wheel(add: Add, x: number, y: number, z: number, R: number, Wd: number, spokes: number, tread: boolean, profile = 0.22) {
  const tyre = R * profile;
  add(new THREE.TorusGeometry(R - tyre, tyre, 10, 48).scale(1, 1, Wd / (tyre * 2)).translate(x, y, z), 40);
  add(cylZ(R - tyre * 1.8, Wd * 0.7, x, y, z, 40), 30);
  add(cylZ(R * 0.16, Wd * 0.8, x, y, z + Math.sign(z || 1) * 0.01, 16), 40);
  const face = z + Math.sign(z || 1) * Wd * 0.36;
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    add(box(R * 0.5, R * 0.09, Wd * 0.12, 0, 0, 0).translate(R * 0.38, 0, 0).rotateZ(a).translate(x, y, face), 40);
    add(cylZ(R * 0.03, Wd * 0.1, x + Math.cos(a + 0.6) * R * 0.11, y + Math.sin(a + 0.6) * R * 0.11, face, 6), 60);
  }
  if (tread) for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    add(box(R * 0.02, R * 0.06, Wd * 0.95, 0, 0, 0).translate(R + 0.002, 0, 0).rotateZ(a).translate(x, y, z), 60);
  }
}

const spline = (keys: [number, number][]) => (x: number) => {
  if (x <= keys[0][0]) return keys[0][1];
  const n = keys.length - 1;
  if (x >= keys[n][0]) return keys[n][1];
  let i = 0;
  while (keys[i + 1][0] < x) i++;
  const [x0, y0] = keys[i];
  const [x1, y1] = keys[i + 1];
  const h = x1 - x0;
  const m0 = i > 0 ? ((y1 - keys[i - 1][1]) / (x1 - keys[i - 1][0])) * h : y1 - y0;
  const m1 = i < n - 1 ? ((keys[i + 2][1] - y0) / (keys[i + 2][0] - x0)) * h : y1 - y0;
  const t = (x - x0) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * m1;
};

const FX = 1.3;
const RX = -1.16;
const RF = 0.35;
const RR = 0.367;
const X0 = -2.3;
const X1 = 2.26;
const halfW = spline([[X0, 0.62], [-2.24, 0.8], [-2.05, 0.88], [-1.2, 0.92], [-0.5, 0.86], [0.4, 0.84], [1.3, 0.87], [1.85, 0.83], [2.12, 0.7], [X1, 0.5]]);
const shoulder = spline([[X0, 0.5], [-2.22, 0.68], [-1.9, 0.77], [-1.2, 0.8], [-0.5, 0.7], [0.5, 0.66], [1.3, 0.71], [1.9, 0.6], [2.16, 0.46], [X1, 0.34]]);
const crown = spline([[X0, 0.56], [-2.22, 0.76], [-1.95, 0.86], [-1.0, 0.88], [0.55, 0.82], [1.3, 0.7], [1.9, 0.56], [2.16, 0.44], [X1, 0.36]]);
const floorY = spline([[X0, 0.24], [-2.1, 0.17], [-1.6, 0.15], [1.8, 0.15], [2.15, 0.17], [X1, 0.22]]);
const fenderLift = spline([[-2.1, 0], [-1.6, 0.05], [-0.9, 0.04], [-0.4, 0], [0.75, 0], [1.2, 0.07], [1.85, 0.07], [2.2, 0]]);
const CAB0 = -2.0;
const CAB1 = 0.62;
const roof = spline([[CAB0, 0.8], [-1.8, 0.94], [-1.4, 1.12], [-1.0, 1.26], [-0.65, 1.31], [-0.3, 1.27], [0.0, 1.14], [0.3, 0.98], [CAB1, 0.8]]);
const cabW = spline([[CAB0, 0.42], [-1.7, 0.56], [-1.0, 0.67], [0.0, 0.68], [CAB1, 0.62]]);

function bodyPoint(x: number, s: number, v: THREE.Vector3) {
  const W = halfW(x);
  const ys = shoulder(x);
  const yd = crown(x);
  const yb = floorY(x);
  const side = Math.sign(s) || 1;
  const a = 1 - Math.abs(s);
  if (a < 0.42) {
    const k = a / 0.42;
    return v.set(x, yb + (ys - yb) * k, side * W * (0.93 + 0.07 * Math.sin(k * Math.PI * 0.5)) * (1 + 0.025 * Math.sin(k * Math.PI)));
  }
  const phi = ((a - 0.42) / 0.58) * Math.PI * 0.5;
  const z = W * Math.pow(Math.max(0, Math.cos(phi)), 0.7);
  const u = z / W;
  const bump = fenderLift(x) * Math.exp(-(((u - 0.66) / 0.24) ** 2));
  return v.set(x, ys + (yd - ys) * Math.pow(Math.sin(phi), 0.7) + bump, side * z);
}

function cabinPoint(x: number, s: number, v: THREE.Vector3) {
  const base = 0.76;
  const top = roof(x);
  const w = cabW(x);
  const phi = (1 - Math.abs(s)) * Math.PI * 0.5;
  const sp = Math.pow(Math.sin(phi), 0.62);
  return v.set(x, base + (top - base) * sp, (Math.sign(s) || 1) * w * Math.pow(Math.max(0, Math.cos(phi)), 0.62) * (1 - 0.24 * sp));
}

function grid(push: (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => void, f: (x: number, s: number, v: THREE.Vector3) => void, x0: number, x1: number, nx: number, ns: number) {
  const row = (x: number) => Array.from({ length: ns + 1 }, (_, j) => {
    const v = new THREE.Vector3();
    f(x, -1 + (2 * j) / ns, v);
    return v;
  });
  let prev = row(x0);
  for (let i = 1; i <= nx; i++) {
    const cur = row(x0 + ((x1 - x0) * i) / nx);
    for (let j = 0; j < ns; j++) {
      push(prev[j], cur[j], cur[j + 1]);
      push(prev[j], cur[j + 1], prev[j + 1]);
    }
    prev = cur;
  }
}

const inArch = (x: number, y: number, z: number) =>
  Math.abs(z) > 0.45 && (Math.hypot(x - FX, y - RF) < RF + 0.07 || Math.hypot(x - RX, y - RR) < RR + 0.07);

function buildCar(tris: number[], segs: number[]) {
  const c = new THREE.Vector3();
  const tri = (a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3) => tris.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
  const surf = (g: THREE.BufferGeometry) => {
    for (const v of (g.index ? g.toNonIndexed() : g).attributes.position.array) tris.push(v);
  };
  const edged: Add = (g, thr = 25) => {
    surf(g);
    for (const v of new THREE.EdgesGeometry(g, thr).attributes.position.array) segs.push(v);
  };
  grid((a, b, d) => {
    c.copy(a).add(b).add(d).divideScalar(3);
    if (inArch(c.x, c.y, c.z)) return;
    if (c.x > CAB0 + 0.05 && c.x < CAB1 - 0.05 && Math.abs(c.z) < cabW(c.x) * 0.9 && c.y > 0.72) return;
    tri(a, b, d);
  }, bodyPoint, X0, X1, 360, 72);
  grid(tri, cabinPoint, CAB0, CAB1, 220, 48);
  for (const x of [X0, X1]) {
    const ring = Array.from({ length: 73 }, (_, j) => bodyPoint(x, -1 + j / 36, new THREE.Vector3()));
    const mid = new THREE.Vector3(x, (floorY(x) + crown(x)) / 2, 0);
    for (let j = 0; j < 72; j++) tri(mid, ring[j], ring[j + 1]);
  }
  const foil = new THREE.Shape();
  foil.moveTo(0.22, 0);
  foil.bezierCurveTo(0.1, 0.035, -0.12, 0.05, -0.22, 0.012);
  foil.bezierCurveTo(-0.1, -0.02, 0.1, -0.015, 0.22, 0);
  surf(extrude(foil, 1.84).rotateZ(0.1).translate(-2.16, 1.5, 0));
  for (const s of [-1, 1]) {
    surf(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-1.74, 0.86], [-1.84, 1.1], [-1.95, 1.42], [-2.08, 1.55], [-2.2, 1.52]].map(([x, y]) => new THREE.Vector3(x, y, s * 0.34))), 32, 0.024, 8));
    const plate = new THREE.Shape();
    plate.moveTo(-0.26, -0.1);
    plate.quadraticCurveTo(-0.3, 0.1, -0.12, 0.12);
    plate.lineTo(0.2, 0.08);
    plate.quadraticCurveTo(0.27, 0.02, 0.22, -0.08);
    plate.quadraticCurveTo(0, -0.14, -0.26, -0.1);
    surf(new THREE.ShapeGeometry(plate, 12).translate(-2.17, 1.46, s * 0.92));
    const lamp = (g: THREE.BufferGeometry) => g.rotateY(Math.PI / 2).rotateZ(1.0).translate(1.9, 0.6, s * 0.58);
    edged(lamp(new THREE.TorusGeometry(0.105, 0.016, 10, 48)), 40);
    surf(lamp(new THREE.CircleGeometry(0.09, 32)));
    surf(lamp(new THREE.CircleGeometry(0.09, 32)));
    surf(lamp(new THREE.TorusGeometry(0.045, 0.012, 8, 32)));
    wheel(edged, FX, RF, s * 0.8, RF, 0.275, 10, false, 0.13);
    wheel(edged, RX, RR, s * 0.81, RR, 0.335, 10, false, 0.13);
  }
}

function buildWheel(add: Add) {
  wheel(add, 0, 0, 0, 1, 0.75, 10, true);
  add(cylZ(0.58, 0.05, 0, 0, -0.2, 64), 30);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    add(cylZ(0.015, 0.06, Math.cos(a) * 0.48, Math.sin(a) * 0.48, -0.2, 6), 60);
  }
  add(box(0.3, 0.42, 0.18, 0, 0, 0).translate(0.55, 0, 0).rotateZ(0.8).translate(0, 0, -0.2), 30);
}

const car: ShapeBuilder = (count) => {
  const tris: number[] = [];
  const segs: number[] = [];
  buildCar(tris, segs);
  const m = new THREE.Matrix4().makeRotationX(0.06).multiply(new THREE.Matrix4().makeRotationY(0.17));
  const v = new THREE.Vector3();
  for (const arr of [tris, segs])
    for (let i = 0; i < arr.length; i += 3) {
      v.set(arr[i], arr[i + 1], arr[i + 2]).applyMatrix4(m);
      arr[i] = v.x;
      arr[i + 1] = v.y;
      arr[i + 2] = v.z;
    }
  return { ...sampleSoup(tris, segs, count, 0.12), motion: "static" };
};
const wheelScan: ShapeBuilder = (count) => ({ ...cloud((add) => buildWheel((g, t) => add(g.rotateY(0.65), t)), count, 0.35), motion: "static" });

const lot: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    p.rect(0, 0, 15.4, 7.4, { w: 0.6 });
    for (const [y0, row] of [[1.0, 0], [-3.4, 1]]) {
      p.line(-6.65, y0 + 1.2, 6.65, y0 + 1.2, { w: 0.6 });
      for (let i = 0; i <= 19; i++) p.line(-6.65 + i * 0.7, y0, -6.65 + i * 0.7, y0 + 2.4, { w: 0.6 });
      for (let i = 0; i < 19; i++)
        for (const half of [0, 1]) {
          const k = i * 2 + half + row * 5;
          if (k % 7 === 3 || k % 11 === 5) continue;
          p.rect(-6.3 + i * 0.7, y0 + 0.6 + half * 1.2, 0.42, 0.85, { h: 0.18, fill: 0.2, g: k % 13 === 6 ? 0.1 + k * 0.013 : 0 });
        }
    }
    p.line(-7.2, 0.2, 7.2, 0.2, { dash: 0.5, w: 0.6 });
    p.rect(-2.8, 0.55, 0.9, 0.42, { h: 0.18, fill: 0.4, g: -1 });
    p.rect(3.4, -0.15, 0.9, 0.42, { h: 0.18, fill: 0.4, g: -1 });
  });

const road: ShapeBuilder = (count) =>
  scatter(count, "flow", (v) => {
    const r = rnd();
    const z = rnd() * 2 - 1;
    if (r < 0.28) v.set((rnd() < 0.5 ? -1 : 1) * 0.24 + (rnd() - 0.5) * 0.004, -0.2, z);
    else if (r < 0.5) {
      let zz = z;
      while (((zz + 1) * 12) % 1 > 0.5) zz = rnd() * 2 - 1;
      v.set((rnd() < 0.5 ? -1 : 1) * 0.08, -0.2, zz);
    } else if (r < 0.62) {
      const pz = wrap(Math.round(z * 4) / 4);
      const side = (Math.round(z * 4) % 2 ? 1 : -1) * 0.34;
      if (rnd() < 0.75) v.set(side, -0.2 + rnd() * 0.38, pz);
      else v.set(side - Math.sign(side) * rnd() * 0.12, 0.18, pz);
    } else if (r < 0.74) {
      const lane = rnd() < 0.5 ? -0.16 : 0.16;
      const car = Math.floor((z + 1) * 3);
      const len = 0.08;
      const zc = -1 + (car + 0.5) / 3;
      v.set(lane + (rnd() < 0.5 ? -1 : 1) * 0.035, -0.17, zc + (rnd() - 0.5) * len);
    } else v.set((rnd() - 0.5) * 2, -0.2 + (rnd() < 0.8 ? 0 : rnd() * 0.6), z);
  });

const ring: ShapeBuilder = (count) =>
  scatter(count, "spin", (v) => {
    const r = rnd();
    const a = rnd() * Math.PI * 2;
    if (r < 0.55) {
      const t = rnd() * Math.PI * 2;
      const R = 0.72 + Math.cos(t) * 0.12;
      v.set(Math.cos(a) * R, Math.sin(t) * 0.12, Math.sin(a) * R);
    } else if (r < 0.8) {
      const k = Math.floor(rnd() * 60);
      const b = (k / 60) * Math.PI * 2;
      const len = k % 5 ? 0.06 : 0.14;
      const d = 0.92 + rnd() * len;
      v.set(Math.cos(b) * d, (rnd() - 0.5) * 0.008, Math.sin(b) * d);
    } else {
      const d = 0.56 + (rnd() < 0.5 ? 0 : 0.5);
      v.set(Math.cos(a) * d, (rnd() - 0.5) * 0.006, Math.sin(a) * d);
    }
  });

export const auto: ParticleSet = {
  id: "auto",
  label: "Auto",
  industries: ["automotive", "mobility", "ev", "fleet management", "automotive manufacturing", "charging", "telematics", "motorsport engineering"],
  hero: car,
  overview: lot,
  scan: wheelScan,
  ambient: road,
  close: ring,
  scanBox: true,
  heroLayout: "stacked",
};
