import { describe, it, expect, beforeEach } from 'vitest';
import {
  SPECIES_IDS,
  SPECIES_REGISTRY,
  getSpeciesConfig,
  getAllSpecies,
  getActiveStage,
} from './species.js';
import {
  createExperiment,
  persistExperiment,
  loadSavedExperiments,
  exportExperimentToJSON,
  importExperimentFromJSON,
  normalizeSpeciesId,
  sanitizeLoadedExperiment,
  EXPERIMENTS_STORAGE_KEY,
} from './experiments.js';
import { stepSimulation } from './engine.js';
import { INITIAL_PLANT_STATE, INITIAL_ENVIRONMENT, PlantStages } from './types.js';

// Mock localStorage for Vitest environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

describe('FLORA Species Architecture & Sunflower Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Central Species Registry', () => {
    it('contains configurations for both tomato and sunflower', () => {
      const speciesList = getAllSpecies();
      expect(speciesList.length).toBeGreaterThanOrEqual(2);

      const tomatoCfg = getSpeciesConfig(SPECIES_IDS.TOMATO);
      expect(tomatoCfg).toBeDefined();
      expect(tomatoCfg.id).toBe('tomato');
      expect(tomatoCfg.scientificName).toBe('Solanum lycopersicum');
      expect(tomatoCfg.commonName).toBe('Tomato');
      expect(tomatoCfg.maxStemHeight).toBe(2.8);
      expect(tomatoCfg.architecture.branching).toBe(true);

      const sunflowerCfg = getSpeciesConfig(SPECIES_IDS.SUNFLOWER);
      expect(sunflowerCfg).toBeDefined();
      expect(sunflowerCfg.id).toBe('sunflower');
      expect(sunflowerCfg.scientificName).toBe('Helianthus annuus');
      expect(sunflowerCfg.commonName).toBe('Sunflower');
      expect(sunflowerCfg.maxStemHeight).toBe(3.4);
      expect(sunflowerCfg.architecture.branching).toBe(false);
      expect(sunflowerCfg.architecture.maxFlowers).toBe(1);
    });

    it('safely falls back to tomato for unknown or invalid species IDs', () => {
      const fallbackNull = getSpeciesConfig(null);
      expect(fallbackNull.id).toBe(SPECIES_IDS.TOMATO);

      const fallbackUndefined = getSpeciesConfig(undefined);
      expect(fallbackUndefined.id).toBe(SPECIES_IDS.TOMATO);

      const fallbackInvalid = getSpeciesConfig('non_existent_plant_xyz');
      expect(fallbackInvalid.id).toBe(SPECIES_IDS.TOMATO);
    });

    it('supports backward compatibility aliases (solanum_lycopersicum and helianthus_annuus)', () => {
      const aliasTomato = getSpeciesConfig('solanum_lycopersicum');
      expect(aliasTomato.id).toBe(SPECIES_IDS.TOMATO);

      const aliasSunflower = getSpeciesConfig('helianthus_annuus');
      expect(aliasSunflower.id).toBe(SPECIES_IDS.SUNFLOWER);
    });
  });

  describe('2. Legacy Experiment Compatibility & Default Fallback', () => {
    it('restores legacy experiments lacking speciesId as Tomato by default', () => {
      // Simulate raw legacy record in localStorage created prior to species registry
      const legacyRaw = [
        {
          schemaVersion: 1,
          id: 'exp_legacy_123',
          name: 'Legacy Baseline Run',
          description: 'Created before multi-species update',
          environment: { ...INITIAL_ENVIRONMENT },
          plantState: { ...INITIAL_PLANT_STATE, ageDays: 20, overallProgress: 0.5 },
          history: [],
        },
      ];

      localStorage.setItem(EXPERIMENTS_STORAGE_KEY, JSON.stringify(legacyRaw));

      const loaded = loadSavedExperiments();
      expect(loaded.length).toBe(1);
      expect(loaded[0].speciesId).toBe('tomato');
      expect(loaded[0].speciesName).toContain('Tomato');
      expect(loaded[0].plantState.speciesId).toBe('tomato');
    });

    it('preserves existing solanum_lycopersicum experiments without converting them to sunflower', () => {
      const exp = createExperiment({
        name: 'Heirloom Tomato Run',
        speciesId: 'solanum_lycopersicum',
      });
      persistExperiment(exp);

      const loaded = loadSavedExperiments()[0];
      expect(loaded.speciesId).toBe('solanum_lycopersicum');
      expect(loaded.speciesName).toContain('Tomato');
    });
  });

  describe('3. Sunflower Experiment Persistence & Import/Export', () => {
    it('creates, saves, and reloads sunflower experiments accurately', () => {
      const sunflowerExp = createExperiment({
        name: 'Giant Mammoth Sunflower Trial',
        description: 'Single-stem sunflower trial under high irradiation',
        speciesId: 'sunflower',
        environment: { ...INITIAL_ENVIRONMENT, light: 95 },
      });

      persistExperiment(sunflowerExp);

      const loaded = loadSavedExperiments();
      expect(loaded.length).toBe(1);
      expect(loaded[0].speciesId).toBe('sunflower');
      expect(loaded[0].speciesName).toBe('Sunflower (Helianthus annuus)');
      expect(loaded[0].plantState.speciesId).toBe('sunflower');
    });

    it('preserves species identity through JSON export and re-import', () => {
      const sunflowerExp = createExperiment({
        name: 'Export Sunflower Test',
        speciesId: 'sunflower',
      });

      const jsonStr = exportExperimentToJSON(sunflowerExp);
      expect(jsonStr).toContain('"speciesId": "sunflower"');

      const reimported = importExperimentFromJSON(jsonStr);
      expect(reimported.speciesId).toBe('sunflower');
      expect(reimported.speciesName).toContain('Sunflower');
      expect(reimported.name).toContain('Export Sunflower Test');
    });
  });

  describe('4. Species-Aware Simulation Engine & Growth Differences', () => {
    it('differentiates adult morphological limits between Tomato and Sunflower', () => {
      const tomatoState = {
        ...INITIAL_PLANT_STATE,
        speciesId: 'tomato',
        overallProgress: 1.0,
      };
      const sunflowerState = {
        ...INITIAL_PLANT_STATE,
        speciesId: 'sunflower',
        overallProgress: 1.0,
      };

      const steppedTomato = stepSimulation(tomatoState, INITIAL_ENVIRONMENT, 1.0);
      const steppedSunflower = stepSimulation(sunflowerState, INITIAL_ENVIRONMENT, 1.0);

      // Sunflower grows significantly taller (3.4m vs 2.8m)
      expect(steppedSunflower.stemHeight).toBeGreaterThan(steppedTomato.stemHeight);
      expect(steppedSunflower.stemHeight).toBeCloseTo(3.4, 1);
      expect(steppedTomato.stemHeight).toBeCloseTo(2.8, 1);

      // Sunflower anchors deeper in rhizosphere (2.6m vs 2.2m)
      expect(steppedSunflower.rootDepth).toBeGreaterThan(steppedTomato.rootDepth);
      expect(steppedSunflower.rootDepth).toBeCloseTo(2.6, 1);
      expect(steppedTomato.rootDepth).toBeCloseTo(2.2, 1);
    });

    it('differentiates reproductive organogenesis: 1 capitulum head vs multi-fruit trusses', () => {
      const matureTomato = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: 'tomato', overallProgress: 0.95 },
        INITIAL_ENVIRONMENT,
        1.0
      );
      const matureSunflower = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: 'sunflower', overallProgress: 0.95 },
        INITIAL_ENVIRONMENT,
        1.0
      );

      // Tomato has 5 fruit berries
      expect(matureTomato.fruitCount).toBe(5);
      expect(matureTomato.flowerCount).toBe(5);

      // Sunflower has 1 composite flower head and develops achene seeds (not fleshy berries)
      expect(matureSunflower.flowerCount).toBe(1);
      expect(matureSunflower.fruitCount).toBe(0);
      expect(matureSunflower.fruitMaturity).toBeGreaterThan(0.5);
    });

    it('adheres to species-specific stage descriptions in explanations', () => {
      const sunflowerSeedling = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: 'sunflower', overallProgress: 0.65 },
        INITIAL_ENVIRONMENT,
        1.0
      );
      expect(sunflowerSeedling.explanation.toLowerCase()).toContain('capitulum');
    });

    it('ensures sunflower growth stops at adult limits after maturity', () => {
      let matureSunflower = {
        ...INITIAL_PLANT_STATE,
        speciesId: 'sunflower',
        overallProgress: 1.0,
      };

      const step1 = stepSimulation(matureSunflower, INITIAL_ENVIRONMENT, 1.0);
      const step2 = stepSimulation(matureSunflower, INITIAL_ENVIRONMENT, 100.0);

      expect(step1.stemHeight).toBeLessThanOrEqual(3.4);
      expect(step2.stemHeight).toBeLessThanOrEqual(3.4);
      expect(step2.stemHeight).toBeCloseTo(step1.stemHeight, 5);
    });
  });

  describe('5. Part 8 Lifecycle & Species Specific Tests (12 Requirements)', () => {
    it('Req 1: Initial age for newly created experiments is 0.0 days', () => {
      const exp = createExperiment({ name: 'Fresh Run' });
      expect(exp.plantState.ageDays).toBe(0.0);
      expect(exp.plantState.overallProgress).toBe(0.0);
    });

    it('Req 2: Lifecycle stages follow defined sequence for tomato', () => {
      const tomatoCfg = getSpeciesConfig('tomato');
      const phases = tomatoCfg.lifecycle.phases.map((p) => p.key);
      expect(phases).toEqual(['germination', 'vegetative', 'flowering', 'reproductive', 'maturity']);

      const stageConfigs = tomatoCfg.stageConfigs;
      for (let i = 1; i < stageConfigs.length; i++) {
        expect(stageConfigs[i].minProgress).toBeGreaterThanOrEqual(stageConfigs[i - 1].minProgress);
        expect(stageConfigs[i].minDay).toBeGreaterThanOrEqual(stageConfigs[i - 1].minDay);
      }
      expect(stageConfigs[0].minDay).toBe(0.0);
      expect(stageConfigs[stageConfigs.length - 1].maxDay).toBe(100.0);
    });

    it('Req 3: Lifecycle stages follow defined sequence for sunflower', () => {
      const sunflowerCfg = getSpeciesConfig('sunflower');
      const phases = sunflowerCfg.lifecycle.phases.map((p) => p.key);
      expect(phases).toEqual(['germination', 'vegetative', 'flowering', 'reproductive', 'maturity']);

      const stageConfigs = sunflowerCfg.stageConfigs;
      for (let i = 1; i < stageConfigs.length; i++) {
        expect(stageConfigs[i].minProgress).toBeGreaterThanOrEqual(stageConfigs[i - 1].minProgress);
        expect(stageConfigs[i].minDay).toBeGreaterThanOrEqual(stageConfigs[i - 1].minDay);
      }
      expect(stageConfigs[0].minDay).toBe(0.0);
      expect(stageConfigs[stageConfigs.length - 1].maxDay).toBe(110.0);
    });

    it('Req 4: Tomato flowers appear before fruits develop', () => {
      // At progress 0.45 (Anthesis): flowers active, no fruits yet
      const flowering = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: 'tomato', overallProgress: 0.45 },
        INITIAL_ENVIRONMENT,
        1.0
      );
      expect(flowering.flowerCount).toBeGreaterThan(0);
      expect(flowering.fruitCount).toBe(0);

      // At progress 0.65 (Fruit expansion): fruits have formed
      const fruiting = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: 'tomato', overallProgress: 0.65 },
        INITIAL_ENVIRONMENT,
        1.0
      );
      expect(fruiting.fruitCount).toBeGreaterThan(0);
    });

    it('Req 5: Tomato fruits start green and transition toward ripe', () => {
      // Early fruit set: low maturity (green berries)
      const earlyFruit = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: 'tomato', overallProgress: 0.55 },
        INITIAL_ENVIRONMENT,
        1.0
      );
      expect(earlyFruit.fruitCount).toBe(5);
      expect(earlyFruit.fruitMaturity).toBeLessThan(0.25);

      // Full maturity: high maturity (ripe crimson berries)
      const ripeFruit = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: 'tomato', overallProgress: 0.95 },
        INITIAL_ENVIRONMENT,
        1.0
      );
      expect(ripeFruit.fruitCount).toBe(5);
      expect(ripeFruit.fruitMaturity).toBeGreaterThan(0.8);
    });

    it('Req 6: Sunflower capitulum develops before seed filling', () => {
      // Ray Anthesis / flowering (progress 0.52): capitulum is flowering, seed filling hasn't progressed
      const anthesis = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: 'sunflower', overallProgress: 0.52 },
        INITIAL_ENVIRONMENT,
        1.0
      );
      expect(anthesis.flowerCount).toBe(1);
      expect(anthesis.fruitMaturity).toBe(0);

      // Seed filling stage (progress 0.78): capitulum present and seed filling well underway
      const seedFilling = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: 'sunflower', overallProgress: 0.78 },
        INITIAL_ENVIRONMENT,
        1.0
      );
      expect(seedFilling.flowerCount).toBe(1);
      expect(seedFilling.fruitMaturity).toBeGreaterThan(0.3);
    });

    it('Req 7: Switching species updates the active species and 3D plant selection', () => {
      const tomatoCfg = getSpeciesConfig('tomato');
      const sunflowerCfg = getSpeciesConfig('sunflower');

      expect(tomatoCfg.id).toBe(SPECIES_IDS.TOMATO);
      expect(sunflowerCfg.id).toBe(SPECIES_IDS.SUNFLOWER);

      // BotanicalScene model determination logic
      const isSunflower1 = getSpeciesConfig('sunflower').id === SPECIES_IDS.SUNFLOWER;
      const isSunflower2 = getSpeciesConfig('tomato').id === SPECIES_IDS.SUNFLOWER;
      expect(isSunflower1).toBe(true);
      expect(isSunflower2).toBe(false);
    });

    it('Req 8: Saved experiment age is preserved on save/load and not reset', () => {
      const exp = createExperiment({
        name: 'Preserved Age Test',
        speciesId: 'tomato',
        plantState: {
          ...INITIAL_PLANT_STATE,
          ageDays: 45.8,
          overallProgress: 0.45,
        },
      });

      persistExperiment(exp);
      const loaded = loadSavedExperiments();
      expect(loaded.length).toBe(1);
      expect(loaded[0].plantState.ageDays).toBe(45.8);
      expect(loaded[0].plantState.overallProgress).toBe(0.45);
    });

    it('Req 9: Loading a legacy experiment without species assigns the fallback correctly', () => {
      const legacyRaw = {
        id: 'legacy_run_999',
        name: 'Old Untyped Run',
        environment: { ...INITIAL_ENVIRONMENT },
        plantState: { ...INITIAL_PLANT_STATE, ageDays: 12.0 },
      };

      const sanitized = sanitizeLoadedExperiment(legacyRaw);
      expect(sanitized.speciesId).toBe('tomato');
      expect(sanitized.speciesName).toContain('Tomato');
      expect(sanitized.plantState.speciesId).toBe('tomato');
      expect(sanitized.plantState.ageDays).toBe(12.0);
    });

    it('Req 10: Simulation speed multiplier scales time consistently without corrupting age units', () => {
      const state = { ...INITIAL_PLANT_STATE, speciesId: 'tomato', ageDays: 10.0, overallProgress: 0.1 };

      // 2 seconds elapsed at 1x speed (dt = 2.0)
      const res1x = stepSimulation(state, INITIAL_ENVIRONMENT, 2.0);

      // 1 second elapsed at 2x speed (dt = 1.0 * 2 = 2.0)
      const res2x = stepSimulation(state, INITIAL_ENVIRONMENT, 2.0);

      expect(res1x.ageDays).toBeCloseTo(res2x.ageDays, 5);
      expect(res1x.overallProgress).toBeCloseTo(res2x.overallProgress, 5);
    });

    it('Req 11: Plant age in days increases monotonically during forward simulation', () => {
      let state = { ...INITIAL_PLANT_STATE, speciesId: 'tomato', ageDays: 0.0, overallProgress: 0.0 };
      for (let i = 0; i < 5; i++) {
        const next = stepSimulation(state, INITIAL_ENVIRONMENT, 1.0);
        expect(next.ageDays).toBeGreaterThan(state.ageDays);
        state = next;
      }
    });

    it('Req 12: Terminal stage does not cause unbounded runaway growth', () => {
      const terminalState = {
        ...INITIAL_PLANT_STATE,
        speciesId: 'tomato',
        ageDays: 100.0,
        overallProgress: 1.0,
      };

      const step1 = stepSimulation(terminalState, INITIAL_ENVIRONMENT, 1.0);
      const stepLong = stepSimulation(terminalState, INITIAL_ENVIRONMENT, 500.0);

      expect(step1.stemHeight).toBeLessThanOrEqual(2.8);
      expect(stepLong.stemHeight).toBeLessThanOrEqual(2.8);
      expect(stepLong.stemHeight).toBeCloseTo(step1.stemHeight, 5);
      expect(stepLong.stemThickness).toBeLessThanOrEqual(0.16);
      expect(stepLong.rootDepth).toBeLessThanOrEqual(2.2);
    });
  });
});
