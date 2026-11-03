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
 * - Robust monopodial lignified stem anchored at the soil line (Y = 0)
 * - 51 individually addressable cordate leaves with smooth progressive unfolding
 * - Apical capitulum flower head with golden ray florets and dark seed disk
 * - Involucral phyllary bracts
 * - Continuous botanical head nodding under achene seed weight & senescence
 * - Single-allocation PBR materials without garbage collection churn
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
    fruitMaturity = 0,
    health = 100,
    waterStress = 0,
    lightStress = 0,
    senescenceProgress = 0,
    isTerminal = false,
  } = plantState;

  const canopyRef = useRef();
  const { scene } = useGLTF('/assets/plants/sunflower/sunflower.glb');

  // References to categorized meshes and materials
  const leafNodesRef = useRef([]);
  const stemMeshesRef = useRef([]);
  const headMeshesRef = useRef([]);
  const bractMeshesRef = useRef([]);

  // Emergence factor: canopy scale starts at 0 for progress < 0.06, emerges smoothly
  const emergenceFactor = Math.min(1.0, Math.max(0.0, (overallProgress - 0.06) / 0.10));

  // Compute dynamic scale factor anchored at ground level
  const targetHeight = Math.max(0.18, stemHeight || 1.6);
  const uniformScale = useMemo(() => {
    if (emergenceFactor <= 0) return 0.0001;
    const matureScale = targetHeight / 1100.0;
    const growthMult = Math.min(1.0, Math.max(0.08, overallProgress * 1.05));
    return matureScale * growthMult * emergenceFactor;
  }, [targetHeight, overallProgress, emergenceFactor]);

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

  // Deep clone the asset hierarchy ONCE and setup mesh groups
  const clonedModel = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone(true);

    const leafMeshes = [];
    const stemMeshes = [];
    const headMeshes = [];
    const bractMeshes = [];

    clone.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;

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
        const bbox = new THREE.Box3().setFromObject(child);
        const midY = (bbox.min.y + bbox.max.y) / 2;
        leafMeshes.push({ mesh: child, midY, initialScale: child.scale.clone() });
      }
    });

    leafMeshes.sort((a, b) => a.midY - b.midY);

    leafNodesRef.current = leafMeshes;
    stemMeshesRef.current = stemMeshes;
    headMeshesRef.current = headMeshes;
    bractMeshesRef.current = bractMeshes;

    return clone;
  }, [scene]);

  // Update progressive leaf unfolding and organ visibility smoothly
  useEffect(() => {
    if (!clonedModel) return;

    // 1. Progressive leaf unfolding: leaves emerge from bottom to top along stem
    const leafNodes = leafNodesRef.current;
    const totalLeaves = leafNodes.length;

    leafNodes.forEach((item, idx) => {
      const emergenceThreshold = 0.12 + (idx / totalLeaves) * 0.48;
      if (overallProgress < emergenceThreshold) {
        item.mesh.visible = false;
      } else {
        item.mesh.visible = true;
        // Smooth scale expansion during leaf emergence (0.04 progress window)
        const unfoldFactor = Math.min(1.0, (overallProgress - emergenceThreshold) / 0.05);
        item.mesh.scale.set(
          item.initialScale.x * unfoldFactor,
          item.initialScale.y * unfoldFactor,
          item.initialScale.z * unfoldFactor
        );

        const isSelected = selectedPart?.id === 'sunflower-leaf-main' || selectedPart?.type === 'leaf';
        item.mesh.material.color.copy(isSelected ? new THREE.Color('#64ffda') : leafColor);
        item.mesh.material.emissive.set(isSelected ? '#64ffda' : '#000000');
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

    // 2. Stem mesh materials
    const isStemSelected = selectedPart?.id === 'stem-sunflower-main' || selectedPart?.type === 'stem';
    stemMeshesRef.current.forEach((m) => {
      m.material.color.set(isStemSelected ? '#64ffda' : '#4a7536');
      m.material.emissive.set(isStemSelected ? '#64ffda' : '#000000');
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

    // 3. Capitulum Head & Involucral Bracts (Emerges at 0.32, anthesis by 0.45)
    const showHead = overallProgress >= 0.32;
    const isHeadSelected = selectedPart?.id === 'sunflower-flower-head' || selectedPart?.type === 'flower';
    const headScale = showHead ? Math.min(1.0, (overallProgress - 0.32) / 0.14) : 0;

    headMeshesRef.current.forEach((m) => {
      m.visible = showHead && headScale > 0.02;
      if (showHead) {
        m.material.color.copy(isHeadSelected ? new THREE.Color('#64ffda') : rayColor);
        m.material.emissive.set(isHeadSelected ? '#64ffda' : '#000000');
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

    bractMeshesRef.current.forEach((m) => {
      m.visible = showHead && headScale > 0.02;
      if (showHead) {
        m.material.color.copy(isHeadSelected ? new THREE.Color('#64ffda') : leafColor);
        m.material.emissive.set(isHeadSelected ? '#64ffda' : '#000000');
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
    if (!canopyRef.current || emergenceFactor <= 0.05) return;
    const t = clock.getElapsedTime();

    // Natural elastic stem sway
    const swayAmount = windIntensity * 0.035;
    const swayX = Math.sin(t * 1.8) * swayAmount;
    const swayZ = Math.cos(t * 1.3) * (swayAmount * 0.7);

    // Biological head nodding under achene weight and drought/senescence
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

      {/* 2. Above-Ground Shoot Canopy (Only visible when emerged above soil Y = 0) */}
      {emergenceFactor > 0.01 && (
        <group
          ref={canopyRef}
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
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
          {/* Photorealistic 3D Model Scaled & Ground-Aligned */}
          {clonedModel && (
            <group scale={[uniformScale, uniformScale, uniformScale]}>
              <primitive
                object={clonedModel}
                position={[-92.41, -77.26, -8.96]}
              />
            </group>
          )}
        </group>
      )}
    </group>
  );
}
