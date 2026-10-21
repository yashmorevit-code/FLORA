import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Preload models for the hero scene
useGLTF.preload('/assets/plants/tomato/tomato_plant.glb');
useGLTF.preload('/assets/plants/strawberry/strawberry_plant.glb');
useGLTF.preload('/assets/plants/strawberry/strawberry_fruit.glb');
useGLTF.preload('/assets/plants/sunflower/sunflower.glb');
useGLTF.preload('/assets/plants/chilli/chilli_plant.glb');
useGLTF.preload('/assets/plants/chilli/chilli_fruit.glb');

/**
 * Camera controller with gentle mouse parallax and slow orbital drift.
 * Gracefully respects user drag interaction and prefers-reduced-motion.
 */
function HeroCameraController({ mousePos, isInteracting, reducedMotion }) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0.55, 2.2));
  const baseTarget = useMemo(() => new THREE.Vector3(0, 0.32, 0), []);

  useFrame(({ clock }) => {
    if (isInteracting) return;

    const t = clock.getElapsedTime();
    const driftAngle = reducedMotion ? 0 : Math.sin(t * 0.12) * 0.18;
    const parallaxX = mousePos.x * 0.22;
    const parallaxY = -mousePos.y * 0.12;

    const targetX = Math.sin(driftAngle) * 2.2 + parallaxX;
    const targetY = 0.52 + parallaxY;
    const targetZ = Math.cos(driftAngle) * 2.2;

    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetX, 0.04);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetY, 0.04);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetZ, 0.04);

    camera.position.copy(currentPos.current);
    camera.lookAt(baseTarget);
  });

  return null;
}

/**
 * Hero Tomato Plant Specimen
 */
function HeroTomatoSpecimen({ onHoverPart }) {
  const { scene } = useGLTF('/assets/plants/tomato/tomato_plant.glb');
  const groupRef = useRef();

  const clonedScene = useMemo(() => {
    const node = scene.getObjectByName('plant_001') || scene;
    const clone = node.clone(true);
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.side = THREE.DoubleSide;
          child.material.roughness = 0.42;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.04;
    }
  });

  return (
    <group
      ref={groupRef}
      scale={[0.78, 0.78, 0.78]}
      position={[0, 0.02, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        const name = e.object?.name?.toLowerCase() || '';
        if (name.includes('fruit') || name.includes('tomato')) {
          onHoverPart?.('Tomato Fruit Cluster (Lycopene Rich)');
        } else if (name.includes('leaf')) {
          onHoverPart?.('Compound Foliar Canopy (Active PAR Assimilation)');
        } else {
          onHoverPart?.('Vascular Stem & Petioles');
        }
      }}
      onPointerOut={() => onHoverPart?.(null)}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

/**
 * Hero Strawberry Specimen
 */
function HeroStrawberrySpecimen({ onHoverPart }) {
  const { scene: foliageScene } = useGLTF('/assets/plants/strawberry/strawberry_plant.glb');
  const { scene: fruitScene } = useGLTF('/assets/plants/strawberry/strawberry_fruit.glb');
  const groupRef = useRef();

  const clonedFoliage = useMemo(() => {
    const clone = foliageScene.clone(true);
    clone.position.set(-37.46, 45.37, -27.38);
    clone.traverse((c) => {
      if (c.isMesh && c.material) {
        c.castShadow = true;
        c.receiveShadow = true;
        c.material = c.material.clone();
        c.material.side = THREE.DoubleSide;
      }
    });
    return clone;
  }, [foliageScene]);

  const berries = useMemo(() => [
    { pos: [0.26, 0.08, 0.07], rot: [0.2, 0.15, -0.35], scale: 0.52 },
    { pos: [0.08, 0.09, 0.31], rot: [0.35, -0.2, 0.15], scale: 0.54 },
    { pos: [-0.11, 0.09, 0.32], rot: [0.3, 0.25, 0.25], scale: 0.50 },
    { pos: [-0.17, 0.08, 0.08], rot: [0.15, 0.35, 0.3], scale: 0.48 },
    { pos: [-0.11, 0.09, -0.35], rot: [-0.3, -0.25, 0.15], scale: 0.51 },
    { pos: [0.12, 0.09, -0.28], rot: [-0.28, 0.3, -0.2], scale: 0.49 },
  ], []);

  return (
    <group
      ref={groupRef}
      scale={[0.95, 0.95, 0.95]}
      position={[0, 0.02, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverPart?.('Aggregate Ruby Berry (Fragaria × ananassa)');
      }}
      onPointerOut={() => onHoverPart?.(null)}
    >
      <group scale={[0.0016, 0.00095, 0.00155]}>
        <primitive object={clonedFoliage} />
      </group>
      {berries.map((b, i) => (
        <group key={i} position={b.pos} rotation={b.rot} scale={[b.scale, b.scale, b.scale]}>
          <primitive object={fruitScene.clone(true)} />
        </group>
      ))}
    </group>
  );
}

/**
 * Hero Sunflower Specimen
 */
function HeroSunflowerSpecimen({ onHoverPart }) {
  const { scene } = useGLTF('/assets/plants/sunflower/sunflower.glb');
  const groupRef = useRef();

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.position.set(0, 0, 0);
    clone.traverse((c) => {
      if (c.isMesh && c.material) {
        c.castShadow = true;
        c.receiveShadow = true;
        c.material = c.material.clone();
        c.material.side = THREE.DoubleSide;
      }
    });
    return clone;
  }, [scene]);

  return (
    <group
      ref={groupRef}
      scale={[0.00062, 0.00062, 0.00062]}
      position={[0, 0.02, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverPart?.('Apical Capitulum Inflorescence (Helianthus annuus)');
      }}
      onPointerOut={() => onHoverPart?.(null)}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

/**
 * Hero Chilli Specimen
 */
function HeroChilliSpecimen({ onHoverPart }) {
  const { scene: plantScene } = useGLTF('/assets/plants/chilli/chilli_plant.glb');
  const { scene: fruitScene } = useGLTF('/assets/plants/chilli/chilli_fruit.glb');
  const groupRef = useRef();

  const clonedPlant = useMemo(() => {
    const clone = plantScene.clone(true);
    clone.traverse((c) => {
      if (c.isMesh && c.material) {
        c.castShadow = true;
        c.receiveShadow = true;
        c.material = c.material.clone();
        c.material.side = THREE.DoubleSide;
      }
    });
    return clone;
  }, [plantScene]);

  const pods = useMemo(() => [
    { pos: [0.12, 0.28, 0.09], rot: [0.4, 0.2, 0.1], scale: 0.00085 },
    { pos: [-0.09, 0.25, 0.11], rot: [-0.3, 0.4, -0.2], scale: 0.00082 },
    { pos: [0.03, 0.32, -0.12], rot: [0.1, -0.4, 0.3], scale: 0.00088 },
  ], []);

  return (
    <group
      ref={groupRef}
      scale={[0.0016, 0.0016, 0.0016]}
      position={[0, 0.02, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverPart?.('Pendant Cayenne Pod (Capsicum annuum)');
      }}
      onPointerOut={() => onHoverPart?.(null)}
    >
      <primitive object={clonedPlant} />
      {pods.map((p, i) => (
        <group key={i} position={p.pos} rotation={p.rot} scale={[p.scale, p.scale, p.scale]}>
          <primitive object={fruitScene.clone(true)} />
        </group>
      ))}
    </group>
  );
}

/**
 * Floating microscopic pollen/spores drifting in the air
 */
function AtmosphericPollen() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 28; i++) {
      pts.push({
        x: (Math.random() - 0.5) * 2.8,
        y: Math.random() * 1.8 + 0.1,
        z: (Math.random() - 0.5) * 2.8,
        speed: 0.2 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return pts;
  }, []);

  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const children = ref.current.children;
    for (let i = 0; i < children.length; i++) {
      const p = points[i];
      if (p && children[i]) {
        children[i].position.y = p.y + Math.sin(t * p.speed + p.offset) * 0.06;
      }
    }
  });

  return (
    <group ref={ref}>
      {points.map((p, idx) => (
        <mesh key={idx} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.0045, 6, 6]} />
          <meshBasicMaterial color="#a9d49e" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Botanical Pedestal & Base Dais
 */
function BotanicalPedestal() {
  return (
    <group position={[0, -0.04, 0]}>
      {/* Top ceramic disc */}
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.72, 0.76, 0.05, 48]} />
        <meshStandardMaterial
          color="#16231a"
          roughness={0.72}
          metalness={0.12}
        />
      </mesh>
      {/* Elevated soil bed */}
      <mesh receiveShadow position={[0, 0.046, 0]}>
        <cylinderGeometry args={[0.66, 0.69, 0.02, 48]} />
        <meshStandardMaterial
          color="#221811"
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>
      {/* Subtle outer glow ring */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.78, 0.84, 48]} />
        <meshBasicMaterial
          color="#426b50"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Main Botanical Hero Scene Canvas Component
 */
export function BotanicalHeroScene({
  activeSpecimen = 'tomato',
  onHoverPart,
  interactive = true,
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <div
      className="flora-hero-canvas-wrapper"
      onPointerMove={handlePointerMove}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{ position: [0, 0.55, 2.2], fov: 42 }}
      >
        <color attach="background" args={['#0a130e']} />
        <fog attach="fog" args={['#0a130e', 3.0, 7.5]} />

        {/* Studio Lighting */}
        <ambientLight intensity={0.55} color="#e3fae0" />
        <directionalLight
          castShadow
          position={[3.5, 4.5, 3.0]}
          intensity={2.1}
          color="#fff8eb"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />
        <directionalLight
          position={[-3.0, 2.2, -2.0]}
          intensity={0.8}
          color="#91ad91"
        />
        <directionalLight
          position={[0, 1.2, -3.5]}
          intensity={1.3}
          color="#6db57f"
        />

        {/* Dynamic Botanical Camera */}
        <HeroCameraController
          mousePos={mousePos}
          isInteracting={isInteracting}
          reducedMotion={reducedMotion}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.3}
          maxDistance={3.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.05}
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />

        {/* Base Pedestal & Floating Pollen */}
        <BotanicalPedestal />
        <AtmosphericPollen />

        {/* Living Botanical Specimen */}
        <Suspense fallback={null}>
          {activeSpecimen === 'tomato' && <HeroTomatoSpecimen onHoverPart={onHoverPart} />}
          {activeSpecimen === 'strawberry' && <HeroStrawberrySpecimen onHoverPart={onHoverPart} />}
          {activeSpecimen === 'sunflower' && <HeroSunflowerSpecimen onHoverPart={onHoverPart} />}
          {activeSpecimen === 'chilli' && <HeroChilliSpecimen onHoverPart={onHoverPart} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
