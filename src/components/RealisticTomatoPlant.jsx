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
 * Features 6 morphological growth stages (_pv0 to _pv5) dynamically coupled to FLORA's simulation engine.
 * Fully interactive: stem, leaves, flower blossoms, and tomato fruits are independently addressable.
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
    flowerCount = 0,
    fruitCount = 0,
    fruitMaturity = 0,
    health = 100,
    waterStress = 0,
    lightStress = 0,
    senescenceProgress = 0,
    isTerminal = false,
  } = plantState;

  const canopyRef = useRef();
  const { scene } = useGLTF('/assets/plants/tomato/tomato_plant.glb');

  // Select appropriate growth stage variant based on simulation lifecycle progress
  // plant_006 = _pv0 (seedling)
  // plant_005 = _pv1 (early vegetative)
  // plant_004 = _pv2 (established vegetative)
  // plant_003 = _pv3 (early flower bud)
  // plant_002 = _pv4 (inflorescence bloom)
  // plant_001 = _pv5 (fruiting maturity)
  const variantName = useMemo(() => {
    if (overallProgress < 0.16) return 'plant_006';
    if (overallProgress < 0.32) return 'plant_005';
    if (overallProgress < 0.48) return 'plant_004';
    if (overallProgress < 0.64) return 'plant_003';
    if (overallProgress < 0.80) return 'plant_002';
    return 'plant_001';
  }, [overallProgress]);

  // Clone and center the active stage node from the loaded glTF scene
  const clonedStage = useMemo(() => {
    const sourceNode = scene.getObjectByName(variantName);
    if (!sourceNode) return null;

    // Deep clone the node hierarchy so each stage and material instance is independent
    const clone = sourceNode.clone(true);

    // Subtract root translation so plant is centered at local origin [0, 0, 0]
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);

    return clone;
  }, [scene, variantName]);

  // Dynamic PBR Foliage Material (Chlorosis, drought desiccation, and senescence browning)
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

  // Configure materials, visibility, shadows, and interactive click handlers on the cloned mesh tree
  useEffect(() => {
    if (!clonedStage) return;

    clonedStage.traverse((child) => {
      if (!child.isMesh) return;

      const name = child.name.toLowerCase();
      child.castShadow = true;
      child.receiveShadow = true;

      // Clone material to avoid cross-variant contamination
      if (child.material) {
        child.material = child.material.clone();
        child.material.side = THREE.DoubleSide;
      }

      // Hide artificial greenhouse hardware (twine, hooks, plastic barcodes) for natural appearance
      if (name.includes('hook') || name.includes('string') || name.includes('id_tag')) {
        child.visible = false;
        return;
      }

      // Hide artificial rockwool/PE cube to let roots emerge directly into soil cross-section
      if (name.includes('cube')) {
        child.visible = false;
        return;
      }

      // STEM
      if (name.includes('stem')) {
        const isSelected = selectedPart?.id === 'stem-main' || selectedPart?.type === 'stem';
        child.material.color = new THREE.Color(isSelected ? '#64ffda' : '#3d6c3e');
        child.material.emissive = new THREE.Color(isSelected ? '#64ffda' : '#000000');
        child.material.emissiveIntensity = isSelected ? 0.35 : 0.0;
        child.material.roughness = 0.62;
      }

      // LEAVES
      if (name.includes('leaves')) {
        const isSelected = selectedPart?.id === 'leaf-main' || selectedPart?.type === 'leaf';
        child.material.color = isSelected ? new THREE.Color('#64ffda') : leafColor;
        child.material.emissive = new THREE.Color(isSelected ? '#64ffda' : '#000000');
        child.material.emissiveIntensity = isSelected ? 0.35 : 0.0;
        child.material.roughness = 0.48;
      }

      // FLOWERS
      if (name.includes('flowers')) {
        const isSelected = selectedPart?.id === 'flower-main' || selectedPart?.type === 'flower';
        // Flowers appear when flowerCount > 0, and wither in terminal senescence
        child.visible = flowerCount > 0 && !isTerminal;
        child.material.emissive = new THREE.Color(isSelected ? '#64ffda' : '#000000');
        child.material.emissiveIntensity = isSelected ? 0.4 : 0.0;
      }

      // FRUIT
      if (name.includes('fruit')) {
        const isSelected = selectedPart?.id === 'fruit-main' || selectedPart?.type === 'fruit';
        // Fruit clusters appear when fruitCount > 0
        child.visible = fruitCount > 0;
        child.material.color = isSelected ? new THREE.Color('#64ffda') : fruitColor;
        child.material.emissive = new THREE.Color(isSelected ? '#64ffda' : '#000000');
        child.material.emissiveIntensity = isSelected ? 0.35 : 0.0;
        child.material.roughness = 0.28;
      }

      // ROOT COLLAR
      if (name.includes('roots')) {
        const isSelected = selectedPart?.id === 'root-collar' || selectedPart?.type === 'root';
        child.visible = showRoots;
        child.material.color = new THREE.Color(isSelected ? '#64ffda' : '#5d4037');
        child.material.emissive = new THREE.Color(isSelected ? '#64ffda' : '#000000');
        child.material.emissiveIntensity = isSelected ? 0.35 : 0.0;
        child.material.roughness = 0.75;
      }
    });
  }, [clonedStage, selectedPart, leafColor, fruitColor, flowerCount, fruitCount, isTerminal, showRoots]);

  // Organic wind breeze animation
  useFrame(({ clock }) => {
    if (!canopyRef.current || stemHeight < 0.2) return;
    const t = clock.getElapsedTime();
    const stemFlex = Math.min(1.0, stemHeight * 0.35);
    const breezeZ = Math.sin(t * 1.6) * (windIntensity * 0.038 * stemFlex);
    const breezeX = Math.cos(t * 1.1) * (windIntensity * 0.02 * stemFlex);
    canopyRef.current.rotation.z = breezeZ;
    canopyRef.current.rotation.x = breezeX;
  });

  // Calculate vertical height scaling relative to nominal full maturity (1.8m)
  const heightScale = Math.max(0.25, Math.min(1.25, (stemHeight / 1.8) * 1.15));

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
        maturity: Math.min(1.0, (overallProgress - 0.4) * 3.0),
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
      {/* 1. Subsoil Roots with 3D scanned photogrammetric Poly Haven assets */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* 2. Above-Ground Realistic Plant Canopy */}
      <group
        ref={canopyRef}
        position={[0, 0, 0]}
        scale={[1.0, heightScale, 1.0]}
        onClick={handleClick}
      >
        {clonedStage && <primitive object={clonedStage} />}
      </group>
    </group>
  );
}
