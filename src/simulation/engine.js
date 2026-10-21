import { PlantStages, LifecyclePhases, STAGE_CONFIGS } from './types.js';
import { getSpeciesConfig, SPECIES_IDS, getActiveStage } from './species.js';

// Absolute physical boundary limits across all botanical species
export const MAX_STEM_HEIGHT = 3.6;     // meters
export const MAX_STEM_THICKNESS = 0.24; // meters
export const MAX_ROOT_DEPTH = 3.0;      // meters
export const MAX_ROOT_SPREAD = 2.2;     // meters

/**
 * Updates water and waterlogging stress (0 - 100%).
 */
export function updateWaterStress(moisture, currentWaterStress, currentWaterloggingStress, dt, speciesConfig = null) {
  let waterStress = currentWaterStress;
  let waterloggingStress = currentWaterloggingStress;

  const opt = speciesConfig?.optimalEnvironment || {
    moistureMin: 45,
    moistureMax: 75,
  };

  const droughtThreshold = opt.moistureMin - 5;
  const saturationThreshold = opt.moistureMax + 10;

  if (moisture < droughtThreshold) {
    const severity = (droughtThreshold - moisture) / droughtThreshold;
    waterStress = Math.min(1.0, waterStress + severity * 0.25 * dt);
  } else {
    waterStress = Math.max(0.0, waterStress - 0.18 * dt);
  }

  if (moisture > saturationThreshold) {
    const severity = (moisture - saturationThreshold) / (100 - saturationThreshold);
    waterloggingStress = Math.min(1.0, waterloggingStress + severity * 0.22 * dt);
  } else {
    waterloggingStress = Math.max(0.0, waterloggingStress - 0.15 * dt);
  }

  return { waterStress, waterloggingStress };
}

/**
 * Updates light stress (0 - 100%).
 */
export function updateLightStress(light, currentStress, dt, speciesConfig = null) {
  let lightStress = currentStress;
  const opt = speciesConfig?.optimalEnvironment || {
    lightMin: 60,
    lightMax: 90,
  };

  const shadeThreshold = opt.lightMin - 15;
  const scorchThreshold = Math.min(95, opt.lightMax + 8);

  if (light < shadeThreshold) {
    const severity = (shadeThreshold - light) / shadeThreshold;
    lightStress = Math.min(1.0, lightStress + severity * 0.12 * dt);
  } else if (light > scorchThreshold) {
    const severity = (light - scorchThreshold) / (100 - scorchThreshold);
    lightStress = Math.min(1.0, lightStress + severity * 0.08 * dt);
  } else {
    lightStress = Math.max(0.0, lightStress - 0.12 * dt);
  }
  return lightStress;
}

/**
 * Updates temperature stress (°C).
 */
export function updateTemperatureStress(temp, currentStress, dt, speciesConfig = null) {
  let tempStress = currentStress;
  const opt = speciesConfig?.optimalEnvironment || {
    temperatureMin: 20,
    temperatureMax: 28,
  };

  const chillingThreshold = opt.temperatureMin - 2;
  const heatThreshold = opt.temperatureMax + 2;

  if (temp < chillingThreshold) {
    const severity = Math.min(1.0, (chillingThreshold - temp) / 10);
    tempStress = Math.min(1.0, tempStress + severity * 0.15 * dt);
  } else if (temp > heatThreshold) {
    const severity = Math.min(1.0, (temp - heatThreshold) / 10);
    tempStress = Math.min(1.0, tempStress + severity * 0.15 * dt);
  } else {
    tempStress = Math.max(0.0, tempStress - 0.12 * dt);
  }
  return tempStress;
}

/**
 * Updates nutrient stress (0 - 100%).
 */
export function updateNutrientStress(nutrients, currentStress, dt, speciesConfig = null) {
  let nutStress = currentStress;
  const opt = speciesConfig?.optimalEnvironment || {
    nutrientsMin: 50,
  };

  const defThreshold = Math.max(25, opt.nutrientsMin - 15);

  if (nutrients < defThreshold) {
    const severity = (defThreshold - nutrients) / defThreshold;
    nutStress = Math.min(1.0, nutStress + severity * 0.12 * dt);
  } else {
    nutStress = Math.max(0.0, nutStress - 0.12 * dt);
  }
  return nutStress;
}

/**
 * Calculates current growth rate multiplier based on stresses and health.
 */
export function calculateGrowthRate(stresses, health) {
  const { waterStress, waterloggingStress, lightStress, tempStress, nutrientStress } = stresses;
  const maxFactorStress = Math.max(
    waterStress * 0.85,
    waterloggingStress * 0.9,
    lightStress * 0.7,
    tempStress * 0.8,
    nutrientStress * 0.6
  );
  const healthPenalty = ((100 - health) / 100) * 0.5;
  const growthRate = Math.max(0.02, 1.0 - maxFactorStress * 0.85 - healthPenalty);
  return growthRate;
}

/**
 * Determines current derived high-level lifecycle phase
 */
export function deriveLifecyclePhase(state, speciesConfig = null) {
  if (state.isTerminal || state.stage === PlantStages.TERMINAL) {
    return {
      phase: LifecyclePhases.TERMINAL,
      label: 'Lifecycle Complete (Terminal)',
    };
  }
  if (
    state.stage === PlantStages.EARLY_SENESCENCE ||
    state.stage === PlantStages.ADVANCED_SENESCENCE ||
    (state.senescenceProgress && state.senescenceProgress > 0)
  ) {
    return {
      phase: LifecyclePhases.SENESCENCE,
      label: state.stage === PlantStages.ADVANCED_SENESCENCE ? 'Advanced Senescence' : 'Early Senescence',
    };
  }
  if (state.health < 35) {
    return {
      phase: LifecyclePhases.DECLINE,
      label: 'Physiological Decline',
    };
  }
  if (state.totalStress > 0.25) {
    return {
      phase: LifecyclePhases.ENVIRONMENTAL_STRESS,
      label: 'Environmental Stress',
    };
  }
  if (state.stage === PlantStages.MATURE || state.overallProgress >= 0.98) {
    return {
      phase: LifecyclePhases.FULL_MATURITY,
      label: 'Full Maturity (Adult Canopy)',
    };
  }

  const isSunflower = (speciesConfig?.id || state.speciesId) === SPECIES_IDS.SUNFLOWER;
  const fruitType = speciesConfig?.architecture?.fruitType;

  if (isSunflower) {
    if (state.overallProgress >= 0.60) {
      return {
        phase: LifecyclePhases.FRUIT_RIPENING,
        label: state.overallProgress >= 0.82 ? 'Seed Maturation' : 'Seed Filling',
      };
    }
  } else if (fruitType === 'spike_caryopsis' || fruitType === 'panicle_grain') {
    if (state.overallProgress >= 0.60) {
      return {
        phase: LifecyclePhases.FRUIT_RIPENING,
        label: state.overallProgress >= 0.82 ? 'Grain Hardening' : 'Grain Filling',
      };
    }
  } else {
    if (state.stage === PlantStages.RIPENING || state.overallProgress >= 0.72) {
      return {
        phase: LifecyclePhases.FRUIT_RIPENING,
        label: fruitType === 'rose_hip' ? 'Hip Maturation' : 'Fruit Ripening',
      };
    }
  }

  return {
    phase: LifecyclePhases.ACTIVE_DEVELOPMENT,
    label: 'Active Development',
  };
}

/**
 * Generates an educational explanation of the plant's condition.
 */
export function generateBotanicalExplanation(state, env, speciesConfig = null) {
  const { waterStress, waterloggingStress, lightStress, tempStress, nutrientStress, stage, health } = state;

  if (state.isTerminal || stage === PlantStages.TERMINAL) {
    return 'LIFECYCLE COMPLETE — SENESCENCE FINISHED: Biological senescence concluded. All physiological and developmental processes have ceased.';
  }
  if (stage === PlantStages.ADVANCED_SENESCENCE) {
    return 'Advanced senescence: Widespread cellular dehydration, foliar desiccation, and progressive loss of vascular integrity.';
  }
  if (stage === PlantStages.EARLY_SENESCENCE) {
    return 'Early senescence: Chlorophyll breakdown in lower foliage and nutrient remobilization to generative seed/fruit sinks.';
  }

  if (health < 30) {
    return 'Severe physiological decline: Chronic stress causing widespread foliar and vascular tissue senescence.';
  }

  if (waterStress > 0.4) {
    return 'Water deficit detected: Turgor pressure falling, stomata closing to conserve moisture.';
  }
  if (waterloggingStress > 0.4) {
    return 'Root hypoxia from waterlogged soil: Anaerobic conditions inhibiting mineral transport.';
  }
  if (lightStress > 0.4) {
    return env.light < 40
      ? 'Insufficient photosynthetic active radiation: Phototropism active, chlorosis risk.'
      : 'Photoinhibition & solar scorching: Excessive irradiance causing oxidative stress in chloroplasts.';
  }
  if (tempStress > 0.4) {
    return env.temperature < 18
      ? 'Chilling stress: Enzymatic reactions and nutrient diffusion slowed down.'
      : 'Heat stress: Elevated transpiration rate, potential floral abscission risk.';
  }
  if (nutrientStress > 0.4) {
    return 'Nitrogen/Potassium deficiency: Vegetative vigour constrained, pale foliar tint.';
  }

  // Look for stage description in species-specific config first
  if (speciesConfig?.stageConfigs) {
    const match = speciesConfig.stageConfigs.find((s) => s.stage === stage);
    if (match?.desc) return match.desc;
  }
  if (speciesConfig?.senescenceStageConfigs) {
    const match = speciesConfig.senescenceStageConfigs.find((s) => s.stage === stage);
    if (match?.desc) return match.desc;
  }

  // Default fallback stage explanations
  switch (stage) {
    case PlantStages.SEED:
      return 'Seed imbibing moisture from surrounding soil particles to initiate germination.';
    case PlantStages.GERMINATION:
      return 'Radicle breaks seed coat and geotropically descends into rhizosphere.';
    case PlantStages.ROOT_DEVELOPMENT:
      return 'Primary taproot branching laterally; establishing strong hydraulic architecture.';
    case PlantStages.SHOOT_EMERGENCE:
      return 'Hypocotyl loop breaking through topsoil into sunlight.';
    case PlantStages.SEEDLING:
      return 'Cotyledons expanded; primordial true leaves establishing photosynthetic factory.';
    case PlantStages.VEGETATIVE_GROWTH:
      return 'Vigorous shoot expansion; robust stem lignification and foliage canopy.';
    case PlantStages.BUD_FORMATION:
      return 'Inflorescence differentiation active; floral clusters emerging at stem nodes.';
    case PlantStages.FLOWERING:
      return 'Anthesis in progress: Vibrant corollas open for pollen distribution.';
    case PlantStages.FRUIT_SET:
      return 'Fertilization complete: Reproductive organs transitioning into seed/fruit development.';
    case PlantStages.FRUIT_DEVELOPMENT:
      return 'Cell enlargement phase: Rapid accumulation of water, carbohydrates, and nutrients.';
    case PlantStages.RIPENING:
      return 'Maturation phase: Pigmentation and seed coat lignification finalizing.';
    case PlantStages.MATURE:
      return 'Adult reproductive plant: Robust canopy homeostasis with mature generative structures.';
    case PlantStages.EARLY_SENESCENCE:
      return 'Early senescence: Lower canopy chlorosis with active nutrient translocation.';
    case PlantStages.ADVANCED_SENESCENCE:
      return 'Advanced senescence: Extensive foliar necrosis, cellular dehydration, and drying seed coat.';
    case PlantStages.TERMINAL:
      return 'Lifecycle complete: Senescence finished. Biological processes ceased.';
    default:
      return 'Optimal balanced micro-climate. Steady vegetative and generative development.';
  }
}

/**
 * Authoritative step function for the plant simulation.
 * Continuous lifecycle:
 * - When overallProgress < 1.0: Active morphological organogenesis according to species characteristics.
 * - When overallProgress = 1.0 (Full Maturity): Age, health, stresses, fruit/seed ripening, and homeostasis CONTINUE updating.
 * - Morphological bounds (height, depth, spread) remain firmly capped at configured adult biological limits.
 */
export function stepSimulation(prevState, env, dt) {
  // Retrieve species-specific biological configuration (safe fallback to tomato)
  const speciesConfig = getSpeciesConfig(prevState?.speciesId);

  const maxStemHeight = speciesConfig.maxStemHeight || MAX_STEM_HEIGHT;
  const maxStemThickness = speciesConfig.maxStemThickness || MAX_STEM_THICKNESS;
  const maxRootDepth = speciesConfig.maxRootDepth || MAX_ROOT_DEPTH;
  const maxRootSpread = speciesConfig.maxRootSpread || MAX_ROOT_SPREAD;

  const nominalSeasonDuration = speciesConfig.lifecycle?.nominalSeasonDuration || 90.0;
  const totalMaturityDays = speciesConfig.lifecycle?.totalMaturityDays || 100.0;
  const senescenceOnsetDays = speciesConfig.lifecycle?.senescenceOnsetDays ?? totalMaturityDays;
  const senescenceDurationDays = speciesConfig.lifecycle?.senescenceDurationDays ?? 20.0;
  const terminalAgeDays = speciesConfig.lifecycle?.terminalAgeDays ?? (senescenceOnsetDays + senescenceDurationDays);

  // If the plant has already reached its terminal state, biological aging and morphological increases cease
  if (prevState?.isTerminal || (prevState?.ageDays || 0) >= terminalAgeDays) {
    const terminalState = {
      ...prevState,
      speciesId: speciesConfig.id,
      isTerminal: true,
      ageDays: terminalAgeDays,
      overallProgress: 1.0,
      growthRate: 0.0,
      health: Math.min(prevState.health ?? 5.0, 5.0),
      senescenceProgress: 1.0,
      flowerCount: 0,
      stage: PlantStages.TERMINAL,
      stageProgress: 1.0,
      lifecyclePhase: LifecyclePhases.TERMINAL,
      lifecycleStatusLabel: 'Lifecycle Complete (Terminal)',
      explanation: 'LIFECYCLE COMPLETE — SENESCENCE FINISHED: Biological senescence concluded. All physiological and developmental processes have ceased.',
    };
    return terminalState;
  }

  // 1. Update individual stresses (always continuous, even in adult plant)
  const { waterStress, waterloggingStress } = updateWaterStress(
    env.moisture,
    prevState.waterStress,
    prevState.waterloggingStress,
    dt,
    speciesConfig
  );
  const lightStress = updateLightStress(env.light, prevState.lightStress, dt, speciesConfig);
  const tempStress = updateTemperatureStress(env.temperature, prevState.tempStress, dt, speciesConfig);
  const nutrientStress = updateNutrientStress(env.nutrients, prevState.nutrientStress, dt, speciesConfig);

  const totalStress = Math.min(
    1.0,
    waterStress * 0.35 +
    waterloggingStress * 0.35 +
    lightStress * 0.2 +
    tempStress * 0.25 +
    nutrientStress * 0.15
  );

  // 2. Simulated plant age progression with strict terminal clamp
  const dayRate = totalMaturityDays / nominalSeasonDuration;
  const proposedAgeDays = (prevState.ageDays || 0.0) + dt * dayRate;

  let isTerminal = false;
  let senescenceProgress = 0.0;
  let ageDays = proposedAgeDays;

  if (proposedAgeDays >= terminalAgeDays) {
    ageDays = terminalAgeDays;
    isTerminal = true;
    senescenceProgress = 1.0;
  } else if (proposedAgeDays >= senescenceOnsetDays) {
    senescenceProgress = Math.min(1.0, Math.max(0.0, (proposedAgeDays - senescenceOnsetDays) / senescenceDurationDays));
  }

  // 3. Health & Vigour progression
  let health = prevState.health;
  if (isTerminal) {
    health = 0.0;
  } else if (senescenceProgress > 0) {
    // Programmed biological senescence caps and gradually reduces health
    const senescenceHealthCap = Math.max(0.0, 100.0 - senescenceProgress * 100.0);
    health = Math.min(health, senescenceHealthCap);
  } else {
    if (totalStress > 0.25) {
      health = Math.max(10, health - (totalStress - 0.2) * 5.0 * dt);
    } else {
      health = Math.min(100, health + 3.0 * dt);
    }
  }

  let growthRate = calculateGrowthRate(
    { waterStress, waterloggingStress, lightStress, tempStress, nutrientStress },
    health
  );
  if (isTerminal) {
    growthRate = 0.0;
  } else if (senescenceProgress > 0) {
    growthRate = Math.max(0.0, growthRate * (1.0 - senescenceProgress));
  }

  // 4. Progress advance according to species lifecycle configuration
  const baseGrowthStep = (1.0 / nominalSeasonDuration) * dt;
  const progressIncrement = isTerminal ? 0 : baseGrowthStep * growthRate;
  const overallProgress = Math.min(1.0, (prevState.overallProgress || 0.0) + progressIncrement);

  // 5. Determine active developmental stage from species stage configuration and age
  const { stageConfig: activeStageConfig, stageIndex, stage, stageProgress } = getActiveStage(
    speciesConfig,
    overallProgress,
    ageDays
  );

  // 6. Morphological development calculations with strict species-specific biological maximum limits
  const stemHeight = Math.min(
    maxStemHeight,
    Math.pow(Math.max(0, (overallProgress - 0.07) / 0.93), 1.15) * maxStemHeight
  );
  const stemThickness = Math.min(
    maxStemThickness,
    0.03 + overallProgress * (maxStemThickness - 0.03)
  );
  const rootDepth = Math.min(
    maxRootDepth,
    Math.pow(Math.max(0, (overallProgress - 0.04) / 0.96), 0.9) * maxRootDepth
  );
  const rootSpread = Math.min(
    maxRootSpread,
    Math.pow(Math.max(0, (overallProgress - 0.06) / 0.94), 0.85) * maxRootSpread
  );

  // Organ counts and reproductive organs governed by species architecture
  const isSunflower = speciesConfig.id === SPECIES_IDS.SUNFLOWER;

  // Leaf count
  const maxLeaves = speciesConfig.architecture?.maxLeaves || 14;
  const leafCount = Math.min(
    maxLeaves,
    Math.floor(Math.max(0, (overallProgress - 0.07) / 0.93) * (maxLeaves + 1))
  );

  // Flowers, Fruits, and Reproductive Maturity
  let flowerCount = 0;
  let fruitCount = 0;
  let fruitMaturity = prevState.fruitMaturity || 0.0;
  const fruitType = speciesConfig.architecture?.fruitType;
  const isGrain = fruitType === 'spike_caryopsis' || fruitType === 'panicle_grain';
  const maxFlowers = speciesConfig.architecture?.maxFlowers ?? (isSunflower || isGrain ? 1 : 5);
  const maxFruits = speciesConfig.architecture?.maxFruits ?? (isSunflower || isGrain ? 0 : 5);

  if (isSunflower || isGrain) {
    flowerCount = overallProgress >= 0.35 && !isTerminal ? 1 : 0;
    fruitCount = 0;

    if (overallProgress >= 0.60) {
      if (overallProgress < 0.82) {
        fruitMaturity = ((overallProgress - 0.60) / 0.22) * 0.70;
      } else if (overallProgress < 0.90) {
        fruitMaturity = 0.70 + ((overallProgress - 0.82) / 0.08) * 0.30;
      } else {
        fruitMaturity = 1.0;
      }
    } else {
      fruitMaturity = 0.0;
    }
  } else {
    if (overallProgress < 0.35) {
      flowerCount = 0;
      fruitCount = 0;
      fruitMaturity = 0.0;
    } else if (overallProgress < 0.50) {
      flowerCount = Math.min(maxFlowers, Math.floor(1 + ((overallProgress - 0.35) / 0.15) * Math.max(1, maxFlowers - 1)));
      fruitCount = 0;
      fruitMaturity = 0.0;
    } else if (overallProgress < 0.72) {
      flowerCount = maxFlowers;
      fruitCount = maxFruits;
      fruitMaturity = ((overallProgress - 0.50) / 0.22) * 0.40;
    } else if (overallProgress < 0.80) {
      flowerCount = maxFlowers;
      fruitCount = maxFruits;
      fruitMaturity = 0.40 + ((overallProgress - 0.72) / 0.08) * 0.55;
    } else {
      // Full maturity & senescence
      if (isTerminal) {
        flowerCount = 0;
      } else if (senescenceProgress > 0.4) {
        flowerCount = Math.max(0, Math.floor(maxFlowers * (1.0 - (senescenceProgress - 0.4) / 0.6)));
      } else {
        flowerCount = maxFlowers;
      }
      fruitCount = maxFruits;
      fruitMaturity = 1.0;
    }
  }

  // Build authoritative plant state
  const nextState = {
    ...prevState,
    speciesId: speciesConfig.id,
    stage,
    stageIndex,
    stageProgress,
    overallProgress,
    ageDays,
    senescenceProgress,
    isTerminal,
    health,
    waterStress,
    waterloggingStress,
    lightStress,
    tempStress,
    nutrientStress,
    totalStress,
    growthRate,
    stemHeight,
    stemThickness,
    rootDepth,
    rootSpread,
    leafCount,
    flowerCount,
    fruitCount,
    fruitMaturity,
  };

  const { phase, label } = deriveLifecyclePhase(nextState, speciesConfig);
  nextState.lifecyclePhase = phase;
  nextState.lifecycleStatusLabel = label;
  nextState.explanation = generateBotanicalExplanation(nextState, env, speciesConfig);

  return nextState;
}
