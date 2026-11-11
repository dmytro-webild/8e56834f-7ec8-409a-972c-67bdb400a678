import * as THREE from "three";
import { cloud, type ShapeResult } from "@/components/kit/particleShapes";
import { globe, sphere } from "@/components/kit/particleShapes/parts";
import { spread } from "@/components/kit/particleShapes/sample";

export type DriftBuild = (count: number) => Float32Array;

export type DriftSet = {
  id: string;
  label: string;
  heroRing: number;
  hero: DriftBuild;
  galaxy: DriftBuild;
  stars: DriftBuild;
  model: DriftBuild;
  close: DriftBuild;
};

const rnd = Math.random;
const TAU = Math.PI * 2;

const fill = (count: number, at: (i: number) => [number, number, number]) => {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) out.set(at(i), i * 3);
  return out;
};

const scaled = (positions: Float32Array, s: number) => positions.map((v) => v * s);

const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

const torus: DriftBuild = (n) =>
  fill(n, () => {
    const u = rnd() * TAU, v = rnd() * TAU, R = 1.6, r = 0.78;
    return [(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v)];
  });

const galaxy: DriftBuild = (n) =>
  fill(n, (i) => {
    const arm = i % 2, rr = Math.pow(rnd(), 0.9) * 4.2;
    const a = arm * Math.PI + rr * 1.35 + (rnd() - 0.5) * (0.35 + rr * 0.08);
    const ring = rnd() < 0.35 ? (rnd() < 0.5 ? 1.25 : 3.1) + (rnd() - 0.5) * 0.12 : rr;
    const ang = rnd() < 0.35 ? rnd() * TAU : a;
    return [Math.cos(ang) * ring, (rnd() - 0.5) * 0.08 * (1.2 - ring / 4.5), Math.sin(ang) * ring];
  });

const star = (): [number, number, number] => {
  const d = 3 + Math.pow(rnd(), 0.6) * 9, th = rnd() * TAU, ph = Math.acos(2 * rnd() - 1);
  return [d * Math.sin(ph) * Math.cos(th), d * Math.sin(ph) * Math.sin(th) * 0.7, d * Math.cos(ph) - 2];
};

const stars: DriftBuild = (n) => fill(n, star);

const rings: DriftBuild = (n) =>
  fill(n, () => {
    const pick = rnd();
    if (pick < 0.18) {
      const v = new THREE.Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(0.7 * Math.cbrt(rnd()));
      return [v.x, v.y, v.z];
    }
    const band = pick < 0.5 ? [1.5, 0.18] : pick < 0.8 ? [2.5, 0.3] : [3.6, 0.12];
    const r = band[0] + (rnd() - 0.5) * band[1], a = rnd() * TAU;
    return [Math.cos(a) * r, (rnd() - 0.5) * 0.04, Math.sin(a) * r];
  });

const nebula: DriftBuild = (n) => {
  const blobs = Array.from({ length: 9 }, () => [(rnd() - 0.5) * 14, (rnd() - 0.5) * 7, -2 - rnd() * 8, 0.8 + rnd() * 1.8]);
  return fill(n, () => {
    if (rnd() < 0.35) return star();
    const b = blobs[Math.floor(rnd() * blobs.length)];
    return [b[0] + gauss() * b[3], b[1] + gauss() * b[3] * 0.6, b[2] + gauss() * b[3]];
  });
};

const waveField: DriftBuild = (n) => {
  const tilt = new THREE.Matrix4().makeRotationX(0.9);
  const v = new THREE.Vector3();
  return fill(n, () => {
    const x = (rnd() - 0.5) * 6.4, z = (rnd() - 0.5) * 4;
    const y = Math.sin(x * 1.3) * 0.32 + Math.cos(z * 1.7 + x * 0.6) * 0.26;
    v.set(x, y, z).applyMatrix4(tilt);
    return [v.x, v.y, v.z];
  });
};

const helix: DriftBuild = (n) =>
  fill(n, () => {
    const y = (rnd() - 0.5) * 5.6, a = y * 1.6, r = 1.15;
    if (rnd() < 0.22) {
      const t = rnd() * 2 - 1, step = Math.round(y * 3) / 3, b = step * 1.6;
      return [Math.cos(b) * r * t, step, Math.sin(b) * r * t];
    }
    const side = rnd() < 0.5 ? 0 : Math.PI, j = 0.05;
    return [Math.cos(a + side) * r + gauss() * j, y, Math.sin(a + side) * r + gauss() * j];
  });

const grid: DriftBuild = (n) =>
  fill(n, () => {
    const s = 0.9;
    return [Math.round((rnd() - 0.5) * 16 / s) * s + gauss() * 0.02, Math.round((rnd() - 0.5) * 9 / s) * s + gauss() * 0.02, (rnd() - 0.5) * 12 - 2];
  });

const lattice: DriftBuild = (n) =>
  fill(n, () => {
    const k = 3, s = 1.05;
    const node = [Math.floor(rnd() * (2 * k + 1)) - k, Math.floor(rnd() * (2 * k + 1)) - k, Math.floor(rnd() * (2 * k + 1)) - k];
    const axis = Math.floor(rnd() * 3);
    node[axis] += rnd();
    const p = node.map((c) => c * s * 0.62) as [number, number, number];
    return Math.hypot(...p) > 3.4 ? [p[0] * 0.5, p[1] * 0.5, p[2] * 0.5] : p;
  });

const shards: DriftBuild = (n) => {
  const centres = Array.from({ length: 70 }, () => [(rnd() - 0.5) * 16, (rnd() - 0.5) * 9, -1 - rnd() * 10, 0.15 + rnd() * 0.45]);
  return fill(n, () => {
    const c = centres[Math.floor(rnd() * centres.length)];
    const v = new THREE.Vector3(gauss(), gauss() * 1.8, gauss());
    const l1 = Math.abs(v.x) + Math.abs(v.y) / 1.8 + Math.abs(v.z) || 1;
    v.multiplyScalar(c[3] / l1);
    return [c[0] + v.x, c[1] + v.y, c[2] + v.z];
  });
};

const network: DriftBuild = (n) => {
  const nodes = Array.from({ length: 48 }, () => new THREE.Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(2.2 + rnd() * 1.4));
  const links: [THREE.Vector3, THREE.Vector3][] = [];
  nodes.forEach((a) => {
    const near = [...nodes].sort((p, q) => p.distanceTo(a) - q.distanceTo(a)).slice(1, 4);
    near.forEach((b) => links.push([a, b]));
  });
  const v = new THREE.Vector3();
  return fill(n, () => {
    if (rnd() < 0.3) {
      const c = nodes[Math.floor(rnd() * nodes.length)];
      v.set(gauss(), gauss(), gauss()).multiplyScalar(0.07).add(c);
    } else {
      const [a, b] = links[Math.floor(rnd() * links.length)];
      v.copy(a).lerp(b, rnd());
    }
    return [v.x, v.y * 0.9, v.z];
  });
};

const stream: DriftBuild = (n) => {
  const lanes = Array.from({ length: 140 }, () => [(rnd() - 0.5) * 15, (rnd() - 0.5) * 8]);
  return fill(n, () => {
    const l = lanes[Math.floor(rnd() * lanes.length)];
    return [l[0] + gauss() * 0.02, l[1] + gauss() * 0.02, (rnd() - 0.5) * 12 - 2];
  });
};

const ico: DriftBuild = (n) => scaled(cloud((add) => add(new THREE.IcosahedronGeometry(1, 0), 1), n, 0.55).positions, 2.1);

const ball: DriftBuild = (n) => scaled((sphere(n) as ShapeResult).positions, 2.6);

const earth: DriftBuild = (n) => scaled((globe(46, true)(n) as ShapeResult).positions, 3.4);

const knot: DriftBuild = (n) => scaled(cloud((add) => add(new THREE.TorusKnotGeometry(1, 0.28, 320, 28, 2, 3), 90), n, 0).positions, 2.3);

const planet: DriftBuild = (n) => {
  const tilt = new THREE.Matrix4().makeRotationX(0.42).premultiply(new THREE.Matrix4().makeRotationZ(-0.28));
  const moons = [[2.35, 0.6, 0.16], [-2.05, -0.95, 0.12], [0.5, 1.75, 0.09]];
  return spread(n, (v) => {
    const pick = rnd();
    if (pick < 0.46) v.set(gauss(), gauss(), gauss()).normalize().multiplyScalar(1.05);
    else if (pick < 0.92) {
      const r = Math.sqrt(1.55 ** 2 + rnd() * (2.35 ** 2 - 1.55 ** 2)), a = rnd() * TAU;
      const gap = r > 1.92 && r < 2.0 ? 0.6 : 1;
      v.set(Math.cos(a) * r * gap, (rnd() - 0.5) * 0.03, Math.sin(a) * r * gap).applyMatrix4(tilt);
    } else {
      const m = moons[Math.floor(rnd() * moons.length)];
      v.set(gauss(), gauss(), gauss()).normalize().multiplyScalar(m[2]).add(new THREE.Vector3(m[0], m[1], 0.4));
    }
  });
};

const ribbon: DriftBuild = (n) =>
  spread(n, (v) => {
    const x = (rnd() - 0.5) * 4.8, w = (rnd() - 0.5) * 1.8, th = x * 0.75 + 0.4;
    const lift = Math.sin(x * 1.3) * 0.75;
    v.set(x, lift + Math.cos(th) * w, Math.sin(th) * w + Math.cos(x * 0.9) * 0.4);
  });

const crystals: DriftBuild = (n) =>
  scaled(
    cloud((add) => {
      const up = new THREE.Vector3(0, 1, 0);
      [[0, 0, 0.42, 2.6], [0.55, -0.35, 0.3, 1.8], [-0.6, -0.25, 0.32, 1.9], [0.3, 0.6, 0.24, 1.4], [-0.35, 0.55, 0.22, 1.3], [0.95, 0.15, 0.2, 1.1], [-1, 0.2, 0.18, 1.0]].forEach(([dx, dz, r, h]) => {
        const body = new THREE.CylinderGeometry(r, r * 1.08, h, 6).translate(0, h / 2, 0);
        const tip = new THREE.ConeGeometry(r, r * 1.7, 6).translate(0, h + r * 0.85, 0);
        const q = new THREE.Quaternion().setFromUnitVectors(up, new THREE.Vector3(dx, 1.6, dz).normalize());
        [body, tip].forEach((g) => add(g.applyQuaternion(q).translate(dx * 0.35, -1.2, dz * 0.35)));
      });
    }, n, 0.4).positions,
    2.3,
  );

const lattice3: DriftBuild = (n) =>
  scaled(
    cloud((add) => {
      add(new THREE.IcosahedronGeometry(0.95, 2), 5);
      [[1.3, 0.35, 0], [1.55, -0.5, 0.6], [1.8, 0.15, -0.9]].forEach(([r, x, z]) =>
        add(new THREE.TorusGeometry(r, 0.012, 3, 160).rotateX(Math.PI / 2 + x).rotateZ(z), 60),
      );
    }, n, 0.8).positions,
    2.2,
  );

export const DRIFT_SETS: Record<string, DriftSet> = {
  drift: { id: "drift", label: "Drift: torus, galaxy, stars, knot", heroRing: 1.6, hero: torus, galaxy, stars, model: knot, close: stars },
  orbit: { id: "orbit", label: "Orbit: sphere, rings, nebula, planet", heroRing: 0, hero: ball, galaxy: rings, stars: nebula, model: planet, close: nebula },
  wave: { id: "wave", label: "Wave: field, helix, grid, ribbon", heroRing: 0, hero: waveField, galaxy: helix, stars: grid, model: ribbon, close: grid },
  prism: { id: "prism", label: "Prism: icosahedron, lattice, crystal, cluster", heroRing: 0, hero: ico, galaxy: lattice, stars: shards, model: crystals, close: shards },
  signal: { id: "signal", label: "Signal: globe, network, stream, lattice sphere", heroRing: 0, hero: earth, galaxy: network, stars: stream, model: lattice3, close: stream },
};
