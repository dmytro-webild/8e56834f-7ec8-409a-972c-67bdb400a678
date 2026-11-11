import * as THREE from "three";
import { rnd, spread } from "./sample";
import type { ShapeBuilder, ShapeMotion, ShapeResult } from "./types";

export const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
export const cyl = (rt: number, rb: number, h: number, x: number, y: number, z: number, seg = 24) => new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z);
export const cylX = (r: number, len: number, x: number, y: number, z: number, seg = 24) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2).translate(x, y, z);
export const cylZ = (r: number, len: number, x: number, y: number, z: number, seg = 24) => new THREE.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2).translate(x, y, z);
export const lathe = (profile: [number, number][], seg = 48) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
export const extrude = (shape: THREE.Shape, depth: number, bevel = 0) =>
  new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 16 }).translate(0, 0, -depth / 2);
export const between = (p: THREE.Vector3, q: THREE.Vector3, r: number, seg = 8) => {
  const dir = q.clone().sub(p);
  const m = p.clone().add(q).multiplyScalar(0.5);
  return new THREE.CylinderGeometry(r, r, dir.length(), seg)
    .applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()))
    .translate(m.x, m.y, m.z);
};
export const outline =(pts: [number, number][]) => {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  return s;
};

export function scatter(count: number, motion: ShapeMotion, at: (v: THREE.Vector3, i: number) => void): ShapeResult {
  const out = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    at(v, i);
    out[i * 3] = v.x;
    out[i * 3 + 1] = v.y;
    out[i * 3 + 2] = v.z;
  }
  return { positions: out, motion };
}

export const onSphere = (v: THREE.Vector3, r: number) => {
  const u = rnd() * 2 - 1;
  const a = rnd() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return v.set(r * s * Math.cos(a), r * u, r * s * Math.sin(a));
};

const latLon = (v: THREE.Vector3, lat: number, lon: number, r: number) =>
  v.set(r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(lon));

export const wrap = (z: number) => ((((z + 1) % 2) + 2) % 2) - 1;

export function globe(routes: number, nodes = false): ShapeBuilder {
  return (count) => {
    const R = 0.62;
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    const hubs: THREE.Vector3[] = [];
    for (let i = 0; i < Math.max(routes, 12); i++) hubs.push(latLon(new THREE.Vector3(), (rnd() - 0.4) * 2.1, rnd() * Math.PI * 2, 1));
    for (let i = 0; i < routes; i++) {
      const a = hubs[Math.floor(rnd() * hubs.length)];
      let b = hubs[Math.floor(rnd() * hubs.length)];
      if (a === b) b = hubs[(hubs.indexOf(a) + 1) % hubs.length];
      pairs.push([a, b]);
    }
    const tmp = new THREE.Vector3();
    return scatter(count, "spin", (v) => {
      const r = rnd();
      if (r < 0.42) {
        const lines = rnd() < 0.5;
        let lat = (Math.floor(rnd() * 11) - 5) * (Math.PI / 12);
        while (lines && rnd() > Math.cos(lat)) lat = (Math.floor(rnd() * 11) - 5) * (Math.PI / 12);
        if (!lines) lat = (rnd() - 0.5) * Math.PI * 0.86;
        const lon = lines ? rnd() * Math.PI * 2 : Math.floor(rnd() * 12) * (Math.PI / 6);
        latLon(v, lat, lon, R);
      } else if (r < 0.62) onSphere(v, R * (0.995 + rnd() * 0.01));
      else if (pairs.length && r < 0.86) {
        const [a, b] = pairs[Math.floor(rnd() * pairs.length)];
        const t = rnd();
        v.copy(a).lerp(b, t).normalize();
        v.multiplyScalar(R * (1 + Math.sin(t * Math.PI) * 0.22 * a.distanceTo(b)));
      } else if (nodes || pairs.length) {
        tmp.copy(hubs[Math.floor(rnd() * hubs.length)]);
        onSphere(v, 0.045).add(tmp.multiplyScalar(R));
      } else {
        const a = rnd() * Math.PI * 2;
        const rr = R * (1.3 + rnd() * 0.16);
        v.set(rr * Math.cos(a), (rnd() - 0.5) * 0.01, rr * Math.sin(a));
      }
    });
  };
}

export const sphere: ShapeBuilder = (count) =>
  scatter(count, "spin", (v, i) => {
    if (i % 5 === 0) {
      const lat = (Math.floor(rnd() * 9) - 4) * (Math.PI / 10);
      latLon(v, lat, rnd() * Math.PI * 2, 0.8);
    } else onSphere(v, 0.8 * (1 - Math.pow(rnd(), 6) * 0.25));
  });

type PlanOpt = { h?: number; z?: number; g?: number; fill?: number; dash?: number; w?: number };
type P3 = [number, number, number];

export type Plan = {
  seg: (a: P3, b: P3, o?: PlanOpt) => void;
  line: (x1: number, y1: number, x2: number, y2: number, o?: PlanOpt) => void;
  poly: (pts: [number, number][], o?: PlanOpt) => void;
  rect: (x: number, y: number, w: number, d: number, o?: PlanOpt) => void;
  ring: (x: number, y: number, r: number, o?: PlanOpt) => void;
};

export function plan(count: number, width: number, draw: (p: Plan) => void, tilt = 0.45): ShapeResult {
  const parts: { w: number; g: number; at: (v: THREE.Vector3) => void }[] = [];
  const seg = (a: P3, b: P3, o: PlanOpt = {}) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const dash = o.dash ?? 0;
    parts.push({
      w: len * (dash ? 0.5 : 1) * (o.w ?? 1),
      g: o.g ?? 0,
      at: (v) => {
        let s = rnd() * len;
        if (dash) s = Math.floor(s / dash) * dash + (s % dash) * 0.5;
        const t = s / len;
        v.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
      },
    });
  };
  const poly = (pts: [number, number][], o: PlanOpt = {}) => {
    const z0 = o.z ?? 0;
    const h = o.h ?? 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      seg([x1, y1, z0 + h], [x2, y2, z0 + h], o);
      if (h > 0) {
        seg([x1, y1, z0], [x2, y2, z0], { ...o, w: (o.w ?? 1) * 0.45 });
        seg([x1, y1, z0], [x1, y1, z0 + h], o);
      }
    }
  };
  const P: Plan = {
    seg,
    line: (x1, y1, x2, y2, o = {}) => seg([x1, y1, o.z ?? 0], [x2, y2, o.z ?? 0], o),
    poly,
    rect: (x, y, w, d, o = {}) => {
      poly([[x - w / 2, y - d / 2], [x + w / 2, y - d / 2], [x + w / 2, y + d / 2], [x - w / 2, y + d / 2]], o);
      const top = (o.z ?? 0) + (o.h ?? 0);
      if (o.fill) parts.push({ w: w * d * o.fill * 3, g: o.g ?? 0, at: (v) => v.set(x + (rnd() - 0.5) * w, y + (rnd() - 0.5) * d, top) });
    },
    ring: (x, y, r, o = {}) => {
      const z0 = o.z ?? 0;
      const h = o.h ?? 0;
      const levels = h > 0 ? [z0, z0 + h] : [z0];
      for (const z of levels) parts.push({ w: Math.PI * 2 * r * (o.w ?? 1) * (z === z0 + h ? 1 : 0.45), g: o.g ?? 0, at: (v) => { const a = rnd() * Math.PI * 2; v.set(x + Math.cos(a) * r, y + Math.sin(a) * r, z); } });
      if (o.fill) parts.push({ w: Math.PI * r * r * o.fill * 3, g: o.g ?? 0, at: (v) => { const a = rnd() * Math.PI * 2; const d = r * Math.sqrt(rnd()); v.set(x + Math.cos(a) * d, y + Math.sin(a) * d, z0 + h); } });
    },
  };
  draw(P);
  let total = 0;
  const cum = parts.map((p) => (total += p.w));
  const S = 2 / width;
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  const groups = new Float32Array(count);
  const positions = spread(count, (v) => {
    const r = rnd() * total;
    let lo = 0;
    let hi = cum.length - 1;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (cum[m] < r) lo = m + 1;
      else hi = m;
    }
    parts[lo].at(v);
    v.set(v.x * S, (v.y * c - v.z * s) * S + 0.1, (v.y * s + v.z * c) * S);
    return parts[lo].g;
  }, 0.35, 128, groups);
  return { positions, groups, motion: "static" };
}
