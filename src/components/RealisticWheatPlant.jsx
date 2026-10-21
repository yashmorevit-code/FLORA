import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

// Preload 3D wheat asset
useGLTF.preload('/assets/plants/wheat/wheat_stalks.glb');

/**
 * Realistic Wheat Plant Model (Triticum aestivum)
 * Integrates authentic 3D wheat model from Google Poly / Poly Pizza (CC-BY 3.0).
 * Features realistic jointed culms, graminoid leaf blades, and terminal distichous spikelets with long awns (beards).
 * Coupled to FLORA's deterministic growth engine:
 * - Dynamic height scaling based on stemHeight & overallProgress
 * - Tillering multiplier: activates additional tiller clumps as vegetative progress advances
 * - Grain maturation: color transition from lush photosynthetic green to rich golden harvest straw
 * - Full interactive part inspection: culm, leaves, and terminal grain spike
 */
export function RealisticWheatPlant({
  plantState,
  showRoots = true,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
}) {
  const {
    overallProgress = 0,
    stemHeight = 0.85,
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
  const { scene } = useGLTF('/assets/plants/wheat/wheat_stalks.glb');

  // Dynamic scale factor:
  // Native wheat_stalks.glb height is ~220 units.
  // Standard mature wheat reaches ~0.8m to 1.1m.
  const targetHeight = Math.max(0.12, stemHeight || 0.85);
  const uniformScale = useMemo(() => {
    const matureScale = targetHeight / 220.0;
    const growthMult = Math.min(1.0, Math.max(0.15, overallProgress * 1.1));
    return matureScale * growthMult;
  }, [targetHeight, overallProgress]);

  // Color transition for cereal ripening: green (anthesis) -> milky dough amber -> golden straw
  const strawColor = useMemo(() => {
    const greenCulm = new THREE.Color('#43a047');
    const amberDough = new THREE.Color('#e0a93b');
    const goldenStraw = new THREE.Color('#fbc951');
    const desiccated = new THREE.Color('#8d6e63');

    let c = greenCulm.clone();
    if (fruitMaturity < 0.45) {
      c.lerp(amberDough, fruitMaturity / 0.45);
    } else {
      c = amberDough.clone().lerp(goldenStraw, (fruitMaturity - 0.45) / 0.55);
    }

    if (senescenceProgress > 0.4) {
      c.lerp(desiccated, (senescenceProgress - 0.4) * 1.5);
    } else if (waterStress > 0.35) {
      c.lerp(desiccated, (waterStress - 0.35) * 0.8);
    }
    return c;
  }, [fruitMaturity, senescenceProgress, waterStress]);

  const isSelectedCulm = selectedPart?.type === 'stem' || selectedPart?.id?.includes('culm') || selectedPart?.id?.includes('tiller');
  const isSelectedLeaf = selectedPart?.type === 'leaf' || selectedPart?.id?.includes('leaf');
  const isSelectedSpike = selectedPart?.type === 'ear' || selectedPart?.type === 'fruit' || selectedPart?.id?.includes('spike');

  // Clone and configure materials for all instances
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.color = strawColor;
          child.material.side = THREE.DoubleSide;
          child.material.roughness = 0.55;
          child.material.metalness = 0.05;
        }
      }
    });
    return clone;
  }, [scene, strawColor]);

  // Update selection highlight dynamically
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse(child => {
      if (child.isMesh && child.material) {
        if (isSelectedCulm || isSelectedLeaf || isSelectedSpike) {
          child.material.emissive = new THREE.Color('#64ffda');
          child.material.emissiveIntensity = 0.35;
        } else {
          child.material.emissive = new THREE.Color('#000000');
          child.material.emissiveIntensity = 0.0;
        }
      }
    });
  }, [clonedScene, isSelectedCulm, isSelectedLeaf, isSelectedSpike]);

  // Gentle rhythmic wind sway
  useFrame(({ clock }) => {
    if (!canopyRef.current) return;
    const t = clock.getElapsedTime();
    const flex = Math.min(1.0, stemHeight / 0.85);
    canopyRef.current.rotation.z = Math.sin(t * 1.8) * (windIntensity * 0.025 * flex);
    canopyRef.current.rotation.x = Math.cos(t * 1.4) * (windIntensity * 0.018 * flex);
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subsoil Fibrous Root System */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* 2. Above-Ground Jointed Wheat Stalks */}
      <group ref={canopyRef} position={[0, 0, 0]}>
        {/* Main Central Wheat Stalk Cluster */}
        <primitive
          object={clonedScene}
          scale={[uniformScale, uniformScale, uniformScale]}
          position={[0, -0.02, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart?.({
              id: 'ear-wheat-spike',
              name: 'Terminal Bearded Wheat Spike (Ear)',
              type: 'ear',
              species: 'Wheat',
              maturity: fruitMaturity,
              parent: 'Jointed Culm Axis',
            });
          }}
        />

        {/* Tillering Clump Stalks: additional clumps activate at higher vegetative progress */}
        {overallProgress >= 0.35 && (
          <group
            position={[-0.04, 0, 0.03]}
            rotation={[0.06, 1.2, -0.05]}
            scale={[uniformScale * 0.9, uniformScale * 0.9, uniformScale * 0.9]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart?.({
                id: 'stem-wheat-culm',
                name: 'Secondary Tiller Culm with Awned Spike',
                type: 'stem',
                species: 'Wheat',
                parent: 'Crown Tillering Ring',
              });
            }}
          >
            <primitive object={clonedScene.clone(true)} />
          </group>
        )}

        {overallProgress >= 0.50 && (
          <group
            position={[0.04, 0, -0.03]}
            rotation={[-0.05, -1.5, 0.06]}
            scale={[uniformScale * 0.85, uniformScale * 0.85, uniformScale * 0.85]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart?.({
                id: 'stem-wheat-culm',
                name: 'Tertiary Tiller Culm',
                type: 'stem',
                species: 'Wheat',
                parent: 'Crown Tillering Ring',
              });
            }}
          >
            <primitive object={clonedScene.clone(true)} />
          </group>
        )}
      </group>
    </group>
  );
}
