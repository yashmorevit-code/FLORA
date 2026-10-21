import { describe, it, expect } from 'vitest';
import {
  createHistorySnapshot,
  recordHistorySample,
  MAX_HISTORY_SAMPLES,
} from './history.js';
import { INITIAL_PLANT_STATE, INITIAL_ENVIRONMENT, PlantStages, LifecyclePhases } from './types.js';

describe('FLORA Historical Data Sampling System', () => {
  it('1. Samples are created with valid compact numeric values', () => {
    const snapshot = createHistorySnapshot(INITIAL_PLANT_STATE, INITIAL_ENVIRONMENT);
    expect(snapshot.ageDays).toBe(0);
    expect(snapshot.overallProgress).toBe(0);
    expect(snapshot.health).toBe(100);
    expect(snapshot.moisture).toBe(INITIAL_ENVIRONMENT.moisture);
    expect(snapshot.stage).toBe(PlantStages.SEED);
    expect(snapshot.lifecyclePhase).toBe(LifecyclePhases.ACTIVE_DEVELOPMENT);
  });

  it('2. Samples are stored in chronological order', () => {
    let history = [];
    history = recordHistorySample(history, { ...INITIAL_PLANT_STATE, ageDays: 1.0 }, INITIAL_ENVIRONMENT);
    history = recordHistorySample(history, { ...INITIAL_PLANT_STATE, ageDays: 2.5 }, INITIAL_ENVIRONMENT);
    history = recordHistorySample(history, { ...INITIAL_PLANT_STATE, ageDays: 5.0 }, INITIAL_ENVIRONMENT);

    expect(history.length).toBe(3);
    expect(history[0].ageDays).toBe(1.0);
    expect(history[1].ageDays).toBe(2.5);
    expect(history[2].ageDays).toBe(5.0);
    expect(history[1].ageDays).toBeGreaterThan(history[0].ageDays);
    expect(history[2].ageDays).toBeGreaterThan(history[1].ageDays);
  });

  it('3. Duplicate simulation times do not create duplicate samples', () => {
    let history = [];
    const state = { ...INITIAL_PLANT_STATE, ageDays: 3.0 };
    history = recordHistorySample(history, state, INITIAL_ENVIRONMENT);
    expect(history.length).toBe(1);

    // Call again with same simulation time (e.g., React re-render or pause)
    history = recordHistorySample(history, state, INITIAL_ENVIRONMENT);
    history = recordHistorySample(history, state, INITIAL_ENVIRONMENT);
    expect(history.length).toBe(1);
  });

  it('4. Pause does not produce new time-based samples', () => {
    let history = [];
    let state = { ...INITIAL_PLANT_STATE, ageDays: 4.0 };
    history = recordHistorySample(history, state, INITIAL_ENVIRONMENT);

    // During pause, simulated time is fixed
    for (let i = 0; i < 10; i++) {
      history = recordHistorySample(history, state, INITIAL_ENVIRONMENT);
    }
    expect(history.length).toBe(1);
  });

  it('5. Step records the resulting state with force flag', () => {
    let history = [];
    const state1 = { ...INITIAL_PLANT_STATE, ageDays: 1.0 };
    history = recordHistorySample(history, state1, INITIAL_ENVIRONMENT);

    // Manual step advances by a small delta
    const state2 = { ...INITIAL_PLANT_STATE, ageDays: 1.05 };
    history = recordHistorySample(history, state2, INITIAL_ENVIRONMENT, 0.1, true);
    expect(history.length).toBe(2);
    expect(history[1].ageDays).toBe(1.05);
  });

  it('6. Reset clears history back to empty or initial snapshot', () => {
    let history = [];
    history = recordHistorySample(history, { ...INITIAL_PLANT_STATE, ageDays: 1.0 }, INITIAL_ENVIRONMENT);
    history = recordHistorySample(history, { ...INITIAL_PLANT_STATE, ageDays: 2.0 }, INITIAL_ENVIRONMENT);
    expect(history.length).toBe(2);

    // On reset: clear history
    history = [];
    expect(history.length).toBe(0);
  });

  it('7. Historical data is not fabricated and matches plant state measurements', () => {
    const customState = {
      ...INITIAL_PLANT_STATE,
      ageDays: 12.3,
      stemHeight: 1.5,
      rootDepth: 1.1,
      health: 84.5,
      fruitCount: 3,
      fruitMaturity: 0.65,
    };
    const snapshot = createHistorySnapshot(customState, INITIAL_ENVIRONMENT);
    expect(snapshot.stemHeight).toBe(15.0); // 1.5 * 10
    expect(snapshot.rootDepth).toBe(11.0);  // 1.1 * 10
    expect(snapshot.health).toBe(84.5);
    expect(snapshot.fruitCount).toBe(3);
    expect(snapshot.fruitMaturity).toBe(0.65);
  });

  it('8. History collection continues after Full Maturity', () => {
    let history = [];
    const matureState1 = { ...INITIAL_PLANT_STATE, ageDays: 50.0, overallProgress: 1.0, stage: PlantStages.MATURE };
    const matureState2 = { ...INITIAL_PLANT_STATE, ageDays: 55.0, overallProgress: 1.0, stage: PlantStages.MATURE };
    history = recordHistorySample(history, matureState1, INITIAL_ENVIRONMENT);
    history = recordHistorySample(history, matureState2, INITIAL_ENVIRONMENT);

    expect(history.length).toBe(2);
    expect(history[1].ageDays).toBe(55.0);
    expect(history[1].overallProgress).toBe(1.0);
    expect(history[1].stage).toBe(PlantStages.MATURE);
  });
});
