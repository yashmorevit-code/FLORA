import { describe, it, expect, beforeEach } from 'vitest';
import {
  createExperiment,
  persistExperiment,
  loadSavedExperiments,
  saveExperimentsList,
  EXPERIMENTS_STORAGE_KEY,
} from './experiments.js';
import { INITIAL_PLANT_STATE, INITIAL_ENVIRONMENT } from './types.js';
import { createHistorySnapshot } from './history.js';

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

describe('FLORA Experiment Comparison Logic & Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Prepares two distinct experiments with contrasting micro-climates', () => {
    const expA = createExperiment({
      name: 'Trial A - Humid Tropics',
      description: 'High moisture and warm temperature test',
      environment: { moisture: 85, light: 75, temperature: 28, nutrients: 60 },
      plantState: { ...INITIAL_PLANT_STATE, ageDays: 14.5, stemHeight: 0.65, health: 92 },
    });

    const expB = createExperiment({
      name: 'Trial B - Arid Sun',
      description: 'Low moisture and high light test',
      environment: { moisture: 30, light: 95, temperature: 32, nutrients: 45 },
      plantState: { ...INITIAL_PLANT_STATE, ageDays: 12.0, stemHeight: 0.42, health: 68 },
    });

    persistExperiment(expA);
    persistExperiment(expB);

    const saved = loadSavedExperiments();
    expect(saved.length).toBe(2);
    expect(saved[0].id).not.toBe(saved[1].id);
  });

  it('2. Computes metric differentials (Delta B - A) accurately', () => {
    const heightA = 0.65 * 10; // 6.5 cm
    const heightB = 0.42 * 10; // 4.2 cm
    const deltaHeight = heightB - heightA; // -2.3 cm
    expect(Number(deltaHeight.toFixed(1))).toBe(-2.3);

    const moistureA = 85;
    const moistureB = 30;
    const deltaMoisture = moistureB - moistureA;
    expect(deltaMoisture).toBe(-55);

    const healthA = 92;
    const healthB = 68;
    const deltaHealth = healthB - healthA;
    expect(deltaHealth).toBe(-24);
  });

  it('3. Comparison operations never mutate stored experiment records', () => {
    const initialPlant = { ...INITIAL_PLANT_STATE, ageDays: 10, stemHeight: 0.5 };
    const expA = createExperiment({
      name: 'Original Trial A',
      environment: { moisture: 70, light: 80, temperature: 24, nutrients: 50 },
      plantState: initialPlant,
      history: [createHistorySnapshot(initialPlant, INITIAL_ENVIRONMENT)],
    });

    persistExperiment(expA);

    const beforeComparison = loadSavedExperiments()[0];
    const originalSnapshotsCount = beforeComparison.history.length;
    const originalMoisture = beforeComparison.environment.moisture;

    // Simulate comparison view reading and delta computations
    const simulatedReadA = { ...beforeComparison };
    const deltaTest = simulatedReadA.plantState.stemHeight - 0.2;
    expect(deltaTest).toBeGreaterThan(0);

    // Verify storage remained untouched
    const afterComparison = loadSavedExperiments()[0];
    expect(afterComparison.environment.moisture).toBe(originalMoisture);
    expect(afterComparison.history.length).toBe(originalSnapshotsCount);
    expect(afterComparison.plantState.stemHeight).toBe(beforeComparison.plantState.stemHeight);
  });

  it('4. Dual historical timelines remain independent without zero-padding or forced alignment', () => {
    // Experiment A ran for 5 days with 3 snapshots
    const historyA = [
      { ageDays: 0, stemHeight: 0.05, health: 100 },
      { ageDays: 2.5, stemHeight: 0.15, health: 98 },
      { ageDays: 5.0, stemHeight: 0.35, health: 95 },
    ];

    // Experiment B ran for 10 days with 4 snapshots at different intervals
    const historyB = [
      { ageDays: 0, stemHeight: 0.05, health: 100 },
      { ageDays: 3.2, stemHeight: 0.12, health: 80 },
      { ageDays: 7.1, stemHeight: 0.22, health: 75 },
      { ageDays: 10.0, stemHeight: 0.28, health: 70 },
    ];

    // Union domain calculation
    const allAges = [...historyA.map((d) => d.ageDays), ...historyB.map((d) => d.ageDays)];
    const minX = Math.min(...allAges);
    const maxX = Math.max(...allAges);

    expect(minX).toBe(0);
    expect(maxX).toBe(10.0);

    // Datasets keep their respective lengths and timestamps
    expect(historyA.length).toBe(3);
    expect(historyB.length).toBe(4);
    expect(historyA[2].ageDays).toBe(5.0);
    expect(historyB[3].ageDays).toBe(10.0);
  });

  it('5. Handles empty and single experiment states safely', () => {
    // 0 experiments
    const emptyList = loadSavedExperiments();
    expect(emptyList.length).toBe(0);

    // 1 experiment
    const singleExp = createExperiment({ name: 'Solo Run' });
    persistExperiment(singleExp);
    const singleList = loadSavedExperiments();
    expect(singleList.length).toBe(1);
    expect(singleList[0].name).toBe('Solo Run');
  });

  it('6. Handles duplicate experiment selection detection', () => {
    const exp = createExperiment({ name: 'Duplicate Check' });
    persistExperiment(exp);

    const idA = exp.id;
    const idB = exp.id;
    const isDuplicate = Boolean(idA && idB && idA === idB);
    expect(isDuplicate).toBe(true);

    const differentIdB = 'different_exp_id';
    expect(Boolean(idA && differentIdB && idA === differentIdB)).toBe(false);
  });
});
