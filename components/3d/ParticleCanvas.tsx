"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * Interactive particle node field.
 * - ~1,500 additive-blended particles orbit a flattened sphere.
 * - A hub subset is linked into a node network (line segments).
 * - Rotation speed gains a impulse from cursor velocity; scroll
 *   position tilts the field; the camera parallaxes with the pointer.
 * All animation runs on the GPU-friendly transform pipeline only.
 */
function NodeField({ count = 1500 }: { count?: number }) {
  const group = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const vel = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });

  const { positions, accentPositions, linePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const hubs: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      // Distributed point cloud inside a flattened ellipsoid
      const r = 2.6 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      const z = r * Math.cos(phi) * 0.8;
      pos.set([x, y, z], i * 3);
      if (i % 32 === 0) hubs.push(new THREE.Vector3(x, y, z));
    }

    // Node network — connect hub pairs under a distance threshold
    const segs: number[] = [];
    const MAX_DIST = 1.55;
    const MAX_SEGS = 150;
    outer: for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        if (hubs[i].distanceTo(hubs[j]) < MAX_DIST) {
          segs.push(
            hubs[i].x, hubs[i].y, hubs[i].z,
            hubs[j].x, hubs[j].y, hubs[j].z
          );
          if (segs.length / 6 >= MAX_SEGS) break outer;
        }
      }
    }

    // Sparse violet accent particles for depth
    const accents = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      const r = 2.9 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      accents.set(
        [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.55,
          r * Math.cos(phi) * 0.8,
        ],
        i * 3
      );
    }

    return {
      positions: pos,
      accentPositions: accents,
      linePositions: new Float32Array(segs),
    };
  }, [count]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // Cursor velocity impulse (clamped, decaying)
    const dx = state.pointer.x - lastPointer.current.x;
    const dy = state.pointer.y - lastPointer.current.y;
    lastPointer.current = { x: state.pointer.x, y: state.pointer.y };
    vel.current = Math.min(0.9, vel.current + (Math.abs(dx) + Math.abs(dy)) * 6);
    vel.current *= 0.92;

    // Base drift + velocity impulse, tilt from pointer + scroll
    const scroll = window.scrollY;
    g.rotation.y += delta * (0.035 + vel.current * 0.9);
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      state.pointer.y * -0.14 + scroll * 0.00045,
      0.045
    );

    // Gentle breathing on the point cloud
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.015;
    g.scale.setScalar(breathe);

    // Camera parallax
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      state.pointer.x * 0.55,
      0.04
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      state.pointer.y * 0.35 + scroll * 0.0006,
      0.04
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#4FACFE"
          size={0.024}
          sizeAttenuation
          depthWrite={false}
          opacity={0.72}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <Points positions={accentPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#7F00FF"
          size={0.042}
          sizeAttenuation
          depthWrite={false}
          opacity={0.55}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          transparent
          color="#00F2FE"
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export default function ParticleCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <NodeField />
    </Canvas>
  );
}
