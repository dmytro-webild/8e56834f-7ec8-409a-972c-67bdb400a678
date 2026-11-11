import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type ShapeTone = { accent: string; face: string; light: boolean };
type Mats = { face: THREE.MeshPhysicalMaterial; chrome: THREE.MeshPhysicalMaterial; accent: THREE.MeshPhysicalMaterial; side: THREE.MeshPhysicalMaterial };
export type ShapeDef = { id: string; label: string; industries: string[]; build: () => THREE.Group };

const RED = "rgb(252, 32, 31)";
const FACE = "rgb(42, 9, 9)";

const physical = (tone: string, params: THREE.MeshPhysicalMaterialParameters) => {
  const material = new THREE.MeshPhysicalMaterial(params);
  material.name = `velorn-${tone}`;
  material.userData.tone = tone;
  return material;
};

type Finish = Record<keyof Mats, THREE.MeshPhysicalMaterialParameters>;

const DARK: Finish = {
  face: { color: FACE, metalness: 1, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.14 },
  chrome: { color: "rgb(180, 180, 186)", metalness: 1, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.1 },
  accent: { color: RED, metalness: 0.45, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08 },
  side: { color: "rgb(20, 20, 22)", metalness: 1, roughness: 0.34, clearcoat: 0.5, clearcoatRoughness: 0.2 },
};

const LIGHT: Finish = {
  face: { metalness: 0.45, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.06 },
  chrome: { color: "rgb(236, 236, 240)", metalness: 1, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05 },
  accent: { metalness: 0.2, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.06 },
  side: { color: "rgb(150, 150, 158)", metalness: 0.85, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 },
};

const mats = (): Mats => ({
  face: physical("face", DARK.face),
  chrome: physical("chrome", DARK.chrome),
  accent: physical("accent", DARK.accent),
  side: physical("side", DARK.side),
});

const slab = (shape: THREE.Shape, depth: number, bevel: number, m: Mats, face: THREE.Material = m.face, side: THREE.Material = m.side) => {
  const group = new THREE.Group();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 64, steps: 1 });
  const mesh = new THREE.Mesh(geo, [face, side]);
  mesh.position.z = -depth / 2;
  group.add(mesh);
  return group;
};

const quarter = (outer: number, inner: number, from: number) => {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, from, from + Math.PI / 2, false);
  shape.absarc(0, 0, inner, from + Math.PI / 2, from, true);
  return shape;
};

const rounded = (w: number, h: number, r: number) => {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
};

const normalise = (inner: THREE.Group, fill = 1) => {
  const box = new THREE.Box3().setFromObject(inner);
  const size = box.getSize(new THREE.Vector3());
  inner.position.sub(box.getCenter(new THREE.Vector3()));
  const outer = new THREE.Group();
  outer.add(inner);
  outer.scale.setScalar(1 / Math.max(size.x, size.y, size.z, 1e-6));
  outer.userData.fill = fill;
  return outer;
};

const arcs = () => {
  const m = mats();
  const g = new THREE.Group();
  [0, 1].forEach((row) => {
    const y = row === 0 ? 0.52 : -0.52;
    const x = row === 0 ? 0.12 : -0.12;
    const big = slab(quarter(1, 0.46, Math.PI / 2), 0.36, 0.05, m);
    big.position.set(x + 0.02, y - 0.5, 0);
    const small = slab(quarter(1, 0.46, -Math.PI / 2), 0.36, 0.05, m);
    small.position.set(x - 0.02, y + 0.5, 0);
    g.add(big, small);
  });
  g.rotation.set(-0.12, 0.38, 0);
  return normalise(g);
};

const sweep = (section: THREE.Shape, steps: number, path: (a: number) => THREE.Vector3, twist = 0) => {
  const geo = new THREE.ExtrudeGeometry(section, { depth: 1, bevelEnabled: false, curveSegments: 10, steps });
  const pos = geo.attributes.position;
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  const n = new THREE.Vector3();
  const b = new THREE.Vector3();
  const up = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < pos.count; i += 1) {
    const u = pos.getZ(i);
    const a = u * Math.PI * 2;
    p.copy(path(a));
    t.copy(path(a + 1e-3)).sub(path(a - 1e-3)).normalize();
    n.crossVectors(up, t).normalize();
    b.crossVectors(t, n).normalize();
    const r = u * twist;
    const x = pos.getX(i) * Math.cos(r) - pos.getY(i) * Math.sin(r);
    const y = pos.getX(i) * Math.sin(r) + pos.getY(i) * Math.cos(r);
    pos.setXYZ(i, p.x + n.x * x + b.x * y, p.y + n.y * x + b.y * y, p.z + n.z * x + b.z * y);
  }
  geo.deleteAttribute("normal");
  geo.deleteAttribute("uv");
  const smooth = mergeVertices(geo, 1e-4);
  smooth.computeVertexNormals();
  return smooth;
};

const infinity = () => {
  const m = mats();
  const g = new THREE.Group();
  const path = (a: number) => {
    const d = 1 + Math.sin(a) ** 2;
    return new THREE.Vector3((Math.cos(a) / d) * 1.1, ((Math.sin(a) * Math.cos(a)) / d) * 1.1, Math.sin(a) * 0.2);
  };
  g.add(new THREE.Mesh(sweep(rounded(0.36, 0.26, 0.1), 320, path), m.face));
  g.rotation.set(-0.25, 0.35, 1.3);
  return normalise(g, 1.32);
};

const ribbon = () => {
  const m = mats();
  const depth = 2.6;
  const geo = new THREE.ExtrudeGeometry(rounded(0.5, 0.08, 0.035), { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 8, steps: 220 });
  const pos = geo.attributes.position;
  const span = Math.PI * 1.55;
  for (let i = 0; i < pos.count; i += 1) {
    const t = pos.getZ(i) / depth;
    const twist = t * Math.PI * 1.5;
    const x = pos.getX(i) * Math.cos(twist) - pos.getY(i) * Math.sin(twist);
    const y = pos.getX(i) * Math.sin(twist) + pos.getY(i) * Math.cos(twist);
    const a = (t - 0.5) * span;
    const r = 0.62 + x;
    pos.setXYZ(i, r * Math.cos(a), r * Math.sin(a), y + Math.sin(t * Math.PI * 2) * 0.12);
  }
  geo.deleteAttribute("normal");
  geo.deleteAttribute("uv");
  const smooth = mergeVertices(geo, 1e-4);
  smooth.computeVertexNormals();
  const g = new THREE.Group();
  const band = new THREE.Mesh(smooth, m.face);
  const inner = new THREE.Mesh(smooth, m.accent);
  inner.scale.setScalar(0.62);
  inner.rotation.set(0.5, 0.2, Math.PI);
  g.add(band, inner);
  g.rotation.x = -0.35;
  return normalise(g, 1.1);
};

const petals = () => {
  const m = mats();
  const g = new THREE.Group();
  const lobe = new THREE.Shape();
  lobe.moveTo(0, 0.04);
  lobe.bezierCurveTo(0.34, 0.1, 0.36, 0.86, 0, 0.98);
  lobe.bezierCurveTo(-0.36, 0.86, -0.34, 0.1, 0, 0.04);
  [0, 1, 2, 3].forEach((i) => {
    const p = slab(lobe, 0.16, 0.05, m);
    p.rotation.z = (i * Math.PI) / 2 + Math.PI / 4;
    p.position.z = i % 2 ? 0.06 : -0.06;
    g.add(p);
  });
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 48, 32), m.chrome));
  g.rotation.set(-0.3, 0.42, 0);
  return normalise(g, 1.14);
};

const frame = () => {
  const m = mats();
  const g = new THREE.Group();
  const path = (a: number) => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    return new THREE.Vector3(Math.sign(c) * Math.abs(c) ** 0.5 * 0.72, Math.sign(s) * Math.abs(s) ** 0.5 * 0.72, 0);
  };
  g.add(new THREE.Mesh(sweep(rounded(0.36, 0.1, 0.045), 400, path, Math.PI), m.face));
  const core = slab(rounded(0.42, 0.42, 0.1), 0.12, 0.04, m, m.accent);
  core.rotation.z = Math.PI / 4;
  g.add(core);
  g.rotation.set(-0.35, 0.45, 0.1);
  return normalise(g);
};

const stack = () => {
  const m = mats();
  const g = new THREE.Group();
  [0, 1, 2, 3].forEach((i) => {
    const s = slab(rounded(0.9, 0.9, 0.2), 0.1, 0.04, m);
    s.rotation.set(-Math.PI / 2, 0, i * 0.24);
    s.position.set((i - 1.5) * 0.06, (i - 1.5) * 0.21, (i - 1.5) * -0.04);
    g.add(s);
  });
  g.rotation.set(0.35, 0.5, 0);
  return normalise(g);
};

const chevron = (w: number, h: number, t: number) => {
  const shape = new THREE.Shape();
  const k = t / Math.cos(Math.atan2(w / 2, h));
  shape.moveTo(-w / 2, 0);
  shape.lineTo(-w / 2 + t, 0);
  shape.lineTo(0, h - k);
  shape.lineTo(w / 2 - t, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(0.06, h - 0.03);
  shape.quadraticCurveTo(0, h + 0.02, -0.06, h - 0.03);
  shape.lineTo(-w / 2, 0);
  return shape;
};

const chevrons = () => {
  const m = mats();
  const g = new THREE.Group();
  [0, 1, 2].forEach((i) => {
    const c = slab(chevron(1.7, 0.8, 0.32), 0.3, 0.07, m, i === 1 ? m.accent : m.face, m.face);
    c.position.set(0, (1 - i) * 0.5 - 0.4, (i - 1) * -0.16);
    g.add(c);
  });
  g.rotation.set(-0.2, 0.45, 0);
  return normalise(g, 1.08);
};

export const SHAPES: Record<string, ShapeDef> = {
  arcs: { id: "arcs", label: "Arcs", industries: ["creative agencies", "branding studios", "design studios", "product studios", "marketing agencies", "any business"], build: arcs },
  infinity: { id: "infinity", label: "Infinity", industries: ["consulting", "partnerships", "legal", "recruitment", "professional services"], build: infinity },
  ribbon: { id: "ribbon", label: "Ribbon", industries: ["fashion", "beauty", "luxury retail", "music", "entertainment", "events"], build: ribbon },
  petals: { id: "petals", label: "Petals", industries: ["wellness", "hospitality", "lifestyle brands", "health clinics"], build: petals },
  frame: { id: "frame", label: "Frame", industries: ["saas", "integrations", "platforms", "software", "ai", "cybersecurity"], build: frame },
  stack: { id: "stack", label: "Stack", industries: ["architecture", "real estate", "construction", "interior design", "manufacturing"], build: stack },
  chevrons: { id: "chevrons", label: "Chevrons", industries: ["fintech", "aerospace", "data", "investment", "web3", "gaming"], build: chevrons },
};

const parse = (value: string, fallback: string) => {
  const color = new THREE.Color(fallback);
  try {
    if (value) color.setStyle(value);
  } catch {
    color.set(fallback);
  }
  return color;
};

export const readShapeTone = (): ShapeTone => {
  const root = document.documentElement;
  const style = getComputedStyle(document.querySelector("[data-model-stage]") ?? root);
  const accent = parse(style.getPropertyValue("--accent").trim(), RED);
  const flag = style.getPropertyValue("--model-tone").trim();
  const light = flag ? flag === "light" : root.style.colorScheme === "light";
  const face = light ? new THREE.Color("rgb(214, 212, 218)").lerp(accent, 0.14) : new THREE.Color("rgb(11, 11, 13)").lerp(accent, 0.16);
  return { accent: `#${accent.getHexString()}`, face: `#${face.getHexString()}`, light };
};

export const paintShape = (root: THREE.Object3D, tone: ShapeTone) => {
  const finish = tone.light ? LIGHT : DARK;
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => {
      const material = m as THREE.MeshPhysicalMaterial;
      const role = material.userData.tone as keyof Mats;
      if (!finish[role]) return;
      material.setValues({ ...DARK[role], ...finish[role] });
      if (role === "face") material.color.set(tone.face);
      if (role === "accent") material.color.set(tone.accent);
    });
  });
};
