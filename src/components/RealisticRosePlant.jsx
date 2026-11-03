import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

useGLTF.preload('/assets/plants/rose/rose.glb');

/**
 * Procedural Rose Hip (Urn-shaped hypanthium enclosing achenes)
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
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color={isSelected ? '#64ffda' : hipColor}
          emissive={isSelected ? '#64ffda' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0.0}
          roughness={0.25}
        />
      </mesh>
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
  const materialsRef = useRef([]);

  const clonedObject = useMemo(() => {
    if (!modelScene) return null;
    const clone = modelScene.clone(true);
    materialsRef.current = [];

    const toRemove = [];
    clone.traverse((child) => {
      if (child.isLight || child.isCamera) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((c) => c.parent && c.parent.remove(c));

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const minY = box.min.y;
    clone.position.set(-box.min.x - size.x * 0.5, -minY, -box.min.z - size.z * 0.5);

    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = child.material.clone();
        child.material.side = THREE.DoubleSide;
        materialsRef.current.push(child.material);
      }
    });

    return { obj: clone, height: Math.max(0.1, size.y) };
  }, [modelScene]);

  // Direct material updates without cloning
  useEffect(() => {
    const isHighlight = isSelectedFlower || isSelectedLeaf || isSelectedStem;
    materialsRef.current.forEach((mat) => {
      mat.color.set('#ffffff');
      if (foliarTint) {
        mat.color.lerp(foliarTint, 0.35);
      }
      mat.emissive.set(isHighlight ? '#64ffda' : '#000000');
      mat.emissiveIntensity = isHighlight ? 0.45 : 0.0;
    });
  }, [isSelectedFlower, isSelectedLeaf, isSelectedStem, foliarTint]);

  if (!clonedObject) return null;

  return (
    <group
      ref={caneRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
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
    senescenceProgress = 0,
    isTerminal = false,
  } = plantState;

  const canopyRef = useRef();
  const { scene } = useGLTF('/assets/plants/rose/rose.glb');

  // Emergence factor: starts at 0 for progress < 0.06, emerges smoothly
  const emergenceFactor = Math.min(1.0, Math.max(0.0, (overallProgress - 0.06) / 0.10));

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

  useFrame(({ clock }) => {
    if (!canopyRef.current || emergenceFactor <= 0.05) return;
    const t = clock.getElapsedTime();
    const flex = Math.min(1.0, stemHeight * 0.7);
    canopyRef.current.rotation.z = Math.sin(t * 1.4) * (windIntensity * 0.02 * flex);
    canopyRef.current.rotation.x = Math.cos(t * 1.1) * (windIntensity * 0.012 * flex);
  });

  const isSelectedFlower = selectedPart?.type === 'flower' || selectedPart?.id?.includes('flower');
  const isSelectedLeaf = selectedPart?.type === 'leaf' || selectedPart?.id?.includes('leaf');
  const isSelectedStem = selectedPart?.type === 'stem' || selectedPart?.id?.includes('stem');

  const targetHeight = Math.max(0.12, stemHeight || 1.1);
  const baseScale = emergenceFactor > 0 ? (targetHeight / 1.74) * emergenceFactor : 0.0001;

  // Cane 2 and 3 scaling smoothly
  const cane2Scale = overallProgress > 0.35 ? Math.min(1.0, (overallProgress - 0.35) / 0.12) : 0;
  const cane3Scale = overallProgress > 0.55 ? Math.min(1.0, (overallProgress - 0.55) / 0.12) : 0;

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

      {/* 2. Shrub Canopy (Only rendered when emerged above soil Y = 0) */}
      {emergenceFactor > 0.01 && (
        <group ref={canopyRef} position={[0, 0, 0]}>
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

          {cane2Scale > 0.02 && (
            <RoseCane
              modelScene={scene}
              position={[-0.04, 0, 0.03]}
              rotation={[0.14, 1.85, -0.18]}
              scale={baseScale * 0.88 * cane2Scale}
              isSelectedFlower={isSelectedFlower}
              isSelectedLeaf={isSelectedLeaf}
              isSelectedStem={isSelectedStem}
              flowerVisible={flowerCount > 1 && !isTerminal}
              foliarTint={foliarTint}
              onSelectPart={onSelectPart}
              plantState={plantState}
            />
          )}

          {cane3Scale > 0.02 && (
            <RoseCane
              modelScene={scene}
              position={[0.045, 0, -0.035]}
              rotation={[-0.12, -2.1, 0.22]}
              scale={baseScale * 0.82 * cane3Scale}
              isSelectedFlower={isSelectedFlower}
              isSelectedLeaf={isSelectedLeaf}
              isSelectedStem={isSelectedStem}
              flowerVisible={flowerCount > 2 && !isTerminal}
              foliarTint={foliarTint}
              onSelectPart={onSelectPart}
              plantState={plantState}
            />
          )}

          {/* Lignified Root Crown Junction */}
          <mesh
            position={[0, 0.05 * emergenceFactor, 0]}
            scale={[baseScale * 1.5, baseScale * 1.5, baseScale * 1.5]}
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

          {/* Scarlet Rose Hips */}
          {fruitCount > 0 && hipPositions.slice(0, fruitCount).map((pos, idx) => (
            <RoseHip
              key={`rose-hip-${idx}`}
              position={pos}
              scale={(0.8 + fruitMaturity * 0.4) * Math.min(1.0, (overallProgress - 0.5) / 0.2)}
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
      )}
    </group>
  );
}
