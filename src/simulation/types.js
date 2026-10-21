/**
 * FLORA Life-Cycle Stages
 */
export const PlantStages = {
  SEED: 'SEED',
  GERMINATION: 'GERMINATION',
  ROOT_DEVELOPMENT: 'ROOT_DEVELOPMENT',
  SHOOT_EMERGENCE: 'SHOOT_EMERGENCE',
  SEEDLING: 'SEEDLING',
  VEGETATIVE_GROWTH: 'VEGETATIVE_GROWTH',
  BUD_FORMATION: 'BUD_FORMATION',
  FLOWERING: 'FLOWERING',
  FRUIT_SET: 'FRUIT_SET',
  FRUIT_DEVELOPMENT: 'FRUIT_DEVELOPMENT',
  RIPENING: 'RIPENING',
  MATURE: 'MATURE',
  EARLY_SENESCENCE: 'EARLY_SENESCENCE',
  ADVANCED_SENESCENCE: 'ADVANCED_SENESCENCE',
  TERMINAL: 'TERMINAL',
};

/**
 * High-level Lifecycle Phases distinguishing morphological progression from ongoing mature homeostasis and senescence
 */
export const LifecyclePhases = {
  ACTIVE_DEVELOPMENT: 'ACTIVE_DEVELOPMENT',
  FRUIT_RIPENING: 'FRUIT_RIPENING',
  FULL_MATURITY: 'FULL_MATURITY',
  ENVIRONMENTAL_STRESS: 'ENVIRONMENTAL_STRESS',
  DECLINE: 'DECLINE',
  SENESCENCE: 'SENESCENCE',
  TERMINAL: 'TERMINAL',
};

export const STAGE_CONFIGS = [
  { stage: PlantStages.SEED, name: 'Seed', minProgress: 0.0, maxProgress: 0.06, desc: 'Hydration and swelling of the seed underground.' },
  { stage: PlantStages.GERMINATION, name: 'Germination', minProgress: 0.06, maxProgress: 0.12, desc: 'Seed coat ruptures as the radicle breaks through.' },
  { stage: PlantStages.ROOT_DEVELOPMENT, name: 'Root Emergence', minProgress: 0.12, maxProgress: 0.20, desc: 'Primary root anchors into soil, absorbing early water.' },
  { stage: PlantStages.SHOOT_EMERGENCE, name: 'Shoot Emergence', minProgress: 0.20, maxProgress: 0.28, desc: 'Hypocotyl arches upwards, piercing the soil surface.' },
  { stage: PlantStages.SEEDLING, name: 'Seedling', minProgress: 0.28, maxProgress: 0.40, desc: 'Cotyledons unfold and initial true leaves begin photosynthesizing.' },
  { stage: PlantStages.VEGETATIVE_GROWTH, name: 'Vegetative Growth', minProgress: 0.40, maxProgress: 0.58, desc: 'Vigorous stem elongation and dense compound foliage canopy.' },
  { stage: PlantStages.BUD_FORMATION, name: 'Bud Formation', minProgress: 0.58, maxProgress: 0.68, desc: 'Apical floral cymes develop tightly clustered green buds.' },
  { stage: PlantStages.FLOWERING, name: 'Anthesis / Flowering', minProgress: 0.68, maxProgress: 0.78, desc: 'Brilliant yellow star-shaped flowers blossom.' },
  { stage: PlantStages.FRUIT_SET, name: 'Fruit Set', minProgress: 0.78, maxProgress: 0.85, desc: 'Petals senesce as ovaries swell into small green berries.' },
  { stage: PlantStages.FRUIT_DEVELOPMENT, name: 'Fruit Expansion', minProgress: 0.85, maxProgress: 0.93, desc: 'Tomato fruit enlarges rapidly, accumulating sugars and water.' },
  { stage: PlantStages.RIPENING, name: 'Ripening / Breaker', minProgress: 0.93, maxProgress: 0.98, desc: 'Chlorophyll degrades, synthesis of lycopene creates red color.' },
  { stage: PlantStages.MATURE, name: 'Full Maturity', minProgress: 0.98, maxProgress: 1.0, desc: 'Lush vine with glossy, deep-crimson ripe tomatoes.' },
];

export const SENESCENCE_STAGE_CONFIGS = [
  { stage: PlantStages.EARLY_SENESCENCE, name: 'Early Senescence', minProgress: 1.0, maxProgress: 1.0, desc: 'Chlorophyll degrades, lower leaves turn chlorotic, nutrients remobilize.' },
  { stage: PlantStages.ADVANCED_SENESCENCE, name: 'Advanced Senescence', minProgress: 1.0, maxProgress: 1.0, desc: 'Extensive cellular dehydration, foliar browning, and vascular breakdown.' },
  { stage: PlantStages.TERMINAL, name: 'Terminal State', minProgress: 1.0, maxProgress: 1.0, desc: 'Lifecycle complete: Senescence finished. Biological processes ceased.' },
];

export const ALL_STAGE_CONFIGS = [...STAGE_CONFIGS, ...SENESCENCE_STAGE_CONFIGS];

export const INITIAL_ENVIRONMENT = {
  moisture: 58,    // 0 to 100%
  light: 75,       // 0 to 100% (sunlight intensity)
  temperature: 24, // in Celsius (°C)
  nutrients: 70,   // 0 to 100% (N-P-K mineral availability)
};

export const INITIAL_PLANT_STATE = {
  speciesId: 'tomato',  // Species ID ('tomato' | 'sunflower')
  stage: PlantStages.SEED,
  stageIndex: 0,
  stageProgress: 0.0,
  overallProgress: 0.0, // 0.0 to 1.0 (developmental milestone tracker)
  lifecyclePhase: LifecyclePhases.ACTIVE_DEVELOPMENT, // High-level operational phase
  lifecycleStatusLabel: 'Active Development',
  ageDays: 0.0,         // simulated age in days (continues advancing deterministically)
  senescenceProgress: 0.0, // 0.0 to 1.0 during senescence
  isTerminal: false,    // true once lifecycle is complete and terminal age reached

  // Health and multi-factor stresses (0.0 = zero stress, 1.0 = maximum stress)
  health: 100.0,        // 0 to 100
  waterStress: 0.0,
  waterloggingStress: 0.0,
  lightStress: 0.0,
  tempStress: 0.0,
  nutrientStress: 0.0,
  totalStress: 0.0,

  // Growth metrics with defined botanical bounds
  growthRate: 1.0,      // calculated multiplier
  stemHeight: 0.0,      // cm/units (max capped at defined adult height)
  stemThickness: 0.05,
  rootDepth: 0.1,       // max capped at defined adult rhizosphere depth
  rootSpread: 0.1,
  leafCount: 0,
  flowerCount: 0,
  fruitCount: 0,
  fruitMaturity: 0.0,   // 0.0 to 1.0 (continues ripening if entered maturity before 1.0)

  explanation: 'Seed planted in moist, nutrient-rich soil. Dormant and hydrating.',
};
