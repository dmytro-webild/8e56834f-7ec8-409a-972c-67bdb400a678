import * as THREE from "three";
import { arch, extrudeProfile, finishes, useParts } from "@/components/kit/codeModel";
import Wheels from "@/components/models/Wheels";

type ExampleSportsCarProps = { color?: string };

const LENGTH = 4.5;
const WIDTH = 1.86;
const WHEEL_R = 0.35;
const WHEEL_X = 1.38;
const ARCH = WHEEL_R + 0.1;
const TRACK = WIDTH - 0.24;

const bodyShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-2.22, 0.3);
  s.lineTo(-WHEEL_X - ARCH, 0.2);
  arch(s, -WHEEL_X, WHEEL_R, ARCH);
  s.lineTo(WHEEL_X - ARCH, 0.18);
  arch(s, WHEEL_X, WHEEL_R, ARCH);
  s.lineTo(2.08, 0.2);
  s.quadraticCurveTo(2.3, 0.24, 2.28, 0.38);
  s.quadraticCurveTo(2.16, 0.62, 1.76, 0.76);
  s.quadraticCurveTo(1.38, 0.98, 0.9, 0.84);
  s.lineTo(0.62, 0.81);
  s.lineTo(-1.0, 0.86);
  s.quadraticCurveTo(-1.38, 0.98, -1.85, 0.9);
  s.lineTo(-2.2, 0.86);
  s.lineTo(-2.3, 0.76);
  s.quadraticCurveTo(-2.32, 0.46, -2.22, 0.3);
  return s;
};

const canopyShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0.78, 0.72);
  s.quadraticCurveTo(0.2, 1.06, -0.25, 1.13);
  s.lineTo(-0.7, 1.13);
  s.quadraticCurveTo(-1.35, 1.06, -1.72, 0.78);
  s.lineTo(0.78, 0.72);
  return s;
};

export default function ExampleSportsCar({ color = "rgb(255, 106, 19)" }: ExampleSportsCarProps) {
  const f = useParts(() => finishes(color), [color]);
  const g = useParts(() => ({ body: extrudeProfile(bodyShape(), WIDTH - 0.1, 0.05), canopy: extrudeProfile(canopyShape(), WIDTH - 0.52, 0.1), box: new THREE.BoxGeometry(1, 1, 1) }), []);

  return (
    <group name="sports-car">
      <group name="part-body">
        <mesh name="body" geometry={g.body} material={f.paint} />
        <mesh name="canopy" geometry={g.canopy} material={f.glass} />
        <mesh name="underbody" geometry={g.box} material={f.trim} position={[0, 0.24, 0]} scale={[LENGTH - 0.6, 0.1, WIDTH - 0.3]} />
        <mesh name="splitter" geometry={g.box} material={f.trim} position={[2.14, 0.2, 0]} scale={[0.3, 0.04, WIDTH - 0.3]} />
        <mesh name="diffuser" geometry={g.box} material={f.trim} position={[-2.2, 0.28, 0]} scale={[0.2, 0.12, WIDTH - 0.5]} />
        <mesh name="taillight" geometry={g.box} material={f.signal} position={[-2.34, 0.66, 0]} scale={[0.04, 0.05, WIDTH - 0.44]} />
        <mesh name="spoiler" geometry={g.box} material={f.trim} position={[-2.1, 1.02, 0]} scale={[0.36, 0.03, WIDTH - 0.24]} />
        {[1, -1].map((side) => (
          <group key={side}>
            <mesh name="headlight" geometry={g.box} material={f.light} position={[2.02, 0.63, side * 0.6]} rotation-z={-0.55} scale={[0.34, 0.05, 0.38]} />
            <mesh name="intake" geometry={g.box} material={f.trim} position={[-0.6, 0.52, side * (WIDTH / 2 - 0.01)]} scale={[0.7, 0.16, 0.06]} />
            <mesh name="mirror" geometry={g.box} material={f.paint} position={[0.5, 0.96, side * 0.98]} scale={[0.16, 0.08, 0.2]} />
            <mesh name="spoiler-post" geometry={g.box} material={f.trim} position={[-2.04, 0.95, side * 0.5]} scale={[0.06, 0.14, 0.04]} />
          </group>
        ))}
      </group>
      <Wheels wheelbase={WHEEL_X * 2} track={TRACK} radius={WHEEL_R} finishes={f} />
    </group>
  );
}
