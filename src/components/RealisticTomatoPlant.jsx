import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

// Preload tomato 3D asset for immediate rendering
useGLTF.preload('/assets/plants/tomato/tomato_plant.glb');

/**
 * Realistic Tomato Plant Model (Solanum lycopersicum)
 * Integrates photorealistic 3D crop geometry from the GH-01 Digital Twin project (CC0).
 * Features continuous botanical organogenesis:
 * - Anchored firmly at the soil line (Y = 0) with stem base offset correction.
 * - Underground seed hydration & emergence during early stages (progress < 0.06).
 * - Smooth proportional 3D volumetric expansion (height, thickness, and canopy spread).
 * - Continuous flower bud emergence, anthesis bloom, petal senescence, and fruit ripening.
 * - Single-allocation PBR materials without garbage collection churn or shader re-compilation.
 */
export function RealisticTomatoPlant({
  plantState,
  showRoots = true,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
}) {
  const {
    overallProgress = 0,
    stemHeight = 0.5,
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
  const flowerGroupRef = useRef();
  const fruitGroupRef = useRef();
  const materialsRef = useRef({
    stem: null,
    leaves: null,
    flowers: null,
    fruit: null,
    roots: null,
  });

  const { scene } = useGLTF('/assets/plants/tomato/tomato_plant.glb');

  // Clone photorealistic plant hierarchy ONCE
  const clonedStage = useMemo(() => {
    // plant_001 is the mature scanned plant with complete stem, leaves, flower clusters, and fruit trusses
    const sourceNode = scene.getObjectByName('plant_001');
    if (!sourceNode) return null;

    const clone = sourceNode.clone(true);

    // In tomato_plant.glb, stem base minY is 0.6445. Offset by -0.6445 to anchor stem base at Y = 0 (soil line)
    // Offset X and Z by the stem center to align perfectly with the root crown at (0, 0, 0)
    clone.position.set(0.007, -0.6445, -0.005);
    clone.rotation.set(0, 0, 0);

    // Setup materials once
    clone.traverse((child) => {
      if (!child.isMesh) return;
      const name = child.name.toLowerCase();
      child.castShadow = true;
      child.receiveShadow = true;

      // Hide greenhouse hardware
      if (name.includes('hook') || name.includes('string') || name.includes('id_tag') || name.includes('cube')) {
        child.visible = false;
        return;
      }

      if (child.material) {
        child.material = child.material.clone();
        child.material.side = THREE.DoubleSide;

        if (name.includes('stem')) {
          materialsRef.current.stem = child.material;
          child.material.roughness = 0.62;
        } else if (name.includes('leaves')) {
          materialsRef.current.leaves = child.material;
          child.material.roughness = 0.48;
        } else if (name.includes('flowers')) {
          materialsRef.current.flowers = child.material;
          flowerGroupRef.current = child;
        } else if (name.includes('fruit')) {
          materialsRef.current.fruit = child.material;
          child.material.roughness = 0.28;
          fruitGroupRef.current = child;
        } else if (name.includes('roots')) {
          materialsRef.current.roots = child.material;
          child.material.roughness = 0.75;
        }
      }
    });

    return clone;
  }, [scene]);

  // Dynamic PBR Foliage Color (Chlorosis, drought desiccation, and senescence browning)
  const leafColor = useMemo(() => {
    const healthyGreen = new THREE.Color('#2e7d32');
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

  // Dynamic Fruit Ripening Color (Unripe green -> Breaker amber -> Crimson ripe)
  const fruitColor = useMemo(() => {
    const unripeGreen = new THREE.Color('#388e3c');
    const breakerAmber = new THREE.Color('#ffa726');
    const ripeRed = new THREE.Color('#c62828');

    if (fruitMaturity < 0.45) {
      return unripeGreen.clone().lerp(breakerAmber, fruitMaturity / 0.45);
    }
    return breakerAmber.clone().lerp(ripeRed, (fruitMaturity - 0.45) / 0.55);
  }, [fruitMaturity]);

  // Mutate existing material properties directly without cloning (zero GC churn)
  useEffect(() => {
    const mats = materialsRef.current;
    if (!mats.stem) return;

    const isStemSelected = selectedPart?.id === 'stem-main' || selectedPart?.type === 'stem';
    mats.stem.color.set(isStemSelected ? '#64ffda' : '#3d6c3e');
    mats.stem.emissive.set(isStemSelected ? '#64ffda' : '#000000');
    mats.stem.emissiveIntensity = isStemSelected ? 0.35 : 0.0;

    const isLeafSelected = selectedPart?.id === 'leaf-main' || selectedPart?.type === 'leaf';
    if (mats.leaves) {
      mats.leaves.color.copy(isLeafSelected ? new THREE.Color('#64ffda') : leafColor);
      mats.leaves.emissive.set(isLeafSelected ? '#64ffda' : '#000000');
      mats.leaves.emissiveIntensity = isLeafSelected ? 0.35 : 0.0;
    }

    const isFlowerSelected = selectedPart?.id === 'flower-main' || selectedPart?.type === 'flower';
    if (mats.flowers) {
      mats.flowers.emissive.set(isFlowerSelected ? '#64ffda' : '#000000');
      mats.flowers.emissiveIntensity = isFlowerSelected ? 0.4 : 0.0;
    }

    const isFruitSelected = selectedPart?.id === 'fruit-main' || selectedPart?.type === 'fruit';
    if (mats.fruit) {
      mats.fruit.color.copy(isFruitSelected ? new THREE.Color('#64ffda') : fruitColor);
      mats.fruit.emissive.set(isFruitSelected ? '#64ffda' : '#000000');
      mats.fruit.emissiveIntensity = isFruitSelected ? 0.35 : 0.0;
    }

    if (mats.roots) {
      const isRootSelected = selectedPart?.id === 'root-collar' || selectedPart?.type === 'root';
      mats.roots.color.set(isRootSelected ? '#64ffda' : '#5d4037');
      mats.roots.emissive.set(isRootSelected ? '#64ffda' : '#000000');
      mats.roots.emissiveIntensity = isRootSelected ? 0.35 : 0.0;
    }
  }, [selectedPart, leafColor, fruitColor]);

  // Dynamic organ scaling & visibility based on developmental stage:
  // 1. Shoot Emergence: canopy scale starts at 0 for progress < 0.06, expands smoothly to 1.0 by 0.16
  const emergenceFactor = Math.min(1.0, Math.max(0.0, (overallProgress - 0.06) / 0.10));

  // 2. Continuous Proportional 3D Scaling (Height + Canopy Spread)
  // Ensures realistic developmental proportions from vigorous young vegetative shoot to majestic adult vine
  const heightProgress = Math.min(1.0, Math.max(0.24, (stemHeight / 2.8) * 1.15 + (overallProgress * 0.42)));
  const heightScale = emergenceFactor > 0 ? heightProgress * 1.45 * emergenceFactor : 0.0001;
  const spreadScale = emergenceFactor > 0 ? Math.min(1.0, Math.max(0.22, overallProgress * 1.18)) * emergenceFactor : 0.0001;

  // 3. Flower bud formation and anthesis scaling (emerges at 0.35, full bloom by 0.45, withers post 0.60)
  let flowerScale = 0;
  if (overallProgress >= 0.35 && !isTerminal) {
    if (overallProgress < 0.45) {
      flowerScale = 0.2 + ((overallProgress - 0.35) / 0.10) * 0.8;
    } else if (overallProgress < 0.60) {
      flowerScale = 1.0;
    } else if (overallProgress < 0.75) {
      flowerScale = Math.max(0.0, 1.0 - (overallProgress - 0.60) / 0.15);
    }
  }

  // 4. Fruit set, cell expansion, and ripening scaling (emerges at 0.50, expands to full truss by 0.72)
  let fruitScale = 0;
  if (overallProgress >= 0.50) {
    if (overallProgress < 0.72) {
      fruitScale = 0.18 + ((overallProgress - 0.50) / 0.22) * 0.82;
    } else {
      fruitScale = 1.0;
    }
  }

  // Apply organ scales directly to mesh nodes
  useEffect(() => {
    if (flowerGroupRef.current) {
      flowerGroupRef.current.visible = flowerScale > 0.02 && !isTerminal;
      flowerGroupRef.current.scale.set(flowerScale, flowerScale, flowerScale);
    }
    if (fruitGroupRef.current) {
      fruitGroupRef.current.visible = fruitScale > 0.02;
      fruitGroupRef.current.scale.set(fruitScale, fruitScale, fruitScale);
    }
  }, [flowerScale, fruitScale, isTerminal]);

  // Organic wind breeze animation
  useFrame(({ clock }) => {
    if (!canopyRef.current || stemHeight < 0.15 || emergenceFactor <= 0.05) return;
    const t = clock.getElapsedTime();
    const stemFlex = Math.min(1.0, stemHeight * 0.35);
    const breezeZ = Math.sin(t * 1.6) * (windIntensity * 0.038 * stemFlex);
    const breezeX = Math.cos(t * 1.1) * (windIntensity * 0.02 * stemFlex);
    canopyRef.current.rotation.z = breezeZ;
    canopyRef.current.rotation.x = breezeX;
  });

  // Handle pointer clicks on the realistic 3D model
  const handleClick = (e) => {
    e.stopPropagation();
    const meshName = e.object?.name?.toLowerCase() || '';

    if (meshName.includes('stem')) {
      onSelectPart?.({
        id: 'stem-main',
        name: 'Main Tapered Stem',
        type: 'stem',
        species: 'Tomato',
        height: stemHeight,
        parent: 'Root Crown',
      });
    } else if (meshName.includes('leaves')) {
      onSelectPart?.({
        id: 'leaf-main',
        name: 'Compound Tomato Leaves',
        type: 'leaf',
        species: 'Tomato',
        maturity: overallProgress,
        parent: 'Main Stem Node',
      });
    } else if (meshName.includes('flowers')) {
      onSelectPart?.({
        id: 'flower-main',
        name: 'Tomato Inflorescence Cyme',
        type: 'flower',
        species: 'Tomato',
        maturity: Math.min(1.0, (overallProgress - 0.35) * 2.5),
        parent: 'Inflorescence Cyme',
      });
    } else if (meshName.includes('fruit')) {
      onSelectPart?.({
        id: 'fruit-main',
        name: 'Tomato Fruit Truss',
        type: 'fruit',
        species: 'Tomato',
        maturity: fruitMaturity,
        parent: 'Fruiting Truss',
      });
    } else if (meshName.includes('roots')) {
      onSelectPart?.({
        id: 'root-collar',
        name: 'Subsoil Root Crown',
        type: 'root',
        species: 'Tomato',
        depth: rootDepth,
        parent: 'Base of Stem',
      });
    }
  };

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subsoil Roots with continuous elongation */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* 2. Above-Ground Realistic Plant Canopy (Emerges smoothly from soil line Y = 0) */}
      {emergenceFactor > 0.01 && (
        <group
          ref={canopyRef}
          position={[0, 0, 0]}
          scale={[spreadScale, heightScale, spreadScale]}
          onClick={handleClick}
        >
          {clonedStage && <primitive object={clonedStage} />}
        </group>
      )}
    </group>
  );
}
