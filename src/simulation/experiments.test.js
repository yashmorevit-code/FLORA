import { describe, it, expect, beforeEach } from 'vitest';
import {
  createExperiment,
  persistExperiment,
  loadSavedExperiments,
  deleteExperimentById,
  exportExperimentToJSON,
  importExperimentFromJSON,
  validateExperimentStructure,
  EXPERIMENTS_STORAGE_KEY,
} from './experiments.js';
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

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('FLORA Experiment Management System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Creates experiment with valid schema and unique ID', () => {
    const exp1 = createExperiment({ name: 'Drought Trial A' });
    const exp2 = createExperiment({ name: 'Drought Trial B' });

    expect(exp1.id).toBeDefined();
    expect(exp2.id).toBeDefined();
    expect(exp1.id).not.toBe(exp2.id);
    expect(exp1.name).toBe('Drought Trial A');
    expect(exp1.speciesId).toBe('solanum_lycopersicum');
    expect(exp1.environment.moisture).toBe(INITIAL_ENVIRONMENT.moisture);
    expect(exp1.history.length).toBeGreaterThan(0);
  });

  it('2. Persists and reloads experiments faithfully in localStorage', () => {
    const exp = createExperiment({
      name: 'Salinity Trial',
      environment: { ...INITIAL_ENVIRONMENT, moisture: 30, temperature: 28 },
    });

    persistExperiment(exp);
    const loaded = loadSavedExperiments();

    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe(exp.id);
    expect(loaded[0].name).toBe('Salinity Trial');
    expect(loaded[0].environment.moisture).toBe(30);
    expect(loaded[0].environment.temperature).toBe(28);
  });

  it('3. Restores simulation state, environment, and history without mutation', () => {
    const customPlantState = {
      ...INITIAL_PLANT_STATE,
      ageDays: 14.5,
      overallProgress: 0.45,
      stemHeight: 1.2,
      health: 88,
    };
    const customHistory = [
      { ageDays: 0, overallProgress: 0, stemHeight: 0, health: 100 },
      { ageDays: 14.5, overallProgress: 0.45, stemHeight: 12, health: 88 },
    ];

    const exp = createExperiment({
      name: 'Mid-vegetative Save',
      plantState: customPlantState,
      history: customHistory,
    });

    persistExperiment(exp);
    const reloaded = loadSavedExperiments()[0];

    expect(reloaded.plantState.ageDays).toBe(14.5);
    expect(reloaded.plantState.overallProgress).toBe(0.45);
    expect(reloaded.history.length).toBe(2);
  });

  it('4. Exports and imports valid experiment JSON', () => {
    const exp = createExperiment({ name: 'Nutrient Deprivation' });
    const json = exportExperimentToJSON(exp);
    expect(typeof json).toBe('string');

    const imported = importExperimentFromJSON(json);
    expect(imported).toBeDefined();
    expect(imported.name).toContain('Nutrient Deprivation');
    expect(imported.environment).toEqual(exp.environment);
    // New unique ID generated on import to prevent collision
    expect(imported.id).not.toBe(exp.id);
  });

  it('5. Rejects invalid or corrupt imported data gracefully', () => {
    expect(() => importExperimentFromJSON('not a json')).toThrow();
    expect(() => importExperimentFromJSON(JSON.stringify({ random: 'data' }))).toThrow();
    expect(() => importExperimentFromJSON(JSON.stringify({ id: '123', name: 'missing state' }))).toThrow();
  });

  it('6. Deletes experiments cleanly with storage update', () => {
    const exp1 = createExperiment({ name: 'Exp 1' });
    const exp2 = createExperiment({ name: 'Exp 2' });

    persistExperiment(exp1);
    persistExperiment(exp2);
    expect(loadSavedExperiments().length).toBe(2);

    deleteExperimentById(exp1.id);
    const afterDelete = loadSavedExperiments();
    expect(afterDelete.length).toBe(1);
    expect(afterDelete[0].id).toBe(exp2.id);
  });

  it('7. Handles malformed localStorage data safely', () => {
    localStorage.setItem(EXPERIMENTS_STORAGE_KEY, 'corrupted{json');
    const safeList = loadSavedExperiments();
    expect(Array.isArray(safeList)).toBe(true);
    expect(safeList.length).toBe(0);
  });

  it('8. Maintains complete independence between separate experiments', () => {
    const expA = createExperiment({
      name: 'Experiment Alpha',
      environment: { ...INITIAL_ENVIRONMENT, moisture: 20 },
    });
    const expB = createExperiment({
      name: 'Experiment Beta',
      environment: { ...INITIAL_ENVIRONMENT, moisture: 80 },
    });

    persistExperiment(expA);
    persistExperiment(expB);

    // Modify Exp A and save
    expA.plantState.health = 45;
    persistExperiment(expA);

    const reloadedList = loadSavedExperiments();
    const loadedA = reloadedList.find((e) => e.id === expA.id);
    const loadedB = reloadedList.find((e) => e.id === expB.id);

    expect(loadedA.plantState.health).toBe(45);
    expect(loadedB.plantState.health).toBe(100);
    expect(loadedA.environment.moisture).toBe(20);
    expect(loadedB.environment.moisture).toBe(80);
  });
});
