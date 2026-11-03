import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SPECIES_IDS } from '../simulation/species.js';

/**
 * BotanicalSeedSprout:
 * Provides scientifically authentic 3D seed morphology, imbibition swelling,
 * radicle root breakthrough, and hypocotyl shoot emergence during early stages (progress 0.0 to 0.15).
 * Completely resolves the problem of mature plants floating/sitting on soil at Day 0.
 */
export function BotanicalSeedSprout({
  speciesId = 'tomato',
  overallProgress = 0.0,
  soilMoisture = 60,
  showRoots = true,
}) {
  const sproutGroupRef = useRef();

  // Imbibition hydration swelling factor (0.0 to 0.05 progress)
  const hydration = Math.min(1.0, overallProgress / 0.04);
  const moistureMult = 0.9 + (soilMoisture / 100) * 0.25;
  const seedScale = (1.0 + hydration * 0.22) * moistureMult;

  // Radicle emergence (0.025 to 0.08 progress): geotropic descent into soil
  const radicleProgress = Math.min(1.0, Math.max(0.0, (overallProgress - 0.02) / 0.05));
  const radicleLength = radicleProgress * 0.065;

  // Hypocotyl loop emergence (0.05 to 0.12 progress): arching upwards through soil line Y = 0
  const shootProgress = Math.min(1.0, Math.max(0.0, (overallProgress - 0.05) / 0.06));
  const shootHeight = shootProgress * 0.075;

  // Cotyledon unfolding (0.08 to 0.15 progress)
  const cotyledonProgress = Math.min(1.0, Math.max(0.0, (overallProgress - 0.075) / 0.07));

  // Seed coat decomposition/fade (fades out as true leaves establish)
  const seedOpacity = overallProgress > 0.10 ? Math.max(0.0, 1.0 - (overallProgress - 0.10) / 0.06) : 1.0;

  // 1. Species-specific seed morphology
  const seedConfig = useMemo(() => {
    switch (speciesId) {
      case SPECIES_IDS.SUNFLOWER:
        return {
          shape: 'achene_tapered',
          color: '#263238',
          stripeColor: '#b0bec5',
          scale: [0.028, 0.052, 0.016],
          seedY: -0.040,
        };
      case SPECIES_IDS.STRAWBERRY:
        return {
          shape: 'ovoid_tiny',
          color: '#c77800',
          scale: [0.014, 0.022, 0.014],
          seedY: -0.025,
        };
      case SPECIES_IDS.WHEAT:
        return {
          shape: 'caryopsis_grain',
          color: '#c49a45',
          scale: [0.018, 0.046, 0.016],
          seedY: -0.035,
        };
      case SPECIES_IDS.RICE:
        return {
          shape: 'caryopsis_grain',
          color: '#bfa15f',
          scale: [0.015, 0.048, 0.013],
          seedY: -0.035,
        };
      case SPECIES_IDS.CHILLI:
        return {
          shape: 'flat_disc',
          color: '#d7ccc8',
          scale: [0.024, 0.012, 0.024],
          seedY: -0.032,
        };
      case SPECIES_IDS.ROSE:
        return {
          shape: 'teardrop_woody',
          color: '#4e342e',
          scale: [0.022, 0.036, 0.020],
          seedY: -0.038,
        };
      case SPECIES_IDS.TOMATO:
      default:
        return {
          shape: 'flat_ovate',
          color: '#8d6e63',
          scale: [0.022, 0.014, 0.028],
          seedY: -0.035,
        };
    }
  }, [speciesId]);

  // Radicle curve points (descending geotropically into soil)
  const radicleCurve = useMemo(() => {
    if (radicleProgress <= 0) return null;
    const p0 = new THREE.Vector3(0, seedConfig.seedY, 0);
    const p1 = new THREE.Vector3(0.003, seedConfig.seedY - radicleLength * 0.5, 0.002);
    const p2 = new THREE.Vector3(-0.002, seedConfig.seedY - radicleLength, 0.001);
    return new THREE.QuadraticBezierCurve3(p0, p1, p2);
  }, [radicleProgress, radicleLength, seedConfig.seedY]);

  // Hypocotyl shoot arch curve (arching upwards towards Y = 0 and breaking topsoil)
  const hypocotylCurve = useMemo(() => {
    if (shootProgress <= 0) return null;
    const startY = seedConfig.seedY + 0.005;
    const targetY = startY + shootHeight;
    const p0 = new THREE.Vector3(0, startY, 0);
    const p1 = new THREE.Vector3(0.008, startY + (targetY - startY) * 0.65, 0.004);
    const p2 = new THREE.Vector3(0, targetY, 0);
    return new THREE.QuadraticBezierCurve3(p0, p1, p2);
  }, [shootProgress, shootHeight, seedConfig.seedY]);

  // If plant has advanced well into seedling/vegetative stage, seed coat has fully decomposed
  // Placed AFTER all hooks to adhere strictly to React's Rules of Hooks
  if (overallProgress > 0.16) return null;

  return (
    <group ref={sproutGroupRef} position={[0, 0, 0]}>
      {/* 1. Underground Swelling Seed */}
      {seedOpacity > 0.01 && (
        <group
          position={[0, seedConfig.seedY, 0]}
          scale={[
            seedConfig.scale[0] * seedScale,
            seedConfig.scale[1] * seedScale,
            seedConfig.scale[2] * seedScale,
          ]}
        >
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
              color={seedConfig.color}
              roughness={0.78}
              metalness={0.05}
              transparent={seedOpacity < 1.0}
              opacity={seedOpacity}
            />
          </mesh>

          {/* Longitudinal stripes for sunflower achene */}
          {speciesId === SPECIES_IDS.SUNFLOWER && (
            <mesh scale={[1.02, 1.01, 0.4]}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial
                color={seedConfig.stripeColor}
                roughness={0.7}
                wireframe
                transparent={seedOpacity < 1.0}
                opacity={seedOpacity * 0.75}
              />
            </mesh>
          )}
        </group>
      )}

      {/* 2. Tender Radicle Root Tip Emerging Downwards */}
      {showRoots && radicleCurve && radicleProgress > 0.02 && (
        <mesh castShadow receiveShadow>
          <tubeGeometry args={[radicleCurve, 8, 0.0035, 6, false]} />
          <meshStandardMaterial
            color="#f1ede2"
            roughness={0.65}
            metalness={0.02}
          />
        </mesh>
      )}

      {/* 3. Hypocotyl Loop Arching Upwards into Topsoil */}
      {hypocotylCurve && shootProgress > 0.02 && (
        <group>
          <mesh castShadow receiveShadow>
            <tubeGeometry args={[hypocotylCurve, 8, 0.004, 6, false]} />
            <meshStandardMaterial
              color="#8bc34a"
              roughness={0.6}
              metalness={0.02}
            />
          </mesh>

          {/* Emerged Cotyledon Primordia at Hypocotyl Apex */}
          {cotyledonProgress > 0.05 && (
            <group
              position={[0, seedConfig.seedY + 0.005 + shootHeight, 0]}
              scale={[cotyledonProgress, cotyledonProgress, cotyledonProgress]}
            >
              {/* Left Cotyledon Blade */}
              <mesh
                position={[-0.014 * cotyledonProgress, 0.005, 0]}
                rotation={[0.2, 0, 0.4]}
                castShadow
              >
                <sphereGeometry args={[0.015, 8, 8]} scale={[1.3, 0.3, 0.8]} />
                <meshStandardMaterial color="#689f38" roughness={0.55} />
              </mesh>

              {/* Right Cotyledon Blade */}
              <mesh
                position={[0.014 * cotyledonProgress, 0.005, 0]}
                rotation={[0.2, 0, -0.4]}
                castShadow
              >
                <sphereGeometry args={[0.015, 8, 8]} scale={[1.3, 0.3, 0.8]} />
                <meshStandardMaterial color="#689f38" roughness={0.55} />
              </mesh>
            </group>
          )}
        </group>
      )}
    </group>
  );
}
