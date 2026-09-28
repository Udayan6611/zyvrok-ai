import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  Sparkles,
  ContactShadows,
  Icosahedron,
  Torus,
  AdaptiveDpr,
  Environment,
} from '@react-three/drei';
import * as THREE from 'three';

/* The central "morphing" core — a distorted icosahedron that breathes. */
function MorphCore() {
  const mesh = useRef(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(t * 0.18) * 0.35;
    mesh.current.rotation.y = t * 0.14;
    const s = 1 + Math.sin(t * 0.7) * 0.04;
    mesh.current.scale.setScalar(s);
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.35, 10]} />
      <MeshDistortMaterial
        color="#0b3b2e"
        emissive="#0fb27a"
        emissiveIntensity={0.35}
        roughness={0.18}
        metalness={0.85}
        distort={0.42}
        speed={1.6}
      />
    </mesh>
  );
}

/* Orbiting fragments floating around the core. */
function OrbitingFragment({ radius, speed, offset, y, color, geometry }) {
  const ref = useRef(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    ref.current.position.set(
      Math.cos(t) * radius,
      y + Math.sin(t * 1.3) * 0.25,
      Math.sin(t) * radius,
    );
    ref.current.rotation.x = t * 0.6;
    ref.current.rotation.z = t * 0.4;
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        {geometry === 'ico' ? (
          <Icosahedron args={[0.22, 0]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} metalness={0.9} />
          </Icosahedron>
        ) : (
          <Torus args={[0.18, 0.06, 12, 40]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.25} metalness={0.85} />
          </Torus>
        )}
      </Float>
    </group>
  );
}

/* Mouse-parallax rig — the camera drifts gently with the pointer. */
function ParallaxRig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.045;
    camera.position.y += (pointer.y * 0.8 + 0.4 - camera.position.y) * 0.045;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SceneContents() {
  const fragments = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        radius: 2.1 + (i % 3) * 0.55,
        speed: 0.18 + (i % 4) * 0.05,
        offset: (i / 6) * Math.PI * 2,
        y: (i % 2 === 0 ? 0.35 : -0.4) + (i - 3) * 0.12,
        color: i % 2 === 0 ? '#10b981' : '#6366f1',
        geometry: i % 3 === 0 ? 'torus' : 'ico',
      })),
    [],
  );

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} />
      <pointLight position={[-4, -2, 2]} intensity={1.2} color="#6366f1" />
      <pointLight position={[3, -3, -2]} intensity={0.9} color="#10b981" />

      <Suspense fallback={null}>
        <MorphCore />
        {fragments.map((f, i) => (
          <OrbitingFragment key={i} {...f} />
        ))}
        <Sparkles count={40} scale={9} size={2.4} speed={0.4} opacity={0.7} color="#9be7c4" />
        <Environment preset="city" />
      </Suspense>

      <ContactShadows position={[0, -1.9, 0]} opacity={0.4} scale={10} blur={2.6} far={4} color="#000000" />
      <ParallaxRig />
      <AdaptiveDpr pixelated />
    </>
  );
}

/**
 * HeroScene — pauses its WebGL render loop when scrolled out of view so it
 * stops eating CPU/GPU while the user is on the features / pricing sections.
 */
export function HeroScene() {
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        shadows={false}
        dpr={[1, 1.6]}
        frameloop={visible ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.4, 5.2], fov: 42 }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneContents />
      </Canvas>
    </div>
  );
}

export default HeroScene;