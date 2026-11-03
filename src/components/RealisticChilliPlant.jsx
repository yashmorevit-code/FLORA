import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

useGLTF.preload('/assets/plants/chilli/chilli_plant.glb');
useGLTF.preload('/assets/plants/chilli/chilli_fruit.glb');

/**
 * Realistic Chilli Plant Model (Capsicum annuum)
 * Integrates authentic botanical 3D assets with real dichotomous sympodial branching
 * shrub architecture, smooth broad ovate-acuminate foliage, and hanging tapered pepper pods.
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
  const foliageMaterialsRef = useRef([]);
  const fruitMaterialsRef = useRef([]);

  const { scene: foliageScene } = useGLTF('/assets/plants/chilli/chilli_plant.glb');
  const { scene: fruitScene } = useGLTF('/assets/plants/chilli/chilli_fruit.glb');

  // Emergence factor: canopy scale starts at 0 for progress < 0.06, emerges smoothly
  const emergenceFactor = Math.min(1.0, Math.max(0.0, (overallProgress - 0.06) / 0.10));

  // Dynamic scale factor:
  const nominalMatureHeight = 0.72;
  const currentHeight = useMemo(() => {
    if (emergenceFactor <= 0) return 0.0001;
    const growthMult = Math.min(1.0, Math.max(0.10, overallProgress * 1.06));
    return nominalMatureHeight * growthMult * emergenceFactor;
  }, [overallProgress, emergenceFactor]);

  const uniformScale = useMemo(() => {
    return currentHeight / 426.66;
  }, [currentHeight]);

  // Foliar tint responding to health, water stress, and senescence
  const foliarTint = useMemo(() => {
    const natural = new THREE.Color('#ffffff');
    const chlorotic = new THREE.Color('#d4e157');
    const necrotic = new THREE.Color('#8d6e63');

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

  // Fruit pod ripening tint
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

  // Clone foliage scene ONCE
  const clonedBranch = useMemo(() => {
    const clone = foliageScene.clone(true);
    clone.position.set(-0.62, -0.62, -8.76);
    foliageMaterialsRef.current = [];

    clone.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material = child.material.clone();
          child.material.side = THREE.DoubleSide;
          child.material.alphaTest = 0.50;
          child.material.depthWrite = true;
          child.material.roughness = 0.38;
          child.material.metalness = 0.05;
          foliageMaterialsRef.current.push(child.material);
        }
      }
    });
    return clone;
  }, [foliageScene]);

  // Clone fruit scene ONCE
  const clonedFruit = useMemo(() => {
    const clone = fruitScene.clone(true);
    fruitMaterialsRef.current = [];

    clone.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.roughness = 0.28;
          child.material.metalness = 0.08;
          fruitMaterialsRef.current.push(child.material);
        }
      }
    });
    return clone;
  }, [fruitScene]);

  // Direct material updates without cloning
  useEffect(() => {
    const isSelectedStem = selectedPart?.type === 'stem' || selectedPart?.id?.includes('stem') || selectedPart?.id?.includes('branch');
    const isSelectedLeaf = selectedPart?.type === 'leaf' || selectedPart?.id?.includes('leaf');
    const isSelectedFruit = selectedPart?.type === 'fruit' || selectedPart?.id?.includes('pod') || selectedPart?.id?.includes('chilli');

    foliageMaterialsRef.current.forEach(mat => {
      mat.color.copy(foliarTint);
      if (isSelectedLeaf || isSelectedStem) {
        mat.emissive.set('#64ffda');
        mat.emissiveIntensity = 0.35;
      } else {
        mat.emissive.set('#000000');
        mat.emissiveIntensity = 0.0;
      }
    });

    fruitMaterialsRef.current.forEach(mat => {
      mat.color.copy(podColor);
      mat.emissive.set(isSelectedFruit ? '#64ffda' : '#000000');
      mat.emissiveIntensity = isSelectedFruit ? 0.35 : 0.0;
    });
  }, [foliarTint, podColor, selectedPart]);

  // Gentle wind sway
  useFrame(({ clock }) => {
    if (!canopyRef.current || emergenceFactor <= 0.05) return;
    const t = clock.getElapsedTime();
    const flex = Math.min(1.0, currentHeight / nominalMatureHeight);
    canopyRef.current.rotation.z = Math.sin(t * 1.6) * (windIntensity * 0.02 * flex);
    canopyRef.current.rotation.x = Math.cos(t * 1.2) * (windIntensity * 0.015 * flex);
  });

  // Hanging pepper pods (emerges at 0.45, expands smoothly)
  const showPods = overallProgress >= 0.45 && !isTerminal;
  const podScale = showPods ? Math.min(1.0, Math.max(0.12, (overallProgress - 0.45) / 0.25)) : 0;

  const podAttachmentPoints = useMemo(() => [
    { pos: [0.08, 0.40 * currentHeight, 0.06], rot: [0.35, 0.2, 0.15], s: 0.0075 },
    { pos: [-0.09, 0.45 * currentHeight, 0.05], rot: [-0.25, -0.4, -0.2], s: 0.0080 },
    { pos: [0.05, 0.48 * currentHeight, -0.07], rot: [0.2, 0.5, -0.15], s: 0.0072 },
    { pos: [-0.06, 0.38 * currentHeight, -0.06], rot: [-0.3, 0.2, 0.3], s: 0.0078 },
  ], [currentHeight]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subsoil Branched Taproot System */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* 2. Above-Ground Chilli Shrub Canopy */}
      {emergenceFactor > 0.01 && (
        <group ref={canopyRef} position={[0, 0, 0]}>
          <group scale={[uniformScale, uniformScale, uniformScale]}>
            <primitive
              object={clonedBranch}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart?.({
                  id: 'leaf-chilli-ovate',
                  name: 'Smooth Ovate Chilli Leaf',
                  type: 'leaf',
                  species: 'Chilli',
                  maturity: overallProgress,
                  parent: 'Branching Fork Node',
                });
              }}
            />
          </group>

          {/* Hanging Pepper Pods */}
          {showPods && podScale > 0.02 && podAttachmentPoints.map((pod, idx) => {
            const s = pod.s * podScale;
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
                    name: 'Tapered Pendant Chilli Pepper Pod',
                    type: 'fruit',
                    species: 'Chilli',
                    maturity: fruitMaturity,
                    parent: 'Dichotomous Branch Node',
                  });
                }}
              >
                <primitive object={clonedFruit.clone(true)} />
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}
