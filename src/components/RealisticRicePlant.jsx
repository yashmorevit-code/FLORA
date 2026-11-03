import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

useGLTF.preload('/assets/plants/rice/rice_plant.glb');

/**
 * Realistic Rice Plant Model (Oryza sativa)
 * Integrates authentic botanical cereal grass 3D model with realistic jointed culms,
 * linear graminoid foliage, and drooping branched grain panicles.
 */
export function RealisticRicePlant({
  plantState,
  showRoots = true,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
}) {
  const {
    overallProgress = 0,
    stemHeight = 1.15,
    rootDepth = 0.12,
    rootSpread = 0.12,
    fruitMaturity = 0,
    health = 100,
    waterStress = 0,
    senescenceProgress = 0,
    isTerminal = false,
  } = plantState;

  const canopyRef = useRef();
  const leafMaterialsRef = useRef([]);
  const panicleMaterialsRef = useRef([]);

  const { scene } = useGLTF('/assets/plants/rice/rice_plant.glb');

  // Emergence factor: canopy scale starts at 0 for progress < 0.06, emerges smoothly
  const emergenceFactor = Math.min(1.0, Math.max(0.0, (overallProgress - 0.06) / 0.10));

  // Dynamic scale factor:
  const targetHeight = Math.max(0.15, stemHeight || 1.15);
  const uniformScale = useMemo(() => {
    if (emergenceFactor <= 0) return 0.0001;
    const matureScale = targetHeight / 65.75;
    const growthMult = Math.min(1.0, Math.max(0.10, overallProgress * 1.06));
    return matureScale * growthMult * emergenceFactor;
  }, [targetHeight, overallProgress, emergenceFactor]);

  // Rice foliar tint
  const foliarTint = useMemo(() => {
    const richGreen = new THREE.Color('#388e3c');
    const chlorotic = new THREE.Color('#c0ca33');
    const necrotic = new THREE.Color('#8d6e63');

    let c = richGreen.clone();
    if (senescenceProgress > 0) {
      c.lerp(chlorotic, Math.min(1, senescenceProgress * 1.5));
      if (senescenceProgress > 0.45) {
        c.lerp(necrotic, (senescenceProgress - 0.45) * 1.8);
      }
    } else if (waterStress > 0.3) {
      c.lerp(necrotic, (waterStress - 0.3) * 0.7);
    } else if (health < 65) {
      c.lerp(chlorotic, ((100 - health) / 100) * 0.55);
    }
    return c;
  }, [health, waterStress, senescenceProgress]);

  // Rice panicle grain ripening progression
  const panicleTint = useMemo(() => {
    const milkGreen = new THREE.Color('#66bb6a');
    const doughAmber = new THREE.Color('#e0a93b');
    const goldenPaddy = new THREE.Color('#fbc02d');
    const strawDesiccated = new THREE.Color('#a1887f');

    if (senescenceProgress > 0.3) {
      return goldenPaddy.clone().lerp(strawDesiccated, Math.min(1, (senescenceProgress - 0.3) * 1.4));
    }
    if (fruitMaturity < 0.4) {
      return milkGreen.clone().lerp(doughAmber, fruitMaturity / 0.4);
    } else {
      return doughAmber.clone().lerp(goldenPaddy, (fruitMaturity - 0.4) / 0.6);
    }
  }, [fruitMaturity, senescenceProgress]);

  // Clone scene ONCE
  const clonedTiller = useMemo(() => {
    const clone = scene.clone(true);
    clone.position.set(-7.34, 1.77, 3.96);
    leafMaterialsRef.current = [];
    panicleMaterialsRef.current = [];

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const isLeaves = child.name === 'Object_3' || child.material?.name === 'LeavesRiceMatSG';
        const isPanicle = child.name === 'Object_4' || child.material?.name === 'lambert2SG';

        if (child.material) {
          const mat = new THREE.MeshStandardMaterial({
            name: isLeaves ? 'RiceLeaves' : 'RicePanicles',
            roughness: isLeaves ? 0.45 : 0.60,
            metalness: 0.05,
            side: THREE.DoubleSide,
          });
          child.material = mat;
          if (isLeaves) leafMaterialsRef.current.push(mat);
          if (isPanicle) panicleMaterialsRef.current.push(mat);
        }
      }
    });
    return clone;
  }, [scene]);

  // Direct material updates without cloning
  useEffect(() => {
    const isSelectedCulm = selectedPart?.type === 'stem' || selectedPart?.id?.includes('culm') || selectedPart?.id?.includes('tiller');
    const isSelectedLeaf = selectedPart?.type === 'leaf' || selectedPart?.id?.includes('leaf') || selectedPart?.id?.includes('blade');
    const isSelectedPanicle = selectedPart?.type === 'fruit' || selectedPart?.id?.includes('panicle') || selectedPart?.id?.includes('grain');

    leafMaterialsRef.current.forEach(mat => {
      mat.color.copy(foliarTint);
      mat.emissive.set((isSelectedLeaf || isSelectedCulm) ? '#64ffda' : '#000000');
      mat.emissiveIntensity = (isSelectedLeaf || isSelectedCulm) ? 0.35 : 0.0;
    });

    panicleMaterialsRef.current.forEach(mat => {
      mat.color.copy(panicleTint);
      mat.emissive.set(isSelectedPanicle ? '#64ffda' : '#000000');
      mat.emissiveIntensity = isSelectedPanicle ? 0.35 : 0.0;
    });
  }, [foliarTint, panicleTint, selectedPart]);

  // Gentle rhythmic wind sway
  useFrame(({ clock }) => {
    if (!canopyRef.current || emergenceFactor <= 0.05) return;
    const t = clock.getElapsedTime();
    const flex = Math.min(1.0, stemHeight / 1.15);
    canopyRef.current.rotation.z = Math.sin(t * 1.9) * (windIntensity * 0.03 * flex);
    canopyRef.current.rotation.x = Math.cos(t * 1.3) * (windIntensity * 0.02 * flex);
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subsoil Fibrous Root Clump */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* 2. Above-Ground Rice Hill Canopy */}
      {emergenceFactor > 0.01 && (
        <group ref={canopyRef} position={[0, 0, 0]}>
          <group scale={[uniformScale, uniformScale, uniformScale]}>
            <primitive
              object={clonedTiller}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart?.({
                  id: 'leaf-rice-blade',
                  name: 'Linear Graminoid Rice Leaf Blade',
                  type: 'leaf',
                  species: 'Rice',
                  maturity: overallProgress,
                  parent: 'Hollow Culm Node',
                });
              }}
            />
          </group>
        </group>
      )}
    </group>
  );
}
