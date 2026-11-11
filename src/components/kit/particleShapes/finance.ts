import * as THREE from "three";
import { cloud, rnd, type Add } from "./sample";
import { box, extrude, globe, lathe, plan, scatter } from "./parts";
import type { ParticleSet, ShapeBuilder } from "./types";

const COIN_T = 0.17;

const reeded = (R: number, T: number) => {
  const g = new THREE.CylinderGeometry(R, R, T * 0.7, 160, 1, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const a = Math.atan2(p.getZ(i), p.getX(i));
    const k = Math.round(((a + Math.PI) / (Math.PI * 2)) * 160) % 2 ? 0.975 : 1;
    p.setXYZ(i, p.getX(i) * k, p.getY(i), p.getZ(i) * k);
  }
  return g;
};

function coin(add: Add, m: THREE.Matrix4, R: number, face: boolean) {
  const T = COIN_T * R;
  const h = T / 2;
  add(reeded(R, T).applyMatrix4(m), 25);
  add(lathe([[R * 0.985, h * 0.7], [R, h * 0.85], [R * 0.97, h], [R * 0.86, h], [R * 0.84, h * 0.62]], 96).applyMatrix4(m), 25);
  add(lathe([[R * 0.84, -h * 0.62], [R * 0.86, -h], [R * 0.97, -h], [R, -h * 0.85], [R * 0.985, -h * 0.7]], 96).applyMatrix4(m), 25);
  if (!face) return;
  add(new THREE.RingGeometry(R * 0.7, R * 0.84, 96, 1).rotateX(-Math.PI / 2).translate(0, h * 0.62, 0).applyMatrix4(m), 25);
  add(new THREE.TorusGeometry(R * 0.7, R * 0.018, 6, 96).rotateX(Math.PI / 2).translate(0, h * 0.62, 0).applyMatrix4(m), 50);
  for (const r of [0.56, 0.44, 0.32]) add(new THREE.TorusGeometry(R * r, R * 0.009, 5, 80).rotateX(Math.PI / 2).translate(0, h * 0.62, 0).applyMatrix4(m), 18);
  add(new THREE.CylinderGeometry(R * 0.18, R * 0.2, R * 0.05, 48, 1).translate(0, h * 0.62 + R * 0.025, 0).applyMatrix4(m), 22);
  for (let i = 0; i < 24; i++) add(new THREE.BoxGeometry(R * 0.1, R * 0.012, R * 0.008).translate(R * 0.25, h * 0.62, 0).rotateY((i * Math.PI) / 12).applyMatrix4(m), 3);
}

const at = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(1, 1, 1));

function buildCoins(add: Add) {
  const stacks: [number, number, number][] = [[-1.7, -0.6, 5], [0.3, -2.1, 9]];
  for (const [x, z, n] of stacks)
    for (let i = 0; i < n; i++) coin(add, at(x + Math.sin(i * 2.3) * 0.03, COIN_T * (i + 0.5), z + Math.cos(i * 1.7) * 0.03, 0, i * 0.4), 1, i === n - 1);
  coin(add, at(2.0, 1.48, 0.4, Math.PI / 2 - 0.3, -0.3), 1.5, true);
  coin(add, at(-1.2, COIN_T / 2, 1.7, 0, 0.6), 1, true);
}

function buildCard(add: Add) {
  const W = 8.56;
  const H = 5.398;
  const r = 0.32;
  const s = new THREE.Shape();
  s.moveTo(-W / 2 + r, -H / 2);
  s.lineTo(W / 2 - r, -H / 2);
  s.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + r);
  s.lineTo(W / 2, H / 2 - r);
  s.quadraticCurveTo(W / 2, H / 2, W / 2 - r, H / 2);
  s.lineTo(-W / 2 + r, H / 2);
  s.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - r);
  s.lineTo(-W / 2, -H / 2 + r);
  s.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + r, -H / 2);
  add(extrude(s, 0.076), 30);
  const f = 0.04;
  add(box(1.1, 0.85, 0.02, -2.6, 0.45, f));
  for (const y of [0.25, 0.45, 0.65]) add(box(1.1, 0.02, 0.025, -2.6, y, f));
  add(box(0.02, 0.85, 0.025, -2.6, 0.45, f));
  for (let g = 0; g < 4; g++) for (let i = 0; i < 4; i++) add(box(0.28, 0.42, 0.03, -3.4 + g * 1.9 + i * 0.4, -0.75, f), 40);
  for (let i = 0; i < 9; i++) add(box(0.22, 0.26, 0.03, -3.6 + i * 0.32, -1.75, f), 40);
  for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.18 + i * 0.16, 0.02, 4, 24, Math.PI / 2).rotateZ(-Math.PI / 4).translate(-1.75, 0.45, f), 60);
  add(new THREE.TorusGeometry(0.55, 0.03, 4, 40).translate(3.1, -1.75, f), 60);
  add(new THREE.TorusGeometry(0.55, 0.03, 4, 40).translate(2.4, -1.75, f), 60);
  add(box(W, 1.0, 0.02, 0, 1.6, -f));
}

const coins: ShapeBuilder = (count) => ({ ...cloud((add) => buildCoins((g, t) => add(g.rotateX(0.5), t)), count, 0.5), motion: "static" });
const exchange: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    p.rect(0, 1.2, 5.6, 2.9, { h: 0.12, fill: 0.05 });
    p.rect(0, 1.3, 5.0, 2.5, { z: 0.12, h: 0.12 });
    p.rect(0, 1.5, 4.2, 1.9, { z: 0.24, h: 1.3, fill: 0.1 });
    p.rect(0, 1.5, 3.4, 1.2, { z: 1.54, h: 0.25, w: 0.7 });
    for (let i = 0; i < 8; i++) p.ring(-1.82 + i * 0.52, 0.32, 0.12, { z: 0.24, h: 1.3, w: 0.8 });
    p.line(-2.2, 0.32, 2.2, 0.32, { z: 1.62, w: 0.9 });
    p.ring(0, -2.0, 1.4, { dash: 0.3, w: 0.7 });
    p.ring(0, -2.0, 0.55, { h: 0.08, fill: 0.15, g: 0.37 });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      p.line(Math.cos(a) * 0.75, -2.0 + Math.sin(a) * 0.75, Math.cos(a) * 1.25, -2.0 + Math.sin(a) * 1.25, { w: 0.5 });
    }
    for (const s of [-1, 1]) {
      const cx = s * 5.4;
      p.rect(cx, 0.2, 3.8, 6.0, { h: 0.18, w: 0.6 });
      for (let r = 0; r < 6; r++) {
        const y = 2.6 - r * 0.95;
        p.rect(cx, y, 2.9, 0.22, { h: 0.18, fill: 0.2 });
        for (let k = 0; k < 6; k++) p.rect(cx - 1.2 + k * 0.48, y + 0.16, 0.34, 0.03, { z: 0.18, h: 0.16, w: 0.7, g: (r * 6 + k + (s > 0 ? 3 : 0)) % 9 === 4 ? 0.11 + r * 0.07 + k * 0.03 + (s > 0 ? 0.5 : 0) : 0 });
      }
    }
    p.line(-7.6, -3.55, 7.6, -3.55, { w: 0.5 });
    p.line(-7.6, -3.3, 7.6, -3.3, { dash: 0.18, w: 0.8 });
  });
const card: ShapeBuilder = (count) => ({
  ...cloud((add) => buildCard((g, thr) => add(g.rotateX(-0.5).rotateY(0.35), thr)), count, 0.4),
  motion: "static",
});

const ledger: ShapeBuilder = (count) =>
  scatter(count, "flow", (v) => {
    if (rnd() < 0.04) {
      v.set((rnd() - 0.5) * 2, -0.3 + rnd() * 0.9, rnd() * 2 - 1);
      return;
    }
    const k = Math.floor(rnd() * 10);
    const col = k % 5;
    const row = Math.floor(k / 5);
    const z = rnd() * 2 - 1;
    const u = (z + 1) * Math.PI;
    const ph = col * 1.3 + row * 2.1;
    const w = 0.13;
    const s = rnd() < 0.4 ? (rnd() < 0.5 ? -w / 2 : w / 2) : (rnd() - 0.5) * w;
    const tw = u + ph;
    v.set(-0.72 + col * 0.36 + Math.cos(tw) * s, -0.12 + row * 0.34 + 0.05 * Math.sin(u * 2 + ph) + Math.sin(tw) * s * 0.6, z);
  });

export const finance: ParticleSet = {
  id: "finance",
  label: "Finance",
  industries: ["finance", "fintech", "banking", "investment", "insurance", "accounting", "crypto", "payments", "treasury"],
  hero: coins,
  overview: exchange,
  scan: card,
  ambient: ledger,
  close: globe(0),
  scanBox: true,
};
