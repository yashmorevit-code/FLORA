import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

useGLTF.preload('/assets/plants/strawberry/strawberry_plant.glb');
useGLTF.preload('/assets/plants/strawberry/strawberry_fruit.glb');
useGLTF.preload('/assets/plants/strawberry/single_blossom.glb');

/**
 * Realistic Strawberry Plant Model (Fragaria × ananassa)
 * Integrates authentic botanical strawberry rosette model with creeping petioles,
 * characteristic photoreal serrated trifoliate foliage, 5-petaled white flowers,
 * and photorealistic aggregate strawberry fruits with detailed calyx and seed-like achenes.
 */
export function RealisticStrawberryPlant({
  plantState,
  showRoots = true,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
}) {
  const {
    overallProgress = 0,
    stemHeight = 0.22,
    rootDepth = 0.1,
    rootSpread = 0.1,
    fruitMaturity = 0,
    health = 100,
    waterStress = 0,
    lightStress = 0,
    senescenceProgress = 0,
    isTerminal = false,
  } = plantState;

  const canopyRef = useRef();
  const foliageMaterialsRef = useRef({ leaves: null, stems: null });
  const fruitMaterialsRef = useRef([]);

  const { scene: foliageScene } = useGLTF('/assets/plants/strawberry/strawberry_plant.glb');
  const { scene: fruitScene } = useGLTF('/assets/plants/strawberry/strawberry_fruit.glb');
  const { scene: flowerScene } = useGLTF('/assets/plants/strawberry/single_blossom.glb');

  // Emergence factor: canopy scale starts at 0 for progress < 0.06, emerges smoothly
  const emergenceFactor = Math.min(1.0, Math.max(0.0, (overallProgress - 0.06) / 0.10));

  // Dynamic growth multiplier
  const growthMult = useMemo(() => {
    if (emergenceFactor <= 0) return 0.0001;
    const base = Math.min(1.0, Math.max(0.08, overallProgress * 1.05));
    return base * emergenceFactor;
  }, [overallProgress, emergenceFactor]);

  // Scale factors for spreading rosette habit
  const scaleX = 0.00160 * growthMult;
  const scaleY = 0.00095 * growthMult;
  const scaleZ = 0.00155 * growthMult;

  // Foliar tint responding to health, water stress, and senescence
  const foliarTint = useMemo(() => {
    const healthy = new THREE.Color('#ffffff');
    const chlorotic = new THREE.Color('#d4e157');
    const necrotic = new THREE.Color('#8d6e63');

    let c = healthy.clone();
    if (senescenceProgress > 0) {
      c.lerp(chlorotic, Math.min(1, senescenceProgress * 1.5));
      if (senescenceProgress > 0.45) {
        c.lerp(necrotic, (senescenceProgress - 0.45) * 1.8);
      }
    } else if (waterStress > 0.3) {
      c.lerp(necrotic, (waterStress - 0.3) * 0.7);
    } else if (health < 65) {
      c.lerp(chlorotic, ((100 - health) / 100) * 0.5);
    }
    return c;
  }, [health, waterStress, senescenceProgress]);

  // Crown stem color
  const stemColor = useMemo(() => {
    const healthyStem = new THREE.Color('#388e3c');
    const dryStem = new THREE.Color('#6d4c41');
    return senescenceProgress > 0.3
      ? healthyStem.clone().lerp(dryStem, (senescenceProgress - 0.3) * 1.4)
      : healthyStem;
  }, [senescenceProgress]);

  // Berry ripening progression
  const berryColor = useMemo(() => {
    const paleCream = new THREE.Color('#dce775');
    const blushPink = new THREE.Color('#f48fb1');
    const scarletRipe = new THREE.Color('#c62828');

    if (fruitMaturity < 0.35) {
      return paleCream.clone().lerp(blushPink, fruitMaturity / 0.35);
    } else {
      return blushPink.clone().lerp(scarletRipe, (fruitMaturity - 0.35) / 0.65);
    }
  }, [fruitMaturity]);

  // Clone foliage scene ONCE
  const clonedFoliageScene = useMemo(() => {
    const clone = foliageScene.clone(true);
    clone.position.set(-37.46, 45.37, -27.38);

    clone.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const isLeaves = child.name === 'leaves' || child.material?.name === 'StrawberryLeaves';
        if (isLeaves) {
          if (child.material) {
            child.material = child.material.clone();
            child.material.side = THREE.DoubleSide;
            child.material.alphaTest = 0.50;
            child.material.depthWrite = true;
            child.material.roughness = 0.38;
            child.material.metalness = 0.05;
            foliageMaterialsRef.current.leaves = child.material;
          }
        } else {
          child.material = new THREE.MeshStandardMaterial({
            name: 'StrawberryCrownStems',
            color: stemColor,
            roughness: 0.55,
            metalness: 0.05,
            side: THREE.DoubleSide,
          });
          foliageMaterialsRef.current.stems = child.material;
        }
      }
    });
    return clone;
  }, [foliageScene]);

  // Clone fruit scene ONCE
  const clonedFruit = useMemo(() => {
    const clone = fruitScene.clone(true);
    clone.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.28;
          child.material.metalness = 0.05;
          fruitMaterialsRef.current.push(child.material);
        }
      }
    });
    return clone;
  }, [fruitScene]);

  // Clone single blossom model ONCE
  const clonedBlossom = useMemo(() => {
    const clone = flowerScene.clone(true);
    clone.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.side = THREE.DoubleSide;
          child.material.alphaTest = 0.70;
          child.material.depthWrite = true;
        }
      }
    });
    return clone;
  }, [flowerScene]);

  // Direct material property updates without cloning
  useEffect(() => {
    const isSelectedCrown = selectedPart?.type === 'stem' || selectedPart?.id?.includes('crown');
    const isSelectedLeaf = selectedPart?.type === 'leaf' || selectedPart?.id?.includes('leaf') || selectedPart?.id?.includes('trifoliate');

    if (foliageMaterialsRef.current.leaves) {
      foliageMaterialsRef.current.leaves.color.copy(foliarTint);
      foliageMaterialsRef.current.leaves.emissive.set(isSelectedLeaf ? '#64ffda' : '#000000');
      foliageMaterialsRef.current.leaves.emissiveIntensity = isSelectedLeaf ? 0.35 : 0.0;
    }

    if (foliageMaterialsRef.current.stems) {
      foliageMaterialsRef.current.stems.color.copy(stemColor);
      foliageMaterialsRef.current.stems.emissive.set(isSelectedCrown ? '#64ffda' : '#000000');
      foliageMaterialsRef.current.stems.emissiveIntensity = isSelectedCrown ? 0.35 : 0.0;
    }

    const isSelectedFruit = selectedPart?.type === 'fruit' || selectedPart?.id?.includes('berry') || selectedPart?.id?.includes('strawb');
    fruitMaterialsRef.current.forEach(mat => {
      mat.color.copy(berryColor);
      mat.emissive.set(isSelectedFruit ? '#64ffda' : '#000000');
      mat.emissiveIntensity = isSelectedFruit ? 0.35 : 0.0;
    });
  }, [foliarTint, stemColor, berryColor, selectedPart]);

  // Gentle wind sway
  useFrame(({ clock }) => {
    if (!canopyRef.current || emergenceFactor <= 0.05) return;
    const t = clock.getElapsedTime();
    canopyRef.current.rotation.z = Math.sin(t * 1.5) * (windIntensity * 0.015);
    canopyRef.current.rotation.x = Math.cos(t * 1.2) * (windIntensity * 0.012);
  });

  // Flower blossom positions emerging proportionally
  const flowerPositions = useMemo(() => [
    { pos: [0.08 * growthMult, 0.22 * growthMult, 0.07 * growthMult], rot: [-0.2, 0.4, 0.1], scale: 0.048 },
    { pos: [-0.07 * growthMult, 0.23 * growthMult, 0.06 * growthMult], rot: [0.3, -0.5, -0.2], scale: 0.045 },
    { pos: [0.04 * growthMult, 0.24 * growthMult, -0.08 * growthMult], rot: [-0.4, 0.2, 0.3], scale: 0.050 },
    { pos: [-0.06 * growthMult, 0.20 * growthMult, -0.07 * growthMult], rot: [0.2, -0.3, -0.4], scale: 0.044 },
  ], [growthMult]);

  // Stalk attachment points
  const stalkAttachmentPoints = useMemo(() => [
    { stalk: [163.1, 120.0, 45.7], crownOrigin: [40.0, 52.0, 15.0], rot: [0.22, 0.15, -0.35], scale: 0.48 },
    { stalk: [52.9, 138.0, 196.0], crownOrigin: [15.0, 52.0, 45.0], rot: [0.35, -0.20, 0.15], scale: 0.52 },
    { stalk: [-72.2, 145.0, 203.2], crownOrigin: [-20.0, 52.0, 45.0], rot: [0.30, 0.25, 0.25], scale: 0.50 },
    { stalk: [-106.5, 130.0, 51.0], crownOrigin: [-35.0, 52.0, 10.0], rot: [0.15, 0.35, 0.30], scale: 0.46 },
    { stalk: [-71.8, 142.0, -220.0], crownOrigin: [-20.0, 52.0, -45.0], rot: [-0.30, -0.25, 0.15], scale: 0.51 },
    { stalk: [77.2, 135.0, -178.5], crownOrigin: [25.0, 52.0, -40.0], rot: [-0.28, 0.30, -0.20], scale: 0.49 },
  ], []);

  const showFlowers = overallProgress >= 0.25 && overallProgress < 0.65 && !isTerminal;
  const flowerGrowthScale = Math.min(1.0, Math.max(0.1, (overallProgress - 0.25) / 0.12));

  const showBerries = overallProgress >= 0.40 && !isTerminal;
  const berryGrowthScale = Math.min(1.0, Math.max(0.15, (overallProgress - 0.40) / 0.30));

  // Attached berries
  const attachedBerries = useMemo(() => {
    return stalkAttachmentPoints.map((b, idx) => {
      const stalkX = b.stalk[0] * scaleX;
      const stalkY = b.stalk[1] * scaleY;
      const stalkZ = b.stalk[2] * scaleZ;

      const crownX = b.crownOrigin[0] * scaleX;
      const crownY = b.crownOrigin[1] * scaleY;
      const crownZ = b.crownOrigin[2] * scaleZ;

      const s = b.scale * berryGrowthScale;
      const attachOffsetY = 0.044 * s;
      const fruitY = Math.max(0.035, stalkY - attachOffsetY);
      const fruitPos = [stalkX, fruitY, stalkZ];

      const p0 = new THREE.Vector3(crownX, crownY, crownZ);
      const p2 = new THREE.Vector3(stalkX, fruitY + attachOffsetY, stalkZ);
      const p1 = new THREE.Vector3(
        crownX * 0.35 + stalkX * 0.65,
        Math.max(crownY, fruitY + attachOffsetY) + 0.014 * growthMult,
        crownZ * 0.35 + stalkZ * 0.65
      );
      const pedicelCurve = new THREE.QuadraticBezierCurve3(p0, p1, p2);

      return {
        id: idx,
        fruitPos,
        pedicelCurve,
        pedicelRadius: 0.0018 * growthMult,
        rot: b.rot,
        scale: s,
      };
    });
  }, [stalkAttachmentPoints, scaleX, scaleY, scaleZ, berryGrowthScale, growthMult]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subsoil Adventitious Root Crown System */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* 2. Above-Ground 3D Strawberry Rosette Canopy */}
      {emergenceFactor > 0.01 && (
        <group ref={canopyRef} position={[0, 0.035, 0]}>
          <group scale={[scaleX, scaleY, scaleZ]}>
            <primitive
              object={clonedFoliageScene}
              onClick={(e) => {
                e.stopPropagation();
                const clickedMesh = e.object;
                const name = clickedMesh?.name?.toLowerCase() || '';
                if (name.includes('leaf') || name.includes('leaves')) {
                  onSelectPart?.({
                    id: 'leaf-strawberry-trifoliate',
                    name: 'Serrated Trifoliate Leaflet Cluster',
                    type: 'leaf',
                    species: 'Strawberry',
                    maturity: overallProgress,
                    parent: 'Crown Petiole',
                  });
                } else {
                  onSelectPart?.({
                    id: 'stem-strawberry-crown',
                    name: 'Basal Perennial Crown & Runner Node',
                    type: 'stem',
                    species: 'Strawberry',
                    parent: 'Root Collar',
                  });
                }
              }}
            />
          </group>

          {/* 5-Petaled White Blossoms */}
          {showFlowers && flowerPositions.map((fl, idx) => {
            const s = fl.scale * flowerGrowthScale;
            return (
              <group
                key={`strawb-flower-${idx}`}
                position={fl.pos}
                rotation={fl.rot}
                scale={[s, s, s]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart?.({
                    id: `flower-strawberry-${idx}`,
                    name: 'White 5-Petaled Anthesis Flower with Golden Receptacle',
                    type: 'flower',
                    species: 'Strawberry',
                    maturity: overallProgress,
                    parent: 'Basal Flowering Cyme Scape',
                  });
                }}
              >
                <primitive object={clonedBlossom.clone(true)} />
              </group>
            );
          })}

          {/* Aggregate Fruits Attached to Stalks */}
          {showBerries && attachedBerries.map((b) => (
            <React.Fragment key={`strawb-fruit-group-${b.id}`}>
              <mesh castShadow receiveShadow>
                <tubeGeometry args={[b.pedicelCurve, 8, b.pedicelRadius, 6, false]} />
                <meshStandardMaterial
                  color={stemColor}
                  roughness={0.55}
                  metalness={0.05}
                  side={THREE.DoubleSide}
                />
              </mesh>

              <group
                position={b.fruitPos}
                rotation={b.rot}
                scale={[b.scale, b.scale, b.scale]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart?.({
                    id: `fruit-strawberry-${b.id}`,
                    name: 'Aggregate Berry with Achenes & Persistent Calyx',
                    type: 'fruit',
                    species: 'Strawberry',
                    maturity: fruitMaturity,
                    parent: 'Fruiting Truss Pedicel',
                  });
                }}
              >
                <primitive object={clonedFruit.clone(true)} position={[0, 0, 0]} />
              </group>
            </React.Fragment>
          ))}
        </group>
      )}
    </group>
  );
}
