import { describe, it, expect } from 'vitest';
import { stepSimulation, deriveLifecyclePhase } from './engine.js';
import {
  PlantStages,
  LifecyclePhases,
  INITIAL_ENVIRONMENT,
  INITIAL_PLANT_STATE,
} from './types.js';
import {
  getSpeciesConfig,
  getAllStagesForSpecies,
  getActiveStage,
  SPECIES_IDS,
} from './species.js';
import {
  getOrganCameraTarget,
  getOrganDetails,
} from './anatomyData.js';

describe('Phase 2: Finite Plant Lifecycle, Senescence & Terminal Clamping', () => {
  it('1. Species configs specify finite maturityDurationDays, senescenceOnsetDays, and terminalAgeDays', () => {
    const tomato = getSpeciesConfig(SPECIES_IDS.TOMATO);
    const sunflower = getSpeciesConfig(SPECIES_IDS.SUNFLOWER);

    expect(tomato.lifecycle.maturityDurationDays).toBe(35);
    expect(tomato.lifecycle.senescenceOnsetDays).toBe(135);
    expect(tomato.lifecycle.terminalAgeDays).toBe(160);

    expect(sunflower.lifecycle.maturityDurationDays).toBe(35);
    expect(sunflower.lifecycle.senescenceOnsetDays).toBe(145);
    expect(sunflower.lifecycle.terminalAgeDays).toBe(170);
  });

  it('2. getAllStagesForSpecies returns both the 12 developmental stages and the 3 senescence stages', () => {
    const tomato = getSpeciesConfig(SPECIES_IDS.TOMATO);
    const allStages = getAllStagesForSpecies(tomato);

    expect(allStages.length).toBe(15);
    expect(allStages[0].stage).toBe(PlantStages.SEED);
    expect(allStages[11].stage).toBe(PlantStages.MATURE);
    expect(allStages[12].stage).toBe(PlantStages.EARLY_SENESCENCE);
    expect(allStages[13].stage).toBe(PlantStages.ADVANCED_SENESCENCE);
    expect(allStages[14].stage).toBe(PlantStages.TERMINAL);
  });

  it('3. Plant transitions into senescence when age reaches senescenceOnsetDays', () => {
    const tomato = getSpeciesConfig(SPECIES_IDS.TOMATO);
    const preSenescent = {
      ...INITIAL_PLANT_STATE,
      speciesId: SPECIES_IDS.TOMATO,
      overallProgress: 1.0,
      ageDays: tomato.lifecycle.senescenceOnsetDays - 0.5,
    };

    const next = stepSimulation(preSenescent, INITIAL_ENVIRONMENT, 1.0);
    expect(next.ageDays).toBeGreaterThanOrEqual(tomato.lifecycle.senescenceOnsetDays);
    expect(next.senescenceProgress).toBeGreaterThan(0.0);
    expect(next.lifecyclePhase).toBe(LifecyclePhases.SENESCENCE);
  });

  it('4. Plant strictly caps at terminalAgeDays and becomes terminal (dead)', () => {
    const tomato = getSpeciesConfig(SPECIES_IDS.TOMATO);
    let state = {
      ...INITIAL_PLANT_STATE,
      speciesId: SPECIES_IDS.TOMATO,
      overallProgress: 1.0,
      ageDays: tomato.lifecycle.terminalAgeDays - 1.0,
      health: 25,
      isTerminal: false,
    };

    // Step across the boundary
    state = stepSimulation(state, INITIAL_ENVIRONMENT, 5.0);

    expect(state.isTerminal).toBe(true);
    expect(state.ageDays).toBe(tomato.lifecycle.terminalAgeDays);
    expect(state.senescenceProgress).toBe(1.0);
    expect(state.health).toBe(0.0);
    expect(state.growthRate).toBe(0.0);
    expect(state.lifecyclePhase).toBe(LifecyclePhases.TERMINAL);
    expect(state.stage).toBe(PlantStages.TERMINAL);
  });

  it('5. Stepping a dead/terminal plant does NOT advance age, alter health, or resurrect', () => {
    const tomato = getSpeciesConfig(SPECIES_IDS.TOMATO);
    const deadState = {
      ...INITIAL_PLANT_STATE,
      speciesId: SPECIES_IDS.TOMATO,
      overallProgress: 1.0,
      ageDays: tomato.lifecycle.terminalAgeDays,
      health: 0.0,
      growthRate: 0.0,
      senescenceProgress: 1.0,
      isTerminal: true,
      stage: PlantStages.TERMINAL,
      lifecyclePhase: LifecyclePhases.TERMINAL,
    };

    const next = stepSimulation(deadState, INITIAL_ENVIRONMENT, 10.0);
    expect(next.isTerminal).toBe(true);
    expect(next.ageDays).toBe(tomato.lifecycle.terminalAgeDays);
    expect(next.health).toBe(0.0);
    expect(next.growthRate).toBe(0.0);
  });

  it('6. Sunflower plant completes senescence at 170 days', () => {
    const sunflower = getSpeciesConfig(SPECIES_IDS.SUNFLOWER);
    let state = {
      ...INITIAL_PLANT_STATE,
      speciesId: SPECIES_IDS.SUNFLOWER,
      overallProgress: 1.0,
      ageDays: sunflower.lifecycle.terminalAgeDays - 0.5,
      health: 20,
    };

    state = stepSimulation(state, INITIAL_ENVIRONMENT, 2.0);
    expect(state.isTerminal).toBe(true);
    expect(state.ageDays).toBe(sunflower.lifecycle.terminalAgeDays);
    expect(state.lifecyclePhase).toBe(LifecyclePhases.TERMINAL);
  });
});

describe('Phase 2: 3D Camera Focus Targets & Inspection Data', () => {
  const sampleTomatoState = {
    ...INITIAL_PLANT_STATE,
    speciesId: SPECIES_IDS.TOMATO,
    stemHeight: 1.2,
    rootDepth: 0.8,
    overallProgress: 0.7,
    flowerCount: 4,
    fruitCount: 3,
    fruitMaturity: 0.8,
  };

  it('1. Computes optimal 3D camera targets for different tomato organs', () => {
    const apexTarget = getOrganCameraTarget({ id: 'apex-shoot', type: 'apex' }, sampleTomatoState);
    expect(apexTarget.target).toBeDefined();
    expect(apexTarget.cameraPosition).toBeDefined();
    expect(apexTarget.target[1]).toBeCloseTo(sampleTomatoState.stemHeight, 1);

    const stemTarget = getOrganCameraTarget({ id: 'stem-main', type: 'stem' }, sampleTomatoState);
    expect(stemTarget.target[1]).toBeCloseTo(sampleTomatoState.stemHeight * 0.45, 1);

    const fruitTarget = getOrganCameraTarget({ id: 'fruit-0', type: 'fruit' }, sampleTomatoState);
    expect(fruitTarget.target[1]).toBeCloseTo(sampleTomatoState.stemHeight * 0.65, 1);

    const rootTarget = getOrganCameraTarget({ id: 'root-taproot', type: 'root' }, sampleTomatoState);
    expect(rootTarget.target[1]).toBeLessThan(0); // Subsoil target
  });

  it('2. Computes optimal 3D camera target for sunflower capitulum head', () => {
    const sunflowerState = {
      ...INITIAL_PLANT_STATE,
      speciesId: SPECIES_IDS.SUNFLOWER,
      stemHeight: 1.8,
      overallProgress: 0.85,
    };

    const headTarget = getOrganCameraTarget({ id: 'sunflower-flower-head', type: 'flower' }, sunflowerState);
    expect(headTarget.target[1]).toBeCloseTo(sunflowerState.stemHeight + 0.05, 1);
    expect(headTarget.distance).toBeGreaterThan(0.5);
  });

  it('3. getOrganDetails returns direct measurements, calculations, and botanical context', () => {
    const organ = {
      id: 'fruit-0',
      name: 'Tomato Fruit 1',
      type: 'fruit',
      species: 'Tomato',
      maturity: 0.85,
      parent: 'Inflorescence Truss',
    };

    const details = getOrganDetails(organ, sampleTomatoState);
    expect(details).toBeDefined();
    expect(details.partName).toBe('Tomato Fruit 1');
    expect(details.directMeasurements.length).toBeGreaterThan(0);
    expect(details.modelCalculatedValues.length).toBeGreaterThan(0);
    expect(details.botanicalContext).toBeDefined();
    expect(details.unavailableMeasurements.length).toBeGreaterThan(0);
  });
});
