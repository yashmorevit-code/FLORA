import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { SPECIES_IDS, getSpeciesConfig } from '../simulation/species.js';

/**
 * Botanical Anatomy Callout Component
 * Renders an anchor dot at the 3D organ coordinate, a clean vector leader line,
 * and a compact, restrained scientific callout badge offset from the plant silhouette.
 */
function AnatomyCallout({
  position,
  label,
  subLabel,
  side = 'right', // 'right' | 'left'
  verticalOffset = 0,
  isSelected = false,
  isFocusedMode = false,
  onClick,
}) {
  const isLeft = side === 'left';

  return (
    <Html
      position={position}
      center
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: isSelected ? 35 : isFocusedMode ? 30 : 15,
      }}
    >
      <div
        className={`botanical-callout-wrapper ${isLeft ? 'callout-left' : 'callout-right'} ${isSelected ? 'selected' : ''}`}
        style={{
          pointerEvents: 'auto',
          transform: `translate(${isLeft ? '-100%' : '0%'}, calc(-50% + ${verticalOffset}px))`,
        }}
      >
        {/* Precise Anchor Dot on the Organ Surface */}
        <div className="callout-anchor-dot" />

        {/* Vector Connector Line with Leader Angle */}
        <div className="callout-connector-line" />

        {/* Compact, Restrained Scientific Callout Pill */}
        <button
          className="callout-pill"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          title={`Click to inspect anatomical details of ${label}`}
        >
          <span className="callout-dot" />
          <div className="callout-text-group">
            <span className="callout-title">{label}</span>
            {subLabel && <span className="callout-sub">{subLabel}</span>}
          </div>
          {isSelected && <span className="callout-badge-active">INSPECTING</span>}
        </button>
      </div>
    </Html>
  );
}

/**
 * AnatomyAnnotations:
 * Polished, collision-aware 3D botanical annotation system.
 *
 * Supported Interaction Modes:
 * - 'overview' (default): Displays ~3-4 essential anatomical landmarks (Stem, Leaf, Flower/Fruit, Root).
 *   Leaves the plant silhouette clear, unobstructed, and readable.
 * - 'all' (Anatomy Mode): Displays full anatomical breakdown with collision-aware vertical spacing.
 * - 'focused': When an organ is actively selected, isolates and prominently highlights its anchor.
 */
export function AnatomyAnnotations({
  plantState,
  showRoots = true,
  visible = true,
  annotationMode = 'overview', // 'overview' | 'all' | 'hidden'
  selectedPart = null,
  onSelectPart = null,
}) {
  if (!visible || annotationMode === 'hidden' || !plantState) return null;

  const speciesCfg = getSpeciesConfig(plantState.speciesId);
  const speciesId = speciesCfg.id;
  const isSunflower = speciesId === SPECIES_IDS.SUNFLOWER;
  const stemHeight = plantState.stemHeight || 0.0;
  const rootDepth = plantState.rootDepth || 0.1;
  const rootSpread = plantState.rootSpread || 0.1;
  const overallProgress = plantState.overallProgress || 0.0;
  const flowerCount = plantState.flowerCount || 0;
  const fruitCount = plantState.fruitCount || 0;
  const fruitMaturity = plantState.fruitMaturity || 0.0;

  // 1. Build authoritative list of physically existing organs in the current procedural model
  const allAnnotations = useMemo(() => {
    const list = [];

    // ==========================================
    // 1. SHOOT APEX (Apical Meristem)
    // ==========================================
    if (stemHeight > 0.04) {
      list.push({
        id: 'shoot-apex',
        label: 'Shoot Apex',
        subLabel: 'Apical Meristem',
        side: 'right',
        yOrder: stemHeight + 0.02,
        position: [0.01, stemHeight + 0.02, 0.01],
        priority: 3,
        partData: {
          id: 'shoot-apex',
          name: 'Shoot Apex (Apical Meristem)',
          type: 'apex',
          species: speciesCfg.commonName,
          parent: 'Main Stem Node',
          height: stemHeight,
        },
      });
    }

    // ==========================================
    // 2. MAIN STEM / CULM / CANE / CROWN
    // ==========================================
    if (stemHeight >= 0.04) {
      let stemLabel = 'Main Stem';
      let stemSub = 'Sympodial Axis';
      if (isSunflower) { stemLabel = 'Column Stem'; stemSub = 'Lignified Axis'; }
      else if (speciesId === SPECIES_IDS.STRAWBERRY) { stemLabel = 'Basal Crown'; stemSub = 'Compressed Stem'; }
      else if (speciesId === SPECIES_IDS.WHEAT || speciesId === SPECIES_IDS.RICE) { stemLabel = 'Hollow Culm'; stemSub = 'Jointed Stem'; }
      else if (speciesId === SPECIES_IDS.CHILLI) { stemLabel = 'Branching Stem'; stemSub = 'Lignifying Axis'; }
      else if (speciesId === SPECIES_IDS.ROSE) { stemLabel = 'Woody Cane'; stemSub = 'Prickly Stem'; }

      list.push({
        id: 'stem-main',
        label: stemLabel,
        subLabel: stemSub,
        side: 'left',
        yOrder: Math.max(0.04, stemHeight * 0.35),
        position: [-0.015, Math.max(0.04, stemHeight * 0.35), 0.0],
        priority: 1,
        partData: {
          id: `stem-${speciesId}-main`,
          name: `${speciesCfg.commonName} ${stemLabel}`,
          type: 'stem',
          species: speciesCfg.commonName,
          parent: 'Root Crown',
        },
      });
    }

    // ==========================================
    // 3. FOLIAGE LEAF
    // ==========================================
    if (overallProgress >= 0.15) {
      let leafLabel = 'Compound Leaf';
      let leafSub = 'Pinnate Foliage';
      if (isSunflower) { leafLabel = 'Cordate Leaf'; leafSub = 'Photosynthetic Blade'; }
      else if (speciesId === SPECIES_IDS.STRAWBERRY) { leafLabel = 'Trifoliate Leaf'; leafSub = 'Serrate Margin Blade'; }
      else if (speciesId === SPECIES_IDS.WHEAT || speciesId === SPECIES_IDS.RICE) { leafLabel = 'Linear Leaf'; leafSub = 'Graminoid Blade'; }
      else if (speciesId === SPECIES_IDS.CHILLI) { leafLabel = 'Ovate Leaf'; leafSub = 'Acuminate Foliage'; }
      else if (speciesId === SPECIES_IDS.ROSE) { leafLabel = 'Odd-Pinnate Leaf'; leafSub = 'Serrate Rose Leaf'; }

      list.push({
        id: 'leaf-main',
        label: leafLabel,
        subLabel: leafSub,
        side: 'left',
        yOrder: Math.max(0.08, stemHeight * 0.52),
        position: [-0.14, Math.max(0.08, stemHeight * 0.48), 0.06],
        priority: 1,
        partData: {
          id: `leaf-${speciesId}-main`,
          name: `${speciesCfg.commonName} ${leafLabel}`,
          type: 'leaf',
          species: speciesCfg.commonName,
          maturity: 0.9,
          parent: 'Main Stem Node',
        },
      });
    }

    // ==========================================
    // 4. SPECIALIZED VEGETATIVE STRUCTURES (Stolons / Tillers / Lateral Branches)
    // ==========================================
    if (speciesId === SPECIES_IDS.STRAWBERRY && overallProgress >= 0.45) {
      list.push({
        id: 'stolon-runner',
        label: 'Stolon Runner',
        subLabel: 'Creeping Shoot',
        side: 'right',
        yOrder: 0.05,
        position: [0.18, 0.04, 0.12],
        priority: 2,
        partData: {
          id: 'stolon-runner-1',
          name: 'Strawberry Stolon (Runner)',
          type: 'stolon',
          species: 'Strawberry',
          parent: 'Basal Crown Node',
        },
      });
    } else if ((speciesId === SPECIES_IDS.WHEAT || speciesId === SPECIES_IDS.RICE) && overallProgress >= 0.25) {
      list.push({
        id: 'tiller-clump',
        label: 'Tillering Clump',
        subLabel: 'Cespitose Shoots',
        side: 'right',
        yOrder: stemHeight * 0.3,
        position: [0.12, stemHeight * 0.25, 0.05],
        priority: 2,
        partData: {
          id: `tiller-${speciesId}-group`,
          name: `${speciesCfg.commonName} Tillering Clump`,
          type: 'tiller',
          species: speciesCfg.commonName,
          parent: 'Crown Node',
        },
      });
    } else if (speciesId === SPECIES_IDS.TOMATO && overallProgress >= 0.35 && stemHeight >= 0.40) {
      list.push({
        id: 'branch-lateral',
        label: 'Lateral Branch',
        subLabel: 'Axillary Shoot',
        side: 'right',
        yOrder: stemHeight * 0.38,
        position: [0.16, stemHeight * 0.38, 0.06],
        priority: 3,
        partData: {
          id: 'branch-0',
          name: 'Sympodial Lateral Branch',
          type: 'branch',
          species: 'Tomato',
          height: stemHeight * 0.36,
          length: 0.35,
          parent: 'Main Stem Node',
        },
      });
    }

    // ==========================================
    // 5. FLOWERS / INFLORESCENCES / SPIKES / PANICLES
    // ==========================================
    if (flowerCount > 0) {
      if (isSunflower) {
        list.push({
          id: 'sunflower-flower',
          label: 'Capitulum Head',
          subLabel: fruitMaturity > 0.4 ? 'Disk Anthesis' : 'Ray Florets',
          side: 'right',
          yOrder: stemHeight + 0.06,
          position: [0.18, stemHeight + 0.06, 0.08],
          priority: 1,
          partData: {
            id: 'sunflower-flower-head',
            name: 'Capitulum Pseudanthium (Flower Head)',
            type: 'flower',
            species: 'Sunflower',
            maturity: fruitMaturity,
            parent: 'Main Stem Apex',
          },
        });
      } else if (speciesId === SPECIES_IDS.WHEAT) {
        list.push({
          id: 'wheat-spike',
          label: 'Terminal Spike',
          subLabel: 'Grain Ear with Awns',
          side: 'right',
          yOrder: stemHeight + 0.05,
          position: [0.08, stemHeight + 0.05, 0.04],
          priority: 1,
          partData: {
            id: 'spike-wheat-main',
            name: 'Terminal Grain Spike (Ear)',
            type: 'spike',
            species: 'Wheat',
            maturity: fruitMaturity,
            parent: 'Culm Rachis',
          },
        });
      } else if (speciesId === SPECIES_IDS.RICE) {
        list.push({
          id: 'rice-panicle',
          label: 'Nodding Panicle',
          subLabel: 'Spikelet Inflorescence',
          side: 'right',
          yOrder: stemHeight + 0.02,
          position: [0.10, stemHeight + 0.02, 0.04],
          priority: 1,
          partData: {
            id: 'panicle-rice-main',
            name: 'Nodding Branched Panicle',
            type: 'panicle',
            species: 'Rice',
            maturity: fruitMaturity,
            parent: 'Culm Rachis',
          },
        });
      } else {
        let flowerLabel = 'Flower Blossom';
        let flowerSub = 'Inflorescence';
        if (speciesId === SPECIES_IDS.STRAWBERRY) { flowerLabel = 'White Blossom'; flowerSub = '5-Petaled Flower'; }
        else if (speciesId === SPECIES_IDS.CHILLI) { flowerLabel = 'Solitary Flower'; flowerSub = 'Rotate Corolla'; }
        else if (speciesId === SPECIES_IDS.ROSE) { flowerLabel = 'Rose Blossom'; flowerSub = 'Multi-Petaled Corolla'; }

        list.push({
          id: 'flower-cluster',
          label: flowerLabel,
          subLabel: flowerSub,
          side: 'right',
          yOrder: Math.max(0.12, stemHeight * 0.75),
          position: [0.15, Math.max(0.12, stemHeight * 0.75), 0.08],
          priority: fruitCount > 0 ? 2 : 1,
          partData: {
            id: `flower-${speciesId}-0`,
            name: `${speciesCfg.commonName} ${flowerLabel}`,
            type: 'flower',
            species: speciesCfg.commonName,
            maturity: 0.85,
            parent: 'Inflorescence',
          },
        });
      }
    }

    // ==========================================
    // 6. FRUIT / BERRY / POD / HIP
    // ==========================================
    if (fruitCount > 0) {
      let fruitLabel = 'Ripening Fruit';
      let fruitSub = 'Maturing Berry';
      if (speciesId === SPECIES_IDS.STRAWBERRY) { fruitLabel = 'Aggregate Berry'; fruitSub = 'Achene Receptacle'; }
      else if (speciesId === SPECIES_IDS.CHILLI) { fruitLabel = 'Pendant Pepper'; fruitSub = 'Pod Berry'; }
      else if (speciesId === SPECIES_IDS.ROSE) { fruitLabel = 'Rose Hip'; fruitSub = 'Scarlet Hypanthium'; }

      list.push({
        id: 'fruit-ripening',
        label: fruitLabel,
        subLabel: fruitSub,
        side: 'left',
        yOrder: Math.max(0.08, stemHeight * 0.60),
        position: [-0.15, Math.max(0.08, stemHeight * 0.60), 0.08],
        priority: 1,
        partData: {
          id: `fruit-${speciesId}-0`,
          name: `${speciesCfg.commonName} ${fruitLabel}`,
          type: 'fruit',
          species: speciesCfg.commonName,
          maturity: fruitMaturity,
          parent: 'Fruiting Truss',
        },
      });
    }

    // ==========================================
    // 8. ROOT COLLAR (Crown Zone)
    // ==========================================
    if (showRoots && rootDepth >= 0.04) {
      list.push({
        id: 'root-collar',
        label: 'Root Collar',
        subLabel: 'Crown Interface Zone',
        side: 'right',
        yOrder: 0.015,
        position: [0.06, 0.015, 0.04],
        priority: 2,
        partData: {
          id: 'root-collar',
          name: 'Root Collar (Crown Zone)',
          type: 'root',
          order: 'collar',
          species: isSunflower ? 'Sunflower' : 'Tomato',
          depth: 0.0,
          parent: 'Stem Base / Soil Interface',
        },
      });
    }

    // ==========================================
    // 9. LATERAL ROOTS
    // ==========================================
    if (showRoots && rootSpread >= 0.12 && rootDepth >= 0.15) {
      list.push({
        id: 'root-lateral',
        label: 'Lateral Roots',
        subLabel: 'Secondary Feeder Roots',
        side: 'left',
        yOrder: -rootDepth * 0.32,
        position: [-rootSpread * 0.55, -rootDepth * 0.32, 0.04],
        priority: 3,
        partData: {
          id: 'root-lateral-node',
          name: 'Secondary Lateral Feeder Roots',
          type: 'root',
          order: 'lateral',
          species: isSunflower ? 'Sunflower' : 'Tomato',
          depth: rootDepth * 0.32,
          parent: 'Primary Taproot',
        },
      });
    }

    // ==========================================
    // 10. PRIMARY ROOT (Taproot)
    // ==========================================
    if (showRoots && rootDepth >= 0.05) {
      list.push({
        id: 'root-primary',
        label: isSunflower ? 'Anchoring Taproot' : 'Primary Root',
        subLabel: isSunflower ? 'Subsoil Anchor' : 'Primary Taproot',
        side: 'right',
        yOrder: -rootDepth * 0.65,
        position: [0.02, -rootDepth * 0.65, 0.02],
        priority: 1, // Core landmark
        partData: {
          id: 'root-taproot',
          name: isSunflower ? 'Anchoring Taproot' : 'Primary Root (Taproot)',
          type: 'root',
          order: 'taproot',
          species: isSunflower ? 'Sunflower' : 'Tomato',
          depth: rootDepth,
          parent: 'Root Collar',
        },
      });
    }

    return list;
  }, [
    isSunflower,
    stemHeight,
    rootDepth,
    rootSpread,
    overallProgress,
    flowerCount,
    fruitCount,
    fruitMaturity,
    showRoots,
  ]);

  // 2. Filter and structure annotations based on the active display mode
  const displayedAnnotations = useMemo(() => {
    // FOCUSED INSPECTION MODE: If a specific organ is selected, only display its callout
    if (selectedPart) {
      const match = allAnnotations.find(
        (a) =>
          a.partData.id === selectedPart.id ||
          (a.partData.type === selectedPart.type && a.partData.order === selectedPart.order)
      );
      if (match) {
        return [{ ...match, verticalOffset: 0 }];
      }
    }

    // OVERVIEW MODE: Restrained density, strictly max ~3-4 essential landmarks
    if (annotationMode === 'overview') {
      const selected = [];

      // 1. Shoot landmark: Main Stem (or Apex if seedling)
      const stemItem = allAnnotations.find((a) => a.id === 'stem-main');
      const apexItem = allAnnotations.find((a) => a.id === 'shoot-apex');
      if (stemItem && overallProgress >= 0.20) selected.push(stemItem);
      else if (apexItem) selected.push(apexItem);

      // 2. Foliar landmark: Compound / Cordate leaf
      const leafItem = allAnnotations.find((a) => a.id === 'leaf-compound');
      if (leafItem) selected.push(leafItem);

      // 3. Generative landmark: Ripening fruit, developing fruit, or flower
      const ripeItem = allAnnotations.find((a) => a.id === 'fruit-ripening');
      const greenItem = allAnnotations.find((a) => a.id === 'fruit-developing');
      const flowerItem = allAnnotations.find(
        (a) => a.id === 'flower-cluster' || a.id === 'sunflower-flower'
      );
      if (ripeItem) selected.push(ripeItem);
      else if (greenItem) selected.push(greenItem);
      else if (flowerItem) selected.push(flowerItem);

      // 4. Subterranean landmark: Primary Taproot (if roots enabled)
      if (showRoots) {
        const rootItem = allAnnotations.find((a) => a.id === 'root-primary');
        if (rootItem) selected.push(rootItem);
      }

      // Compute collision relaxation on the selected items
      return applyCollisionSpacing(selected);
    }

    // ALL ANATOMY MODE: Show all available organs with collision relaxation
    return applyCollisionSpacing(allAnnotations);
  }, [allAnnotations, annotationMode, selectedPart, showRoots, overallProgress]);

  return (
    <group position={[0, 0, 0]}>
      {displayedAnnotations.map((ann) => {
        const isSelected =
          selectedPart &&
          (selectedPart.id === ann.partData.id ||
            (ann.partData.type === 'leaf' && selectedPart.type === 'leaf') ||
            (ann.partData.type === 'flower' && selectedPart.type === 'flower') ||
            (ann.partData.type === 'fruit' &&
              selectedPart.type === 'fruit' &&
              selectedPart.maturity === ann.partData.maturity) ||
            (ann.partData.type === 'root' &&
              selectedPart.type === 'root' &&
              selectedPart.order === ann.partData.order));

        return (
          <AnatomyCallout
            key={ann.id}
            position={ann.position}
            label={ann.label}
            subLabel={ann.subLabel}
            side={ann.side}
            verticalOffset={ann.verticalOffset || 0}
            isSelected={Boolean(isSelected)}
            isFocusedMode={Boolean(selectedPart)}
            onClick={() => onSelectPart?.(ann.partData)}
          />
        );
      })}
    </group>
  );
}

/**
 * Lightweight collision detection and relaxation algorithm.
 * Groups annotations by side ('left' vs 'right') and sorts by vertical Y position.
 * Displaces labels vertically if they are within collision range to prevent overlap.
 */
function applyCollisionSpacing(items) {
  const leftGroup = items.filter((it) => it.side === 'left').sort((a, b) => b.yOrder - a.yOrder);
  const rightGroup = items.filter((it) => it.side === 'right').sort((a, b) => b.yOrder - a.yOrder);

  const relaxSide = (group) => {
    const minPixelGap = 36; // Minimum vertical gap in pixels between label centers
    const result = [];

    for (let i = 0; i < group.length; i++) {
      let offset = 0;
      if (i > 0) {
        const prev = result[i - 1];
        // Vertical distance in 3D scene units approximated to screen space
        const dy3d = prev.yOrder - group[i].yOrder;
        const estPixelDiff = dy3d * 90; // scale factor to screen pixels

        if (estPixelDiff < minPixelGap) {
          offset = prev.verticalOffset + (minPixelGap - estPixelDiff);
        }
      }
      result.push({ ...group[i], verticalOffset: offset });
    }
    return result;
  };

  return [...relaxSide(leftGroup), ...relaxSide(rightGroup)];
}
