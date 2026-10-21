import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralRoots } from './ProceduralRoots.jsx';

// Preload photorealistic sunflower asset
useGLTF.preload('/assets/plants/sunflower/sunflower.glb');

/**
 * Realistic Sunflower Model (Helianthus annuus)
 * Integrates photorealistic 3D botanical asset with 58 addressable meshes:
 * - Robust monopodial lignified stem
 * - 51 individually addressable cordate leaves with progressive disclosure along the stem
 * - Apical capitulum flower head with golden ray florets and seed disk
 * - Involucral phyllary bracts
 * Dynamic simulation coupling:
 * - Dynamic height scaling based on stemHeight & overallProgress
 * - Helianthus anthesis: apical bud emergence -> golden bloom -> seed maturation
 * - Dynamic botanical head nodding under achene seed weight & senescence
 * - Foliar chlorosis, drought desiccation, and senescence browning
 * - Dynamic wind sway & full organ inspection interactivity
 */
export function RealisticSunflower({
  plantState,
  showRoots = true,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
}) {
  const {
    overallProgress = 0,
    stemHeight = 1.6,
    rootDepth = 0.1,
    rootSpread = 0.1,
    flowerCount = 0,
    fruitMaturity = 0,
    health = 100,
    waterStress = 0,
    lightStress = 0,
    senescenceProgress = 0,
    isTerminal = false,
  } = plantState;

  const canopyRef = useRef();
  const headPivotRef = useRef();
  const { scene } = useGLTF('/assets/plants/sunflower/sunflower.glb');

  // Compute dynamic scale factor:
  // Native asset height in Three.js coordinates is ~1100 units.
  // Standard mature sunflower reaches ~1.8m to 2.2m.
  const targetHeight = Math.max(0.18, stemHeight || 1.6);
  const uniformScale = useMemo(() => {
    const matureScale = targetHeight / 1100.0;
    // Growth multiplier from seedling to full height
    const growthMult = Math.min(1.0, Math.max(0.15, overallProgress * 1.05));
    return matureScale * growthMult;
  }, [targetHeight, overallProgress]);

  // Leaf color responding to plant health, water stress, and senescence
  const leafColor = useMemo(() => {
    const healthy = new THREE.Color('#38761d'); // Rich sunflower green
    const chlorotic = new THREE.Color('#c0ca33'); // Chlorosis yellow
    const desiccated = new THREE.Color('#5d4037'); // Senescent brown

    let c = healthy.clone();
    if (senescenceProgress > 0) {
      if (senescenceProgress < 0.45) {
        c.lerp(chlorotic, senescenceProgress / 0.45);
      } else {
        c.lerp(chlorotic, 1.0).lerp(desiccated, (senescenceProgress - 0.45) / 0.55);
      }
    } else if (waterStress > 0.25) {
      c.lerp(desiccated, (waterStress - 0.25) * 0.85);
    } else if (lightStress > 0.4 || health < 65) {
      c.lerp(chlorotic, ((100 - health) / 100) * 0.7);
    }
    return c;
  }, [health, waterStress, lightStress, senescenceProgress]);

  // Capitulum ray floret and disk color based on anthesis and achene ripening
  const { rayColor, diskColor } = useMemo(() => {
    const goldenRay = new THREE.Color('#fbc02d');
    const senescentRay = new THREE.Color('#8d6e63');
    const activeDisk = new THREE.Color('#4e342e');
    const ripeSeedDisk = new THREE.Color('#1f1610');

    let ray = goldenRay.clone();
    let disk = activeDisk.clone();

    if (senescenceProgress > 0.1 || isTerminal) {
      const t = Math.min(1.0, senescenceProgress * 1.4);
      ray.lerp(senescentRay, t);
      disk.lerp(ripeSeedDisk, 0.9);
    } else if (fruitMaturity > 0.3) {
      const t = (fruitMaturity - 0.3) / 0.7;
      disk.lerp(ripeSeedDisk, t);
    }

    return { rayColor: ray, diskColor: disk };
  }, [senescenceProgress, fruitMaturity, isTerminal]);

  // Deep clone the asset scene hierarchy so instances and materials are self-contained
  const clonedModel = useMemo(() => {
    if (!scene) return null;
    return scene.clone(true);
  }, [scene]);

  // Configure materials, progressive leaf disclosure, and click interactions
  useEffect(() => {
    if (!clonedModel) return;

    // Collect all leaf meshes to sort them by height for developmental disclosure
    const leafMeshes = [];
    const stemMeshes = [];
    const headMeshes = [];
    const bractMeshes = [];

    clonedModel.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      // Independent material clone with double-sided rendering
      if (child.material) {
        child.material = child.material.clone();
        child.material.side = THREE.DoubleSide;
      }

      const matName = child.material?.name || '';
      const name = child.name || '';

      if (matName === 'Material.001' || name.includes('167') || name.includes('170') || name.includes('176') || name.includes('53') || name.includes('54') || name.includes('56')) {
        stemMeshes.push(child);
      } else if (matName === 'GIRASOLITO' || name.includes('Cube_GIRASOLITO') || name === 'Object_11') {
        headMeshes.push(child);
      } else if (matName === 'OJITAS' || matName === 'ojita' || name.includes('OJITAS')) {
        bractMeshes.push(child);
      } else if (matName === 'HOJA_1' || name.includes('HOJA')) {
        // Compute approximate vertical position
        const bbox = new THREE.Box3().setFromObject(child);
        const midY = (bbox.min.y + bbox.max.y) / 2;
        leafMeshes.push({ mesh: child, midY });
      }
    });

    // Sort leaves from lowest to highest
    leafMeshes.sort((a, b) => a.midY - b.midY);

    // Progressive leaf disclosure: leaves emerge sequentially as vegetative growth proceeds
    const totalLeaves = leafMeshes.length;
    leafMeshes.forEach((item, idx) => {
      const emergenceThreshold = 0.15 + (idx / totalLeaves) * 0.55;
      const isVisible = overallProgress >= emergenceThreshold;
      item.mesh.visible = isVisible;

      if (isVisible) {
        const isSelected = selectedPart?.id === 'sunflower-leaf-main' || selectedPart?.type === 'leaf';
        item.mesh.material.color = isSelected ? new THREE.Color('#64ffda') : leafColor;
        item.mesh.material.emissive = new THREE.Color(isSelected ? '#64ffda' : '#000000');
        item.mesh.material.emissiveIntensity = isSelected ? 0.4 : 0.0;
        item.mesh.material.roughness = 0.52;

        item.mesh.userData.floraPart = {
          id: 'sunflower-leaf-main',
          name: `Cordate Leaf (Tier ${Math.floor((idx / totalLeaves) * 5) + 1})`,
          type: 'leaf',
          species: 'Sunflower',
          parent: 'Main Lignified Stem',
        };
      }
    });

    // Configure Stem Meshes
    const isStemSelected = selectedPart?.id === 'stem-sunflower-main' || selectedPart?.type === 'stem';
    stemMeshes.forEach((m) => {
      m.material.color = new THREE.Color(isStemSelected ? '#64ffda' : '#4a7536');
      m.material.emissive = new THREE.Color(isStemSelected ? '#64ffda' : '#000000');
      m.material.emissiveIntensity = isStemSelected ? 0.35 : 0.0;
      m.material.roughness = 0.68;
      m.userData.floraPart = {
        id: 'stem-sunflower-main',
        name: 'Main Lignified Stem',
        type: 'stem',
        species: 'Sunflower',
        parent: 'Root Crown',
      };
    });

    // Configure Capitulum Head & Bracts
    const isHeadSelected = selectedPart?.id === 'sunflower-flower-head' || selectedPart?.type === 'flower';
    const showHead = overallProgress >= 0.32;

    headMeshes.forEach((m) => {
      m.visible = showHead;
      if (showHead) {
        m.material.color = isHeadSelected ? new THREE.Color('#64ffda') : rayColor;
        m.material.emissive = new THREE.Color(isHeadSelected ? '#64ffda' : '#000000');
        m.material.emissiveIntensity = isHeadSelected ? 0.45 : 0.0;
        m.material.roughness = 0.42;
        m.userData.floraPart = {
          id: 'sunflower-flower-head',
          name: 'Capitulum Pseudanthium (Flower Head)',
          type: 'flower',
          species: 'Sunflower',
          parent: 'Apical Meristem',
        };
      }
    });

    bractMeshes.forEach((m) => {
      m.visible = showHead;
      if (showHead) {
        m.material.color = isHeadSelected ? new THREE.Color('#64ffda') : leafColor;
        m.material.emissive = new THREE.Color(isHeadSelected ? '#64ffda' : '#000000');
        m.material.emissiveIntensity = isHeadSelected ? 0.35 : 0.0;
        m.material.roughness = 0.55;
        m.userData.floraPart = {
          id: 'sunflower-flower-head',
          name: 'Capitulum Involucral Bracts',
          type: 'flower',
          species: 'Sunflower',
          parent: 'Apical Meristem',
        };
      }
    });
  }, [clonedModel, overallProgress, selectedPart, leafColor, rayColor, diskColor]);

  // Natural aerodynamic wind oscillation and geotropic head nodding
  useFrame(({ clock }) => {
    if (!canopyRef.current) return;
    const t = clock.getElapsedTime();

    // Natural elastic stem sway (higher at apex, dampened at base)
    const swayAmount = windIntensity * 0.035;
    const swayX = Math.sin(t * 1.8) * swayAmount;
    const swayZ = Math.cos(t * 1.3) * (swayAmount * 0.7);

    // Biological head nodding:
    // Heavy capitulum bows forward/downward under increasing achene weight and drought/senescence
    const progressOverMature = Math.max(0, overallProgress - 0.65) / 0.35;
    const nodRad =
      0.15 +
      0.45 * progressOverMature +
      0.35 * fruitMaturity +
      0.45 * senescenceProgress +
      0.20 * waterStress;

    canopyRef.current.rotation.x = swayX + nodRad * 0.15;
    canopyRef.current.rotation.z = swayZ;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Subterranean Rhizosphere Root System */}
      {showRoots && (
        <ProceduralRoots
          rootDepth={rootDepth}
          rootSpread={rootSpread}
          health={health}
          isSunflower={true}
          selectedPart={selectedPart}
          onSelectPart={onSelectPart}
        />
      )}

      {/* 2. Above-Ground Shoot Canopy */}
      <group
        ref={canopyRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          // Find closest floraPart metadata up the clicked hierarchy
          let target = e.object;
          while (target && !target.userData?.floraPart && target.parent) {
            target = target.parent;
          }
          if (target?.userData?.floraPart) {
            onSelectPart?.(target.userData.floraPart);
          } else {
            onSelectPart?.({
              id: 'stem-sunflower-main',
              name: 'Main Lignified Stem',
              type: 'stem',
              species: 'Sunflower',
              parent: 'Root Crown',
            });
          }
        }}
      >
        {/* Early Seedling Cotyledon Sprout (when overallProgress < 0.22) */}
        {overallProgress < 0.22 && (
          <group position={[0, Math.min(0.06, overallProgress * 0.25), 0]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.045, 16, 16]} scale={[1.3, 0.7, 0.9]} />
              <meshStandardMaterial color="#37474f" roughness={0.8} />
            </mesh>
            {overallProgress > 0.06 && (
              <mesh position={[0, 0.045, 0]} castShadow>
                <coneGeometry args={[0.024, 0.07, 10]} />
                <meshStandardMaterial color="#8bc34a" roughness={0.65} />
              </mesh>
            )}
          </group>
        )}

        {/* Photorealistic 3D Model Scaled & Ground-Aligned */}
        {clonedModel && (
          <group scale={[uniformScale, uniformScale, uniformScale]}>
            {/* Center the native model coordinates: base at Y=0, stem centered at X=0, Z=0 */}
            <primitive
              object={clonedModel}
              position={[-92.41, -77.26, -8.96]}
            />
          </group>
        )}
      </group>
    </group>
  );
}
