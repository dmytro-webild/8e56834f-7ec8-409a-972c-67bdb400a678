"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, useGLTF } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { useWebildHold } from "./webildReady";

type SceneProps = {
  progress: MotionValue<number>;
  spin: MotionValue<number>;
  started: boolean;
  active: boolean;
  reduce: boolean;
  scale?: number;
};
type FloatingModelSceneProps = SceneProps & ({ src: string; model?: never } | { model: ReactNode; src?: never });
type RigProps = Omit<SceneProps, "active"> & { ready: () => void };

const METAL = /metal|steel|chrome|silver|gold|alumin|brass|copper|titan/i;
const ORIGIN = new THREE.Vector3();
const INTRO = 1.25;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const buildRig = (source: THREE.Object3D, own = false) => {
  if (own) {
    source.removeFromParent();
    source.position.set(0, 0, 0);
  }
  const scene = own ? source : source.clone(true);
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const dims = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  scene.position.sub(center);
  const holder = new THREE.Group();
  holder.add(scene);
  holder.scale.setScalar(1 / Math.max(dims.y, 1e-6));
  const seen = new Set<THREE.Material>();
  scene.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => {
      if (seen.has(m)) return;
      seen.add(m);
      const material = m as THREE.MeshPhysicalMaterial;
      if (METAL.test(material.name) && material.metalness < 0.5) material.metalness = 1;
      material.aoMapIntensity = 0;
      if (material.transmission > 0) {
        material.transmission = 0;
        material.transparent = true;
        material.opacity = Math.min(material.opacity, 0.12);
        material.depthWrite = false;
      }
    });
  });
  return { holder, wide: Math.max(dims.x, dims.z) / Math.max(dims.y, 1e-6) };
};

function Model({ src, ...rest }: RigProps & { src: string }) {
  const gltf = useGLTF(src, false);
  return <Rig source={gltf.scene} {...rest} />;
}

const shapeOf = (root: THREE.Object3D) => {
  let id = "";
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    id += mesh.isMesh ? `${mesh.id}:${mesh.geometry.id},` : `${o.id},`;
  });
  return id;
};

function CodeModel({ model, ...rest }: RigProps & { model: ReactNode }) {
  const holder = useMemo(() => new THREE.Group(), []);
  const [build, setBuild] = useState(0);
  const seen = useRef("");
  useFrame(() => {
    if (!holder.children.length) return;
    const id = shapeOf(holder);
    if (id === seen.current) return;
    seen.current = id;
    setBuild((n) => n + 1);
  });
  return (
    <>
      {createPortal(model, holder)}
      {build > 0 && <Rig source={holder} build={build} {...rest} />}
    </>
  );
}

function Rig({ source, build, progress, spin, started, reduce, ready, scale = 1 }: RigProps & { source: THREE.Object3D; build?: number }) {
  const rig = useMemo(() => buildRig(source, build !== undefined), [source, build]);
  const turn = useRef<THREE.Group>(null);
  const introAt = useRef<number | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const offProgress = progress.on("change", () => invalidate());
    const offSpin = spin.on("change", () => invalidate());
    invalidate();
    return () => {
      offProgress();
      offSpin();
    };
  }, [progress, spin, started, invalidate]);

  useFrame((state) => {
    const group = turn.current;
    if (!group) return;
    const vp = state.viewport.getCurrentViewport(state.camera, ORIGIN);
    const small = state.size.width < 880;
    const raw = reduce ? 0 : clamp01(progress.get());
    const p = 1 - (1 - raw) * (1 - raw);
    const fit = small ? 0.44 - 0.06 * p : 0.55;
    const size = Math.min(vp.height * fit, (vp.width * 0.42) / rig.wide);
    let e = 0;
    if (started) {
      if (introAt.current === null) introAt.current = performance.now() / 1000;
      const t = reduce ? 1 : clamp01((performance.now() / 1000 - introAt.current) / INTRO);
      e = 1 - Math.pow(1 - t, 3);
      if (t < 1) state.invalidate();
      else ready();
    }
    group.visible = started;
    group.scale.setScalar(size * scale * (0.7 + 0.3 * e));
    group.rotation.set(p * Math.PI * 2, p * Math.PI * 3 + spin.get() - (1 - e) * Math.PI * 0.75, 0);
  });

  return (
    <group ref={turn} visible={false}>
      <primitive object={rig.holder} />
    </group>
  );
}

function Studio() {
  return (
    <Environment resolution={512} frames={1}>
      <color attach="background" args={[0.62, 0.62, 0.64]} />
      <Lightformer form="rect" intensity={2.4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={2.6} position={[-6, 0.5, 1]} rotation-y={Math.PI / 2} scale={[1.5, 9, 1]} />
      <Lightformer form="rect" intensity={2.6} position={[6, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[1.5, 9, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[0, 2.5, 8]} scale={[9, 1.2, 1]} />
      <Lightformer form="rect" intensity={0.8} position={[0, -2.5, 8]} scale={[9, 0.6, 1]} />
      <Lightformer form="rect" intensity={2.4} position={[-3, 2, -6]} scale={[2, 7, 1]} />
      <Lightformer form="rect" intensity={1.8} position={[4, -1, -6]} scale={[2, 5, 1]} />
      <Lightformer form="rect" color={0x1a1a1a} intensity={1} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[12, 6, 1]} />
    </Environment>
  );
}

export default function FloatingModelScene({ src, model, progress, spin, started, active, reduce, scale }: FloatingModelSceneProps) {
  const ready = useWebildHold(undefined, active);
  return (
    <Canvas
      frameloop={active ? (reduce ? "demand" : "always") : "never"}
      dpr={[1, 2]}
      camera={{ position: [2, 0, 10], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <Studio />
        <Float enabled={!reduce} rotationIntensity={0.5} floatingRange={[-0.05, 0.05]} floatIntensity={2} speed={2}>
          {model ? <CodeModel model={model} progress={progress} spin={spin} started={started} reduce={reduce} scale={scale} ready={ready} /> : <Model src={src ?? ""} progress={progress} spin={spin} started={started} reduce={reduce} scale={scale} ready={ready} />}
        </Float>
      </Suspense>
    </Canvas>
  );
}
