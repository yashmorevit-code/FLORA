import { PlantStages } from './types.js';

/**
 * Supported Species Identifiers
 */
export const SPECIES_IDS = {
  TOMATO: 'tomato',
  SUNFLOWER: 'sunflower',
  STRAWBERRY: 'strawberry',
  WHEAT: 'wheat',
  CHILLI: 'chilli',
  RICE: 'rice',
  ROSE: 'rose',
};

/**
 * Central Species Registry Definition
 * Configures biological architecture, optimal environments, educational lifecycles, and developmental stages.
 */
export const SPECIES_REGISTRY = {
  [SPECIES_IDS.TOMATO]: {
    id: SPECIES_IDS.TOMATO,
    commonName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    family: 'Solanaceae',
    variety: 'Indeterminate Heirloom',
    description:
      'Vigorous sympodial vine with compound pinnate leaves, yellow star blossoms, and multi-stage breaker fruit ripening.',

    // Morphological & Biometric boundaries
    maxStemHeight: 2.8,       // in meters / scene units
    maxStemThickness: 0.16,
    maxRootDepth: 2.2,
    maxRootSpread: 1.6,

    // Educational timescale configuration
    lifecycle: {
      totalMaturityDays: 100,      // Nominal days to full maturity under optimal conditions
      maturityDurationDays: 35,    // Sustained adult canopy and ripe fruiting period
      senescenceOnsetDays: 135,    // Age in simulated days when foliar senescence initiates
      senescenceDurationDays: 25,  // Duration in days from onset to terminal plant death
      terminalAgeDays: 160,        // Absolute terminal age boundary (Day 160)
      nominalSeasonDuration: 90.0, // Seconds at 1x simulation speed to complete cycle
      phases: [
        { key: 'germination', name: 'Germination & Emergence', dayStart: 1, dayEnd: 7, progressStart: 0.0, progressEnd: 0.07 },
        { key: 'vegetative', name: 'Vegetative Development', dayStart: 8, dayEnd: 35, progressStart: 0.07, progressEnd: 0.35 },
        { key: 'flowering', name: 'Flowering & Anthesis', dayStart: 36, dayEnd: 50, progressStart: 0.35, progressEnd: 0.50 },
        { key: 'reproductive', name: 'Fruit Development & Ripening', dayStart: 51, dayEnd: 80, progressStart: 0.50, progressEnd: 0.80 },
        { key: 'maturity', name: 'Full Maturity', dayStart: 81, dayEnd: 100, progressStart: 0.80, progressEnd: 1.00 },
      ],
    },

    // Optimal environmental ranges
    optimalEnvironment: {
      moistureMin: 45,
      moistureMax: 75,
      lightMin: 60,
      lightMax: 90,
      temperatureMin: 20,
      temperatureMax: 28,
      nutrientsMin: 50,
      nutrientsMax: 90,
    },

    // Architecture & organogenesis characteristics
    architecture: {
      growthHabit: 'sympodial_vine',
      branching: true,
      maxBranches: 4,
      leafType: 'compound_pinnate',
      maxLeaves: 14,
      inflorescenceType: 'cyme_star',
      maxFlowers: 5,
      hasFruit: true,
      fruitType: 'berry',
      maxFruits: 5,
      rootArchitecture: 'deep_taproot_fibrous',
      taprootProminence: 0.8,
    },

    // 12-Stage Fine Developmental Milestones mapped to educational days
    stageConfigs: [
      { stage: PlantStages.SEED, name: 'Seed', minProgress: 0.00, maxProgress: 0.02, minDay: 0.0, maxDay: 2.0, desc: 'Hydration and swelling of tomato seed underground.' },
      { stage: PlantStages.GERMINATION, name: 'Germination', minProgress: 0.02, maxProgress: 0.04, minDay: 2.0, maxDay: 4.0, desc: 'Seed coat ruptures as the radicle breaks through.' },
      { stage: PlantStages.ROOT_DEVELOPMENT, name: 'Root Emergence', minProgress: 0.04, maxProgress: 0.06, minDay: 4.0, maxDay: 6.0, desc: 'Primary taproot anchors into soil, absorbing early water.' },
      { stage: PlantStages.SHOOT_EMERGENCE, name: 'Shoot Emergence', minProgress: 0.06, maxProgress: 0.07, minDay: 6.0, maxDay: 7.0, desc: 'Hypocotyl loop arches upwards, piercing topsoil.' },
      { stage: PlantStages.SEEDLING, name: 'Seedling', minProgress: 0.07, maxProgress: 0.20, minDay: 8.0, maxDay: 20.0, desc: 'Cotyledons unfold and initial true leaves begin photosynthesizing.' },
      { stage: PlantStages.VEGETATIVE_GROWTH, name: 'Vegetative Growth', minProgress: 0.20, maxProgress: 0.35, minDay: 21.0, maxDay: 35.0, desc: 'Vigorous sympodial shoot elongation and compound foliage canopy.' },
      { stage: PlantStages.BUD_FORMATION, name: 'Bud Formation', minProgress: 0.35, maxProgress: 0.42, minDay: 36.0, maxDay: 42.0, desc: 'Inflorescence cymes develop tightly clustered green buds.' },
      { stage: PlantStages.FLOWERING, name: 'Anthesis / Flowering', minProgress: 0.42, maxProgress: 0.50, minDay: 43.0, maxDay: 50.0, desc: 'Brilliant yellow star-shaped flowers blossom.' },
      { stage: PlantStages.FRUIT_SET, name: 'Fruit Set', minProgress: 0.50, maxProgress: 0.60, minDay: 51.0, maxDay: 60.0, desc: 'Petals senesce as ovaries swell into green tomato berries.' },
      { stage: PlantStages.FRUIT_DEVELOPMENT, name: 'Fruit Expansion', minProgress: 0.60, maxProgress: 0.72, minDay: 61.0, maxDay: 72.0, desc: 'Tomato fruit enlarges rapidly, accumulating sugars.' },
      { stage: PlantStages.RIPENING, name: 'Ripening / Breaker', minProgress: 0.72, maxProgress: 0.80, minDay: 73.0, maxDay: 80.0, desc: 'Chlorophyll degrades, synthesis of lycopene creates red color.' },
      { stage: PlantStages.MATURE, name: 'Full Maturity', minProgress: 0.80, maxProgress: 1.00, minDay: 81.0, maxDay: 100.0, desc: 'Lush vine with glossy, deep-crimson ripe tomatoes.' },
    ],

    // Senescence and Terminal Stages beyond Full Maturity
    senescenceStageConfigs: [
      { stage: PlantStages.EARLY_SENESCENCE, name: 'Early Senescence', minProgress: 1.00, maxProgress: 1.00, minDay: 135.0, maxDay: 148.0, desc: 'Foliar chlorophyll degrades as mobile nutrients are remobilized to fruits.' },
      { stage: PlantStages.ADVANCED_SENESCENCE, name: 'Advanced Senescence', minProgress: 1.00, maxProgress: 1.00, minDay: 148.0, maxDay: 160.0, desc: 'Widespread vascular and cellular breakdown, wilting, and foliar desiccation.' },
      { stage: PlantStages.TERMINAL, name: 'Terminal State', minProgress: 1.00, maxProgress: 1.00, minDay: 160.0, maxDay: 160.0, desc: 'Lifecycle complete: Senescence finished. Biological processes ceased.' },
    ],
  },

  [SPECIES_IDS.SUNFLOWER]: {
    id: SPECIES_IDS.SUNFLOWER,
    commonName: 'Sunflower',
    scientificName: 'Helianthus annuus',
    family: 'Asteraceae',
    variety: 'Single-Stem Giant (Mammoth)',
    description:
      'Robust single-stem annual with broad cordate leaves, deep anchoring taproot, and a prominent apical pseudanthium flower head.',

    // Morphological & Biometric boundaries
    maxStemHeight: 3.4,       // Taller, stately vertical column stem
    maxStemThickness: 0.22,   // Thicker, fibrous lignified stem
    maxRootDepth: 2.6,        // Deep taproot for anchoring tall shoot
    maxRootSpread: 1.8,

    // Educational timescale configuration
    lifecycle: {
      totalMaturityDays: 110,      // Nominal days to full maturity under optimal conditions
      maturityDurationDays: 35,    // Full anthesis and achene seed development duration
      senescenceOnsetDays: 145,    // Age in simulated days when capitulum and foliar senescence initiates
      senescenceDurationDays: 25,  // Duration in days from onset to terminal plant death
      terminalAgeDays: 170,        // Absolute terminal age boundary (Day 170)
      nominalSeasonDuration: 90.0, // Seconds at 1x simulation speed to complete cycle
      phases: [
        { key: 'germination', name: 'Germination & Emergence', dayStart: 1, dayEnd: 10, progressStart: 0.0, progressEnd: 0.10 },
        { key: 'vegetative', name: 'Vegetative Development', dayStart: 11, dayEnd: 35, progressStart: 0.10, progressEnd: 0.35 },
        { key: 'flowering', name: 'Flowering & Anthesis', dayStart: 36, dayEnd: 60, progressStart: 0.35, progressEnd: 0.60 },
        { key: 'reproductive', name: 'Seed Development & Filling', dayStart: 61, dayEnd: 90, progressStart: 0.60, progressEnd: 0.90 },
        { key: 'maturity', name: 'Full Maturity', dayStart: 91, dayEnd: 110, progressStart: 0.90, progressEnd: 1.00 },
      ],
    },

    // Optimal environmental ranges
    optimalEnvironment: {
      moistureMin: 40,
      moistureMax: 70,
      lightMin: 70,
      lightMax: 100, // Helianthus thrives under intense full sun
      temperatureMin: 21,
      temperatureMax: 32,
      nutrientsMin: 45,
      nutrientsMax: 85,
    },

    // Architecture & organogenesis characteristics
    architecture: {
      growthHabit: 'monopodial_upright',
      branching: false,       // Predominantly unbranched central column
      maxBranches: 0,
      leafType: 'broad_cordate',
      maxLeaves: 18,          // Large alternating heart-shaped leaves along stem
      inflorescenceType: 'capitulum_pseudanthium', // Large composite disk + ray florets
      maxFlowers: 1,          // Major apical composite flower head
      hasFruit: false,        // Generative seed development inside composite head, no fleshy berry
      fruitType: 'achene_seeds',
      maxFruits: 0,
      rootArchitecture: 'deep_strong_taproot',
      taprootProminence: 0.9,
    },

    // 12-Stage Fine Developmental Milestones mapped to educational days
    stageConfigs: [
      { stage: PlantStages.SEED, name: 'Achene Seed', minProgress: 0.00, maxProgress: 0.03, minDay: 0.0, maxDay: 3.0, desc: 'Achene seed absorbing soil moisture to trigger embryo activation.' },
      { stage: PlantStages.GERMINATION, name: 'Germination', minProgress: 0.03, maxProgress: 0.06, minDay: 3.0, maxDay: 6.0, desc: 'Thick hull splits as the radicle anchors downward.' },
      { stage: PlantStages.ROOT_DEVELOPMENT, name: 'Radicle Anchor', minProgress: 0.06, maxProgress: 0.08, minDay: 6.0, maxDay: 8.0, desc: 'Robust primary taproot descends deeply to anchor tall shoot.' },
      { stage: PlantStages.SHOOT_EMERGENCE, name: 'Shoot Emergence', minProgress: 0.08, maxProgress: 0.10, minDay: 8.0, maxDay: 10.0, desc: 'Hypocotyl lifts heavy cotyledons above the soil line.' },
      { stage: PlantStages.SEEDLING, name: 'Seedling', minProgress: 0.10, maxProgress: 0.22, minDay: 11.0, maxDay: 22.0, desc: 'Cotyledons expand and first pair of ovate true leaves emerge.' },
      { stage: PlantStages.VEGETATIVE_GROWTH, name: 'Stem Elongation', minProgress: 0.22, maxProgress: 0.35, minDay: 23.0, maxDay: 35.0, desc: 'Rapid upright stem thickening and expansive cordate foliage.' },
      { stage: PlantStages.BUD_FORMATION, name: 'Bud Involucre', minProgress: 0.35, maxProgress: 0.48, minDay: 36.0, maxDay: 48.0, desc: 'Terminal capitulum bud enclosed by green involucral bracts.' },
      { stage: PlantStages.FLOWERING, name: 'Ray Anthesis', minProgress: 0.48, maxProgress: 0.60, minDay: 49.0, maxDay: 60.0, desc: 'Involucre opens, revealing bright golden ray petals and disk floret disc.' },
      { stage: PlantStages.FRUIT_SET, name: 'Disk Anthesis', minProgress: 0.60, maxProgress: 0.72, minDay: 61.0, maxDay: 72.0, desc: 'Centripetal flowering across capitulum central disk florets, attracting pollinators.' },
      { stage: PlantStages.FRUIT_DEVELOPMENT, name: 'Seed Filling', minProgress: 0.72, maxProgress: 0.82, minDay: 73.0, maxDay: 82.0, desc: 'Disk florets senesce as achenes swell and harden with oil and protein.' },
      { stage: PlantStages.RIPENING, name: 'Seed Maturation', minProgress: 0.82, maxProgress: 0.90, minDay: 83.0, maxDay: 90.0, desc: 'Composite head nods gently as striped achene seed coat lignifies.' },
      { stage: PlantStages.MATURE, name: 'Full Maturity', minProgress: 0.90, maxProgress: 1.00, minDay: 91.0, maxDay: 110.0, desc: 'Majestic mature sunflower with heavy golden-brown seed head.' },
    ],

    // Senescence and Terminal Stages beyond Full Maturity
    senescenceStageConfigs: [
      { stage: PlantStages.EARLY_SENESCENCE, name: 'Early Senescence', minProgress: 1.00, maxProgress: 1.00, minDay: 145.0, maxDay: 158.0, desc: 'Ray florets drop and capitulum nods heavily as achenes complete oil desiccation.' },
      { stage: PlantStages.ADVANCED_SENESCENCE, name: 'Advanced Senescence', minProgress: 1.00, maxProgress: 1.00, minDay: 158.0, maxDay: 170.0, desc: 'Capitulum and stem fully lignify and brown; seeds ready for dispersal.' },
      { stage: PlantStages.TERMINAL, name: 'Terminal State', minProgress: 1.00, maxProgress: 1.00, minDay: 170.0, maxDay: 170.0, desc: 'Lifecycle complete: Senescence finished. Biological processes ceased.' },
    ],
  },

  [SPECIES_IDS.STRAWBERRY]: {
    id: SPECIES_IDS.STRAWBERRY,
    commonName: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    family: 'Rosaceae',
    variety: 'Everbearing Garden Strawberry (Albion)',
    description:
      'Perennial herbaceous rosette with trifoliate serrated leaflets, trailing runner stolons, 5-petaled white blossoms, and aggregate accessory berries.',

    maxStemHeight: 0.35,      // Low-profile compact basal crown rosette
    maxStemThickness: 0.08,
    maxRootDepth: 0.65,       // Shallow, fibrous root system
    maxRootSpread: 0.55,

    lifecycle: {
      totalMaturityDays: 75,
      maturityDurationDays: 20,
      senescenceOnsetDays: 95,
      senescenceDurationDays: 25,
      terminalAgeDays: 120,
      nominalSeasonDuration: 80.0,
      phases: [
        { key: 'germination', name: 'Crown Emergence', dayStart: 1, dayEnd: 10, progressStart: 0.0, progressEnd: 0.12 },
        { key: 'vegetative', name: 'Trifoliate Canopy & Stolon Run', dayStart: 11, dayEnd: 30, progressStart: 0.12, progressEnd: 0.40 },
        { key: 'flowering', name: 'White Inflorescence Anthesis', dayStart: 31, dayEnd: 45, progressStart: 0.40, progressEnd: 0.60 },
        { key: 'reproductive', name: 'Receptacle Expansion & Ripening', dayStart: 46, dayEnd: 65, progressStart: 0.60, progressEnd: 0.85 },
        { key: 'maturity', name: 'Full Fruiting Maturity', dayStart: 66, dayEnd: 75, progressStart: 0.85, progressEnd: 1.00 },
      ],
    },

    optimalEnvironment: {
      moistureMin: 55,
      moistureMax: 80, // Strawberries require consistent, moist, well-drained topsoil
      lightMin: 50,
      lightMax: 80,
      temperatureMin: 16,
      temperatureMax: 24, // Cool-to-mild temperate conditions
      nutrientsMin: 45,
      nutrientsMax: 75,
    },

    architecture: {
      growthHabit: 'stoloniferous_rosette',
      branching: false,
      maxBranches: 0,
      leafType: 'trifoliate_serrate',
      maxLeaves: 12,
      inflorescenceType: 'cyme_white_5petals',
      maxFlowers: 6,
      hasFruit: true,
      fruitType: 'accessory_aggregate',
      maxFruits: 6,
      rootArchitecture: 'shallow_fibrous',
      taprootProminence: 0.3,
    },

    stageConfigs: [
      { stage: PlantStages.SEED, name: 'Achene Imbibition', minProgress: 0.00, maxProgress: 0.03, minDay: 0.0, maxDay: 3.0, desc: 'Tiny achene seed absorbs moisture in moist humus.' },
      { stage: PlantStages.GERMINATION, name: 'Radicle Piercing', minProgress: 0.03, maxProgress: 0.06, minDay: 3.0, maxDay: 6.0, desc: 'Radicle anchors fibrous roots into topsoil.' },
      { stage: PlantStages.ROOT_DEVELOPMENT, name: 'Fibrous Network', minProgress: 0.06, maxProgress: 0.09, minDay: 6.0, maxDay: 9.0, desc: 'Dense shallow feeder roots explore upper soil layer.' },
      { stage: PlantStages.SHOOT_EMERGENCE, name: 'Crown Emergence', minProgress: 0.09, maxProgress: 0.12, minDay: 9.0, maxDay: 12.0, desc: 'Basal crown forms at soil surface, lifting first petiole.' },
      { stage: PlantStages.SEEDLING, name: 'First Trifoliate', minProgress: 0.12, maxProgress: 0.25, minDay: 12.0, maxDay: 20.0, desc: 'First characteristic three-parted serrated leaf unfolds.' },
      { stage: PlantStages.VEGETATIVE_GROWTH, name: 'Rosette & Runners', minProgress: 0.25, maxProgress: 0.40, minDay: 21.0, maxDay: 30.0, desc: 'Crown thickens and arching stolons (runners) creep horizontally.' },
      { stage: PlantStages.BUD_FORMATION, name: 'Cyme Budding', minProgress: 0.40, maxProgress: 0.50, minDay: 31.0, maxDay: 38.0, desc: 'Flower buds emerge from crown surrounded by calyx bracts.' },
      { stage: PlantStages.FLOWERING, name: 'White Anthesis', minProgress: 0.50, maxProgress: 0.60, minDay: 39.0, maxDay: 45.0, desc: 'Pure white five-petaled blossoms open around yellow centers.' },
      { stage: PlantStages.FRUIT_SET, name: 'Green Button', minProgress: 0.60, maxProgress: 0.70, minDay: 46.0, maxDay: 52.0, desc: 'Petals drop as the receptacle swells into a firm green button.' },
      { stage: PlantStages.FRUIT_DEVELOPMENT, name: 'White Receptacle', minProgress: 0.70, maxProgress: 0.80, minDay: 53.0, maxDay: 58.0, desc: 'Fleshy receptacle expands rapidly and turns creamy white.' },
      { stage: PlantStages.RIPENING, name: 'Breaker Pink', minProgress: 0.80, maxProgress: 0.88, minDay: 59.0, maxDay: 65.0, desc: 'Anthocyanins accumulate, shifting fruit from pink to scarlet.' },
      { stage: PlantStages.MATURE, name: 'Ruby Ripe', minProgress: 0.88, maxProgress: 1.00, minDay: 66.0, maxDay: 75.0, desc: 'Glossy crimson strawberries with surface achenes and recurved calyx.' },
    ],

    senescenceStageConfigs: [
      { stage: PlantStages.EARLY_SENESCENCE, name: 'Foliar Bronzing', minProgress: 1.00, maxProgress: 1.00, minDay: 95.0, maxDay: 108.0, desc: 'Older trifoliate leaves develop red-bronze anthocyanin tints.' },
      { stage: PlantStages.ADVANCED_SENESCENCE, name: 'Crown Senescence', minProgress: 1.00, maxProgress: 1.00, minDay: 108.0, maxDay: 120.0, desc: 'Foliage withers back to crown as energy stores consolidate.' },
      { stage: PlantStages.TERMINAL, name: 'Terminal State', minProgress: 1.00, maxProgress: 1.00, minDay: 120.0, maxDay: 120.0, desc: 'Lifecycle complete: Senescence finished. Biological processes ceased.' },
    ],
  },

  [SPECIES_IDS.WHEAT]: {
    id: SPECIES_IDS.WHEAT,
    commonName: 'Wheat',
    scientificName: 'Triticum aestivum',
    family: 'Poaceae',
    variety: 'Hard Red Winter Wheat',
    description:
      'Cereal grass with erect tillering culms, narrow parallel-veined leaves, deep seminal roots, and a terminal distichous spike with awns.',

    maxStemHeight: 1.10,      // Modest, erect cereal canopy
    maxStemThickness: 0.045,  // Slender hollow culm
    maxRootDepth: 1.80,       // Deep exploratory seminal & nodal root system
    maxRootSpread: 0.85,

    lifecycle: {
      totalMaturityDays: 120,
      maturityDurationDays: 20,
      senescenceOnsetDays: 140,
      senescenceDurationDays: 25,
      terminalAgeDays: 165,
      nominalSeasonDuration: 90.0,
      phases: [
        { key: 'germination', name: 'Germination & Coleoptile', dayStart: 1, dayEnd: 12, progressStart: 0.0, progressEnd: 0.10 },
        { key: 'vegetative', name: 'Tillering & Stem Elongation', dayStart: 13, dayEnd: 55, progressStart: 0.10, progressEnd: 0.45 },
        { key: 'flowering', name: 'Booting & Spike Anthesis', dayStart: 56, dayEnd: 75, progressStart: 0.45, progressEnd: 0.65 },
        { key: 'reproductive', name: 'Milk & Dough Grain Fill', dayStart: 76, dayEnd: 105, progressStart: 0.65, progressEnd: 0.90 },
        { key: 'maturity', name: 'Golden Ripeness', dayStart: 106, dayEnd: 120, progressStart: 0.90, progressEnd: 1.00 },
      ],
    },

    optimalEnvironment: {
      moistureMin: 35,
      moistureMax: 65, // Temperate cereal with high drought tolerance
      lightMin: 65,
      lightMax: 95,
      temperatureMin: 15,
      temperatureMax: 23, // Cool temperate affinity
      nutrientsMin: 40,
      nutrientsMax: 80,
    },

    architecture: {
      growthHabit: 'cespitose_tillering_culms',
      branching: false,
      maxBranches: 0,
      leafType: 'linear_grass_blade',
      maxLeaves: 16,
      inflorescenceType: 'terminal_spike_awns',
      maxFlowers: 1,
      hasFruit: true,
      fruitType: 'spike_caryopsis',
      maxFruits: 1,
      rootArchitecture: 'deep_seminal_nodal_fibrous',
      taprootProminence: 0.4,
    },

    stageConfigs: [
      { stage: PlantStages.SEED, name: 'Caryopsis Hydration', minProgress: 0.00, maxProgress: 0.03, minDay: 0.0, maxDay: 3.0, desc: 'Wheat kernel absorbs moisture to initiate embryo development.' },
      { stage: PlantStages.GERMINATION, name: 'Radicle & Coleorhiza', minProgress: 0.03, maxProgress: 0.06, minDay: 3.0, maxDay: 6.0, desc: 'Primary seminal root emerges through the coleorhiza.' },
      { stage: PlantStages.ROOT_DEVELOPMENT, name: 'Seminal Root Depth', minProgress: 0.06, maxProgress: 0.08, minDay: 6.0, maxDay: 8.0, desc: 'Seminal root descends vertically while secondary roots emerge.' },
      { stage: PlantStages.SHOOT_EMERGENCE, name: 'Coleoptile Piercing', minProgress: 0.08, maxProgress: 0.10, minDay: 8.0, maxDay: 12.0, desc: 'Protective coleoptile penetrates topsoil and releases first leaf.' },
      { stage: PlantStages.SEEDLING, name: 'Early Seedling', minProgress: 0.10, maxProgress: 0.22, minDay: 13.0, maxDay: 25.0, desc: 'Erect, narrow linear leaves emerge with distinct ligules.' },
      { stage: PlantStages.VEGETATIVE_GROWTH, name: 'Tillering & Jointing', minProgress: 0.22, maxProgress: 0.45, minDay: 26.0, maxDay: 55.0, desc: 'Culm nodes joint upwards and multiple basal tillers form.' },
      { stage: PlantStages.BUD_FORMATION, name: 'Booting Stage', minProgress: 0.45, maxProgress: 0.55, minDay: 56.0, maxDay: 65.0, desc: 'Flag leaf sheath swells as the immature spike develops internally.' },
      { stage: PlantStages.FLOWERING, name: 'Heading & Anthesis', minProgress: 0.55, maxProgress: 0.65, minDay: 66.0, maxDay: 75.0, desc: 'Bearded spike emerges from flag leaf; yellow anthers extrude.' },
      { stage: PlantStages.FRUIT_SET, name: 'Watery Ripe Kernel', minProgress: 0.65, maxProgress: 0.74, minDay: 76.0, maxDay: 85.0, desc: 'Pollination succeeds; ovary fills with clear liquid carbohydrate.' },
      { stage: PlantStages.FRUIT_DEVELOPMENT, name: 'Milk Stage', minProgress: 0.74, maxProgress: 0.82, minDay: 86.0, maxDay: 95.0, desc: 'Endosperm turns milky white as starch accumulates rapidly.' },
      { stage: PlantStages.RIPENING, name: 'Dough Stage', minProgress: 0.82, maxProgress: 0.90, minDay: 96.0, maxDay: 105.0, desc: 'Kernel turns doughy and firm; awns and spikelets begin yellowing.' },
      { stage: PlantStages.MATURE, name: 'Golden Hard Grain', minProgress: 0.90, maxProgress: 1.00, minDay: 106.0, maxDay: 120.0, desc: 'Golden amber wheat spike with hard dry kernels and bowing stem.' },
    ],

    senescenceStageConfigs: [
      { stage: PlantStages.EARLY_SENESCENCE, name: 'Stover Bleaching', minProgress: 1.00, maxProgress: 1.00, minDay: 140.0, maxDay: 152.0, desc: 'Culms and flag leaves lose all green chlorophyll, turning to pale straw.' },
      { stage: PlantStages.ADVANCED_SENESCENCE, name: 'Crop Desiccation', minProgress: 1.00, maxProgress: 1.00, minDay: 152.0, maxDay: 165.0, desc: 'Entire stand is dry and brittle; ripe grains ready for threshing.' },
      { stage: PlantStages.TERMINAL, name: 'Terminal State', minProgress: 1.00, maxProgress: 1.00, minDay: 165.0, maxDay: 165.0, desc: 'Lifecycle complete: Senescence finished. Biological processes ceased.' },
    ],
  },

  [SPECIES_IDS.CHILLI]: {
    id: SPECIES_IDS.CHILLI,
    commonName: 'Chilli Pepper',
    scientificName: 'Capsicum annuum',
    family: 'Solanaceae',
    variety: 'Cayenne Long Slim',
    description:
      'Warm-season solanaceous shrub with dichotomous sympodial branching, pointed ovate leaves, solitary nodding white blossoms, and elongated pungent pods.',

    maxStemHeight: 1.20,
    maxStemThickness: 0.11,
    maxRootDepth: 1.40,
    maxRootSpread: 1.10,

    lifecycle: {
      totalMaturityDays: 95,
      maturityDurationDays: 30,
      senescenceOnsetDays: 125,
      senescenceDurationDays: 25,
      terminalAgeDays: 150,
      nominalSeasonDuration: 85.0,
      phases: [
        { key: 'germination', name: 'Seed Hydration & Sprout', dayStart: 1, dayEnd: 10, progressStart: 0.0, progressEnd: 0.08 },
        { key: 'vegetative', name: 'Dichotomous Branching Canopy', dayStart: 11, dayEnd: 38, progressStart: 0.08, progressEnd: 0.38 },
        { key: 'flowering', name: 'White Star Anthesis', dayStart: 39, dayEnd: 52, progressStart: 0.38, progressEnd: 0.52 },
        { key: 'reproductive', name: 'Pod Elongation & Red Ripening', dayStart: 53, dayEnd: 78, progressStart: 0.52, progressEnd: 0.82 },
        { key: 'maturity', name: 'Fiery Crimson Harvest', dayStart: 79, dayEnd: 95, progressStart: 0.82, progressEnd: 1.00 },
      ],
    },

    optimalEnvironment: {
      moistureMin: 50,
      moistureMax: 75,
      lightMin: 65,
      lightMax: 95,
      temperatureMin: 22,
      temperatureMax: 30, // Heat-loving warm-season crop
      nutrientsMin: 50,
      nutrientsMax: 85,
    },

    architecture: {
      growthHabit: 'dichotomous_branching_shrub',
      branching: true,
      maxBranches: 5,
      leafType: 'ovate_acuminate',
      maxLeaves: 22,
      inflorescenceType: 'solitary_axillary_white',
      maxFlowers: 8,
      hasFruit: true,
      fruitType: 'pod_berry',
      maxFruits: 8,
      rootArchitecture: 'moderate_taproot_lateral',
      taprootProminence: 0.75,
    },

    stageConfigs: [
      { stage: PlantStages.SEED, name: 'Chilli Seed Imbibition', minProgress: 0.00, maxProgress: 0.03, minDay: 0.0, maxDay: 3.0, desc: 'Warm soil temperature triggers enzyme activation in chilli seed.' },
      { stage: PlantStages.GERMINATION, name: 'Radicle Emergence', minProgress: 0.03, maxProgress: 0.05, minDay: 3.0, maxDay: 5.0, desc: 'Primary radicle breaks hull and anchors into subsoil.' },
      { stage: PlantStages.ROOT_DEVELOPMENT, name: 'Lateral Taproot', minProgress: 0.05, maxProgress: 0.07, minDay: 5.0, maxDay: 7.0, desc: 'Substantial taproot extends, sending out lateral feeder roots.' },
      { stage: PlantStages.SHOOT_EMERGENCE, name: 'Shoot Emergence', minProgress: 0.07, maxProgress: 0.08, minDay: 7.0, maxDay: 10.0, desc: 'Slender hypocotyl lifts narrow cotyledons into the light.' },
      { stage: PlantStages.SEEDLING, name: 'First Pointed Leaves', minProgress: 0.08, maxProgress: 0.20, minDay: 11.0, maxDay: 22.0, desc: 'Glossy ovate true leaves emerge with acuminate tips.' },
      { stage: PlantStages.VEGETATIVE_GROWTH, name: 'Dichotomous Branching', minProgress: 0.20, maxProgress: 0.38, minDay: 23.0, maxDay: 38.0, desc: 'Central stem forks repeatedly into a dense, bushy canopy.' },
      { stage: PlantStages.BUD_FORMATION, name: 'Axillary Buds', minProgress: 0.38, maxProgress: 0.45, minDay: 39.0, maxDay: 45.0, desc: 'Solitary floral buds form in the axils of branch forks.' },
      { stage: PlantStages.FLOWERING, name: 'Nodding White Bloom', minProgress: 0.45, maxProgress: 0.52, minDay: 46.0, maxDay: 52.0, desc: 'Pendant white blossoms open with bluish-purple anthers.' },
      { stage: PlantStages.FRUIT_SET, name: 'Pod Emergence', minProgress: 0.52, maxProgress: 0.62, minDay: 53.0, maxDay: 62.0, desc: 'Ovary elongates past persistent calyx into a green conical pod.' },
      { stage: PlantStages.FRUIT_DEVELOPMENT, name: 'Green Pod Expansion', minProgress: 0.62, maxProgress: 0.72, minDay: 63.0, maxDay: 72.0, desc: 'Chilli pods rapidly lengthen and develop characteristic pungency.' },
      { stage: PlantStages.RIPENING, name: 'Breaker Variegation', minProgress: 0.72, maxProgress: 0.82, minDay: 73.0, maxDay: 82.0, desc: 'Chlorophyll fades; carotenoid and capsanthin synthesis shifts pod to orange-red.' },
      { stage: PlantStages.MATURE, name: 'Fiery Crimson Pods', minProgress: 0.82, maxProgress: 1.00, minDay: 83.0, maxDay: 95.0, desc: 'Glossy deep-red ripe cayenne chillies suspended from sturdy branches.' },
    ],

    senescenceStageConfigs: [
      { stage: PlantStages.EARLY_SENESCENCE, name: 'Foliar Chlorosis', minProgress: 1.00, maxProgress: 1.00, minDay: 125.0, maxDay: 138.0, desc: 'Upper leaves turn yellow; plant redirects final photosynthates to ripe pods.' },
      { stage: PlantStages.ADVANCED_SENESCENCE, name: 'Stem Lignification & Drop', minProgress: 1.00, maxProgress: 1.00, minDay: 138.0, maxDay: 150.0, desc: 'Leaves abscise, leaving woody stems bearing wrinkled mature pods.' },
      { stage: PlantStages.TERMINAL, name: 'Terminal State', minProgress: 1.00, maxProgress: 1.00, minDay: 150.0, maxDay: 150.0, desc: 'Lifecycle complete: Senescence finished. Biological processes ceased.' },
    ],
  },

  [SPECIES_IDS.RICE]: {
    id: SPECIES_IDS.RICE,
    commonName: 'Rice',
    scientificName: 'Oryza sativa',
    family: 'Poaceae',
    variety: 'Indica Lowland Paddy Rice',
    description:
      'Semi-aquatic cereal grass with copious tillering culms, erect linear leaves with prominent midribs, aerenchyma tissue, and drooping grain panicles.',

    maxStemHeight: 1.25,
    maxStemThickness: 0.05,
    maxRootDepth: 0.95,       // Adapted for waterlogged paddy soils with aerenchyma
    maxRootSpread: 0.75,

    lifecycle: {
      totalMaturityDays: 130,
      maturityDurationDays: 20,
      senescenceOnsetDays: 150,
      senescenceDurationDays: 25,
      terminalAgeDays: 175,
      nominalSeasonDuration: 95.0,
      phases: [
        { key: 'germination', name: 'Submerged Sprouting', dayStart: 1, dayEnd: 12, progressStart: 0.0, progressEnd: 0.10 },
        { key: 'vegetative', name: 'Copious Tillering & Elongation', dayStart: 13, dayEnd: 60, progressStart: 0.10, progressEnd: 0.45 },
        { key: 'flowering', name: 'Panicle Exsertion & Anthesis', dayStart: 61, dayEnd: 80, progressStart: 0.45, progressEnd: 0.65 },
        { key: 'reproductive', name: 'Milky Dough Grain Filling', dayStart: 81, dayEnd: 110, progressStart: 0.65, progressEnd: 0.88 },
        { key: 'maturity', name: 'Golden Grain Harvest', dayStart: 111, dayEnd: 130, progressStart: 0.88, progressEnd: 1.00 },
      ],
    },

    optimalEnvironment: {
      moistureMin: 75,
      moistureMax: 98, // Semi-aquatic crop thriving in flooded / near-saturated soil
      lightMin: 65,
      lightMax: 95,
      temperatureMin: 24,
      temperatureMax: 34, // Warm tropical/subtropical requirements
      nutrientsMin: 55,
      nutrientsMax: 90,
    },

    architecture: {
      growthHabit: 'semi_aquatic_tillering_culms',
      branching: false,
      maxBranches: 0,
      leafType: 'erect_linear_blade',
      maxLeaves: 20,
      inflorescenceType: 'drooping_branched_panicle',
      maxFlowers: 1,
      hasFruit: true,
      fruitType: 'panicle_grain',
      maxFruits: 1,
      rootArchitecture: 'shallow_adventitious_aerenchyma',
      taprootProminence: 0.2,
    },

    stageConfigs: [
      { stage: PlantStages.SEED, name: 'Paddy Imbibition', minProgress: 0.00, maxProgress: 0.03, minDay: 0.0, maxDay: 3.0, desc: 'Paddy grain hydrates under warm, anaerobic submerged conditions.' },
      { stage: PlantStages.GERMINATION, name: 'Coleoptile Sprout', minProgress: 0.03, maxProgress: 0.06, minDay: 3.0, maxDay: 6.0, desc: 'Coleoptile emerges upward toward oxygen and light.' },
      { stage: PlantStages.ROOT_DEVELOPMENT, name: 'Aerenchyma Crown', minProgress: 0.06, maxProgress: 0.08, minDay: 6.0, maxDay: 8.0, desc: 'Adventitious roots form with internal aerenchyma channels for oxygen diffusion.' },
      { stage: PlantStages.SHOOT_EMERGENCE, name: 'Waterline Piercing', minProgress: 0.08, maxProgress: 0.10, minDay: 8.0, maxDay: 12.0, desc: 'First green leaf breaches the water surface.' },
      { stage: PlantStages.SEEDLING, name: 'Seedling Establishment', minProgress: 0.10, maxProgress: 0.22, minDay: 13.0, maxDay: 28.0, desc: 'Slender, erect leaves grow with ligules and auricles.' },
      { stage: PlantStages.VEGETATIVE_GROWTH, name: 'Active Tillering', minProgress: 0.22, maxProgress: 0.45, minDay: 29.0, maxDay: 60.0, desc: 'Culms multiply rapidly from the crown into a dense, luxuriant clump.' },
      { stage: PlantStages.BUD_FORMATION, name: 'Panicle Initiation', minProgress: 0.45, maxProgress: 0.55, minDay: 61.0, maxDay: 70.0, desc: 'Microscopic branched panicle forms inside the stem base.' },
      { stage: PlantStages.FLOWERING, name: 'Heading & Anthesis', minProgress: 0.55, maxProgress: 0.65, minDay: 71.0, maxDay: 80.0, desc: 'Panicle emerges from flag leaf; glumes open for brief morning anthesis.' },
      { stage: PlantStages.FRUIT_SET, name: 'Milky Kernel Fill', minProgress: 0.65, maxProgress: 0.75, minDay: 81.0, maxDay: 92.0, desc: 'Spikelets fill with milky liquid starch; panicle begins nodding.' },
      { stage: PlantStages.FRUIT_DEVELOPMENT, name: 'Soft Dough Stage', minProgress: 0.75, maxProgress: 0.82, minDay: 93.0, maxDay: 102.0, desc: 'Grain solidifies into soft dough; hulls turn light green-yellow.' },
      { stage: PlantStages.RIPENING, name: 'Hard Dough Yellowing', minProgress: 0.82, maxProgress: 0.88, minDay: 103.0, maxDay: 110.0, desc: 'Kernels harden; panicles turn golden yellow and arch downward under weight.' },
      { stage: PlantStages.MATURE, name: 'Golden Paddy Harvest', minProgress: 0.88, maxProgress: 1.00, minDay: 111.0, maxDay: 130.0, desc: 'Bountiful golden panicles fully bowed with mature, hard rough rice grains.' },
    ],

    senescenceStageConfigs: [
      { stage: PlantStages.EARLY_SENESCENCE, name: 'Stover Yellowing', minProgress: 1.00, maxProgress: 1.00, minDay: 150.0, maxDay: 162.0, desc: 'Culms and leaves fade from green to straw gold as grain desiccation completes.' },
      { stage: PlantStages.ADVANCED_SENESCENCE, name: 'Field Senescence', minProgress: 1.00, maxProgress: 1.00, minDay: 162.0, maxDay: 175.0, desc: 'Complete senescence of paddy stover; grains ready for sickle harvest.' },
      { stage: PlantStages.TERMINAL, name: 'Terminal State', minProgress: 1.00, maxProgress: 1.00, minDay: 175.0, maxDay: 175.0, desc: 'Lifecycle complete: Senescence finished. Biological processes ceased.' },
    ],
  },

  [SPECIES_IDS.ROSE]: {
    id: SPECIES_IDS.ROSE,
    commonName: 'Rose',
    scientificName: 'Rosa rubiginosa',
    family: 'Rosaceae',
    variety: 'Shrub Rose / Sweet Briar',
    description:
      'Lignified woody perennial shrub with prickle-bearing canes, odd-pinnately compound serrated leaflets, urn-shaped buds, and fragrant multi-petaled corollas.',

    maxStemHeight: 1.80,
    maxStemThickness: 0.14,   // Sturdy woody cane
    maxRootDepth: 1.60,       // Deep woody anchoring taproot
    maxRootSpread: 1.30,

    lifecycle: {
      totalMaturityDays: 85,
      maturityDurationDays: 30,
      senescenceOnsetDays: 115,
      senescenceDurationDays: 25,
      terminalAgeDays: 140,
      nominalSeasonDuration: 85.0,
      phases: [
        { key: 'germination', name: 'Cane Sprouting & Radicle', dayStart: 1, dayEnd: 10, progressStart: 0.0, progressEnd: 0.10 },
        { key: 'vegetative', name: 'Woody Canes & Compound Foliage', dayStart: 11, dayEnd: 35, progressStart: 0.10, progressEnd: 0.40 },
        { key: 'flowering', name: 'Sepal Opening & Petal Bloom', dayStart: 36, dayEnd: 55, progressStart: 0.40, progressEnd: 0.65 },
        { key: 'reproductive', name: 'Petal Spread & Hip Setting', dayStart: 56, dayEnd: 75, progressStart: 0.65, progressEnd: 0.88 },
        { key: 'maturity', name: 'Peak Floral Flourish', dayStart: 76, dayEnd: 85, progressStart: 0.88, progressEnd: 1.00 },
      ],
    },

    optimalEnvironment: {
      moistureMin: 50,
      moistureMax: 75,
      lightMin: 60,
      lightMax: 85,
      temperatureMin: 18,
      temperatureMax: 26,
      nutrientsMin: 50,
      nutrientsMax: 80,
    },

    architecture: {
      growthHabit: 'lignified_prickly_shrub',
      branching: true,
      maxBranches: 4,
      leafType: 'pinnate_compound_serrate',
      maxLeaves: 24,
      inflorescenceType: 'multi_petal_corolla',
      maxFlowers: 4,
      hasFruit: true,
      fruitType: 'rose_hip',
      maxFruits: 4,
      rootArchitecture: 'deep_woody_taproot',
      taprootProminence: 0.85,
    },

    stageConfigs: [
      { stage: PlantStages.SEED, name: 'Achene Imbibition', minProgress: 0.00, maxProgress: 0.03, minDay: 0.0, maxDay: 3.0, desc: 'Rose achene seed softens after cold stratification period.' },
      { stage: PlantStages.GERMINATION, name: 'Radicle Anchor', minProgress: 0.03, maxProgress: 0.06, minDay: 3.0, maxDay: 6.0, desc: 'Strong taproot descends deeply into subsoil.' },
      { stage: PlantStages.ROOT_DEVELOPMENT, name: 'Woody Root Crown', minProgress: 0.06, maxProgress: 0.08, minDay: 6.0, maxDay: 8.0, desc: 'Root crown suberizes and branches lateral woody roots.' },
      { stage: PlantStages.SHOOT_EMERGENCE, name: 'Cane Emergence', minProgress: 0.08, maxProgress: 0.10, minDay: 8.0, maxDay: 10.0, desc: 'Red-tinted young shoot emerges bearing fine prickles.' },
      { stage: PlantStages.SEEDLING, name: 'First Pinnate Leaves', minProgress: 0.10, maxProgress: 0.22, minDay: 11.0, maxDay: 22.0, desc: 'First odd-pinnate leaf emerges with serrated margins.' },
      { stage: PlantStages.VEGETATIVE_GROWTH, name: 'Cane Arching & Foliage', minProgress: 0.22, maxProgress: 0.40, minDay: 23.0, maxDay: 35.0, desc: 'Woody canes elongate, branching laterally with dark glossy foliage.' },
      { stage: PlantStages.BUD_FORMATION, name: 'Swelling Sepals', minProgress: 0.40, maxProgress: 0.50, minDay: 36.0, maxDay: 45.0, desc: 'Urn-shaped floral buds form; green sepals begin reflexing.' },
      { stage: PlantStages.FLOWERING, name: 'Corolla Anthesis', minProgress: 0.50, maxProgress: 0.65, minDay: 46.0, maxDay: 55.0, desc: 'Velvety petals unfold in concentric whorls around golden stamens.' },
      { stage: PlantStages.FRUIT_SET, name: 'Full Bloom & Scent', minProgress: 0.65, maxProgress: 0.78, minDay: 56.0, maxDay: 65.0, desc: 'Magnificent multi-petaled rose in peak bloom emitting sweet fragrance.' },
      { stage: PlantStages.FRUIT_DEVELOPMENT, name: 'Petal Maturation', minProgress: 0.78, maxProgress: 0.85, minDay: 66.0, maxDay: 72.0, desc: 'Petals mature fully as hypanthium begins swelling below sepals.' },
      { stage: PlantStages.RIPENING, name: 'Early Hip Formation', minProgress: 0.85, maxProgress: 0.92, minDay: 73.0, maxDay: 78.0, desc: 'Outer petals age; central hypanthium begins forming vitamin C-rich hip.' },
      { stage: PlantStages.MATURE, name: 'Peak Floral Shrub', minProgress: 0.92, maxProgress: 1.00, minDay: 79.0, maxDay: 85.0, desc: 'Stately rose shrub with lush compound canopy and vibrant blooms.' },
    ],

    senescenceStageConfigs: [
      { stage: PlantStages.EARLY_SENESCENCE, name: 'Petal Abscission', minProgress: 1.00, maxProgress: 1.00, minDay: 115.0, maxDay: 128.0, desc: 'Velvety petals fade in color and abscise, leaving the central hip.' },
      { stage: PlantStages.ADVANCED_SENESCENCE, name: 'Woody Dormancy', minProgress: 1.00, maxProgress: 1.00, minDay: 128.0, maxDay: 140.0, desc: 'Foliage drops and canes enter winter dormancy hardening.' },
      { stage: PlantStages.TERMINAL, name: 'Terminal State', minProgress: 1.00, maxProgress: 1.00, minDay: 140.0, maxDay: 140.0, desc: 'Lifecycle complete: Senescence finished. Biological processes ceased.' },
    ],
  },
};

/**
 * Returns the species configuration object by ID with safe fallback to Tomato
 */
export function getSpeciesConfig(speciesId) {
  if (!speciesId) return SPECIES_REGISTRY[SPECIES_IDS.TOMATO];

  const lower = String(speciesId).toLowerCase().trim();
  if (lower === 'solanum_lycopersicum' || lower === 'tomato') {
    return SPECIES_REGISTRY[SPECIES_IDS.TOMATO];
  }
  if (lower === 'helianthus_annuus' || lower === 'sunflower') {
    return SPECIES_REGISTRY[SPECIES_IDS.SUNFLOWER];
  }
  if (lower === 'fragaria_ananassa' || lower === 'fragaria' || lower === 'strawberry') {
    return SPECIES_REGISTRY[SPECIES_IDS.STRAWBERRY];
  }
  if (lower === 'triticum_aestivum' || lower === 'triticum' || lower === 'wheat') {
    return SPECIES_REGISTRY[SPECIES_IDS.WHEAT];
  }
  if (lower === 'capsicum_annuum' || lower === 'capsicum' || lower === 'chilli' || lower === 'chili' || lower === 'pepper') {
    return SPECIES_REGISTRY[SPECIES_IDS.CHILLI];
  }
  if (lower === 'oryza_sativa' || lower === 'oryza' || lower === 'rice' || lower === 'paddy') {
    return SPECIES_REGISTRY[SPECIES_IDS.RICE];
  }
  if (lower === 'rosa' || lower === 'rose' || lower === 'rosa_rubiginosa') {
    return SPECIES_REGISTRY[SPECIES_IDS.ROSE];
  }

  return SPECIES_REGISTRY[lower] || SPECIES_REGISTRY[SPECIES_IDS.TOMATO];
}

/**
 * Returns all registered species as a list
 */
export function getAllSpecies() {
  return Object.values(SPECIES_REGISTRY);
}

/**
 * Returns full developmental + senescence stage list for a given species
 */
export function getAllStagesForSpecies(speciesConfig) {
  const cfg = typeof speciesConfig === 'string'
    ? getSpeciesConfig(speciesConfig)
    : (speciesConfig || getSpeciesConfig());
  return [...(cfg.stageConfigs || []), ...(cfg.senescenceStageConfigs || [])];
}

/**
 * Resolves active developmental stage from species configuration, progress, and simulated age
 */
export function getActiveStage(speciesConfig, overallProgress, ageDays = null) {
  const stages = speciesConfig?.stageConfigs || SPECIES_REGISTRY[SPECIES_IDS.TOMATO].stageConfigs;
  const senescenceStages = speciesConfig?.senescenceStageConfigs || [];
  const onsetDay = speciesConfig?.lifecycle?.senescenceOnsetDays ?? 100.0;
  const terminalDay = speciesConfig?.lifecycle?.terminalAgeDays ?? 120.0;

  // If plant has reached senescence age, resolve from senescence stages
  if (ageDays !== null && ageDays >= onsetDay && senescenceStages.length > 0) {
    if (ageDays >= terminalDay) {
      const termCfg = senescenceStages[senescenceStages.length - 1];
      return {
        stageConfig: termCfg,
        stageIndex: stages.length + senescenceStages.length - 1,
        stage: termCfg.stage,
        stageProgress: 1.0,
      };
    }
    for (let i = 0; i < senescenceStages.length; i++) {
      const sc = senescenceStages[i];
      if (ageDays >= sc.minDay && ageDays < sc.maxDay) {
        const range = sc.maxDay - sc.minDay || 1;
        const progress = Math.min(1.0, Math.max(0.0, (ageDays - sc.minDay) / range));
        return {
          stageConfig: sc,
          stageIndex: stages.length + i,
          stage: sc.stage,
          stageProgress: progress,
        };
      }
    }
    const lastSc = senescenceStages[senescenceStages.length - 1];
    return {
      stageConfig: lastSc,
      stageIndex: stages.length + senescenceStages.length - 1,
      stage: lastSc.stage,
      stageProgress: 1.0,
    };
  }

  let activeStageConfig = stages[0];
  let stageIndex = 0;

  for (let i = 0; i < stages.length; i++) {
    const cfg = stages[i];
    if (overallProgress >= cfg.minProgress) {
      activeStageConfig = cfg;
      stageIndex = i;
    }
  }

  const range = activeStageConfig.maxProgress - activeStageConfig.minProgress || 0.001;
  const stageProgress = Math.min(1.0, Math.max(0.0, (overallProgress - activeStageConfig.minProgress) / range));

  return {
    stageConfig: activeStageConfig,
    stageIndex,
    stage: activeStageConfig.stage,
    stageProgress,
  };
}

/**
 * Normalizes any species ID or alias to canonical form
 */
export function normalizeSpeciesId(speciesId) {
  if (!speciesId) return SPECIES_IDS.TOMATO;
  const lower = String(speciesId).toLowerCase().trim();
  if (lower === 'solanum_lycopersicum' || lower === 'tomato') return SPECIES_IDS.TOMATO;
  if (lower === 'helianthus_annuus' || lower === 'sunflower') return SPECIES_IDS.SUNFLOWER;
  if (lower === 'fragaria_ananassa' || lower === 'fragaria' || lower === 'strawberry') return SPECIES_IDS.STRAWBERRY;
  if (lower === 'triticum_aestivum' || lower === 'triticum' || lower === 'wheat') return SPECIES_IDS.WHEAT;
  if (lower === 'capsicum_annuum' || lower === 'capsicum' || lower === 'chilli' || lower === 'chili' || lower === 'pepper') return SPECIES_IDS.CHILLI;
  if (lower === 'oryza_sativa' || lower === 'oryza' || lower === 'rice' || lower === 'paddy') return SPECIES_IDS.RICE;
  if (lower === 'rosa' || lower === 'rose' || lower === 'rosa_rubiginosa') return SPECIES_IDS.ROSE;
  return SPECIES_REGISTRY[lower]?.id || SPECIES_IDS.TOMATO;
}
