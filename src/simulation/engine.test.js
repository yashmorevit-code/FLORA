import { describe, it, expect } from 'vitest';
import {
  updateWaterStress,
  updateLightStress,
  updateTemperatureStress,
  updateNutrientStress,
  calculateGrowthRate,
  stepSimulation,
  deriveLifecyclePhase,
  MAX_STEM_HEIGHT,
  MAX_ROOT_DEPTH,
} from './engine.js';
import { PlantStages, LifecyclePhases, INITIAL_ENVIRONMENT, INITIAL_PLANT_STATE } from './types.js';

describe('Flora Plant Simulation Engine', () => {
  it('1. Initial plant starts at the seed stage', () => {
    expect(INITIAL_PLANT_STATE.stage).toBe(PlantStages.SEED);
    expect(INITIAL_PLANT_STATE.overallProgress).toBe(0.0);
    expect(INITIAL_PLANT_STATE.health).toBe(100.0);
    expect(INITIAL_PLANT_STATE.lifecyclePhase).toBe(LifecyclePhases.ACTIVE_DEVELOPMENT);
  });

  it('2. Simulation time advances under optimal conditions', () => {
    const next = stepSimulation(INITIAL_PLANT_STATE, INITIAL_ENVIRONMENT, 1.0);
    expect(next.overallProgress).toBeGreaterThan(0.0);
    expect(next.ageDays).toBeGreaterThan(0.0);
  });

  it('3. Suitable moisture permits healthy growth without water stress', () => {
    const next = stepSimulation(INITIAL_PLANT_STATE, { ...INITIAL_ENVIRONMENT, moisture: 60 }, 1.0);
    expect(next.waterStress).toBe(0.0);
    expect(next.waterloggingStress).toBe(0.0);
    expect(next.growthRate).toBeCloseTo(1.0, 1);
  });

  it('4. Insufficient moisture increases water stress', () => {
    let state = INITIAL_PLANT_STATE;
    const dryEnv = { ...INITIAL_ENVIRONMENT, moisture: 15 };
    for (let i = 0; i < 5; i++) {
      state = stepSimulation(state, dryEnv, 1.0);
    }
    expect(state.waterStress).toBeGreaterThan(0.0);
    expect(state.growthRate).toBeLessThan(1.0);
  });

  it('5. Excessive moisture increases waterlogging stress', () => {
    let state = INITIAL_PLANT_STATE;
    const soakedEnv = { ...INITIAL_ENVIRONMENT, moisture: 95 };
    for (let i = 0; i < 5; i++) {
      state = stepSimulation(state, soakedEnv, 1.0);
    }
    expect(state.waterloggingStress).toBeGreaterThan(0.0);
    expect(state.growthRate).toBeLessThan(1.0);
  });

  it('6. Unsuitable temperature causes temperature stress', () => {
    let state = INITIAL_PLANT_STATE;
    const coldEnv = { ...INITIAL_ENVIRONMENT, temperature: 10 };
    for (let i = 0; i < 5; i++) {
      state = stepSimulation(state, coldEnv, 1.0);
    }
    expect(state.tempStress).toBeGreaterThan(0.0);
    expect(state.growthRate).toBeLessThan(1.0);
  });

  it('7. Nutrient deficiency increases nutrient stress', () => {
    let state = INITIAL_PLANT_STATE;
    const poorSoil = { ...INITIAL_ENVIRONMENT, nutrients: 10 };
    for (let i = 0; i < 5; i++) {
      state = stepSimulation(state, poorSoil, 1.0);
    }
    expect(state.nutrientStress).toBeGreaterThan(0.0);
    expect(state.growthRate).toBeLessThan(1.0);
  });

  it('8. Growth progresses deterministically under identical conditions', () => {
    const run1 = stepSimulation(INITIAL_PLANT_STATE, INITIAL_ENVIRONMENT, 2.5);
    const run2 = stepSimulation(INITIAL_PLANT_STATE, INITIAL_ENVIRONMENT, 2.5);
    expect(run1.overallProgress).toEqual(run2.overallProgress);
    expect(run1.stemHeight).toEqual(run2.stemHeight);
    expect(run1.stage).toEqual(run2.stage);
  });

  it('9. Fruits do not appear before flowering and fruit formation stages', () => {
    let state = INITIAL_PLANT_STATE;
    for (let i = 0; i < 20; i++) {
      state = stepSimulation(state, INITIAL_ENVIRONMENT, 1.0);
    }
    expect(state.overallProgress).toBeLessThan(0.78);
    expect(state.fruitCount).toBe(0);
    expect(state.fruitMaturity).toBe(0.0);
  });

  it('10. Fruit size and maturity develop progressively in late stages', () => {
    let state = { ...INITIAL_PLANT_STATE, overallProgress: 0.85 };
    state = stepSimulation(state, INITIAL_ENVIRONMENT, 1.0);
    expect(state.fruitCount).toBeGreaterThan(0);
    expect(state.fruitMaturity).toBeGreaterThan(0.0);

    const laterState = stepSimulation(state, INITIAL_ENVIRONMENT, 10.0);
    expect(laterState.fruitMaturity).toBeGreaterThanOrEqual(state.fruitMaturity);
  });

  // STEP 5: New Mature Lifecycle Tests
  it('11. The plant can reach Full Maturity stage', () => {
    let state = { ...INITIAL_PLANT_STATE, overallProgress: 0.985 };
    state = stepSimulation(state, INITIAL_ENVIRONMENT, 5.0);
    expect(state.stage).toBe(PlantStages.MATURE);
    expect(state.overallProgress).toBe(1.0);
  });

  it('12. Simulated time continues advancing after maturity when active', () => {
    let matureState = { ...INITIAL_PLANT_STATE, overallProgress: 1.0, ageDays: 60.0 };
    const next = stepSimulation(matureState, INITIAL_ENVIRONMENT, 10.0);
    expect(next.ageDays).toBeGreaterThan(60.0);
    expect(next.overallProgress).toBe(1.0); // Progress capped at 1.0
  });

  it('13. Plant height does not increase beyond defined mature limit', () => {
    let matureState = { ...INITIAL_PLANT_STATE, overallProgress: 1.0 };
    const step1 = stepSimulation(matureState, INITIAL_ENVIRONMENT, 1.0);
    const step2 = stepSimulation(matureState, INITIAL_ENVIRONMENT, 100.0);
    expect(step1.stemHeight).toBeLessThanOrEqual(MAX_STEM_HEIGHT);
    expect(step2.stemHeight).toBeLessThanOrEqual(MAX_STEM_HEIGHT);
    expect(step2.stemHeight).toBeCloseTo(step1.stemHeight, 5);
  });

  it('14. Root depth does not increase beyond defined mature limit', () => {
    let matureState = { ...INITIAL_PLANT_STATE, overallProgress: 1.0 };
    const step1 = stepSimulation(matureState, INITIAL_ENVIRONMENT, 1.0);
    const step2 = stepSimulation(matureState, INITIAL_ENVIRONMENT, 100.0);
    expect(step1.rootDepth).toBeLessThanOrEqual(MAX_ROOT_DEPTH);
    expect(step2.rootDepth).toBeLessThanOrEqual(MAX_ROOT_DEPTH);
    expect(step2.rootDepth).toBeCloseTo(step1.rootDepth, 5);
  });

  it('15. Existing fruits can continue ripening after maturity when applicable', () => {
    let matureStateWithUnripeFruits = {
      ...INITIAL_PLANT_STATE,
      overallProgress: 1.0,
      fruitCount: 5,
      fruitMaturity: 0.85,
    };
    const next = stepSimulation(matureStateWithUnripeFruits, INITIAL_ENVIRONMENT, 10.0);
    expect(next.fruitMaturity).toBeGreaterThan(0.85);
    expect(next.fruitMaturity).toBeLessThanOrEqual(1.0);
  });

  it('16. Environmental stress continues updating after maturity', () => {
    let matureState = { ...INITIAL_PLANT_STATE, overallProgress: 1.0 };
    const dryEnv = { ...INITIAL_ENVIRONMENT, moisture: 10 };
    for (let i = 0; i < 10; i++) {
      matureState = stepSimulation(matureState, dryEnv, 1.0);
    }
    expect(matureState.waterStress).toBeGreaterThan(0.0);
    expect(matureState.totalStress).toBeGreaterThan(0.25);
    expect(matureState.lifecyclePhase).toBe(LifecyclePhases.ENVIRONMENTAL_STRESS);
  });

  it('17. Prolonged stress leads to physiological decline in mature plant, but recovery is possible', () => {
    let matureState = { ...INITIAL_PLANT_STATE, overallProgress: 1.0, health: 100 };
    const hostileEnv = { ...INITIAL_ENVIRONMENT, moisture: 5, temperature: 40 };
    // Subject plant to prolonged severe stress
    for (let i = 0; i < 60; i++) {
      matureState = stepSimulation(matureState, hostileEnv, 1.0);
    }
    expect(matureState.health).toBeLessThan(35);
    expect(matureState.lifecyclePhase).toBe(LifecyclePhases.DECLINE);

    // Recovery under optimal environment
    for (let i = 0; i < 60; i++) {
      matureState = stepSimulation(matureState, INITIAL_ENVIRONMENT, 1.0);
    }
    expect(matureState.health).toBeGreaterThan(35);
    expect(matureState.lifecyclePhase).not.toBe(LifecyclePhases.DECLINE);
  });
});
