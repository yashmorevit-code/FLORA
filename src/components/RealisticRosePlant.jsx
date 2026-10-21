import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

useGLTF.preload('/assets/plants/rose/rose.glb');

/**
 * Procedural Rose Hip (Urn-shaped hypanthium enclosing achenes)
 * Ripens to bright scarlet-orange post-anthesis.
 */
function RoseHip({ position, scale = 1.0, maturity = 0.0, isSelected = false, onSelect }) {
  const hipColor = useMemo(() => {
    const greenCalyx = new THREE.Color('#4caf50');
    const orangeHip = new THREE.Color('#ff7043');
    const scarletRipe = new THREE.Color('#d32f2f');

    if (maturity < 0.45) {
      return greenCalyx.clone().lerp(orangeHip, maturity / 0.45);
    } else {
      return orangeHip.clone().lerp(scarletRipe, (maturity - 0.45) / 0.55);
    }
  }, [maturity]);

  return (
    <group position={position} scale={scale} onClick={onSelect}>
      {/* Fleshy spherical/urn hypanthium */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color={isSelected ? '#64ffda' : hipColor}
          emissive={isSelected ? '#64ffda' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0.0}
          roughness={0.25}
        />
      </mesh>
      {/* Persistent sepals crowning the hip apex */}
      <mesh position={[0, 0.02, 0]}>
        <coneGeometry args={[0.008, 0.016, 5]} />
        <meshStandardMaterial color="#3e2723" roughness={0.7} />
      </mesh>
    </group>
  );
}

/**
 * Single Cane Instance using the authentic rose model
 */
function RoseCane({
  modelScene,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  isSelectedFlower = false,
  isSelectedLeaf = false,
  isSelectedStem = false,
  flowerVisible = true,
  foliarTint = null,
  onSelectPart,
  plantState,
}) {
  const caneRef = useRef();

  const clonedObject = useMemo(() => {
    if (!modelScene) return null;
    const clone = modelScene.clone(true);

    // Filter out lights and cameras embedded in glTF
    const toRemove = [];
    clone.traverse((child) => {
      if (child.isLight || child.isCamera) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((c) => c.parent && c.parent.remove(c));

    // Normalize bounds: compute bounding box and place base at y = 0
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const minY = box.min.y;
    clone.position.set(-box.min.x - size.x * 0.5, -minY, -box.min.z - size.z * 0.5);

    return { obj: clone, height: Math.max(0.1, size.y) };
  }, [modelScene]);

  // Update materials on cloned meshes
  useEffect(() => {
    if (!clonedObject?.obj) return;

    clonedObject.obj.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material = child.material.clone();
        child.material.side = THREE.DoubleSide;

        // Preserve texture map colors; do not tint with solid red/pink so leaves stay green!
        child.material.color = new THREE.Color('#ffffff');
        if (foliarTint) {
          child.material.color.lerp(foliarTint, 0.35);
        }

        const isHighlight = isSelectedFlower || isSelectedLeaf || isSelectedStem;
        if (isHighlight) {
          child.material.emissive = new THREE.Color('#64ffda');
          child.material.emissiveIntensity = 0.45;
        } else {
          child.material.emissive = new THREE.Color('#000000');
          child.material.emissiveIntensity = 0.0;
        }
      }
    });
  }, [clonedObject, isSelectedFlower, isSelectedLeaf, isSelectedStem, foliarTint]);

  if (!clonedObject) return null;

  return (
    <group
      ref={caneRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        // Point Y relative to cane base
        const localY = e.point ? e.point.y : 0.5;
        const stemHeight = plantState.stemHeight || 1.1;

        if (localY > stemHeight * 0.65 && flowerVisible) {
          onSelectPart?.({
            id: 'flower-rose-corolla',
            name: 'Multi-Petaled Rose Blossom',
            type: 'flower',
            species: 'Rose',
            maturity: Math.min(1.0, (plantState.overallProgress - 0.35) * 2.5),
            parent: 'Distal Flowering Cane',
          });
        } else if (localY < stemHeight * 0.25) {
          onSelectPart?.({
            id: 'stem-rose-cane',
            name: 'Prickly Woody Rose Cane',
            type: 'stem',
            species: 'Rose',
            height: stemHeight,
            parent: 'Woody Root Crown',
          });
        } else {
          onSelectPart?.({
            id: 'leaf-rose-pinnate',
            name: 'Odd-Pinnate Rose Foliage',
            type: 'leaf',
            species: 'Rose',
            maturity: plantState.overallProgress || 0.8,
            parent: 'Lignified Cane Node',
          });
        }
      }}
    >
      <primitive object={clonedObject.obj} />
    </group>
  );
}

/**
 * Realistic Rose Plant Model (Rosa rubiginosa)
 * Features authentic photorealistic 3D botanical asset from fazreil/valentine-ar (MIT),
 * composed into a multi-cane woody shrub with odd-pinnate foliage, multi-petaled corollas,
 * and developing scarlet hypanthium hips.
 */
export function RealisticRosePlant({
  plantState,
  showRoots = true,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
}) {
  const {
    overallProgress = 0,
    stemHeight = 1.1,
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
  const { scene } = useGLTF('/assets/plants/rose/rose.glb');

  // Foliar tint for chlorosis / senescence
  const foliarTint = useMemo(() => {
    if (senescenceProgress > 0) {
      const chlorotic = new THREE.Color('#d4e157');
      const necrotic = new THREE.Color('#8d6e63');
      return chlorotic.lerp(necrotic, senescenceProgress);
    }
    if (waterStress > 0.3) {
      return new THREE.Color('#bcaaa4');
    }
    return null;
  }, [senescenceProgress, waterStress]);

  // Wind sway for woody shrub
  useFrame(({ clock }) => {
    if (!canopyRef.current) return;
    const t = clock.getElapsedTime();
    const flex = Math.min(1.0, stemHeight * 0.7);
    canopyRef.current.rotation.z = Math.sin(t * 1.4) * (windIntensity * 0.02 * flex);
    canopyRef.current.rotation.x = Math.cos(t * 1.1) * (windIntensity * 0.012 * flex);
  });

  const isSelectedFlower = selectedPart?.type === 'flower' || selectedPart?.id?.includes('flower');
  const isSelectedLeaf = selectedPart?.type === 'leaf' || selectedPart?.id?.includes('leaf');
  const isSelectedStem = selectedPart?.type === 'stem' || selectedPart?.id?.includes('stem');

  // Target scale normalized to native height (~1.74m)
  const targetHeight = Math.max(0.2, stemHeight || 1.1);
  const baseScale = targetHeight / 1.74;

  // Rose hip coordinates
  const hipPositions = useMemo(() => [
    [0.08, targetHeight * 0.65, 0.06],
    [-0.09, targetHeight * 0.70, 0.05],
    [0.04, targetHeight * 0.75, -0.07],
  ], [targetHeight]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subsoil Woody Taproot and Laterals */}
      <ProceduralRoots
        rootDepth={rootDepth}
        rootSpread={rootSpread}
        visible={showRoots}
        health={health}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        isSunflower={false}
      />

      {/* 2. Shrub Canopy */}
      <group ref={canopyRef} position={[0, 0, 0]}>
        {/* Central Dominant Cane */}
        <RoseCane
          modelScene={scene}
          position={[0, 0, 0]}
          rotation={[0.05, 0, -0.04]}
          scale={baseScale}
          isSelectedFlower={isSelectedFlower}
          isSelectedLeaf={isSelectedLeaf}
          isSelectedStem={isSelectedStem}
          flowerVisible={flowerCount > 0 && !isTerminal}
          foliarTint={foliarTint}
          onSelectPart={onSelectPart}
          plantState={plantState}
        />

        {/* Arching Lateral Canes for Mature Shrub Architecture */}
        {overallProgress > 0.35 && (
          <RoseCane
            modelScene={scene}
            position={[-0.04, 0, 0.03]}
            rotation={[0.14, 1.85, -0.18]}
            scale={baseScale * 0.88}
            isSelectedFlower={isSelectedFlower}
            isSelectedLeaf={isSelectedLeaf}
            isSelectedStem={isSelectedStem}
            flowerVisible={flowerCount > 1 && !isTerminal}
            foliarTint={foliarTint}
            onSelectPart={onSelectPart}
            plantState={plantState}
          />
        )}

        {overallProgress > 0.55 && (
          <RoseCane
            modelScene={scene}
            position={[0.045, 0, -0.035]}
            rotation={[-0.12, -2.1, 0.22]}
            scale={baseScale * 0.82}
            isSelectedFlower={isSelectedFlower}
            isSelectedLeaf={isSelectedLeaf}
            isSelectedStem={isSelectedStem}
            flowerVisible={flowerCount > 2 && !isTerminal}
            foliarTint={foliarTint}
            onSelectPart={onSelectPart}
            plantState={plantState}
          />
        )}

        {/* 3. Lignified Root Crown Junction */}
        <mesh
          position={[0, 0.05, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart?.({
              id: 'stem-rose-cane',
              name: 'Prickly Woody Rose Cane',
              type: 'stem',
              species: 'Rose',
              height: stemHeight,
              parent: 'Woody Root Crown',
            });
          }}
        >
          <cylinderGeometry args={[0.02, 0.03, 0.1, 8]} />
          <meshStandardMaterial
            color={isSelectedStem ? '#64ffda' : '#3e2723'}
            emissive={isSelectedStem ? '#64ffda' : '#000000'}
            emissiveIntensity={isSelectedStem ? 0.35 : 0.0}
            roughness={0.85}
          />
        </mesh>

        {/* 4. Scarlet Rose Hips (Hypanthia) */}
        {fruitCount > 0 && hipPositions.slice(0, fruitCount).map((pos, idx) => (
          <RoseHip
            key={`rose-hip-${idx}`}
            position={pos}
            scale={0.8 + fruitMaturity * 0.4}
            maturity={fruitMaturity}
            isSelected={selectedPart?.type === 'fruit' || selectedPart?.id?.includes('hip')}
            onSelect={(e) => {
              e.stopPropagation();
              onSelectPart?.({
                id: `hip-rose-${idx}`,
                name: 'Scarlet Rose Hip (Hypanthium)',
                type: 'fruit',
                species: 'Rose',
                maturity: fruitMaturity,
                parent: 'Receptacle Apex',
              });
            }}
          />
        ))}
      </group>
    </group>
  );
}
