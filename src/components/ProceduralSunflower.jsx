import React, { useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';
import { RealisticSunflower } from './RealisticSunflower.jsx';

/**
 * Creates an organic tapering tube geometry using variable-radius curve sampling.
 */
function createTaperedTube(points, startRadius, endRadius, radialSegments = 12) {
  const curve = new THREE.CatmullRomCurve3(points);
  const tubularSegments = Math.max(12, points.length * 5);
  const geom = new THREE.BufferGeometry();

  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const frames = curve.computeFrenetFrames(tubularSegments, false);

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    const p = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const radius = THREE.MathUtils.lerp(startRadius, endRadius, Math.pow(u, 0.92));

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments;
      const theta = v * Math.PI * 2;
      const sin = Math.sin(theta);
      const cos = -Math.cos(theta);

      const normal = new THREE.Vector3(
        cos * N.x + sin * B.x,
        cos * N.y + sin * B.y,
        cos * N.z + sin * B.z
      ).normalize();

      vertices.push(
        p.x + radius * normal.x,
        p.y + radius * normal.y,
        p.z + radius * normal.z
      );
      normals.push(normal.x, normal.y, normal.z);
      uvs.push(u, v);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setIndex(indices);
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  return geom;
}

/**
 * Broad cordate (heart-shaped) sunflower leaf with prominent venation fold
 * and natural undulating margin curvature.
 */
function createSunflowerLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); // Cordate sinus attachment notch
  shape.bezierCurveTo(0.18, 0.05, 0.44, 0.16, 0.42, 0.46); // Broad basal auricle
  shape.bezierCurveTo(0.39, 0.72, 0.24, 0.98, 0, 1.28); // Acuminate apex
  shape.bezierCurveTo(-0.24, 0.98, -0.39, 0.72, -0.42, 0.46);
  shape.bezierCurveTo(-0.44, 0.16, -0.18, 0.05, 0, 0);

  const geom = new THREE.ShapeGeometry(shape, 14);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Deep central midrib depression and longitudinal drooping arch
    const midribV = -Math.abs(x) * 0.36;
    const archCamber = Math.sin((y / 1.28) * Math.PI) * 0.09;
    const marginWaviness = Math.sin(x * 14.0) * 0.02 * (y / 1.28);
    pos.setZ(i, midribV + archCamber + marginWaviness);
  }
  geom.computeVertexNormals();
  return geom;
}

/**
 * Golden ray floret petal geometry for Helianthus capitulum head
 * with natural longitudinal furrow and subtle petal recurve.
 */
function createRayFloretPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.04, 0.08, 0.052, 0.24, 0.03, 0.42);
  shape.bezierCurveTo(0.018, 0.48, 0.006, 0.51, 0, 0.54); // Pointed ray tip
  shape.bezierCurveTo(-0.006, 0.51, -0.018, 0.48, -0.03, 0.42);
  shape.bezierCurveTo(-0.052, 0.24, -0.04, 0.08, 0, 0);

  const geom = new THREE.ShapeGeometry(shape, 8);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const curl = Math.pow(y / 0.54, 2.0) * 0.035;
    pos.setZ(i, curl);
  }
  geom.computeVertexNormals();
  return geom;
}

/**
 * Single Sunflower Leaf Component with stout channeled petiole, visible central midrib,
 * and natural wind fluttering.
 */
function SunflowerLeaf({
  position,
  rotation,
  scale,
  color,
  leafIndex,
  windIntensity = 0.35,
  partId,
  partName,
  isSelected = false,
  onSelectPart,
  maturity = 1.0,
  leafGeom,
}) {
  const leafRef = useRef();

  useFrame(({ clock }) => {
    if (!leafRef.current) return;
    const t = clock.getElapsedTime();
    const phase = leafIndex * 1.618;
    const freq = 1.6 + (leafIndex % 3) * 0.3;
    const windAmount = windIntensity * 0.12;

    const swayX = Math.sin(t * freq + phase) * windAmount;
    const swayZ = Math.cos(t * (freq * 0.85) + phase) * (windAmount * 0.65);

    leafRef.current.rotation.x = rotation[0] + swayX;
    leafRef.current.rotation.z = rotation[2] + swayZ;
  });

  // Channeled sturdy petiole stalk connecting cordate blade to central stem
  const petioleGeom = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.025, 0.12),
      new THREE.Vector3(0, 0.015, 0.24),
    ];
    return createTaperedTube(pts, 0.028, 0.016, 8);
  }, []);

  // Raised prominent central midrib running through the blade
  const midribGeom = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 0.015, 0.24),
      new THREE.Vector3(0, 0.05, 0.65),
      new THREE.Vector3(0, 0.04, 1.15),
      new THREE.Vector3(0, 0.02, 1.45),
    ];
    return createTaperedTube(pts, 0.016, 0.004, 6);
  }, []);

  return (
    <group
      ref={leafRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPart?.({
          id: partId,
          name: partName,
          type: 'leaf',
          species: 'Sunflower',
          maturity,
          parent: 'Main Upright Stem',
        });
      }}
    >
      {/* Thick Channeled Petiole */}
      <mesh geometry={petioleGeom} castShadow receiveShadow>
        <meshStandardMaterial
          color={isSelected ? '#64ffda' : '#457947'}
          emissive={isSelected ? '#64ffda' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0.0}
          roughness={0.62}
          metalness={0.02}
        />
      </mesh>

      {/* Broad Cordate Leaf Blade */}
      <mesh
        geometry={leafGeom}
        position={[0, 0.015, 0.24]}
        rotation={[-Math.PI / 2 + 0.45, 0, 0]}
        scale={[1.12, 1.12, 1.12]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={isSelected ? '#64ffda' : color}
          emissive={isSelected ? '#64ffda' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0.0}
          roughness={0.48}
          metalness={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Prominent Central Leaf Midrib Vein */}
      <mesh geometry={midribGeom} castShadow>
        <meshStandardMaterial
          color={isSelected ? '#64ffda' : '#689f38'}
          roughness={0.55}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
}

/**
 * Large Sunflower Apical Capitulum Head (Pseudanthium)
 * Multi-tiered involucral bracts, dual-layered golden ray petals, and central disk floret disc.
 */
function SunflowerCapitulumHead({
  position,
  rotation,
  overallProgress,
  fruitMaturity,
  senescenceProgress = 0,
  waterStress = 0,
  windIntensity = 0.35,
  partId,
  partName,
  isSelected = false,
  onSelectPart,
}) {
  const headRef = useRef();
  const rayPetalGeom = useMemo(() => createRayFloretPetalGeometry(), []);

  // Anthesis expansion: transitions from tightly closed green involucral bud to radiant golden ray head
  const isBudPhase = overallProgress < 0.48;
  const anthesisProgress = Math.min(1.0, Math.max(0.0, (overallProgress - 0.36) / 0.14));
  const openAngle = isBudPhase ? 0.32 * anthesisProgress : 0.88;

  const numRayPetalsOuter = 28; // Outer golden ray florets
  const numRayPetalsInner = 24; // Staggered inner golden ray florets for rich floral density
  const diskRadius = 0.22 + anthesisProgress * 0.16; // Broad central seed head

  // Head nodding angle as achenes fill with oil/weight and during senescence/drought
  const headNod = 0.24 + (overallProgress > 0.75 ? (overallProgress - 0.75) * 1.35 : 0) + (fruitMaturity * 0.42) + (senescenceProgress * 0.65) + (waterStress * 0.28);

  // During senescence, ray petals wither and shrivel
  const petalScale = Math.max(0.18, 1.25 * (1.0 - senescenceProgress * 0.65));
  const innerPetalScale = Math.max(0.15, 1.12 * (1.0 - senescenceProgress * 0.65));

  const rayColor =
    senescenceProgress > 0.35
      ? '#8d6e63'
      : senescenceProgress > 0.1
      ? '#d4af37'
      : '#ffca28';

  const innerRayColor =
    senescenceProgress > 0.35
      ? '#795548'
      : senescenceProgress > 0.1
      ? '#c5a028'
      : '#ffd54f';

  useFrame(({ clock }) => {
    if (!headRef.current) return;
    const t = clock.getElapsedTime();
    const breeze = Math.sin(t * 1.8) * (windIntensity * 0.05);
    headRef.current.rotation.z = rotation[2] + breeze;
  });

  return (
    <group
      ref={headRef}
      position={position}
      rotation={[headNod, rotation[1], rotation[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPart?.({
          id: partId,
          name: partName,
          type: 'flower',
          species: 'Sunflower',
          maturity: overallProgress,
          fruitMaturity,
          parent: 'Stem Apex',
        });
      }}
    >
      {/* Heavy peduncle neck node */}
      <mesh position={[0, -0.065, 0]}>
        <cylinderGeometry args={[0.048, 0.054, 0.13, 12]} />
        <meshStandardMaterial color="#437347" roughness={0.68} />
      </mesh>

      {/* Multi-tiered Involucral green phyllaries/bracts (protective cup supporting head) */}
      {Array.from({ length: 24 }).map((_, i) => {
        const theta = (i * Math.PI * 2) / 24;
        const tierOffset = (i % 2) * 0.03;
        return (
          <mesh
            key={`bract-${i}`}
            position={[
              Math.cos(theta) * (diskRadius * (0.94 + tierOffset)),
              -0.025 - tierOffset * 0.5,
              Math.sin(theta) * (diskRadius * (0.94 + tierOffset)),
            ]}
            rotation={[-0.42, theta, 0]}
          >
            <coneGeometry args={[0.034, 0.15, 5]} />
            <meshStandardMaterial color="#325a34" roughness={0.72} />
          </mesh>
        );
      })}

      {/* Central Disk Floret Receptacle (fibonacci florets and filling achenes) */}
      <mesh
        position={[0, 0.018, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[diskRadius, diskRadius * 0.92, 0.055, 36]} />
        <meshStandardMaterial
          color={
            isSelected
              ? '#64ffda'
              : senescenceProgress > 0.35
              ? '#1c120c' // Desiccated mature seed head
              : fruitMaturity > 0.85
              ? '#2d1c14' // Dark mature achene seed disk
              : fruitMaturity > 0.4
              ? '#4e342e' // Rich golden-brown active disk florets
              : '#f57f17' // Early vibrant yellow-orange disk anthesis
          }
          emissive={isSelected ? '#64ffda' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0.0}
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>

      {/* Outer Tier Golden Ray Petals */}
      {overallProgress >= 0.48 &&
        Array.from({ length: numRayPetalsOuter }).map((_, i) => {
          const theta = (i * Math.PI * 2) / numRayPetalsOuter;
          return (
            <mesh
              key={`ray-out-${i}`}
              geometry={rayPetalGeom}
              position={[
                Math.cos(theta) * (diskRadius * 0.94),
                0.022,
                Math.sin(theta) * (diskRadius * 0.94),
              ]}
              rotation={[openAngle, theta - Math.PI / 2, 0]}
              scale={[petalScale, petalScale, petalScale]}
              castShadow
            >
              <meshStandardMaterial
                color={isSelected ? '#64ffda' : rayColor}
                emissive={isSelected ? '#64ffda' : senescenceProgress > 0.3 ? '#000000' : '#f57f17'}
                emissiveIntensity={isSelected ? 0.4 : senescenceProgress > 0.3 ? 0.0 : 0.24}
                roughness={0.36}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}

      {/* Inner Tier Staggered Golden Ray Petals (gives authentic botanical depth) */}
      {overallProgress >= 0.52 &&
        Array.from({ length: numRayPetalsInner }).map((_, i) => {
          const theta = (i * Math.PI * 2) / numRayPetalsInner + Math.PI / numRayPetalsInner;
          return (
            <mesh
              key={`ray-in-${i}`}
              geometry={rayPetalGeom}
              position={[
                Math.cos(theta) * (diskRadius * 0.88),
                0.028,
                Math.sin(theta) * (diskRadius * 0.88),
              ]}
              rotation={[openAngle - 0.12, theta - Math.PI / 2, 0]}
              scale={[innerPetalScale, innerPetalScale, innerPetalScale]}
              castShadow
            >
              <meshStandardMaterial
                color={isSelected ? '#64ffda' : innerRayColor}
                emissive={isSelected ? '#64ffda' : senescenceProgress > 0.3 ? '#000000' : '#f57f17'}
                emissiveIntensity={isSelected ? 0.4 : senescenceProgress > 0.3 ? 0.0 : 0.22}
                roughness={0.38}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
    </group>
  );
}

/**
 * Botanical Procedural Sunflower Plant (Helianthus annuus)
 * Stately single-stem habit, broad cordate foliage with central midribs, and apical capitulum head.
 */
function ProceduralSunflowerCore({
  plantState,
  showRoots = true,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
}) {
  const {
    overallProgress = 0,
    stemHeight = 0,
    stemThickness = 0.06,
    rootDepth = 0.1,
    rootSpread = 0.1,
    fruitMaturity = 0,
    health = 100,
    waterStress = 0,
    lightStress = 0,
    senescenceProgress = 0,
  } = plantState;

  const canopyRef = useRef();

  useFrame(({ clock }) => {
    if (!canopyRef.current || stemHeight < 0.2) return;
    const t = clock.getElapsedTime();
    // Upright tall stem sways with natural mass inertia
    const stemFlex = Math.min(1.0, stemHeight * 0.25);
    const breezeZ = Math.sin(t * 1.3) * (windIntensity * 0.036 * stemFlex);
    const breezeX = Math.cos(t * 0.95) * (windIntensity * 0.02 * stemFlex);
    canopyRef.current.rotation.z = breezeZ;
    canopyRef.current.rotation.x = breezeX;
  });

  // Stately Sunflower Leaf Color with physiological stress & senescence chlorosis
  const leafColor = useMemo(() => {
    const vibrantGreen = new THREE.Color('#328a36');
    const droughtYellow = new THREE.Color('#afb42b');
    const senescentBrown = new THREE.Color('#5d4037');

    let c = vibrantGreen.clone();
    if (senescenceProgress > 0) {
      if (senescenceProgress < 0.45) {
        c.lerp(droughtYellow, senescenceProgress / 0.45);
      } else {
        c.lerp(droughtYellow, 1.0).lerp(senescentBrown, (senescenceProgress - 0.45) / 0.55);
      }
    } else if (waterStress > 0.25) {
      c.lerp(senescentBrown, (waterStress - 0.25) * 0.85);
    } else if (lightStress > 0.35 || health < 65) {
      c.lerp(droughtYellow, ((100 - health) / 100) * 0.62);
    }
    return c;
  }, [health, waterStress, lightStress, senescenceProgress]);

  const sunflowerLeafGeom = useMemo(() => createSunflowerLeafGeometry(), []);

  // 1. Upright Sturdy Main Column Stem (Tapered, predominantly vertical with subtle organic flex)
  const stemGeometry = useMemo(() => {
    if (stemHeight < 0.03) return null;
    const curvePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.012, stemHeight * 0.3, 0.006),
      new THREE.Vector3(-0.014, stemHeight * 0.65, -0.006),
      new THREE.Vector3(0.006, stemHeight * 0.9, 0.012),
      new THREE.Vector3(0, stemHeight, 0),
    ];
    const baseRadius = Math.max(0.034, stemThickness * 0.85);
    const tipRadius = Math.max(0.019, stemThickness * 0.38);
    return createTaperedTube(curvePoints, baseRadius, tipRadius, 14);
  }, [stemHeight, stemThickness]);

  // 2. Broad Alternating Cordate Leaves along the central column
  const leaves = useMemo(() => {
    if (overallProgress < 0.20 || stemHeight < 0.1) return [];

    const list = [];
    const maxLeafSlots = 16;

    for (let i = 0; i < maxLeafSlots; i++) {
      const threshold = 0.20 + (i / maxLeafSlots) * 0.58;
      if (overallProgress < threshold) continue;

      const leafAge = Math.min(1.0, (overallProgress - threshold) / 0.16);
      if (leafAge <= 0.02) continue;

      const frac = (i + 1) / (maxLeafSlots + 1);
      const nodeY = stemHeight * (0.12 + frac * 0.82);

      // Golden angle phyllotaxis (137.5 degrees)
      const angle = i * 2.39996;
      const fullScale = 0.88 * (1.15 - frac * 0.45);
      const scale = Math.max(0.12, fullScale * leafAge);

      const droop = 0.28 + waterStress * 0.52 + (1.0 - leafAge) * 0.24 + senescenceProgress * 0.62;
      const leafId = `sunflower-leaf-${i}`;

      list.push({
        id: leafId,
        name: `Cordate Leaf (Node ${i + 1})`,
        pos: [0, nodeY, 0],
        rot: [droop, angle, 0],
        scale: [scale, scale, scale],
        index: i,
        maturity: leafAge,
      });
    }

    return list;
  }, [overallProgress, stemHeight, waterStress, senescenceProgress]);

  const isStemSelected = selectedPart?.id === 'stem-sunflower-main';

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Deep Root System with prominent taproot anchoring */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={true}
      />

      {/* 2. Above-Ground Shoot Canopy */}
      <group ref={canopyRef} position={[0, 0, 0]}>
        {/* Seed emergence stage */}
        {overallProgress < 0.28 && (
          <group position={[0, -0.038 + Math.min(0.08, overallProgress * 0.28), 0]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.048, 16, 16]} scale={[1.4, 0.7, 0.9]} />
              <meshStandardMaterial color="#37474f" roughness={0.8} />
            </mesh>
            {overallProgress > 0.08 && (
              <mesh position={[0, 0.045, 0]} castShadow>
                <coneGeometry args={[0.024, 0.08, 10]} />
                <meshStandardMaterial color="#8bc34a" roughness={0.65} />
              </mesh>
            )}
          </group>
        )}

        {/* Upright Monopodial Column Stem */}
        {stemGeometry && (
          <mesh
            geometry={stemGeometry}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart?.({
                id: 'stem-sunflower-main',
                name: 'Main Lignified Stem',
                type: 'stem',
                species: 'Sunflower',
                parent: 'Root Crown',
              });
            }}
          >
            <meshStandardMaterial
              color={isStemSelected ? '#64ffda' : '#3a693c'}
              emissive={isStemSelected ? '#64ffda' : '#000000'}
              emissiveIntensity={isStemSelected ? 0.35 : 0.0}
              roughness={0.7}
              metalness={0.02}
            />
          </mesh>
        )}

        {/* Broad Alternating Cordate Foliage */}
        {leaves.map((leaf) => (
          <SunflowerLeaf
            key={leaf.id}
            partId={leaf.id}
            partName={leaf.name}
            position={leaf.pos}
            rotation={leaf.rot}
            scale={leaf.scale}
            color={leafColor}
            leafIndex={leaf.index}
            windIntensity={windIntensity}
            isSelected={selectedPart?.id === leaf.id}
            onSelectPart={onSelectPart}
            maturity={leaf.maturity}
            leafGeom={sunflowerLeafGeom}
          />
        ))}

        {/* Apical Capitulum Flower Head */}
        {overallProgress >= 0.35 && (
          <SunflowerCapitulumHead
            position={[0, stemHeight, 0]}
            rotation={[0, 0, 0]}
            overallProgress={overallProgress}
            fruitMaturity={fruitMaturity}
            senescenceProgress={senescenceProgress}
            waterStress={waterStress}
            windIntensity={windIntensity}
            partId="sunflower-flower-head"
            partName="Capitulum Pseudanthium (Flower Head)"
            isSelected={selectedPart?.id === 'sunflower-flower-head'}
            onSelectPart={onSelectPart}
          />
        )}
      </group>
    </group>
  );
}

/**
 * ProceduralSunflower: Transparent wrapper rendering photorealistic 3D sunflower asset
 * with smooth fallback to procedural sunflower geometry during load or headless test environments.
 */
export function ProceduralSunflower(props) {
  return (
    <Suspense fallback={<ProceduralSunflowerCore {...props} />}>
      <RealisticSunflower {...props} />
    </Suspense>
  );
}

export { ProceduralSunflowerCore, RealisticSunflower };

