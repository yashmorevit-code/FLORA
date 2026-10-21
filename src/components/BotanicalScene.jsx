import React, { useMemo, useEffect, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { SoilCrossSection } from './SoilCrossSection.jsx';
import { RealisticTomatoPlant } from './RealisticTomatoPlant.jsx';
import { RealisticSunflower } from './RealisticSunflower.jsx';
import { RealisticStrawberryPlant } from './RealisticStrawberryPlant.jsx';
import { RealisticWheatPlant } from './RealisticWheatPlant.jsx';
import { RealisticChilliPlant } from './RealisticChilliPlant.jsx';
import { RealisticRicePlant } from './RealisticRicePlant.jsx';
import { RealisticRosePlant } from './RealisticRosePlant.jsx';
import { AnatomyAnnotations } from './AnatomyAnnotations.jsx';
import { getSpeciesConfig, SPECIES_IDS } from '../simulation/species.js';
import { getOrganCameraTarget } from '../simulation/anatomyData.js';

/**
 * CameraController:
 * Provides cinematic smooth transitions between research camera viewpoints and focused organ inspections:
 * - Presets: 'overview', 'canopy', 'rhizosphere', 'reproductive'.
 * - Focused Inspection: Dynamically glides camera to focus on selected organ anchor at optimal distance and angle.
 *
 * Smooth programmatic animation is immediately cancelled if the user interacts with OrbitControls,
 * preventing fighting or jarring jumps.
 */
function CameraController({
  cameraPreset,
  cameraPresetToken,
  selectedPart,
  focusToken,
  plantState,
  controlsRef,
  speciesId = 'tomato',
}) {
  const { camera } = useThree();
  const transitionRef = useRef({
    active: false,
    targetCamPos: new THREE.Vector3(),
    targetLookAt: new THREE.Vector3(),
  });

  useEffect(() => {
    if (!cameraPresetToken) return;

    const isSunflower = speciesId === SPECIES_IDS.SUNFLOWER;
    const isStrawberry = speciesId === SPECIES_IDS.STRAWBERRY;
    const isChilli = speciesId === SPECIES_IDS.CHILLI;
    const isRose = speciesId === SPECIES_IDS.ROSE;
    const isWheat = speciesId === SPECIES_IDS.WHEAT;
    const isRice = speciesId === SPECIES_IDS.RICE;

    let pos = [0, 1.25, 3.5];
    let look = [0, 0.45, 0];

    if (cameraPreset === 'canopy') {
      if (isSunflower) {
        pos = [0, 1.85, 2.5];
        look = [0, 1.55, 0];
      } else if (isStrawberry) {
        pos = [0, 0.45, 1.3];
        look = [0, 0.16, 0];
      } else if (isChilli) {
        pos = [0, 0.75, 1.6];
        look = [0, 0.45, 0];
      } else if (isRose) {
        pos = [0, 0.95, 1.8];
        look = [0, 0.55, 0];
      } else if (isWheat || isRice) {
        pos = [0, 0.95, 1.8];
        look = [0, 0.65, 0];
      } else {
        // Tomato & default
        pos = [0, 1.25, 2.1];
        look = [0, 0.95, 0];
      }
    } else if (cameraPreset === 'rhizosphere') {
      if (isSunflower) {
        pos = [0, -0.85, 2.5];
        look = [0, -0.95, 0];
      } else if (isStrawberry) {
        pos = [0, -0.45, 1.6];
        look = [0, -0.45, 0];
      } else {
        pos = [0, -0.65, 2.3];
        look = [0, -0.75, 0];
      }
    } else if (cameraPreset === 'reproductive') {
      if (isSunflower) {
        pos = [0.35, 2.1, 1.85];
        look = [0, 1.95, 0];
      } else if (isStrawberry) {
        pos = [0.18, 0.35, 1.1];
        look = [0, 0.14, 0];
      } else if (isChilli) {
        pos = [0.25, 0.60, 1.3];
        look = [0, 0.45, 0];
      } else if (isRose) {
        pos = [0.28, 0.85, 1.4];
        look = [0, 0.70, 0];
      } else if (isWheat || isRice) {
        pos = [0.22, 1.05, 1.4];
        look = [0, 0.90, 0];
      } else {
        pos = [0.35, 1.4, 1.65];
        look = [0, 1.15, 0];
      }
    } else {
      // 'overview' or default
      if (isSunflower) {
        pos = [0, 1.55, 3.4];
        look = [0, 1.25, 0];
      } else if (isStrawberry) {
        pos = [0, 0.38, 1.05];
        look = [0, 0.16, 0];
      } else if (isChilli) {
        pos = [0, 0.58, 1.55];
        look = [0, 0.42, 0];
      } else if (isRose) {
        pos = [0, 0.78, 1.75];
        look = [0, 0.52, 0];
      } else if (isWheat || isRice) {
        pos = [0, 0.78, 1.85];
        look = [0, 0.55, 0];
      } else {
        // Tomato default
        pos = [0, 0.95, 2.35];
        look = [0, 0.62, 0];
      }
    }

    transitionRef.current.targetCamPos.set(...pos);
    transitionRef.current.targetLookAt.set(...look);
    transitionRef.current.active = true;
  }, [cameraPresetToken, cameraPreset, speciesId]);

  // Handle Dedicated Organ Focus Transition when user clicks an anatomical label or organ
  useEffect(() => {
    if (!focusToken || !selectedPart) return;

    const { target, cameraPosition } = getOrganCameraTarget(selectedPart, plantState);
    transitionRef.current.targetCamPos.set(...cameraPosition);
    transitionRef.current.targetLookAt.set(...target);
    transitionRef.current.active = true;
  }, [focusToken, selectedPart, plantState]);

  // Cancel transition on user orbit/drag
  useEffect(() => {
    const controls = controlsRef?.current;
    if (!controls) return;
    const handleUserStart = () => {
      transitionRef.current.active = false;
    };
    controls.addEventListener('start', handleUserStart);
    return () => controls.removeEventListener('start', handleUserStart);
  }, [controlsRef]);

  useFrame((_, delta) => {
    if (!transitionRef.current.active) return;
    const controls = controlsRef?.current;
    if (!controls) return;

    // Smooth exponential damping
    const factor = Math.min(1, 1 - Math.exp(-8 * delta));

    camera.position.lerp(transitionRef.current.targetCamPos, factor);
    controls.target.lerp(transitionRef.current.targetLookAt, factor);
    controls.update();

    const distPos = camera.position.distanceTo(transitionRef.current.targetCamPos);
    const distTarget = controls.target.distanceTo(transitionRef.current.targetLookAt);

    if (distPos < 0.005 && distTarget < 0.005) {
      camera.position.copy(transitionRef.current.targetCamPos);
      controls.target.copy(transitionRef.current.targetLookAt);
      controls.update();
      transitionRef.current.active = false;
    }
  });

  return null;
}

/**
 * BotanicalScene:
 * Master 3D Viewport with physically grounded dynamic botanical lighting,
 * smooth orbit controls, soil cross-section, and species-specific procedural plant rendering.
 */
export function BotanicalScene({
  plantState,
  environment,
  showRoots = true,
  showAnnotations = true,
  annotationMode = 'overview',
  focusToken = 0,
  controlsRef,
  windIntensity = 0.35,
  selectedPart = null,
  onSelectPart = null,
  onDeselect = null,
  cameraPreset = 'overview',
  cameraPresetToken = 0,
}) {
  const speciesCfg = getSpeciesConfig(plantState?.speciesId);
  const isSunflower = speciesCfg.id === SPECIES_IDS.SUNFLOWER;

  // Sunlight parameter (0 - 100%)
  const light = environment?.light ?? 75;
  const lightFactor = Math.min(1.0, Math.max(0.0, light / 100));

  // 1. Dynamic Sun Elevation & Direction along a botanical diurnal solar arc
  const sunElevation = THREE.MathUtils.lerp(0.28, 1.18, lightFactor);
  const sunAzimuth = THREE.MathUtils.lerp(0.92, 0.52, lightFactor);
  const sunDist = 8.5;
  const sunPos = useMemo(() => [
    sunDist * Math.cos(sunElevation) * Math.sin(sunAzimuth),
    sunDist * Math.sin(sunElevation),
    sunDist * Math.cos(sunElevation) * Math.cos(sunAzimuth),
  ], [sunElevation, sunAzimuth]);

  // 2. Dynamic Sunlight Color Spectrum (Color Temperature)
  const sunColor = useMemo(() => {
    const c = new THREE.Color();
    if (lightFactor < 0.35) {
      const t = lightFactor / 0.35;
      c.set('#ff9e59').lerp(new THREE.Color('#ffe0a3'), t);
    } else if (lightFactor < 0.75) {
      const t = (lightFactor - 0.35) / 0.40;
      c.set('#ffe0a3').lerp(new THREE.Color('#fff4e8'), t);
    } else {
      const t = (lightFactor - 0.75) / 0.25;
      c.set('#fff4e8').lerp(new THREE.Color('#fffdfa'), t);
    }
    return c;
  }, [lightFactor]);

  // 3. Sunlight Intensity (Baseline twilight 0.28 preserves visibility even at 0% sunlight)
  const sunIntensity = 0.28 + lightFactor * 2.05;

  // 4. Ambient Hemispheric Light (Sky + Ground)
  const skyColor = useMemo(() => {
    const duskySky = new THREE.Color('#2d3844');
    const clearSky = new THREE.Color('#eef7eb');
    return duskySky.lerp(clearSky, 0.35 + lightFactor * 0.65);
  }, [lightFactor]);

  const groundColor = useMemo(() => {
    const darkEarth = new THREE.Color('#1f261c');
    const warmEarth = new THREE.Color('#384332');
    return darkEarth.lerp(warmEarth, lightFactor);
  }, [lightFactor]);

  const hemiIntensity = 0.38 + lightFactor * 0.34;

  // 5. Canvas Background Atmospheric Tone - Interactive Digital Greenhouse (#080F0C -> #0D1712)
  const bgColor = useMemo(() => {
    const deepNight = new THREE.Color('#080F0C');
    const labDark = new THREE.Color('#0D1712');
    return deepNight.lerp(labDark, Math.min(1.0, lightFactor * 1.2));
  }, [lightFactor]);

  return (
    <div
      className="flora-canvas-container"
      onClick={() => {
        // Clicking empty canvas space deselects the current part
        onDeselect?.();
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.18,
        }}
      >
        {/* Dynamic Studio Background Atmospheric Tone */}
        <color attach="background" args={[bgColor]} />

        {/* Cinematic Botanical Perspective Camera (Prominent Plant Centerpiece) */}
        <PerspectiveCamera
          makeDefault
          position={[0, 0.95, 2.35]}
          fov={38}
          near={0.1}
          far={350}
        />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={0.3}
          maxDistance={45.0}
          maxPolarAngle={Math.PI / 2 + 0.35}
          minPolarAngle={0.05}
          target={[0, 0.62, 0]}
        />

        {/* Programmatic Smooth Camera Transition Controller */}
        <CameraController
          cameraPreset={cameraPreset}
          cameraPresetToken={cameraPresetToken}
          selectedPart={selectedPart}
          focusToken={focusToken}
          plantState={plantState}
          controlsRef={controlsRef}
          speciesId={speciesCfg.id}
        />

        {/* 1. Hemispheric Sky/Ground Ambient Illumination */}
        <hemisphereLight
          args={[skyColor, groundColor, hemiIntensity]}
        />

        {/* Photorealistic IBL Greenhouse Environment (Poly Haven CC0) */}
        <Suspense fallback={null}>
          <Environment
            files="/assets/environments/abandoned_greenhouse_1k.hdr"
            background={false}
          />
        </Suspense>

        {/* 2. Key Sunlight with Dynamic Position, Color Temperature & Soft Shadows */}
        <directionalLight
          position={sunPos}
          intensity={sunIntensity}
          color={sunColor}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.00012}
          shadow-camera-near={0.5}
          shadow-camera-far={18}
          shadow-camera-left={-2.8}
          shadow-camera-right={2.8}
          shadow-camera-top={4.2}
          shadow-camera-bottom={-2.8}
        />

        {/* 3. Soft Foliar Translucency & Shadow Fill Light */}
        <directionalLight
          position={[-3.2, 2.8, -2.6]}
          intensity={0.25 + lightFactor * 0.25}
          color="#d5e8ce"
        />

        {/* 4. Front Fill Light for High-Resolution Visual Inspection Contrast */}
        <directionalLight
          position={[0, 1.8, 4.2]}
          intensity={0.22 + lightFactor * 0.14}
          color="#f2f7ef"
        />

        {/* 5. Subterranean Rhizosphere Warm Uplight (Illuminates subsoil root architecture) */}
        {showRoots && (
          <pointLight
            position={[0, -1.2, 1.1]}
            intensity={0.58}
            distance={4.5}
            color="#f5e6d2"
          />
        )}

        {/* 6. Ground & Subsoil Cutaway Environment */}
        <SoilCrossSection
          showRoots={showRoots}
          moisture={environment.moisture}
        />

        {/* 7. Botanical 3D Plant Model Selected by Species ID */}
        <Suspense fallback={null}>
          {speciesCfg.id === SPECIES_IDS.SUNFLOWER && (
            <RealisticSunflower
              plantState={plantState}
              showRoots={showRoots}
              windIntensity={windIntensity}
              selectedPart={selectedPart}
              onSelectPart={onSelectPart}
            />
          )}
          {speciesCfg.id === SPECIES_IDS.STRAWBERRY && (
            <RealisticStrawberryPlant
              plantState={plantState}
              showRoots={showRoots}
              windIntensity={windIntensity}
              selectedPart={selectedPart}
              onSelectPart={onSelectPart}
            />
          )}
          {speciesCfg.id === SPECIES_IDS.WHEAT && (
            <RealisticWheatPlant
              plantState={plantState}
              showRoots={showRoots}
              windIntensity={windIntensity}
              selectedPart={selectedPart}
              onSelectPart={onSelectPart}
            />
          )}
          {speciesCfg.id === SPECIES_IDS.CHILLI && (
            <RealisticChilliPlant
              plantState={plantState}
              showRoots={showRoots}
              windIntensity={windIntensity}
              selectedPart={selectedPart}
              onSelectPart={onSelectPart}
            />
          )}
          {speciesCfg.id === SPECIES_IDS.RICE && (
            <RealisticRicePlant
              plantState={plantState}
              showRoots={showRoots}
              windIntensity={windIntensity}
              selectedPart={selectedPart}
              onSelectPart={onSelectPart}
            />
          )}
          {speciesCfg.id === SPECIES_IDS.ROSE && (
            <RealisticRosePlant
              plantState={plantState}
              showRoots={showRoots}
              windIntensity={windIntensity}
              selectedPart={selectedPart}
              onSelectPart={onSelectPart}
            />
          )}
          {(speciesCfg.id === SPECIES_IDS.TOMATO || !Object.values(SPECIES_IDS).includes(speciesCfg.id)) && (
            <RealisticTomatoPlant
              plantState={plantState}
              showRoots={showRoots}
              windIntensity={windIntensity}
              selectedPart={selectedPart}
              onSelectPart={onSelectPart}
            />
          )}
        </Suspense>

        {/* 8. Persistent 3D Anatomy Annotations */}
        <AnatomyAnnotations
          plantState={plantState}
          showRoots={showRoots}
          visible={showAnnotations}
          annotationMode={annotationMode}
          selectedPart={selectedPart}
          onSelectPart={onSelectPart}
        />
      </Canvas>
    </div>
  );
}
