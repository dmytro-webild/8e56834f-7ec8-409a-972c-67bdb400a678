import * as THREE from "three";
import { useParts, type Finishes } from "@/components/kit/codeModel";

type WheelsProps = { wheelbase: number; track: number; radius: number; width?: number; spokes?: number; finishes: Pick<Finishes, "rubber" | "alloy" | "trim">; name?: string };

export default function Wheels({ wheelbase, track, radius, width = 0.27, spokes = 5, finishes, name = "part-wheels" }: WheelsProps) {
  const tube = width / 2.7;
  const g = useParts(
    () => ({
      tyre: new THREE.TorusGeometry(radius - tube, tube, 20, 64).scale(1, 1, 1.35),
      rim: new THREE.CylinderGeometry(radius * 0.74, radius * 0.74, width * 0.74, 48, 1),
      disc: new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, 0.04, 32, 1),
      hub: new THREE.CylinderGeometry(radius * 0.13, radius * 0.13, 0.03, 16, 1),
      spoke: new THREE.BoxGeometry(radius * 0.1, radius * 0.66, 0.03).translate(0, radius * 0.33, 0),
    }),
    [radius, width, tube],
  );
  return (
    <group name={name}>
      {[wheelbase / 2, -wheelbase / 2].flatMap((x) =>
        [track / 2, -track / 2].map((z) => {
          const out = Math.sign(z);
          return (
            <group key={`${x}${z}`} name={`wheel-${x > 0 ? "f" : "r"}${z > 0 ? "l" : "r"}`} position={[x, radius, z]}>
              <mesh geometry={g.tyre} material={finishes.rubber} />
              <mesh geometry={g.rim} material={finishes.alloy} rotation-x={Math.PI / 2} position-z={out * 0.012} />
              <mesh geometry={g.disc} material={finishes.trim} rotation-x={Math.PI / 2} position-z={-out * width * 0.15} />
              <mesh geometry={g.hub} material={finishes.alloy} rotation-x={Math.PI / 2} position-z={out * width * 0.52} />
              {Array.from({ length: spokes }, (_, i) => (
                <mesh key={i} geometry={g.spoke} material={finishes.alloy} position-z={out * width * 0.48} rotation-z={(i * Math.PI * 2) / spokes} />
              ))}
            </group>
          );
        }),
      )}
    </group>
  );
}
