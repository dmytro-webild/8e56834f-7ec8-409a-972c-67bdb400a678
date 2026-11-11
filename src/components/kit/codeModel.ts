import { useEffect, useMemo, type DependencyList } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type Vec3 = [number, number, number];

export const extrudeProfile = (shape: THREE.Shape, depth: number, bevel = 0) => {
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 32 });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
};

export const lathe = (points: [radius: number, y: number][], segments = 64) => new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);

export const arch = (path: THREE.Path, x: number, y: number, r: number) => path.absarc(x, y, r, Math.PI, 0, true);

export const placed = (geometry: THREE.BufferGeometry, { position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: { position?: Vec3; rotation?: Vec3; scale?: number | Vec3 }) => {
  const s = typeof scale === "number" ? [scale, scale, scale] : scale;
  return geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...s)));
};

export const merge = (parts: THREE.BufferGeometry[]) => {
  const flat = parts.map((p) => (p.index ? p.toNonIndexed() : p));
  const out = mergeGeometries(flat);
  new Set([...parts, ...flat]).forEach((p) => p.dispose());
  if (!out) throw new Error("merge: every part needs the same attributes (position, normal, uv)");
  return out;
};

export const finishes = (paint = "rgb(200, 30, 30)") => ({
  paint: new THREE.MeshPhysicalMaterial({ name: "paint", color: paint, metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.04 }),
  glass: new THREE.MeshPhysicalMaterial({ name: "glass", color: "rgb(8, 10, 14)", metalness: 0.3, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 }),
  chrome: new THREE.MeshStandardMaterial({ name: "chrome", color: "rgb(220, 222, 226)", metalness: 1, roughness: 0.08 }),
  alloy: new THREE.MeshStandardMaterial({ name: "alloy", color: "rgb(54, 56, 60)", metalness: 1, roughness: 0.32 }),
  rubber: new THREE.MeshStandardMaterial({ name: "rubber", color: "rgb(18, 18, 20)", metalness: 0, roughness: 0.86 }),
  trim: new THREE.MeshStandardMaterial({ name: "trim", color: "rgb(14, 14, 16)", metalness: 0.2, roughness: 0.55 }),
  plastic: new THREE.MeshStandardMaterial({ name: "plastic", color: "rgb(236, 236, 232)", metalness: 0, roughness: 0.45 }),
  light: new THREE.MeshStandardMaterial({ name: "light", color: "rgb(235, 240, 255)", emissive: "rgb(220, 232, 255)", emissiveIntensity: 2.2, roughness: 0.2 }),
  signal: new THREE.MeshStandardMaterial({ name: "signal", color: "rgb(120, 0, 8)", emissive: "rgb(255, 20, 30)", emissiveIntensity: 2.4, roughness: 0.3 }),
});

export type Finishes = ReturnType<typeof finishes>;

export const useParts = <T extends Record<string, { dispose: () => void }>>(make: () => T, deps: DependencyList) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const parts = useMemo(make, deps);
  useEffect(() => () => Object.values(parts).forEach((p) => p.dispose()), [parts]);
  return parts;
};
