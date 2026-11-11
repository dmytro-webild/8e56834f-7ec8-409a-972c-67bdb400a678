import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { cloud, rnd, type Add } from "./sample";
import { plan } from "./parts";
import type { ParticleSet, ShapeBuilder } from "./types";

const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const cylX = (r: number, len: number, x: number, y: number, z: number, seg = 18) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2).translate(x, y, z);

function buildTruck(add: Add) {
  const W = 2.5;
  const cab = new THREE.Shape();
  cab.moveTo(2.35, 1.15);
  cab.lineTo(2.35, 3.8);
  cab.quadraticCurveTo(2.38, 4.02, 2.75, 4.05);
  cab.quadraticCurveTo(3.9, 4.18, 4.6, 3.98);
  cab.quadraticCurveTo(4.82, 3.9, 4.9, 3.72);
  cab.lineTo(5.5, 2.62);
  cab.quadraticCurveTo(5.62, 2.5, 5.85, 2.44);
  cab.quadraticCurveTo(6.55, 2.36, 6.86, 1.98);
  cab.quadraticCurveTo(6.98, 1.82, 7.0, 1.55);
  cab.lineTo(7.05, 0.72);
  cab.quadraticCurveTo(7.05, 0.48, 6.85, 0.46);
  cab.lineTo(6.32, 0.5);
  cab.absarc(5.6, 0.55, 0.72, 0.07, Math.PI - 0.07, false);
  cab.lineTo(4.7, 0.62);
  cab.lineTo(4.55, 1.05);
  cab.lineTo(2.35, 1.15);
  const cabGeo = new THREE.ExtrudeGeometry(cab, { depth: W - 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 14 });
  add(cabGeo.translate(0, 0, -(W - 0.12) / 2), 20);
  for (const z of [-1, 1]) {
    const zs = z * (W / 2 + 0.005);
    add(box(1.35, 0.03, 0.02, 4.32, 3.58, zs)); add(box(0.03, 0.95, 0.02, 3.66, 3.1, zs)); add(box(0.9, 0.03, 0.02, 4.1, 2.64, zs));
    add(box(1.55, 0.03, 0.02, 4.25, 1.22, zs)); add(box(0.03, 2.4, 0.02, 3.48, 2.42, zs)); add(box(0.03, 1.45, 0.02, 5.02, 1.92, zs));
    add(box(0.05, 0.05, 0.42, 5.32, 3.2, z * 1.42)); add(box(0.1, 0.42, 0.2, 5.3, 3.0, z * 1.62));
    add(box(0.12, 0.2, 0.42, 6.88, 1.82, z * 0.9));
    add(cylX(0.32, 1.45, 3.55, 0.82, z * 1.05, 20));
    add(box(0.2, 2.5, 0.06, 2.25, 2.62, z * 1.22));
    add(box(2.1, 0.06, 0.5, 0.45, 1.22, z * 1.0));
  }
  for (let i = 0; i < 6; i++) add(box(0.05, 0.03, 1.2, 7.07, 0.95 + i * 0.13, 0));
  add(box(0.06, 0.82, 1.24, 7.06, 1.28, 0));
  add(box(7.0, 0.24, 0.95, 3.0, 0.88, 0));
  add(box(0.95, 0.1, 1.2, 0.45, 1.13, 0));
  const TX0 = -14.65;
  const TX1 = 1.5;
  const TL = TX1 - TX0;
  const FLOOR = 1.22;
  const TOP = 4.1;
  add(new RoundedBoxGeometry(TL, TOP - FLOOR, W, 2, 0.06).translate((TX0 + TX1) / 2, (TOP + FLOOR) / 2, 0), 30);
  for (const z of [-1, 1]) {
    for (let x = TX0 + 0.6; x < TX1 - 0.3; x += 1.22) add(box(0.06, TOP - FLOOR - 0.12, 0.03, x, (TOP + FLOOR) / 2, z * (W / 2 + 0.015)));
    add(box(TL, 0.14, 0.04, (TX0 + TX1) / 2, FLOOR + 0.07, z * (W / 2 + 0.02)));
    add(box(TL, 0.1, 0.04, (TX0 + TX1) / 2, TOP - 0.05, z * (W / 2 + 0.02)));
    add(box(7.6, 0.72, 0.03, -7.6, 0.8, z * (W / 2 - 0.08)));
    add(box(0.12, 0.85, 0.12, -0.7, 0.62, z * 0.9)); add(box(0.32, 0.05, 0.32, -0.7, 0.2, z * 0.9));
    add(box(0.03, 0.5, 0.6, TX0 + 0.55, 0.45, z * 0.95));
  }
  add(box(0.04, TOP - FLOOR - 0.1, 0.03, TX0 - 0.01, (TOP + FLOOR) / 2, 0));
  for (const z of [-0.95, -0.35, 0.35, 0.95]) add(new THREE.CylinderGeometry(0.025, 0.025, TOP - FLOOR - 0.2, 6).translate(TX0 - 0.05, (TOP + FLOOR) / 2, z));
  add(box(0.12, 0.1, W - 0.2, TX0 + 0.15, 0.55, 0)); add(box(0.08, 0.6, 0.08, TX0 + 0.2, 0.85, 0.9)); add(box(0.08, 0.6, 0.08, TX0 + 0.2, 0.85, -0.9));
  add(box(TL - 0.4, 0.2, 1.0, (TX0 + TX1) / 2, FLOOR - 0.1, 0));
  add(box(2.6, 0.22, 1.1, -12.7, 1.0, 0));
  const tyre = (x: number, z: number) => {
    add(new THREE.TorusGeometry(0.4, 0.12, 8, 30).translate(x, 0.52, z), 40);
    add(new THREE.CylinderGeometry(0.29, 0.29, 0.22, 22).rotateX(Math.PI / 2).translate(x, 0.52, z), 40);
    add(new THREE.CylinderGeometry(0.1, 0.13, 0.26, 10).rotateX(Math.PI / 2).translate(x, 0.52, z + Math.sign(z) * 0.05), 40);
  };
  for (const z of [-1.03, 1.03]) tyre(5.6, z);
  for (const x of [1.2, -0.15, -11.95, -13.25]) for (const z of [-1.03, -0.74, 0.74, 1.03]) tyre(x, z);
  for (const x of [5.6, 1.2, -0.15, -11.95, -13.25]) add(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 8).rotateX(Math.PI / 2).translate(x, 0.52, 0));
}

const truck: ShapeBuilder = (count) => {
  const shape = cloud(buildTruck, count, 0.42);
  const floor = -shape.box![1] / 2;
  for (let i = Math.floor(count * 0.95); i < count; i++) shape.positions.set([(rnd() - 0.5) * 2.34, floor, (rnd() - 0.5) * 0.34], i * 3);
  return shape;
};

const yard: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    p.rect(0, 3.0, 13, 1.0, { h: 0.6, fill: 0.12 });
    for (let i = 0; i < 13; i++) p.rect(-6 + i, 1.4, 0.55, 2.0, { h: 0.24, fill: 0.25, g: i % 5 === 2 ? 0.1 + i * 0.07 : 0 });
    for (let i = 0; i < 11; i++) p.rect(-5 + i, -1.9, 0.55, 2.0, { h: 0.24, fill: 0.25, g: i % 4 === 1 ? 0.13 + i * 0.05 : 0 });
    p.line(-7.2, -0.2, 7.2, -0.2, { dash: 0.6, w: 0.6 });
    p.rect(-3.2, 0.1, 2.8, 0.45, { h: 0.26, fill: 0.4, g: -1 });
    p.rect(2.6, -0.5, 2.8, 0.45, { h: 0.26, fill: 0.4, g: -1 });
    p.line(-7.8, -3.6, -7.8, 3.8, { w: 0.7 });
    p.line(-7.8, 3.8, 7.8, 3.8, { w: 0.7 });
    p.line(7.8, 3.8, 7.8, -3.6, { w: 0.7 });
    p.line(-7.8, -3.6, -1.4, -3.6, { w: 0.7 });
    p.line(1.4, -3.6, 7.8, -3.6, { w: 0.7 });
    p.rect(2.2, -3.2, 0.7, 0.5, { h: 0.3 });
  });

const road: ShapeBuilder = (N) => {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = rnd();
    let x: number;
    let y = 0;
    let z = -60 + rnd() * 66;
    if (r < 0.3) x = (rnd() < 0.5 ? -1 : 1) * 4.2 + (rnd() - 0.5) * 0.05;
    else if (r < 0.55) { x = (rnd() < 0.5 ? -1 : 1) * 1.4; if (((z % 3) + 3) % 3 > 1.6) x += 999; }
    else if (r < 0.62) { x = (rnd() < 0.5 ? -1 : 1) * 6; y = rnd() * 1.4; z = Math.round(z / 5) * 5; }
    else { x = (rnd() - 0.5) * 9; if (rnd() < 0.7) x = (rnd() - 0.5) * 30; y = rnd() < 0.7 ? 0 : 3 + rnd() * 12; }
    if (x > 900) x = (rnd() - 0.5) * 8.4;
    out.set([x / 33, y / 33, (z + 27) / 33], i * 3);
  }
  return { positions: out, motion: "flow" };
};

const globe: ShapeBuilder = (N) => {
  const out = new Float32Array(N * 3);
  const R = 0.55;
  const d = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const r = rnd();
    if (r < 0.8) {
      let lat = (Math.floor(rnd() * 11) - 5) * (Math.PI / 12);
      while (r < 0.46 && rnd() > Math.cos(lat)) lat = (Math.floor(rnd() * 11) - 5) * (Math.PI / 12);
      if (r >= 0.46) lat = (rnd() - 0.5) * Math.PI * 0.86;
      const lon = r < 0.46 ? rnd() * Math.PI * 2 : Math.floor(rnd() * 12) * (Math.PI / 6);
      out.set([R * Math.cos(lat) * Math.cos(lon), R * Math.sin(lat), R * Math.cos(lat) * Math.sin(lon)], i * 3);
    } else {
      d.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(R * (1.25 + rnd() * 0.55));
      out.set([d.x, d.y, d.z], i * 3);
    }
  }
  return { positions: out, motion: "spin" };
};

export const logistics: ParticleSet = {
  id: "logistics",
  label: "Logistics",
  industries: ["logistics", "freight", "trucking", "warehousing", "ports", "supply chain", "manufacturing", "industrial"],
  hero: truck,
  overview: yard,
  scan: truck,
  ambient: road,
  close: globe,
  scanBox: true,
  heroLayout: "stacked",
};
