import React, { useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';
import { RealisticTomatoPlant } from './RealisticTomatoPlant.jsx';

/**
 * Creates an organic tapering tube geometry using variable-radius curve sampling.
 */
function createTaperedTube(points, startRadius, endRadius, radialSegments = 10) {
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
    // Organic non-linear taper
    const radius = THREE.MathUtils.lerp(startRadius, endRadius, Math.pow(u, 0.9));

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
 * Creates a realistic tomato leaflet geometry with natural serration, acuminate tip,
 * and 3D surface curvature along lateral lobes.
 */
function createTomatoLeafletGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); // Petiolule base
  shape.bezierCurveTo(0.08, 0.05, 0.16, 0.14, 0.22, 0.26); // Lower basal lobe
  shape.lineTo(0.18, 0.31); // Serration notch
  shape.bezierCurveTo(0.26, 0.44, 0.27, 0.60, 0.19, 0.74); // Medial serrated lobe
  shape.lineTo(0.14, 0.77); // Medial notch
  shape.bezierCurveTo(0.16, 0.88, 0.11, 0.98, 0, 1.12); // Acuminate apex
  shape.bezierCurveTo(-0.11, 0.98, -0.16, 0.88, -0.14, 0.77);
  shape.lineTo(-0.19, 0.74);
  shape.bezierCurveTo(-0.27, 0.60, -0.26, 0.44, -0.18, 0.31);
  shape.lineTo(-0.22, 0.26);
  shape.bezierCurveTo(-0.16, 0.14, -0.08, 0.05, 0, 0);

  const geom = new THREE.ShapeGeometry(shape, 12);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // V-shaped longitudinal trough for the prominent central midrib + lateral margin camber
    const midribFold = -Math.abs(x) * 0.42;
    const archCamber = Math.sin((y / 1.12) * Math.PI) * 0.06;
    const ripple = Math.sin(y * 18.0) * Math.cos(x * 12.0) * 0.012;
    pos.setZ(i, midribFold + archCamber + ripple);
  }
  geom.computeVertexNormals();
  return geom;
}

/**
 * Single Tomato Leaflet Component with visible central midrib vein & lateral petiolule
 */
function TomatoLeaflet({ position, rotation, scale, color, leafletGeom, isSelected }) {
  // Cylindrical central midrib vein run along the leaflet length
  const midribGeom = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 0, 0.005),
      new THREE.Vector3(0, 0.4, 0.012),
      new THREE.Vector3(0, 0.8, 0.01),
      new THREE.Vector3(0, 1.1, 0.002),
    ];
    return createTaperedTube(pts, 0.014, 0.003, 6);
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 3D Leaflet Blade */}
      <mesh
        geometry={leafletGeom}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={isSelected ? '#64ffda' : color}
          emissive={isSelected ? '#64ffda' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0.0}
          roughness={0.42}
          metalness={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Prominent Central Midrib Vein */}
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
 * Recognizable Tomato Compound Leaf with organic wind response, rachis petiolules,
 * terminal leaflet, 2 pairs of lateral pinnae, and intercalary foliolules.
 */
function TomatoCompoundLeaf({
  position,
  rotation,
  scale,
  color,
  rachisPoints,
  leafletGeom,
  partId,
  partName,
  leafIndex,
  windIntensity = 0.35,
  isSelected = false,
  onSelectPart,
  maturity = 1.0,
}) {
  const leafRef = useRef();

  const rachisGeometry = useMemo(() => {
    return createTaperedTube(rachisPoints, 0.019, 0.006, 8);
  }, [rachisPoints]);

  // Wind animation frame: flutter leaflet angles and rachis tip
  useFrame(({ clock }) => {
    if (!leafRef.current) return;
    const t = clock.getElapsedTime();
    const phase = leafIndex * 1.618;
    const freq = 1.8 + (leafIndex % 3) * 0.35;
    const windAmount = windIntensity * 0.13;

    const swayX = Math.sin(t * freq + phase) * windAmount;
    const swayZ = Math.cos(t * (freq * 0.8) + phase) * (windAmount * 0.65);

    leafRef.current.rotation.x = rotation[0] + swayX;
    leafRef.current.rotation.z = rotation[2] + swayZ;
  });

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
          species: 'Tomato',
          maturity,
          parent: 'Main Stem Node',
        });
      }}
    >
      {/* Petiole / Rachis stem */}
      <mesh geometry={rachisGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={isSelected ? '#64ffda' : '#3f6c42'}
          emissive={isSelected ? '#64ffda' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0.0}
          roughness={0.62}
          metalness={0.02}
        />
      </mesh>

      {/* Terminal Apical Leaflet (Apex of compound leaf) */}
      <TomatoLeaflet
        position={[0, 0.025, 0.54]}
        rotation={[-Math.PI / 2 + 0.32, 0, 0]}
        scale={[0.33, 0.33, 0.33]}
        color={color}
        leafletGeom={leafletGeom}
        isSelected={isSelected}
      />

      {/* Upper Lateral Leaflet Pair */}
      <TomatoLeaflet
        position={[-0.085, 0.02, 0.39]}
        rotation={[-Math.PI / 2 + 0.42, -0.68, 0.32]}
        scale={[0.27, 0.27, 0.27]}
        color={color}
        leafletGeom={leafletGeom}
        isSelected={isSelected}
      />
      <TomatoLeaflet
        position={[0.085, 0.02, 0.39]}
        rotation={[-Math.PI / 2 + 0.42, 0.68, -0.32]}
        scale={[0.27, 0.27, 0.27]}
        color={color}
        leafletGeom={leafletGeom}
        isSelected={isSelected}
      />

      {/* Intercalary Mini-Foliolules */}
      <TomatoLeaflet
        position={[-0.055, 0.014, 0.29]}
        rotation={[-Math.PI / 2 + 0.52, -0.88, 0.22]}
        scale={[0.13, 0.13, 0.13]}
        color={color}
        leafletGeom={leafletGeom}
        isSelected={isSelected}
      />
      <TomatoLeaflet
        position={[0.055, 0.014, 0.29]}
        rotation={[-Math.PI / 2 + 0.52, 0.88, -0.22]}
        scale={[0.13, 0.13, 0.13]}
        color={color}
        leafletGeom={leafletGeom}
        isSelected={isSelected}
      />

      {/* Lower Lateral Leaflet Pair */}
      <TomatoLeaflet
        position={[-0.105, 0.015, 0.19]}
        rotation={[-Math.PI / 2 + 0.46, -0.82, 0.36]}
        scale={[0.24, 0.24, 0.24]}
        color={color}
        leafletGeom={leafletGeom}
        isSelected={isSelected}
      />
      <TomatoLeaflet
        position={[0.105, 0.015, 0.19]}
        rotation={[-Math.PI / 2 + 0.46, 0.82, -0.36]}
        scale={[0.24, 0.24, 0.24]}
        color={color}
        leafletGeom={leafletGeom}
        isSelected={isSelected}
      />
    </group>
  );
}

/**
 * Botanical Tomato Flower Blossom with star petals, staminal cone, and pedicel
 */
function TomatoFlowerBlossom({
  position,
  rotation,
  flowerIndex,
  windIntensity = 0.35,
  partId,
  partName,
  isSelected = false,
  onSelectPart,
  maturity = 1.0,
}) {
  const flowerRef = useRef();

  // Natural star petal with acuminate apex and slight longitudinal curl
  const petalGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.018, 0.02, 0.026, 0.055, 0, 0.105);
    shape.bezierCurveTo(-0.026, 0.055, -0.018, 0.02, 0, 0);

    const geom = new THREE.ShapeGeometry(shape, 6);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // Recurving petal tip
      const curl = Math.pow(y / 0.105, 2.0) * 0.025;
      pos.setZ(i, curl);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  useFrame(({ clock }) => {
    if (!flowerRef.current) return;
    const t = clock.getElapsedTime();
    const phase = flowerIndex * 2.1;
    const sway = Math.sin(t * 2.1 + phase) * (windIntensity * 0.075);
    flowerRef.current.rotation.z = rotation[2] + sway;
  });

  return (
    <group
      ref={flowerRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPart?.({
          id: partId,
          name: partName,
          type: 'flower',
          species: 'Tomato',
          maturity,
          parent: 'Inflorescence Cyme',
        });
      }}
    >
      {/* Articulated Pedicel stalk with abscission zone node */}
      <mesh position={[0, -0.035, 0]}>
        <cylinderGeometry args={[0.007, 0.009, 0.07, 8]} />
        <meshStandardMaterial color="#447348" roughness={0.65} />
      </mesh>

      {/* Calyx (5 lanceolate sepals enclosing the base) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const theta = (i * Math.PI * 2) / 5;
        return (
          <mesh
            key={`calyx-${i}`}
            position={[0, -0.002, 0]}
            rotation={[-0.32, theta, 0]}
          >
            <coneGeometry args={[0.009, 0.042, 5]} />
            <meshStandardMaterial color="#38633a" roughness={0.75} />
          </mesh>
        );
      })}

      {/* 5 Brilliant Stellate Yellow Petals */}
      {[0, 1, 2, 3, 4].map((i) => {
        const theta = (i * Math.PI * 2) / 5;
        return (
          <mesh
            key={`petal-${i}`}
            geometry={petalGeom}
            position={[0, 0.006, 0]}
            rotation={[0.38, theta, 0]}
            castShadow
          >
            <meshStandardMaterial
              color={isSelected ? '#64ffda' : '#ffea00'}
              emissive={isSelected ? '#64ffda' : '#f57f17'}
              emissiveIntensity={isSelected ? 0.4 : 0.26}
              roughness={0.38}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Central Anther Staminal Cone */}
      <mesh position={[0, 0.028, 0]}>
        <coneGeometry args={[0.013, 0.052, 10]} />
        <meshStandardMaterial
          color="#fbc02d"
          emissive="#f57f17"
          emissiveIntensity={0.15}
          roughness={0.32}
        />
      </mesh>

      {/* Stigma tip emerging from anther cone */}
      <mesh position={[0, 0.056, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.012, 6]} />
        <meshStandardMaterial color="#8bc34a" roughness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Botanical Oblate Tomato Fruit with curved pedicel, 5 calyx sepals, and organic ripening
 */
function BotanicalTomatoFruit({
  position,
  radius,
  color,
  fruitIndex,
  windIntensity = 0.35,
  partId,
  partName,
  isSelected = false,
  onSelectPart,
  maturity = 0.0,
}) {
  const fruitRef = useRef();

  useFrame(({ clock }) => {
    if (!fruitRef.current) return;
    const t = clock.getElapsedTime();
    const phase = fruitIndex * 1.8;
    const swing = Math.sin(t * 1.85 + phase) * (windIntensity * 0.055);
    fruitRef.current.rotation.x = swing;
  });

  return (
    <group
      ref={fruitRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPart?.({
          id: partId,
          name: partName,
          type: 'fruit',
          species: 'Tomato',
          maturity,
          size: radius * 2,
          parent: 'Fruiting Truss Cluster',
        });
      }}
    >
      {/* Curved Pedicel connecting fruit to truss branch */}
      <mesh position={[0, radius * 1.05, 0]} rotation={[0.22, 0, 0.05]}>
        <cylinderGeometry args={[0.01, 0.013, radius * 0.75, 8]} />
        <meshStandardMaterial color="#355c37" roughness={0.7} />
      </mesh>

      {/* Involute Calyx Sepals clinging to fruit shoulder */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * Math.PI * 2) / 5;
        return (
          <mesh
            key={`cal-${i}`}
            position={[
              Math.cos(angle) * radius * 0.38,
              radius * 0.94,
              Math.sin(angle) * radius * 0.38,
            ]}
            rotation={[0.55, angle, 0]}
          >
            <coneGeometry args={[radius * 0.15, radius * 0.52, 5]} />
            <meshStandardMaterial color="#2c502f" roughness={0.68} />
          </mesh>
        );
      })}

      {/* Oblate Tomato Berry with subtle shoulder ribs */}
      <mesh castShadow receiveShadow scale={[1.14, 0.94, 1.14]}>
        <sphereGeometry args={[radius, 32, 28]} />
        <meshStandardMaterial
          color={isSelected ? '#64ffda' : color}
          emissive={isSelected ? '#64ffda' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0.0}
          roughness={0.24}
          metalness={0.04}
          clearcoat={0.72}
          clearcoatRoughness={0.16}
        />
      </mesh>
    </group>
  );
}

/**
 * Main Botanical Procedural Tomato Plant with organic wind simulation & part inspection
 */
function ProceduralTomatoCore({
  plantState,
  showRoots = true,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
}) {
  const {
    overallProgress = 0,
    stemHeight = 0,
    stemThickness = 0.05,
    rootDepth = 0.1,
    rootSpread = 0.1,
    flowerCount = 0,
    fruitCount = 0,
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
    const stemFlex = Math.min(1.2, stemHeight * 0.32);
    const breeze = Math.sin(t * 1.5) * (windIntensity * 0.042 * stemFlex);
    canopyRef.current.rotation.z = breeze;
    canopyRef.current.rotation.x = Math.cos(t * 1.1) * (windIntensity * 0.024 * stemFlex);
  });

  // Foliage healthy vs stressed vs senescent color calculation with realistic chlorosis & browning
  const leafColor = useMemo(() => {
    const healthyGreen = new THREE.Color('#2d7a31');
    const droopYellow = new THREE.Color('#c0ca33');
    const dryBrown = new THREE.Color('#5d422d');

    let c = healthyGreen.clone();
    if (senescenceProgress > 0) {
      if (senescenceProgress < 0.45) {
        c.lerp(droopYellow, senescenceProgress / 0.45);
      } else {
        c.lerp(droopYellow, 1.0).lerp(dryBrown, (senescenceProgress - 0.45) / 0.55);
      }
    } else if (waterStress > 0.25) {
      c.lerp(dryBrown, (waterStress - 0.25) * 0.85);
    } else if (lightStress > 0.4 || health < 65) {
      c.lerp(droopYellow, ((100 - health) / 100) * 0.65);
    }
    return c;
  }, [health, waterStress, lightStress, senescenceProgress]);

  const leafletGeom = useMemo(() => createTomatoLeafletGeometry(), []);

  // 1. Main Tapered Sympodial Stem with natural organic curvature
  const stemGeometry = useMemo(() => {
    if (stemHeight < 0.03) return null;
    const curvePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.022, stemHeight * 0.25, -0.018),
      new THREE.Vector3(-0.028, stemHeight * 0.54, 0.022),
      new THREE.Vector3(0.018, stemHeight * 0.82, -0.012),
      new THREE.Vector3(0.006, stemHeight, 0.006),
    ];
    const baseRadius = Math.max(0.024, stemThickness * 0.78);
    const tipRadius = Math.max(0.009, stemThickness * 0.26);
    return createTaperedTube(curvePoints, baseRadius, tipRadius, 14);
  }, [stemHeight, stemThickness]);

  // 2. Lateral Sympodial Branches with continuous length growth from nodes
  const branches = useMemo(() => {
    if (overallProgress < 0.35 || stemHeight < 0.4) return [];

    const list = [];
    const maxBranchPool = 4;

    for (let i = 0; i < maxBranchPool; i++) {
      const branchThreshold = 0.35 + i * 0.07;
      if (overallProgress < branchThreshold) continue;

      const branchAge = Math.min(1.0, (overallProgress - branchThreshold) / 0.22);
      if (branchAge <= 0.02) continue;

      const nodeFrac = 0.32 + i * 0.16;
      const originY = stemHeight * nodeFrac;
      const angle = i * 2.39996 + 0.5;

      const maxBranchLen = 0.48 * (0.82 + (i % 2) * 0.28);
      const branchLen = maxBranchLen * branchAge;

      const endX = Math.cos(angle) * branchLen;
      const endZ = Math.sin(angle) * branchLen;
      const endY = originY + branchLen * 0.36;

      const pts = [
        new THREE.Vector3(0, originY, 0),
        new THREE.Vector3(endX * 0.42, originY + branchLen * 0.15, endZ * 0.42),
        new THREE.Vector3(endX, endY, endZ),
      ];

      const geom = createTaperedTube(pts, 0.024 * branchAge, 0.008, 8);
      const branchId = `branch-${i}`;

      list.push({
        id: branchId,
        geom,
        height: originY,
        length: branchLen,
        age: branchAge,
      });
    }
    return list;
  }, [overallProgress, stemHeight]);

  // 3. Compound Tomato Leaves with smooth unfolding, rachis curve & phyllotactic distribution
  const leaves = useMemo(() => {
    if (overallProgress < 0.20 || stemHeight < 0.08) return [];

    const nodes = [];
    const maxLeafSlots = 14;

    const baseRachisPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.035, 0.18),
      new THREE.Vector3(0, 0.045, 0.36),
      new THREE.Vector3(0, 0.025, 0.54),
    ];

    for (let i = 0; i < maxLeafSlots; i++) {
      const leafThreshold = 0.20 + (i / maxLeafSlots) * 0.55;
      if (overallProgress < leafThreshold) continue;

      const leafAge = Math.min(1.0, (overallProgress - leafThreshold) / 0.18);
      if (leafAge <= 0.02) continue;

      const frac = (i + 1) / (maxLeafSlots + 1);
      const nodeY = stemHeight * (0.12 + frac * 0.85);
      const angle = i * 2.39996;

      const fullScale = 0.68;
      const leafScale = Math.max(0.08, fullScale * leafAge);

      const droop = 0.24 + waterStress * 0.62 + (1.0 - leafAge) * 0.32 + senescenceProgress * 0.58;
      const leafId = `leaf-${i}`;

      nodes.push({
        id: leafId,
        name: `Compound Leaf (Node ${i + 1})`,
        position: [0, nodeY, 0],
        rotation: [droop, angle, 0],
        scale: [leafScale, leafScale, leafScale],
        rachisPoints: baseRachisPoints,
        leafIndex: i,
        maturity: leafAge,
      });
    }

    return nodes;
  }, [overallProgress, stemHeight, waterStress, senescenceProgress]);

  // 4. Inflorescence Flower Blossoms
  const flowers = useMemo(() => {
    if (flowerCount <= 0 || stemHeight < 0.5) return [];

    const list = [];
    const clusterY = stemHeight * 0.80;

    for (let i = 0; i < flowerCount; i++) {
      const angle = (i * (Math.PI * 2)) / flowerCount + 0.3;
      const radius = 0.17;
      const flId = `flower-${i}`;
      list.push({
        id: flId,
        name: `Flower Blossom ${i + 1}`,
        pos: [
          Math.cos(angle) * radius,
          clusterY + ((i % 3) - 1) * 0.04,
          Math.sin(angle) * radius,
        ],
        rot: [0.42, angle, 0],
        index: i,
        maturity: Math.min(1.0, 0.4 + (overallProgress - 0.35) * 4.0),
      });
    }
    return list;
  }, [flowerCount, stemHeight, overallProgress]);

  // 5. Tomato Fruits with continuous enlargement and ripening colors
  const fruits = useMemo(() => {
    if (fruitCount <= 0 || stemHeight < 0.55) return [];

    const list = [];
    const fruitTrussY = stemHeight * 0.65;
    const baseRadius = 0.044 + fruitMaturity * 0.096;

    const unripeGreen = new THREE.Color('#388e3c');
    const breakerAmber = new THREE.Color('#ffa726');
    const ripeRed = new THREE.Color('#c62828'); // Deep rich tomato crimson

    const fruitColor =
      fruitMaturity < 0.45
        ? unripeGreen.clone().lerp(breakerAmber, fruitMaturity / 0.45)
        : breakerAmber.clone().lerp(ripeRed, (fruitMaturity - 0.45) / 0.55);

    for (let i = 0; i < fruitCount; i++) {
      const angle = (i * (Math.PI * 2)) / fruitCount + 0.6;
      const dist = 0.19 + (i % 2) * 0.06;
      const frId = `fruit-${i}`;

      list.push({
        id: frId,
        name: `Tomato Fruit ${i + 1}`,
        pos: [
          Math.cos(angle) * dist,
          fruitTrussY - 0.07 * (i % 2),
          Math.sin(angle) * dist,
        ],
        radius: baseRadius * (0.88 + (i % 3) * 0.12),
        color: fruitColor,
        index: i,
        maturity: fruitMaturity,
      });
    }
    return list;
  }, [fruitCount, stemHeight, fruitMaturity]);

  const isStemSelected = selectedPart?.id === 'stem-main';

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Underground Root System */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* Canopy Group for Continuous Wind Sway */}
      <group ref={canopyRef} position={[0, 0, 0]}>
        {/* 2. Seed / Hypocotyl Arch */}
        {overallProgress < 0.28 && (
          <group position={[0, -0.038 + Math.min(0.07, overallProgress * 0.28), 0]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.042, 16, 16]} scale={[1.2, 0.75, 1.0]} />
              <meshStandardMaterial color="#6d4c41" roughness={0.85} />
            </mesh>
            {overallProgress > 0.07 && (
              <mesh position={[0, 0.038, 0]} castShadow>
                <coneGeometry args={[0.02, 0.07, 10]} />
                <meshStandardMaterial color="#7cb342" roughness={0.65} />
              </mesh>
            )}
          </group>
        )}

        {/* 3. Main Tapered Sympodial Stem */}
        {stemGeometry && (
          <mesh
            geometry={stemGeometry}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart?.({
                id: 'stem-main',
                name: 'Main Tapered Stem',
                type: 'stem',
                species: 'Tomato',
                parent: 'Root Crown',
              });
            }}
          >
            <meshStandardMaterial
              color={isStemSelected ? '#64ffda' : '#3e6f42'}
              emissive={isStemSelected ? '#64ffda' : '#000000'}
              emissiveIntensity={isStemSelected ? 0.35 : 0.0}
              roughness={0.65}
              metalness={0.03}
            />
          </mesh>
        )}

        {/* 4. Lateral Secondary Branches */}
        {branches.map((b) => {
          const isSelected = selectedPart?.id === b.id;
          return (
            <mesh
              key={b.id}
              geometry={b.geom}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart?.({
                  id: b.id,
                  name: 'Sympodial Lateral Branch',
                  type: 'branch',
                  species: 'Tomato',
                  height: b.height,
                  length: b.length,
                  parent: 'Main Stem Node',
                });
              }}
            >
              <meshStandardMaterial
                color={isSelected ? '#64ffda' : '#3e6f42'}
                emissive={isSelected ? '#64ffda' : '#000000'}
                emissiveIntensity={isSelected ? 0.35 : 0.0}
                roughness={0.68}
                metalness={0.03}
              />
            </mesh>
          );
        })}

        {/* 5. Compound Tomato Leaves */}
        {leaves.map((leaf) => (
          <TomatoCompoundLeaf
            key={leaf.id}
            partId={leaf.id}
            partName={leaf.name}
            position={leaf.position}
            rotation={leaf.rotation}
            scale={leaf.scale}
            color={leafColor}
            rachisPoints={leaf.rachisPoints}
            leafletGeom={leafletGeom}
            leafIndex={leaf.leafIndex}
            windIntensity={windIntensity}
            isSelected={selectedPart?.id === leaf.id}
            onSelectPart={onSelectPart}
            maturity={leaf.maturity}
          />
        ))}

        {/* 6. Tomato Inflorescence Star Blossoms */}
        {flowers.map((fl) => (
          <TomatoFlowerBlossom
            key={fl.id}
            partId={fl.id}
            partName={fl.name}
            position={fl.pos}
            rotation={fl.rot}
            flowerIndex={fl.index}
            windIntensity={windIntensity}
            isSelected={selectedPart?.id === fl.id}
            onSelectPart={onSelectPart}
            maturity={fl.maturity}
          />
        ))}

        {/* 7. Tomato Fruits */}
        {fruits.map((fr) => (
          <BotanicalTomatoFruit
            key={fr.id}
            partId={fr.id}
            partName={fr.name}
            position={fr.pos}
            radius={fr.radius}
            color={fr.color}
            fruitIndex={fr.index}
            windIntensity={windIntensity}
            isSelected={selectedPart?.id === fr.id}
            onSelectPart={onSelectPart}
            maturity={fr.maturity}
          />
        ))}
      </group>
    </group>
  );
}

/**
 * ProceduralPlant: Transparent wrapper rendering photorealistic 3D crop asset
 * with smooth fallback to procedural tomato geometry during load or headless test environments.
 */
export function ProceduralPlant(props) {
  return (
    <Suspense fallback={<ProceduralTomatoCore {...props} />}>
      <RealisticTomatoPlant {...props} />
    </Suspense>
  );
}

export { ProceduralTomatoCore, RealisticTomatoPlant };

