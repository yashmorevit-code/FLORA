import React, { useMemo, useEffect, Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Helper to create an inward-facing 4-wall band geometry for a subterranean horizon.
 * The 4 walls face towards the center of the pit [0, y, 0].
 * WebGL backface culling (CCW) automatically hides the near walls (facing away from camera)
 * and renders the far walls (facing towards camera) with full depthWrite.
 * This completely eliminates transparency depth-sorting artifacts and z-fighting.
 */
function createInwardWallGeometry(w, yTop, yBottom) {
  const geom = new THREE.BufferGeometry();

  const vertices = [
    // Back wall (Z = -w, facing +Z)
    -w, yBottom, -w,   w, yBottom, -w,   w, yTop, -w,
    -w, yBottom, -w,   w, yTop, -w,     -w, yTop, -w,

    // Front wall (Z = +w, facing -Z)
     w, yBottom,  w,  -w, yBottom,  w,  -w, yTop,  w,
     w, yBottom,  w,  -w, yTop,  w,      w, yTop,  w,

    // Left wall (X = -w, facing +X)
    -w, yBottom,  w,  -w, yBottom, -w,  -w, yTop, -w,
    -w, yBottom,  w,  -w, yTop, -w,     -w, yTop,  w,

    // Right wall (X = +w, facing -X)
     w, yBottom, -w,   w, yBottom,  w,   w, yTop,  w,
     w, yBottom, -w,   w, yTop,  w,      w, yTop, -w,
  ];

  const uvs = [
    0, 0,  1, 0,  1, 1,
    0, 0,  1, 1,  0, 1,

    0, 0,  1, 0,  1, 1,
    0, 0,  1, 1,  0, 1,

    0, 0,  1, 0,  1, 1,
    0, 0,  1, 1,  0, 1,

    0, 0,  1, 0,  1, 1,
    0, 0,  1, 1,  0, 1,
  ];

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  return geom;
}

/**
 * PBR Textured Implementation of Soil Cross-Section
 * Loads photorealistic dry/moist mud maps from Poly Haven (CC0).
 */
function TexturedSoilProfile({ showRoots = true, moisture = 50 }) {
  const textures = useTexture({
    map: '/assets/textures/soil/brown_mud_dry_diff_1k.jpg',
    normalMap: '/assets/textures/soil/brown_mud_dry_nor_gl_1k.jpg',
    roughnessMap: '/assets/textures/soil/brown_mud_dry_rough_1k.jpg',
  });

  // Configure texture repeat and filtering for high-density soil detail
  useEffect(() => {
    if (textures.map) {
      textures.map.wrapS = textures.map.wrapT = THREE.RepeatWrapping;
      textures.map.repeat.set(3, 3);
      textures.map.needsUpdate = true;
    }
    if (textures.normalMap) {
      textures.normalMap.wrapS = textures.normalMap.wrapT = THREE.RepeatWrapping;
      textures.normalMap.repeat.set(3, 3);
      textures.normalMap.needsUpdate = true;
    }
    if (textures.roughnessMap) {
      textures.roughnessMap.wrapS = textures.roughnessMap.wrapT = THREE.RepeatWrapping;
      textures.roughnessMap.repeat.set(3, 3);
      textures.roughnessMap.needsUpdate = true;
    }
  }, [textures]);

  const moistureNorm = Math.min(1.0, Math.max(0.0, (moisture ?? 50) / 100));

  // Horizon A: Topsoil Humus color
  const soilColor = useMemo(() => {
    const dryColor = new THREE.Color('#5c4331');
    const wetColor = new THREE.Color('#1c130c');
    return dryColor.lerp(wetColor, moistureNorm);
  }, [moistureNorm]);

  // Horizon B: Subsoil Sandy Loam color
  const subsoilColor = useMemo(() => {
    const drySub = new THREE.Color('#6c513c');
    const wetSub = new THREE.Color('#281c13');
    return drySub.lerp(wetSub, moistureNorm);
  }, [moistureNorm]);

  // Horizon C: Deep Substratum Clay/Bedrock color
  const deepSubstratumColor = useMemo(() => {
    const dryDeep = new THREE.Color('#4d3928');
    const wetDeep = new THREE.Color('#1c120a');
    return dryDeep.lerp(wetDeep, moistureNorm);
  }, [moistureNorm]);

  const surfaceRoughness = 0.94 - moistureNorm * 0.25;
  const subsoilRoughness = 0.96 - moistureNorm * 0.16;

  const groundShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-50, -50);
    shape.lineTo(50, -50);
    shape.lineTo(50, 50);
    shape.lineTo(-50, 50);
    shape.closePath();

    if (showRoots) {
      const hole = new THREE.Path();
      hole.moveTo(-1.9, -1.9);
      hole.lineTo(1.9, -1.9);
      hole.lineTo(1.9, 1.9);
      hole.lineTo(-1.9, 1.9);
      hole.closePath();
      shape.holes.push(hole);
    }

    return shape;
  }, [showRoots]);

  const geomHorizonA = useMemo(() => createInwardWallGeometry(1.9, 0.0, -0.45), []);
  const geomHorizonB = useMemo(() => createInwardWallGeometry(1.9, -0.45, -1.80), []);
  const geomHorizonC = useMemo(() => createInwardWallGeometry(1.9, -1.80, -2.60), []);

  const strataLines = useMemo(() => {
    const points = [];
    const w = 1.9;

    const addSquareLoop = (y) => {
      points.push(
        -w, y, -w,   w, y, -w,
         w, y, -w,   w, y,  w,
         w, y,  w,  -w, y,  w,
        -w, y,  w,  -w, y, -w
      );
    };

    addSquareLoop(0.0);
    addSquareLoop(-0.45);
    addSquareLoop(-1.80);
    addSquareLoop(-2.60);

    const corners = [
      [-w, -w],
      [ w, -w],
      [ w,  w],
      [-w,  w],
    ];

    corners.forEach(([cx, cz]) => {
      points.push(cx, 0.0, cz, cx, -2.60, cz);
    });

    const tickDepths = [-0.25, -0.5, -1.0, -1.5, -2.0, -2.5];
    tickDepths.forEach((td) => {
      points.push(-w, td, w, -w + 0.08, td, w);
      points.push(w, td, w, w - 0.08, td, w);
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geom;
  }, []);

  const soilAggregates = useMemo(() => {
    const items = [];
    const seedRng = (s) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 28; i++) {
      const angle = (i * 2.39996) % (Math.PI * 2);
      const dist = 0.22 + seedRng(i * 1.7) * 0.95;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const s = 0.02 + seedRng(i * 3.1) * 0.035;
      const elevation = 0.035 + (1.0 - dist / 1.3) * 0.045;
      const shade = 0.15 + seedRng(i * 4.9) * 0.25;
      items.push({
        id: `agg-${i}`,
        pos: [x, elevation, z],
        scale: [s * 1.2, s * 0.7, s * 1.1],
        rot: [seedRng(i) * 0.5, angle, seedRng(i + 1) * 0.5],
        color: new THREE.Color('#332216').offsetHSL(0, 0, (shade - 0.2) * 0.2),
      });
    }
    return items;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Above-ground Ground Plane */}
      <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[groundShape]} />
        <meshStandardMaterial
          map={textures.map}
          normalMap={textures.normalMap}
          roughnessMap={textures.roughnessMap}
          color="#334230"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* 2. Topsoil Mound (Refined root collar bed) */}
      <mesh position={[0, 0.0225, 0]} receiveShadow>
        <cylinderGeometry args={[0.70, 1.15, 0.045, 36]} />
        <meshStandardMaterial
          map={textures.map}
          normalMap={textures.normalMap}
          roughnessMap={textures.roughnessMap}
          color={soilColor}
          roughness={surfaceRoughness}
          metalness={0.02}
        />
      </mesh>

      {/* Soil Aggregates / Micro-crumbs on the surface */}
      {soilAggregates.map((agg) => (
        <mesh
          key={agg.id}
          position={agg.pos}
          rotation={agg.rot}
          scale={agg.scale}
          receiveShadow
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial
            color={agg.color}
            roughness={0.98}
            metalness={0.01}
          />
        </mesh>
      ))}

      {/* 3. Subterranean Excavation Trench with Clean Botanical Strata Profile */}
      {showRoots && (
        <group>
          {/* Horizon A (Topsoil / Humus Horizon: 0.0 to -0.45m) */}
          <mesh receiveShadow>
            <primitive object={geomHorizonA} attach="geometry" />
            <meshStandardMaterial
              map={textures.map}
              normalMap={textures.normalMap}
              color={soilColor}
              roughness={surfaceRoughness}
              metalness={0.02}
            />
          </mesh>

          {/* Horizon B (Subsoil Sandy Loam Horizon: -0.45 to -1.80m) */}
          <mesh receiveShadow>
            <primitive object={geomHorizonB} attach="geometry" />
            <meshStandardMaterial
              map={textures.map}
              normalMap={textures.normalMap}
              color={subsoilColor}
              roughness={subsoilRoughness}
              metalness={0.02}
            />
          </mesh>

          {/* Horizon C (Substratum Clay & Bedrock: -1.80 to -2.60m) */}
          <mesh receiveShadow>
            <primitive object={geomHorizonC} attach="geometry" />
            <meshStandardMaterial
              map={textures.map}
              color={deepSubstratumColor}
              roughness={0.98}
              metalness={0.03}
            />
          </mesh>

          {/* Rhizosphere Drainage Bed Floor (-2.60m) */}
          <mesh position={[0, -2.60, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[3.8, 3.8]} />
            <meshStandardMaterial
              map={textures.map}
              color="#130c07"
              roughness={0.99}
              metalness={0.04}
            />
          </mesh>

          {/* Strata Division Boundaries & Scientific Metric Depth Indicators */}
          <lineSegments>
            <primitive object={strataLines} attach="geometry" />
            <lineBasicMaterial color="#7f6650" linewidth={1.5} />
          </lineSegments>
        </group>
      )}
    </group>
  );
}

/**
 * Procedural Fallback when texture is loading or unsupported
 */
function ProceduralSoilFallback({ showRoots = true, moisture = 50 }) {
  const moistureNorm = Math.min(1.0, Math.max(0.0, (moisture ?? 50) / 100));
  const soilColor = useMemo(() => {
    const dryColor = new THREE.Color('#4c3829');
    const wetColor = new THREE.Color('#19110a');
    return dryColor.lerp(wetColor, moistureNorm);
  }, [moistureNorm]);

  const subsoilColor = useMemo(() => {
    const drySub = new THREE.Color('#5b4432');
    const wetSub = new THREE.Color('#251911');
    return drySub.lerp(wetSub, moistureNorm);
  }, [moistureNorm]);

  const deepSubstratumColor = useMemo(() => {
    const dryDeep = new THREE.Color('#413022');
    const wetDeep = new THREE.Color('#1a110a');
    return dryDeep.lerp(wetDeep, moistureNorm);
  }, [moistureNorm]);

  const surfaceRoughness = 0.96 - moistureNorm * 0.22;
  const subsoilRoughness = 0.98 - moistureNorm * 0.12;

  const groundShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-50, -50);
    shape.lineTo(50, -50);
    shape.lineTo(50, 50);
    shape.lineTo(-50, 50);
    shape.closePath();

    if (showRoots) {
      const hole = new THREE.Path();
      hole.moveTo(-1.9, -1.9);
      hole.lineTo(1.9, -1.9);
      hole.lineTo(1.9, 1.9);
      hole.lineTo(-1.9, 1.9);
      hole.closePath();
      shape.holes.push(hole);
    }

    return shape;
  }, [showRoots]);

  const geomHorizonA = useMemo(() => createInwardWallGeometry(1.9, 0.0, -0.45), []);
  const geomHorizonB = useMemo(() => createInwardWallGeometry(1.9, -0.45, -1.80), []);
  const geomHorizonC = useMemo(() => createInwardWallGeometry(1.9, -1.80, -2.60), []);

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[groundShape]} />
        <meshStandardMaterial color="#273524" roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.0225, 0]} receiveShadow>
        <cylinderGeometry args={[0.70, 1.15, 0.045, 36]} />
        <meshStandardMaterial color={soilColor} roughness={surfaceRoughness} metalness={0.02} />
      </mesh>
      {showRoots && (
        <group>
          <mesh receiveShadow>
            <primitive object={geomHorizonA} attach="geometry" />
            <meshStandardMaterial color={soilColor} roughness={surfaceRoughness} metalness={0.02} />
          </mesh>
          <mesh receiveShadow>
            <primitive object={geomHorizonB} attach="geometry" />
            <meshStandardMaterial color={subsoilColor} roughness={subsoilRoughness} metalness={0.02} />
          </mesh>
          <mesh receiveShadow>
            <primitive object={geomHorizonC} attach="geometry" />
            <meshStandardMaterial color={deepSubstratumColor} roughness={0.98} metalness={0.03} />
          </mesh>
          <mesh position={[0, -2.60, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[3.8, 3.8]} />
            <meshStandardMaterial color="#130c07" roughness={0.99} metalness={0.04} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Procedural Soil Cross-Section with realistic botanical horizons and scientific rhizotron profile.
 * Loads high-resolution PBR mud/soil textures with smooth fallback.
 */
export function SoilCrossSection(props) {
  return (
    <Suspense fallback={<ProceduralSoilFallback {...props} />}>
      <TexturedSoilProfile {...props} />
    </Suspense>
  );
}
