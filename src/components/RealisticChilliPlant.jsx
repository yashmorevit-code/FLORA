import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

// Preload authentic 3D Chilli Pepper plant assets:
// 1. Branching foliage & stems with remapped natural ovate leaf textures (chilli_plant.glb by zvanstone, CC-BY 4.0)
// 2. Tapered conical chilli fruit pods (chilli_fruit.glb by iMMERSiVELY, CC-BY 4.0)
useGLTF.preload('/assets/plants/chilli/chilli_plant.glb');
useGLTF.preload('/assets/plants/chilli/chilli_fruit.glb');

/**
 * Realistic Chilli Plant Model (Capsicum annuum)
 * Integrates authentic botanical 3D assets with real dichotomous sympodial branching
 * shrub architecture, smooth broad ovate-acuminate foliage, and hanging tapered pepper pods.
 * 
 * Distinct botanical characteristics:
 * - Multi-stem sympodial branching habit: stem bifurcates at first floral node into a lush spreading shrub
 * - Botanical dimensions: height 0.65–0.78m, canopy spread 0.55–0.65m
 * - Foliar chlorosis and drought desiccation response preserving natural photographic leaf green
 * - Fruit maturation: pendant pods transition from deep photosynthetic green to breaker orange to fiery scarlet
 * - Full interactive part inspection: branching stem forks, ovate foliage, and pepper pods
 */
export function RealisticChilliPlant({
  plantState,
  showRoots = true,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
}) {
  const {
    overallProgress = 0,
    stemHeight = 0.55,
    rootDepth = 0.12,
    rootSpread = 0.12,
    fruitMaturity = 0,
    health = 100,
    waterStress = 0,
    lightStress = 0,
    senescenceProgress = 0,
    isTerminal = false,
  } = plantState;

  const canopyRef = useRef();
  const { scene: foliageScene } = useGLTF('/assets/plants/chilli/chilli_plant.glb');
  const { scene: fruitScene } = useGLTF('/assets/plants/chilli/chilli_fruit.glb');

  // Dynamic scale factor:
  // Native model height in chilli_plant.glb is ~426.66 units.
  // Standard mature cultivated chilli bush reaches ~0.70m to 0.80m in height with a 0.55m to 0.65m spread.
  const nominalMatureHeight = 0.72;
  const currentHeight = useMemo(() => {
    const growthMult = Math.min(1.0, Math.max(0.28, overallProgress * 1.06));
    return nominalMatureHeight * growthMult;
  }, [overallProgress]);

  const uniformScale = useMemo(() => {
    return currentHeight / 426.66;
  }, [currentHeight]);

  // Foliar tint responding to health, water stress, and senescence
  const foliarTint = useMemo(() => {
    const natural = new THREE.Color('#ffffff'); // preserve natural rich green diffuse texture
    const chlorotic = new THREE.Color('#d4e157'); // nitrogen chlorosis
    const necrotic = new THREE.Color('#8d6e63');  // drought/senescence

    let c = natural.clone();
    if (senescenceProgress > 0) {
      c.lerp(chlorotic, Math.min(1, senescenceProgress * 1.4));
      if (senescenceProgress > 0.4) {
        c.lerp(necrotic, (senescenceProgress - 0.4) * 1.8);
      }
    } else if (waterStress > 0.3) {
      c.lerp(necrotic, (waterStress - 0.3) * 0.7);
    } else if (health < 65) {
      c.lerp(chlorotic, ((100 - health) / 100) * 0.55);
    }
    return c;
  }, [health, waterStress, senescenceProgress]);

  // Fruit pod ripening tint: deep photosynthetic green -> breaker orange -> fiery scarlet crimson
  const podColor = useMemo(() => {
    const unripeGreen = new THREE.Color('#2e7d32');
    const breakerOrange = new THREE.Color('#ff7043');
    const scarletRipe = new THREE.Color('#d32f2f');

    if (fruitMaturity < 0.35) {
      return unripeGreen.clone().lerp(breakerOrange, fruitMaturity / 0.35);
    } else {
      return breakerOrange.clone().lerp(scarletRipe, (fruitMaturity - 0.35) / 0.65);
    }
  }, [fruitMaturity]);

  const isSelectedStem = selectedPart?.type === 'stem' || selectedPart?.id?.includes('stem') || selectedPart?.id?.includes('branch');
  const isSelectedLeaf = selectedPart?.type === 'leaf' || selectedPart?.id?.includes('leaf');
  const isSelectedFruit = selectedPart?.type === 'fruit' || selectedPart?.id?.includes('pod') || selectedPart?.id?.includes('chilli');

  // Clone foliage scene, center at base, and configure PBR materials
  const clonedBranch = useMemo(() => {
    const clone = foliageScene.clone(true);

    // Center X & Z, place base at Y = 0
    clone.position.set(-0.62, -0.62, -8.76);

    clone.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material = child.material.clone();
          child.material.color = foliarTint;
          child.material.side = THREE.DoubleSide;
          child.material.alphaTest = 0.50;
          child.material.depthWrite = true;
          child.material.roughness = 0.38;
          child.material.metalness = 0.05;
        }
      }
    });
    return clone;
  }, [foliageScene, foliarTint]);

  // Clone fruit scene with PBR ripening material
  const clonedFruit = useMemo(() => {
    const clone = fruitScene.clone(true);
    clone.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.color = podColor;
          child.material.roughness = 0.28;
          child.material.metalness = 0.08;
        }
      }
    });
    return clone;
  }, [fruitScene, podColor]);

  // Update selection highlights
  useEffect(() => {
    if (!clonedBranch) return;
    clonedBranch.traverse(child => {
      if (child.isMesh && child.material) {
        if (isSelectedLeaf || isSelectedStem) {
          child.material.emissive = new THREE.Color('#64ffda');
          child.material.emissiveIntensity = 0.35;
        } else {
          child.material.emissive = new THREE.Color('#000000');
          child.material.emissiveIntensity = 0.0;
        }
      }
    });
  }, [clonedBranch, isSelectedLeaf, isSelectedStem]);

  // Sympodial branching shrub configuration:
  // Central main axis + 4 primary sympodial forks (spaced around 360 deg) + 3 secondary upper canopy branches
  const branchForks = useMemo(() => [
    // Central stem axis
    { pos: [0, 0, 0], rot: [0, 0, 0], scale: 1.0 },
    // Primary sympodial fork 1 (azimuth 0 deg, outward lean 24 deg)
    { pos: [0.045, 0.06, 0.025], rot: [0.38, 0.2, -0.22], scale: 0.95 },
    // Primary sympodial fork 2 (azimuth 90 deg, outward lean 26 deg)
    { pos: [-0.035, 0.07, 0.045], rot: [-0.35, 1.6, 0.28], scale: 0.94 },
    // Primary sympodial fork 3 (azimuth 180 deg, outward lean 25 deg)
    { pos: [0.020, 0.08, -0.050], rot: [0.32, 3.2, 0.24], scale: 0.93 },
    // Primary sympodial fork 4 (azimuth 270 deg, outward lean 27 deg)
    { pos: [-0.040, 0.07, -0.035], rot: [-0.30, 4.8, -0.25], scale: 0.92 },
    // Secondary upper branchlet A
    { pos: [-0.015, 0.16, -0.020], rot: [-0.18, 1.2, 0.20], scale: 0.88 },
    // Secondary upper branchlet B
    { pos: [0.025, 0.18, 0.015], rot: [0.22, -1.4, -0.18], scale: 0.86 },
  ], []);

  // Pendant chilli pods attached to branch fork axils hanging naturally downward
  const podPositions = useMemo(() => [
    { pos: [0.065, 0.32, 0.045], rot: [2.7, 0.3, -0.2], scale: 0.038 },
    { pos: [-0.055, 0.34, 0.060], rot: [2.5, 1.9, 0.4], scale: 0.040 },
    { pos: [0.030, 0.38, -0.075], rot: [2.8, -1.6, 0.2], scale: 0.036 },
    { pos: [-0.050, 0.40, -0.045], rot: [2.6, -2.8, -0.3], scale: 0.039 },
    { pos: [0.020, 0.46, 0.030], rot: [2.7, 0.8, 0.3], scale: 0.037 },
    { pos: [-0.030, 0.48, -0.025], rot: [2.6, 2.5, -0.2], scale: 0.035 },
  ], []);

  const showPods = overallProgress >= 0.45 && !isTerminal;
  const podGrowthScale = Math.min(1.0, Math.max(0.35, (overallProgress - 0.45) / 0.35));

  // Gentle wind sway
  useFrame(({ clock }) => {
    if (!canopyRef.current) return;
    const t = clock.getElapsedTime();
    canopyRef.current.rotation.z = Math.sin(t * 1.6) * (windIntensity * 0.016);
    canopyRef.current.rotation.x = Math.cos(t * 1.3) * (windIntensity * 0.012);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (fruitMaturity > 0.3) {
      onSelectPart?.({
        id: 'fruit-chilli-pod',
        name: 'Pendant Conical Chilli Pepper Pod',
        type: 'fruit',
        species: 'Chilli',
        maturity: fruitMaturity,
        parent: 'Axillary Pedicel Node',
      });
    } else {
      onSelectPart?.({
        id: 'leaf-chilli-foliage',
        name: 'Alternate Ovate Foliage & Sympodial Canopy',
        type: 'leaf',
        species: 'Chilli',
        maturity: overallProgress,
        parent: 'Dichotomous Branch Fork',
      });
    }
  };

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subsoil Taproot System */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* 2. Above-Ground 3D Sympodial Chilli Canopy */}
      <group
        ref={canopyRef}
        position={[0, 0.035, 0]}
        onClick={handleClick}
      >
        {/* Branching Sympodial Foliage */}
        {branchForks.map((fork, idx) => (
          <group
            key={`chilli-branch-${idx}`}
            position={fork.pos}
            rotation={fork.rot}
            scale={[
              uniformScale * fork.scale,
              uniformScale * fork.scale,
              uniformScale * fork.scale,
            ]}
          >
            <primitive object={clonedBranch.clone(true)} />
          </group>
        ))}

        {/* Attached Pendant Chilli Fruits */}
        {showPods && podPositions.map((pod, idx) => {
          const s = pod.scale * podGrowthScale;
          return (
            <group
              key={`chilli-pod-${idx}`}
              position={pod.pos}
              rotation={pod.rot}
              scale={[s, s, s]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart?.({
                  id: `fruit-chilli-${idx}`,
                  name: 'Pendant Conical Chilli Pepper Pod',
                  type: 'fruit',
                  species: 'Chilli',
                  maturity: fruitMaturity,
                  parent: 'Axillary Pedicel Node',
                });
              }}
            >
              <primitive object={clonedFruit.clone(true)} />
            </group>
          );
        })}
      </group>
    </group>
  );
}
