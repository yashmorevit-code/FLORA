import { describe, it, expect } from 'vitest';
import {
  SPECIES_IDS,
  SPECIES_REGISTRY,
  getSpeciesConfig,
  getAllSpecies,
  getAllStagesForSpecies,
  getActiveStage,
  normalizeSpeciesId,
} from './species.js';
import { stepSimulation } from './engine.js';
import { SUPPORTED_SPECIES, createExperiment } from './experiments.js';
import { getOrganDetails, getOrganCameraTarget } from './anatomyData.js';
import { INITIAL_ENVIRONMENT, INITIAL_PLANT_STATE, PlantStages } from './types.js';

describe('FLORA Phase 4: Multi-Species Botanical Expansion (7 Species)', () => {
  const EXPECTED_SPECIES = [
    SPECIES_IDS.TOMATO,
    SPECIES_IDS.SUNFLOWER,
    SPECIES_IDS.STRAWBERRY,
    SPECIES_IDS.WHEAT,
    SPECIES_IDS.CHILLI,
    SPECIES_IDS.RICE,
    SPECIES_IDS.ROSE,
  ];

  describe('1. Central Species Registry Completeness', () => {
    it('registers exactly 7 distinct species in the registry', () => {
      const allSpecies = getAllSpecies();
      expect(allSpecies.length).toBe(7);
      const ids = allSpecies.map((s) => s.id);
      EXPECTED_SPECIES.forEach((id) => {
        expect(ids).toContain(id);
      });
    });

    it('each species possesses complete botanical metadata', () => {
      EXPECTED_SPECIES.forEach((id) => {
        const config = getSpeciesConfig(id);
        expect(config.id).toBe(id);
        expect(config.commonName).toBeTruthy();
        expect(config.scientificName).toBeTruthy();
        expect(config.family).toBeTruthy();
        expect(config.variety).toBeTruthy();
        expect(config.description).toBeTruthy();
        expect(config.maxStemHeight).toBeGreaterThan(0);
        expect(config.maxStemThickness).toBeGreaterThan(0);
        expect(config.maxRootDepth).toBeGreaterThan(0);
        expect(config.maxRootSpread).toBeGreaterThan(0);
        expect(config.lifecycle.totalMaturityDays).toBeGreaterThan(0);
        expect(config.lifecycle.terminalAgeDays).toBeGreaterThan(config.lifecycle.totalMaturityDays);
      });
    });

    it('differentiates morphological scales correctly', () => {
      const strawberry = getSpeciesConfig(SPECIES_IDS.STRAWBERRY);
      const sunflower = getSpeciesConfig(SPECIES_IDS.SUNFLOWER);
      const wheat = getSpeciesConfig(SPECIES_IDS.WHEAT);
      const rose = getSpeciesConfig(SPECIES_IDS.ROSE);

      // Strawberry is a low-growing rosette herb
      expect(strawberry.maxStemHeight).toBeLessThan(0.4);
      // Sunflower is an upright giant annual
      expect(sunflower.maxStemHeight).toBeGreaterThan(2.0);
      // Wheat is an erect hollow culm cereal
      expect(wheat.maxStemHeight).toBeGreaterThan(0.6);
      expect(wheat.maxStemHeight).toBeLessThan(1.5);
      // Rose is a woody shrub
      expect(rose.maxStemHeight).toBeGreaterThan(1.0);
    });

    it('defines 12 developmental milestones and 3 senescence stages per species', () => {
      EXPECTED_SPECIES.forEach((id) => {
        const config = getSpeciesConfig(id);
        expect(config.stageConfigs).toBeDefined();
        expect(config.stageConfigs.length).toBe(12);
        expect(config.senescenceStageConfigs).toBeDefined();
        expect(config.senescenceStageConfigs.length).toBe(3);

        const allStages = getAllStagesForSpecies(config);
        expect(allStages.length).toBe(15);
      });
    });

    it('normalizes aliases for all 7 species', () => {
      expect(normalizeSpeciesId('tomato')).toBe(SPECIES_IDS.TOMATO);
      expect(normalizeSpeciesId('strawberry')).toBe(SPECIES_IDS.STRAWBERRY);
      expect(normalizeSpeciesId('fragaria_ananassa')).toBe(SPECIES_IDS.STRAWBERRY);
      expect(normalizeSpeciesId('wheat')).toBe(SPECIES_IDS.WHEAT);
      expect(normalizeSpeciesId('triticum_aestivum')).toBe(SPECIES_IDS.WHEAT);
      expect(normalizeSpeciesId('chilli')).toBe(SPECIES_IDS.CHILLI);
      expect(normalizeSpeciesId('chili')).toBe(SPECIES_IDS.CHILLI);
      expect(normalizeSpeciesId('pepper')).toBe(SPECIES_IDS.CHILLI);
      expect(normalizeSpeciesId('rice')).toBe(SPECIES_IDS.RICE);
      expect(normalizeSpeciesId('oryza_sativa')).toBe(SPECIES_IDS.RICE);
      expect(normalizeSpeciesId('rose')).toBe(SPECIES_IDS.ROSE);
      expect(normalizeSpeciesId('rosa_rubiginosa')).toBe(SPECIES_IDS.ROSE);
    });
  });

  describe('2. Multi-Species Simulation Engine Dynamics', () => {
    it('simulates forward growth across all 7 species without NaN or errors', () => {
      EXPECTED_SPECIES.forEach((id) => {
        const config = getSpeciesConfig(id);
        let state = {
          ...INITIAL_PLANT_STATE,
          speciesId: id,
          ageDays: 0.0,
        };

        const env = {
          moisture: config.optimalEnvironment.moistureMin + 5,
          light: config.optimalEnvironment.lightMin + 5,
          temperature: config.optimalEnvironment.temperatureMin + 2,
          nutrients: config.optimalEnvironment.nutrientsMin + 5,
        };

        // Advance 50 steps (~75 simulated days)
        for (let i = 0; i < 50; i++) {
          state = stepSimulation(state, env, 1.0, 1.0);
          expect(Number.isNaN(state.overallProgress)).toBe(false);
          expect(Number.isNaN(state.stemHeight)).toBe(false);
          expect(Number.isNaN(state.rootDepth)).toBe(false);
          expect(state.stemHeight).toBeLessThanOrEqual(config.maxStemHeight * 1.05);
          expect(state.rootDepth).toBeLessThanOrEqual(config.maxRootDepth * 1.05);
        }

        expect(state.overallProgress).toBeGreaterThan(0.3);
        expect(state.ageDays).toBeGreaterThan(40);
        expect(state.explanation).toBeTruthy();
      });
    });

    it('differentiates species reproductive organogenesis', () => {
      const matureProgress = 0.85;

      // 1. Strawberry: multiple white flowers and aggregate berries
      const strawberryConfig = getSpeciesConfig(SPECIES_IDS.STRAWBERRY);
      const strawberryState = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: SPECIES_IDS.STRAWBERRY, overallProgress: matureProgress, ageDays: 85 },
        INITIAL_ENVIRONMENT,
        1.0,
        1.0
      );
      expect(strawberryState.fruitCount).toBe(strawberryConfig.architecture.maxFruits);
      expect(strawberryState.fruitMaturity).toBeGreaterThan(0.5);

      // 2. Wheat: 1 terminal grain spike, 0 fruits, grain filling maturity
      const wheatState = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: SPECIES_IDS.WHEAT, overallProgress: matureProgress, ageDays: 95 },
        INITIAL_ENVIRONMENT,
        1.0,
        1.0
      );
      expect(wheatState.flowerCount).toBe(1); // represents spike inflorescence
      expect(wheatState.fruitCount).toBe(0);
      expect(wheatState.fruitMaturity).toBeGreaterThan(0.5); // grain fill

      // 3. Chilli: multiple flowers and pendant peppers
      const chilliConfig = getSpeciesConfig(SPECIES_IDS.CHILLI);
      const chilliState = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: SPECIES_IDS.CHILLI, overallProgress: matureProgress, ageDays: 90 },
        INITIAL_ENVIRONMENT,
        1.0,
        1.0
      );
      expect(chilliState.fruitCount).toBe(chilliConfig.architecture.maxFruits);
      expect(chilliState.fruitMaturity).toBeGreaterThan(0.5);

      // 4. Rice: 1 nodding panicle, 0 fruits, grain fill maturity
      const riceState = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: SPECIES_IDS.RICE, overallProgress: matureProgress, ageDays: 105 },
        INITIAL_ENVIRONMENT,
        1.0,
        1.0
      );
      expect(riceState.flowerCount).toBe(1); // represents panicle inflorescence
      expect(riceState.fruitCount).toBe(0);
      expect(riceState.fruitMaturity).toBeGreaterThan(0.5);

      // 5. Rose: flowers and hypanthium rose hips
      const roseConfig = getSpeciesConfig(SPECIES_IDS.ROSE);
      const roseState = stepSimulation(
        { ...INITIAL_PLANT_STATE, speciesId: SPECIES_IDS.ROSE, overallProgress: matureProgress, ageDays: 110 },
        INITIAL_ENVIRONMENT,
        1.0,
        1.0
      );
      expect(roseState.fruitCount).toBe(roseConfig.architecture.maxFruits);
      expect(roseState.fruitMaturity).toBeGreaterThan(0.5);
    });
  });

  describe('3. Experiment Integration and Dropdown Support', () => {
    it('includes all 7 species in SUPPORTED_SPECIES for UI selection', () => {
      expect(SUPPORTED_SPECIES.length).toBe(7);
      const ids = SUPPORTED_SPECIES.map((s) => s.id);
      EXPECTED_SPECIES.forEach((id) => {
        expect(ids).toContain(id);
      });
    });

    it('creates experiments for newly added species with correct speciesName and age 0', () => {
      EXPECTED_SPECIES.forEach((id) => {
        const exp = createExperiment({
          name: `Trial for ${id}`,
          speciesId: id,
        });
        expect(exp.speciesId).toBe(id);
        expect(exp.speciesName).toContain(getSpeciesConfig(id).commonName);
        expect(exp.plantState.ageDays).toBe(0.0);
        expect(exp.plantState.speciesId).toBe(id);
      });
    });
  });

  describe('4. Anatomy Context & Camera Targeting for New Organs', () => {
    it('returns rich botanical organ context for stolons, culms, tillers, spikes, and hips', () => {
      const organsToTest = [
        { type: 'stolon', speciesId: SPECIES_IDS.STRAWBERRY, keyword: 'Stolon' },
        { type: 'culm', speciesId: SPECIES_IDS.WHEAT, keyword: 'Culm' },
        { type: 'tiller', speciesId: SPECIES_IDS.RICE, keyword: 'Tiller' },
        { type: 'spike', speciesId: SPECIES_IDS.WHEAT, keyword: 'Spike' },
        { type: 'panicle', speciesId: SPECIES_IDS.RICE, keyword: 'Panicle' },
        { type: 'hip', speciesId: SPECIES_IDS.ROSE, keyword: 'Hip' },
      ];

      organsToTest.forEach(({ type, speciesId, keyword }) => {
        const details = getOrganDetails({ id: `${type}-1`, type }, { speciesId, stemHeight: 0.5, rootDepth: 0.2 });
        expect(details).toBeTruthy();
        expect(details.partName).toContain(keyword);
        expect(details.botanicalContext.function).toBeTruthy();
        expect(details.species).toBe(getSpeciesConfig(speciesId).commonName);
      });
    });

    it('scales camera targeting appropriately for compact strawberry vs tall crops', () => {
      const strawberryTarget = getOrganCameraTarget(
        { type: 'apex', id: 'apex' },
        { speciesId: SPECIES_IDS.STRAWBERRY, stemHeight: 0.2, rootDepth: 0.1 }
      );
      const sunflowerTarget = getOrganCameraTarget(
        { type: 'apex', id: 'apex' },
        { speciesId: SPECIES_IDS.SUNFLOWER, stemHeight: 2.2, rootDepth: 1.5 }
      );

      // Strawberry apex should frame closely with small distance
      expect(strawberryTarget.distance).toBeLessThan(1.0);
      expect(strawberryTarget.target[1]).toBeLessThan(0.3);

      // Sunflower apex should frame higher up
      expect(sunflowerTarget.target[1]).toBeGreaterThan(2.0);
    });
  });
});
