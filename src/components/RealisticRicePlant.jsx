import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

// Preload authentic 3D rice plant asset (Oryza sativa) - independent 154KB model by dariotolkien (CC-BY-NC 4.0)
useGLTF.preload('/assets/plants/rice/rice_plant.glb');

/**
 * Realistic Rice Plant Model (Oryza sativa)
 * Integrates authentic botanical cereal grass 3D model with realistic jointed culms,
 * linear graminoid foliage, and drooping branched grain panicles.
 * 
 * Distinct botanical characteristics:
 * - Independent asset completely distinct from wheat (no bilateral spikelets or awns)
 * - Multi-tiller hill habit: 4-5 tillering culms emerging from basal crown with arching blades
 * - Ripening progression: panicles transition from photosynthetic emerald to golden harvest paddy
 * - Coupled to FLORA's deterministic growth engine: dynamic height, tillering, and senescence
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
    waterloggingStress = 0,
    senescenceProgress = 0,
    isTerminal = false,
  } = plantState;

  const canopyRef = useRef();
  const { scene } = useGLTF('/assets/plants/rice/rice_plant.glb');

  // Dynamic scale factor:
  // Native model height in rice_plant.glb is ~65.75 units.
  // Standard mature paddy rice reaches ~1.05m to 1.25m in height.
  const targetHeight = Math.max(0.15, stemHeight || 1.15);
  const uniformScale = useMemo(() => {
    const matureScale = targetHeight / 65.75;
    const growthMult = Math.min(1.0, Math.max(0.18, overallProgress * 1.06));
    return matureScale * growthMult;
  }, [targetHeight, overallProgress]);

  // Rice foliar tint (lush paddy emerald -> nitrogen chlorosis / drought browning)
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

  // Rice panicle grain ripening progression:
  // Milk stage (pale photosynthetic green) -> Dough stage (soft amber) -> Hard dough (golden paddy grain)
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

  const isSelectedCulm = selectedPart?.type === 'stem' || selectedPart?.id?.includes('culm') || selectedPart?.id?.includes('tiller');
  const isSelectedLeaf = selectedPart?.type === 'leaf' || selectedPart?.id?.includes('leaf') || selectedPart?.id?.includes('blade');
  const isSelectedPanicle = selectedPart?.type === 'fruit' || selectedPart?.id?.includes('panicle') || selectedPart?.id?.includes('grain');

  // Clone scene, center at base, and configure materials for leaves and grain panicles
  const clonedTiller = useMemo(() => {
    const clone = scene.clone(true);

    // Center X & Z, place base at Y = 0
    // Model bounds: x [-11.42, 26.10] (center 7.34), y [-1.77, 63.98], z [-18.76, 10.84] (center -3.96)
    clone.position.set(-7.34, 1.77, 3.96);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const isLeaves = child.name === 'Object_3' || child.material?.name === 'LeavesRiceMatSG';
        const isPanicle = child.name === 'Object_4' || child.material?.name === 'lambert2SG';

        if (child.material) {
          child.material = new THREE.MeshStandardMaterial({
            name: isLeaves ? 'RiceLeaves' : 'RicePanicles',
            color: isLeaves ? foliarTint : panicleTint,
            roughness: isLeaves ? 0.45 : 0.60,
            metalness: 0.05,
            side: THREE.DoubleSide,
          });
        }
      }
    });
    return clone;
  }, [scene, foliarTint, panicleTint]);

  // Update selection highlights
  useEffect(() => {
    if (!clonedTiller) return;
    clonedTiller.traverse((child) => {
      if (child.isMesh && child.material) {
        const isLeaves = child.name === 'Object_3' || child.material?.name === 'RiceLeaves';
        const isPanicle = child.name === 'Object_4' || child.material?.name === 'RicePanicles';

        if ((isPanicle && isSelectedPanicle) || (isLeaves && isSelectedLeaf) || isSelectedCulm) {
          child.material.emissive = new THREE.Color('#64ffda');
          child.material.emissiveIntensity = 0.35;
        } else {
          child.material.emissive = new THREE.Color('#000000');
          child.material.emissiveIntensity = 0.0;
        }
      }
    });
  }, [clonedTiller, isSelectedCulm, isSelectedLeaf, isSelectedPanicle]);

  // Botanical tillering cluster configuration (4-5 tillering culms form an authentic paddy hill)
  const tillers = useMemo(() => [
    { pos: [0, 0, 0], rot: [0.03, 0.0, 0.02], scale: 1.0 },
    { pos: [0.035, 0, 0.025], rot: [0.08, 1.3, -0.06], scale: 0.96 },
    { pos: [-0.030, 0, 0.030], rot: [-0.07, 2.5, 0.08], scale: 0.94 },
    { pos: [-0.025, 0, -0.035], rot: [0.06, 3.8, 0.07], scale: 0.98 },
    { pos: [0.030, 0, -0.025], rot: [-0.08, 5.1, -0.05], scale: 0.92 },
  ], []);

  // Gentle wind sway simulating paddy field breeze
  useFrame(({ clock }) => {
    if (!canopyRef.current) return;
    const t = clock.getElapsedTime();
    canopyRef.current.rotation.z = Math.sin(t * 1.7) * (windIntensity * 0.020);
    canopyRef.current.rotation.x = Math.cos(t * 1.3) * (windIntensity * 0.015);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    const meshName = e.object?.name || '';
    const matName = e.object?.material?.name || '';

    if (meshName === 'Object_4' || matName === 'RicePanicles') {
      onSelectPart?.({
        id: 'fruit-rice-panicle',
        name: 'Drooping Branched Panicle with Paddy Grains',
        type: 'fruit',
        species: 'Rice',
        maturity: fruitMaturity,
        parent: 'Terminal Flag Rachis',
      });
    } else if (meshName === 'Object_3' || matName === 'RiceLeaves') {
      onSelectPart?.({
        id: 'leaf-rice-blade',
        name: 'Linear Graminoid Leaf Blade with Ligule',
        type: 'leaf',
        species: 'Rice',
        maturity: overallProgress,
        parent: 'Culm Sheath Node',
      });
    } else {
      onSelectPart?.({
        id: 'stem-rice-culm',
        name: 'Hollow Jointed Culm & Tillering Crown',
        type: 'stem',
        species: 'Rice',
        maturity: overallProgress,
        parent: 'Basal Crown',
      });
    }
  };

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subsoil Adventitious Root System with Aerenchyma */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* 2. Above-Ground 3D Rice Hill Canopy (Tillering Culms & Drooping Panicles) */}
      <group
        ref={canopyRef}
        position={[0, 0.035, 0]}
        onClick={handleClick}
      >
        {tillers.map((tiller, idx) => (
          <group
            key={`rice-tiller-${idx}`}
            position={tiller.pos}
            rotation={tiller.rot}
            scale={[
              uniformScale * tiller.scale,
              uniformScale * tiller.scale,
              uniformScale * tiller.scale,
            ]}
          >
            <primitive object={clonedTiller.clone(true)} />
          </group>
        ))}
      </group>
    </group>
  );
}

