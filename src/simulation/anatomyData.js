import { getSpeciesConfig, SPECIES_IDS } from './species.js';

/**
 * Curated botanical taxonomy, anatomical functions, and educational context
 * for procedural plant organs in FLORA.
 */
export const BOTANICAL_ORGAN_CONTEXT = {
  apex: {
    name: 'Shoot Apex (Apical Meristem)',
    category: 'Vegetative Shoot',
    function: 'Houses undifferentiated apical meristem stem cells responsible for primary vertical axis elongation, phytomer organogenesis, and auxin-mediated apical dominance.',
    tissueType: 'Apical Meristematic & Protoderm',
    vascularization: 'Developing Procambium',
  },
  stem: {
    name: 'Main Tapered Stem',
    category: 'Vascular Axis',
    function: 'Provides mechanical upright support and houses the vascular cylinder (xylem for unidirectional hydraulic ascent, phloem for bidirectional photosynthate transport).',
    tissueType: 'Collenchyma, Sclerenchyma & Vascular Bundles',
    vascularization: 'Mature Fascicular Xylem & Phloem',
  },
  branch: {
    name: 'Sympodial Lateral Branch',
    category: 'Axillary Branching',
    function: 'Expands foliar light interception volume across horizontal spatial axes, bearing distal reproductive cymes.',
    tissueType: 'Lignified Secondary Xylem & Parenchyma',
    vascularization: 'Branch Trace Bundles',
  },
  leaf: {
    name: 'Foliage Leaf',
    category: 'Photosynthetic Organ',
    function: 'Primary organ of photosynthesis, carbon fixation (RuBisCO), transpirational cooling, and stomatal gas exchange (CO2/O2).',
    tissueType: 'Palisade & Spongy Mesophyll, Epidermis, Guard Cells',
    vascularization: 'Rachis & Reticulate Veinlets',
  },
  flower: {
    name: 'Floral Inflorescence',
    category: 'Reproductive Organ',
    function: 'Facilitates sexual reproduction; houses pollen-bearing anthers and pistil (stigma, style, ovary) awaiting entomophilous or self-pollination.',
    tissueType: 'Petaloid Perianth, Staminal Cone & Carpel',
    vascularization: 'Floral Pedicel Traces',
  },
  fruit: {
    name: 'Fleshy Fruit Berry',
    category: 'Reproductive Pericarp',
    function: 'Encloses and protects developing seeds, synthesizing sugars, carotenoids, and lycopene during maturation to facilitate zoochorous dispersal.',
    tissueType: 'Exocarp, Fleshy Mesocarp & Locular Gel',
    vascularization: 'Pedicel Abscission Ring & Pericarp Veins',
  },
  root_collar: {
    name: 'Root Collar (Crown Zone)',
    category: 'Rhizosphere Interface',
    function: 'Critical morphological junction transition between epigeal vascular stem and subterranean root axis; initiates adventitious brace roots.',
    tissueType: 'Suberized Transition Cortex',
    vascularization: 'Vascular Inversion Zone',
  },
  root_taproot: {
    name: 'Primary Taproot (Radicle Axis)',
    category: 'Subterranean Anchor',
    function: 'Penetrates deeply along gravity vector (positive geotropism) to access deep subsoil water tables and securely anchor upright canopy.',
    tissueType: 'Endodermis, Pericycle & Quiescent Center',
    vascularization: 'Central Stele Actinostele',
  },
  root_lateral: {
    name: 'Secondary Lateral Feeder Roots',
    category: 'Nutrient Absorption',
    function: 'Ramifies horizontally through upper rhizosphere topsoil, maximizing surface area for hydraulic uptake and mineral ion absorption (N-P-K).',
    tissueType: 'Root Epidermis with Micorrhizal Symbiosis Zone',
    vascularization: 'Lateral Branch Protoxylem',
  },
  stolon: {
    name: 'Stolon (Runner)',
    category: 'Vegetative Propagation Axis',
    function: 'Horizontal plagiotropic shoot extending from the basal crown, developing adventitious daughter plantlets at distant nodes for asexual propagation.',
    tissueType: 'Elongated Cortical Internode & Phloem Bundles',
    vascularization: 'Unifascicular Vascular Strand',
  },
  culm: {
    name: 'Hollow Herbaceous Culm',
    category: 'Graminoid Shoot Axis',
    function: 'Cylindrical hollow jointed stem with solid lignified nodes providing tensile resilience against lodging from wind and grain weight.',
    tissueType: 'Silicified Epidermis & Sclerenchyma Ring',
    vascularization: 'Atactostele Closed Collateral Bundles',
  },
  tiller: {
    name: 'Secondary Tillering Culm',
    category: 'Axillary Cespitose Shoot',
    function: 'Secondary vegetative branch emerging from basal unelongated nodes, dramatically multiplying photosynthetic canopy and potential inflorescence count.',
    tissueType: 'Meristematic Basal Crown & Leaf Sheaths',
    vascularization: 'Crown Intercalary Bundles',
  },
  spike: {
    name: 'Terminal Grain Spike (Ear)',
    category: 'Cereal Inflorescence',
    function: 'Distal reproductive axis bearing sessile spikelets with protecting glumes and awns, undergoing anthesis and subsequent grain filling (caryopsis).',
    tissueType: 'Rachis, Lemma, Palea & Developing Caryopsis',
    vascularization: 'Rachis Main Vascular Strands',
  },
  panicle: {
    name: 'Nodding Branched Panicle',
    category: 'Graminoid Inflorescence',
    function: 'Branched indeterminate inflorescence with pedicellate spikelets, arching under grain weight during the milky-dough to hard ripening stages.',
    tissueType: 'Rachilla, Glumes & Starchy Endosperm',
    vascularization: 'Pedicel Branch Strands',
  },
  hip: {
    name: 'Rose Hip (Hypanthium)',
    category: 'Pseudocarpic Berry',
    function: 'Fleshy urn-shaped receptacle enclosing hairy achene seeds; rich in ascorbic acid and carotenoids, turning bright scarlet-orange to signal avian dispersers.',
    tissueType: 'Hypertrophied Fleshy Hypanthium & Sclerotic Achene Pericarp',
    vascularization: 'Axial Receptacle Traces',
  },
};

/**
 * Resolves comprehensive organ details separating:
 * 1. Direct simulation measurements.
 * 2. Model-calculated values.
 * 3. General botanical explanations.
 * 4. Unavailable measurements (honest disclosure of engine limitations).
 */
export function getOrganDetails(part, plantState, speciesConfig = null) {
  if (!part) return null;

  const speciesCfg = speciesConfig || getSpeciesConfig(plantState?.speciesId);
  const isSunflower = speciesCfg.id === SPECIES_IDS.SUNFLOWER;
  const partType = part.type || 'organ';

  // Resolve base biological reference context
  let contextKey = 'stem';
  if (partType === 'apex') contextKey = 'apex';
  else if (partType === 'leaf') contextKey = 'leaf';
  else if (partType === 'branch') contextKey = 'branch';
  else if (partType === 'stolon' || part.id?.includes('stolon')) contextKey = 'stolon';
  else if (partType === 'culm' || part.id?.includes('culm')) contextKey = 'culm';
  else if (partType === 'tiller' || part.id?.includes('tiller')) contextKey = 'tiller';
  else if (partType === 'spike' || part.id?.includes('spike')) contextKey = 'spike';
  else if (partType === 'panicle' || part.id?.includes('panicle')) contextKey = 'panicle';
  else if (partType === 'hip' || part.id?.includes('hip')) contextKey = 'hip';
  else if (partType === 'flower') {
    if (speciesCfg.architecture?.fruitType === 'spike_caryopsis') contextKey = 'spike';
    else if (speciesCfg.architecture?.fruitType === 'panicle_grain') contextKey = 'panicle';
    else contextKey = 'flower';
  } else if (partType === 'fruit') {
    if (speciesCfg.architecture?.fruitType === 'rose_hip') contextKey = 'hip';
    else contextKey = 'fruit';
  } else if (partType === 'root') {
    if (part.order === 'collar') contextKey = 'root_collar';
    else if (part.order === 'taproot') contextKey = 'root_taproot';
    else contextKey = 'root_lateral';
  }

  const bioContext = BOTANICAL_ORGAN_CONTEXT[contextKey] || BOTANICAL_ORGAN_CONTEXT.stem;

  // 1. Direct Simulation Measurements (measured values from authoritative state)
  const directMeasurements = [];

  if (partType === 'stem' || partType === 'apex') {
    directMeasurements.push({
      label: 'Main Stem Height',
      value: `${(plantState.stemHeight * 10).toFixed(1)} cm`,
      source: 'Direct Engine State (stemHeight)',
    });
    directMeasurements.push({
      label: 'Base Caliper',
      value: `${(plantState.stemThickness * 10).toFixed(2)} cm`,
      source: 'Direct Engine State (stemThickness)',
    });
  }

  if (partType === 'root') {
    directMeasurements.push({
      label: 'Total Subsoil Depth',
      value: `${(plantState.rootDepth * 10).toFixed(1)} cm`,
      source: 'Direct Engine State (rootDepth)',
    });
    directMeasurements.push({
      label: 'Rhizosphere Spread',
      value: `${(plantState.rootSpread * 10).toFixed(1)} cm`,
      source: 'Direct Engine State (rootSpread)',
    });
  }

  if (partType === 'flower') {
    directMeasurements.push({
      label: 'Flower Count',
      value: isSunflower ? '1 Terminal Head' : `${plantState.flowerCount} blossoms`,
      source: 'Direct Engine State (flowerCount)',
    });
  }

  if (partType === 'fruit') {
    directMeasurements.push({
      label: 'Fruit Count',
      value: `${plantState.fruitCount} berries`,
      source: 'Direct Engine State (fruitCount)',
    });
    directMeasurements.push({
      label: 'Ripening Progress',
      value: `${Math.round((plantState.fruitMaturity || 0) * 100)}%`,
      source: 'Direct Engine State (fruitMaturity)',
    });
  }

  if (partType === 'leaf') {
    directMeasurements.push({
      label: 'Total Plant Leaves',
      value: `${plantState.leafCount} compound leaves`,
      source: 'Direct Engine State (leafCount)',
    });
    directMeasurements.push({
      label: 'Expansion Maturity',
      value: `${Math.round((part.maturity || 0) * 100)}%`,
      source: 'Procedural Leaf Age Factor',
    });
  }

  // Common physiological health & vigour (direct from engine)
  directMeasurements.push({
    label: 'Whole-Plant Health',
    value: `${Math.round(plantState.health)}%`,
    source: 'Direct Physiological Health',
  });
  directMeasurements.push({
    label: 'Metabolic Vigour',
    value: `${(plantState.growthRate * 100).toFixed(0)}%`,
    source: 'Calculated Growth Multiplier',
  });

  // 2. Model-Calculated Values (derived by procedural geometry generator)
  const modelCalculatedValues = [];

  if (partType === 'leaf') {
    const isWilting = plantState.waterStress > 0.4;
    modelCalculatedValues.push({
      label: 'Hydration Turgor',
      value: isWilting ? 'Flaccid (Wilting droop active)' : 'Turgid (Full cell pressure)',
      derivation: 'Derived from whole-plant hydraulic waterStress',
    });
    modelCalculatedValues.push({
      label: 'Foliar Architecture',
      value: isSunflower ? 'Simple Cordate with reticulate venation' : 'Compound pinnate (terminal + 4 lateral pinnae)',
      derivation: 'Species Architectural Descriptor',
    });
  }

  if (partType === 'fruit') {
    const maturity = part.maturity || plantState.fruitMaturity || 0;
    const ripeningStage = maturity > 0.8 ? 'Crimson Ripe' : maturity > 0.45 ? 'Breaker Phase' : 'Immature Green';
    modelCalculatedValues.push({
      label: 'Ripening Stage',
      value: ripeningStage,
      derivation: 'Calculated from fruitMaturity color curve',
    });
    if (part.size) {
      modelCalculatedValues.push({
        label: 'Calculated Berry Diameter',
        value: `${(part.size * 10).toFixed(1)} cm`,
        derivation: 'Mesh procedural bounding geometry',
      });
    }
  }

  if (partType === 'branch') {
    if (part.height) {
      modelCalculatedValues.push({
        label: 'Node Height',
        value: `${(part.height * 10).toFixed(1)} cm`,
        derivation: 'Phyllotactic node position on main stem',
      });
    }
    if (part.length) {
      modelCalculatedValues.push({
        label: 'Branch Length',
        value: `${(part.length * 10).toFixed(1)} cm`,
        derivation: 'Procedural elongation curve',
      });
    }
  }

  // 3. General Botanical Context & Reference Information
  const botanicalContext = {
    organName: bioContext.name,
    category: bioContext.category,
    primaryFunction: bioContext.function,
    function: bioContext.function,
    tissueType: bioContext.tissueType,
    vascularization: bioContext.vascularization,
    speciesHabit: `${speciesCfg.variety} ${speciesCfg.commonName} (${speciesCfg.scientificName})`,
  };

  // 4. Unavailable Measurements (Transparent disclosure of engine limitations)
  const unavailableMeasurements = [
    {
      metric: 'Per-Organ Stomatal Transpiration Flow',
      reason: 'Modeled globally at whole-plant level via waterStress; individual leaf sap-flow sensors are not simulated.',
    },
    {
      metric: 'Localized Cellular Nutrient Concentration (N-P-K)',
      reason: 'Soil mineral availability is simulated globally; per-organ nutrient partitioning is not metered.',
    },
  ];

  if (partType === 'flower') {
    unavailableMeasurements.push({
      metric: 'Nectar Secretion & Pollen Grain Viability Count',
      reason: 'Generative viability is modeled through overall health, not individual pollen grain counting.',
    });
  }

  return {
    partId: part.id,
    partName: part.name || bioContext.name,
    partType,
    species: speciesCfg.commonName || (isSunflower ? 'Sunflower' : 'Tomato'),
    attachment: part.parent || 'Main Plant Body',
    directMeasurements,
    modelCalculatedValues,
    botanicalContext,
    unavailableMeasurements,
  };
}

/**
 * Calculates optimal 3D camera lookAt target and camera position offset
 * for smoothly focusing on the selected plant organ.
 */
export function getOrganCameraTarget(part, plantState) {
  if (!part || !plantState) {
    return {
      target: [0, 0.45, 0],
      cameraPosition: [0, 1.25, 3.5],
      distance: 3.5,
    };
  }

  const stemHeight = plantState.stemHeight || 0.0;
  const rootDepth = plantState.rootDepth || 0.1;
  const isSunflower = plantState.speciesId === SPECIES_IDS.SUNFLOWER;
  const isStrawberry = plantState.speciesId === SPECIES_IDS.STRAWBERRY;
  const type = part.type;
  const id = part.id || '';

  let target = [0, stemHeight * 0.45, 0];
  let distance = isStrawberry ? 0.9 : 1.4;

  if (type === 'apex' || id.includes('apex')) {
    target = [0, stemHeight + 0.02, 0];
    distance = isStrawberry ? 0.75 : 1.0;
  } else if (type === 'stem' || type === 'culm') {
    target = [0, stemHeight * 0.45, 0];
    distance = isSunflower ? 1.8 : (isStrawberry ? 0.75 : 1.5);
  } else if (type === 'stolon' || id.includes('stolon')) {
    target = [0.15, 0.05, 0.1];
    distance = 0.8;
  } else if (type === 'tiller' || id.includes('tiller')) {
    target = [0.08, stemHeight * 0.4, 0.05];
    distance = 1.2;
  } else if (type === 'leaf') {
    target = isSunflower
      ? [-0.15, stemHeight * 0.52, 0.1]
      : (isStrawberry ? [-0.1, 0.12, 0.08] : [-0.14, stemHeight * 0.48, 0.06]);
    distance = isStrawberry ? 0.8 : 1.15;
  } else if (type === 'branch') {
    target = [0.16, stemHeight * 0.38, 0.06];
    distance = 1.2;
  } else if (type === 'flower' || type === 'spike' || type === 'panicle') {
    if (isSunflower) {
      target = [0, stemHeight + 0.05, 0.08];
      distance = 1.35;
    } else if (isStrawberry) {
      target = [0.08, 0.14, 0.08];
      distance = 0.75;
    } else {
      target = [0.16, Math.max(0.2, stemHeight * 0.80), 0.08];
      distance = 0.95;
    }
  } else if (type === 'fruit' || type === 'hip') {
    if (isStrawberry) {
      target = [0.12, 0.08, 0.12];
      distance = 0.75;
    } else if ((part.maturity !== undefined && part.maturity >= 0.45) || id.includes('ripening')) {
      target = [-0.16, stemHeight * 0.66, 0.10];
      distance = 0.95;
    } else {
      target = [0.17, stemHeight * 0.62, 0.12];
      distance = 0.95;
    }
  } else if (type === 'root') {
    if (part.order === 'collar' || id.includes('collar')) {
      target = [0, 0.015, 0];
      distance = 1.2;
    } else if (part.order === 'taproot' || id.includes('primary') || id.includes('taproot')) {
      target = [0, -rootDepth * 0.60, 0];
      distance = isSunflower ? 1.6 : 1.4;
    } else {
      target = [-0.2, -rootDepth * 0.35, 0.04];
      distance = 1.3;
    }
  }

  // Camera framing position with slight diagonal elevation for optimal 3D perspective
  const cameraPosition = [
    target[0] + 0.32 * distance,
    target[1] + 0.24 * distance,
    target[2] + 0.92 * distance,
  ];

  return {
    target,
    cameraPosition,
    distance,
  };
}
