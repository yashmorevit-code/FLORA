import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Photogrammetric Root Crown Component (Poly Haven CC0)
 * Provides dense, realistic root bark texture and flare geometry at the root crown transition.
 */
function PhotogrammetricRootCrown({ rootDepth, health, isTaprootSelected, isSunflower }) {
  const { scene } = useGLTF('/assets/plants/roots/root_cluster_01.gltf');
  const clone = useMemo(() => {
    if (!scene) return null;
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          if (isTaprootSelected) {
            child.material.color = new THREE.Color('#64ffda');
            child.material.emissive = new THREE.Color('#64ffda');
            child.material.emissiveIntensity = 0.35;
          }
        }
      }
    });
    return c;
  }, [scene, isTaprootSelected]);

  if (!clone || rootDepth < 0.16) return null;

  // Scale gracefully with depth
  const s = Math.min(0.14, 0.04 + rootDepth * 0.06) * (isSunflower ? 1.25 : 1.0);

  return (
    <primitive
      object={clone}
      position={[0, -0.015, 0]}
      rotation={[-Math.PI, 0, 0]}
      scale={[s, s * 0.85, s]}
    />
  );
}

/**
 * Creates an organic tapering root tube geometry using variable-radius curve sampling.
 */
function createTaperedRootGeometry(points, startRadius, endRadius, radialSegments = 8) {
  const curve = new THREE.CatmullRomCurve3(points);
  const tubularSegments = Math.max(10, points.length * 5);
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
    // Natural non-linear tapering with organic root tip swelling/slenderness
    const radius = THREE.MathUtils.lerp(startRadius, endRadius, Math.pow(u, 0.85));

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
 * Botanical Procedural Root System with continuous tip elongation & interactive selection
 * Supports distinct root architectures for Tomato (diffuse lateral branching) and Sunflower (anchoring deep taproot).
 */
export function ProceduralRoots({
  rootDepth = 0.1,
  rootSpread = 0.1,
  visible = true,
  health = 100,
  selectedPart = null,
  onSelectPart = null,
  isSunflower = false,
}) {
  // Realistic root coloration: woody suberized collar transitioning to ivory young absorbing tips
  const rootColor = useMemo(() => {
    const healthNorm = Math.min(1.0, Math.max(0.0, health / 100));
    const healthyC = new THREE.Color(isSunflower ? '#f0ede4' : '#f5f2e8');
    const stressedC = new THREE.Color('#543d2c');
    return stressedC.lerp(healthyC, healthNorm);
  }, [health, isSunflower]);

  // Woody root collar coloration at the soil line (crown transition)
  const collarColor = useMemo(() => {
    return new THREE.Color(isSunflower ? '#735841' : '#694e37');
  }, [isSunflower]);

  // Highlight color for selection
  const highlightColor = useMemo(() => new THREE.Color('#64ffda'), []);

  // 1. Root Collar transition ring at Y = 0 (attaches smoothly to stem base)
  const collarGeometry = useMemo(() => {
    if (rootDepth < 0.04) return null;
    const pts = [
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(0, -0.015, 0),
      new THREE.Vector3(0.005, -0.05, 0.003),
    ];
    const topRadius = isSunflower ? 0.065 : 0.048;
    const botRadius = isSunflower ? 0.045 : 0.035;
    return createTaperedRootGeometry(pts, topRadius, botRadius, 10);
  }, [rootDepth, isSunflower]);

  // 2. Primary Taproot (continuously extends downwards with natural geotropic meandering)
  const taprootGeometry = useMemo(() => {
    if (rootDepth < 0.03) return null;
    const currentDepth = Math.max(0.04, rootDepth);

    // Geotropic path with subtle sinuosity as it maneuvers soil particles
    const points = isSunflower
      ? [
          new THREE.Vector3(0, -0.03, 0),
          new THREE.Vector3(0.012, -currentDepth * 0.22, 0.008),
          new THREE.Vector3(-0.015, -currentDepth * 0.45, -0.01),
          new THREE.Vector3(0.018, -currentDepth * 0.72, 0.009),
          new THREE.Vector3(-0.008, -currentDepth * 0.92, -0.004),
          new THREE.Vector3(0.002, -currentDepth, 0.001),
        ]
      : [
          new THREE.Vector3(0, -0.03, 0),
          new THREE.Vector3(0.016, -currentDepth * 0.2, 0.012),
          new THREE.Vector3(-0.022, -currentDepth * 0.44, -0.016),
          new THREE.Vector3(0.026, -currentDepth * 0.7, 0.014),
          new THREE.Vector3(-0.012, -currentDepth * 0.9, -0.006),
          new THREE.Vector3(0.004, -currentDepth, 0.002),
        ];

    const baseRadius = isSunflower
      ? Math.min(0.062, 0.024 + currentDepth * 0.016) // Thicker strong anchoring taproot
      : Math.min(0.042, 0.015 + currentDepth * 0.012);
    const tipRadius = isSunflower ? 0.005 : 0.0035;
    return createTaperedRootGeometry(points, baseRadius, tipRadius, 8);
  }, [rootDepth, isSunflower]);

  // 3. Lateral Roots with continuous elongation & smooth curvature
  const { lateralBranches, tertiaryRootlets } = useMemo(() => {
    if (rootDepth < 0.12 || rootSpread < 0.04) {
      return { lateralBranches: [], tertiaryRootlets: [] };
    }

    const laterals = [];
    const rootlets = [];
    const maxBranchSites = isSunflower ? 16 : 22; // Sunflower concentrates laterals on upper anchoring crown

    for (let i = 0; i < maxBranchSites; i++) {
      const emergenceDepth = 0.12 + (i / maxBranchSites) * (isSunflower ? 1.4 : 1.7);
      if (rootDepth < emergenceDepth) continue;

      const branchMaturity = Math.min(1.0, (rootDepth - emergenceDepth) / 0.38);
      if (branchMaturity <= 0.01) continue;

      const frac = (i + 1) / (maxBranchSites + 1);
      const originY = -Math.max(0.04, emergenceDepth * frac * 0.88);
      const angle = (i * 2.39996) % (Math.PI * 2);

      // Radial spread and downwards curvature
      const targetSpread =
        rootSpread * (isSunflower ? 1.2 - frac * 0.6 : 1.1 - frac * 0.45) * (0.65 + (i % 4) * 0.14) * branchMaturity;
      const endX = Math.cos(angle) * targetSpread;
      const endZ = Math.sin(angle) * targetSpread;
      const endY = originY - (0.14 + (i % 3) * 0.09) * branchMaturity;

      // Natural S-curve points simulating resistance through soil horizons
      const mid1X = endX * 0.35 + Math.sin(angle * 1.5) * 0.035 * branchMaturity;
      const mid1Z = endZ * 0.35 + Math.cos(angle * 1.5) * 0.035 * branchMaturity;
      const mid1Y = originY - 0.03 * branchMaturity;

      const mid2X = endX * 0.72;
      const mid2Z = endZ * 0.72;
      const mid2Y = originY - (endY - originY) * 0.58;

      const branchPoints = [
        new THREE.Vector3(0, originY, 0),
        new THREE.Vector3(mid1X, mid1Y, mid1Z),
        new THREE.Vector3(mid2X, mid2Y, mid2Z),
        new THREE.Vector3(endX, endY, endZ),
      ];

      const startR = Math.max(0.008, (isSunflower ? 0.018 : 0.015) * (1.0 - frac * 0.38) * branchMaturity);
      const endR = 0.003;
      const geom = createTaperedRootGeometry(branchPoints, startR, endR, 6);

      const branchId = `root-lateral-${i}`;
      laterals.push({
        id: branchId,
        geom,
        depth: -endY,
        maturity: branchMaturity,
      });

      // Fine tertiary absorbing rootlets on mature branch roots
      if (branchMaturity > 0.72 && i % 2 === 0) {
        const rootletAngle = angle + (i % 2 === 0 ? 0.65 : -0.65);
        const rSpread = 0.085 * (rootSpread / 1.5) * ((branchMaturity - 0.72) / 0.28);
        const rEndX = mid2X + Math.cos(rootletAngle) * rSpread;
        const rEndZ = mid2Z + Math.sin(rootletAngle) * rSpread;
        const rEndY = mid2Y - 0.055;

        const subPoints = [
          new THREE.Vector3(mid2X, mid2Y, mid2Z),
          new THREE.Vector3(
            mid2X + (rEndX - mid2X) * 0.45,
            mid2Y - 0.02,
            mid2Z + (rEndZ - mid2Z) * 0.45
          ),
          new THREE.Vector3(rEndX, rEndY, rEndZ),
        ];

        const rGeom = createTaperedRootGeometry(subPoints, 0.004, 0.0016, 5);
        rootlets.push({
          id: `rootlet-${i}`,
          geom: rGeom,
          depth: -rEndY,
        });
      }
    }

    return { lateralBranches: laterals, tertiaryRootlets: rootlets };
  }, [rootDepth, rootSpread, isSunflower]);

  if (!visible || rootDepth < 0.03) return null;

  const isTaprootSelected = selectedPart?.id === 'root-taproot';

  return (
    <group position={[0, 0, 0]}>
      {/* Root Collar Crown */}
      {collarGeometry && (
        <mesh geometry={collarGeometry} receiveShadow>
          <meshStandardMaterial
            color={isTaprootSelected ? highlightColor : collarColor}
            roughness={0.88}
            metalness={0.02}
          />
        </mesh>
      )}

      {/* Photorealistic 3D Root Crown Flare (Poly Haven CC0) */}
      <Suspense fallback={null}>
        <PhotogrammetricRootCrown
          rootDepth={rootDepth}
          health={health}
          isTaprootSelected={isTaprootSelected}
          isSunflower={isSunflower}
        />
      </Suspense>

      {/* Primary Taproot */}
      {taprootGeometry && (
        <mesh
          geometry={taprootGeometry}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart?.({
              id: 'root-taproot',
              name: isSunflower ? 'Primary Anchoring Taproot' : 'Primary Taproot',
              type: 'root',
              order: 'taproot',
              depth: rootDepth,
              species: isSunflower ? 'Sunflower' : 'Tomato',
            });
          }}
        >
          <meshStandardMaterial
            color={isTaprootSelected ? highlightColor : rootColor}
            emissive={isTaprootSelected ? '#64ffda' : '#000000'}
            emissiveIntensity={isTaprootSelected ? 0.4 : 0.0}
            roughness={0.72}
            metalness={0.02}
          />
        </mesh>
      )}

      {/* Lateral Branch Roots */}
      {lateralBranches.map((lat) => {
        const isSelected = selectedPart?.id === lat.id;
        return (
          <mesh
            key={lat.id}
            geometry={lat.geom}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart?.({
                id: lat.id,
                name: 'Lateral Secondary Root',
                type: 'root',
                order: 'lateral',
                depth: lat.depth,
                parent: 'Primary Taproot',
              });
            }}
          >
            <meshStandardMaterial
              color={isSelected ? highlightColor : rootColor}
              emissive={isSelected ? '#64ffda' : '#000000'}
              emissiveIntensity={isSelected ? 0.4 : 0.0}
              roughness={0.78}
              metalness={0.02}
            />
          </mesh>
        );
      })}

      {/* Tertiary Fine Absorbing Rootlets */}
      {tertiaryRootlets.map((r) => {
        const isSelected = selectedPart?.id === r.id;
        return (
          <mesh
            key={r.id}
            geometry={r.geom}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart?.({
                id: r.id,
                name: 'Tertiary Absorbing Rootlet',
                type: 'root',
                order: 'tertiary',
                depth: r.depth,
                parent: 'Lateral Branch',
              });
            }}
          >
            <meshStandardMaterial
              color={isSelected ? highlightColor : rootColor}
              emissive={isSelected ? '#64ffda' : '#000000'}
              emissiveIntensity={isSelected ? 0.4 : 0.0}
              roughness={0.82}
              metalness={0.01}
            />
          </mesh>
        );
      })}
    </group>
  );
}
