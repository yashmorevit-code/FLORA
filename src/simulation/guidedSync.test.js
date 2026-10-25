/**
 * FLORA Master Synchronization & Speed Variant Tests
 * 
 * Validates:
 * 1. Educational script speed variants (1x, 2x, 5x) across all 7 species and 12 stages
 * 2. Audio URL generation with correct filenames
 * 3. Master Synchronization Controller state transitions, guided calculations, and mode switching
 * 4. StepSimulation deterministic interpolation with explicit progress and age
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SPECIES_NARRATIONS, getNarrationAudioUrl, getNarrationScript, getStageNarration } from './narrationData.js';
import { audioController } from './audioController.js';
import { getSpeciesConfig, SPECIES_IDS } from './species.js';
import { stepSimulation } from './engine.js';
import { INITIAL_ENVIRONMENT, INITIAL_PLANT_STATE } from './types.js';

describe('FLORA Narration Speed Variants & Asset Metadata', () => {
  const speciesList = ['tomato', 'sunflower', 'strawberry', 'wheat', 'chilli', 'rice', 'rose'];

  it('provides full (1x), concise (2x), and key-points (5x) scripts for all 84 developmental stages', () => {
    speciesList.forEach((sp) => {
      const spec = SPECIES_NARRATIONS[sp];
      expect(spec).toBeDefined();
      expect(spec.stages.length).toBe(12);

      spec.stages.forEach((stage) => {
        expect(stage.script).toBeDefined();
        expect(stage.script.length).toBeGreaterThan(30);

        expect(stage.script2x).toBeDefined();
        expect(stage.script2x.length).toBeGreaterThan(15);
        // 2x concise script should be more concise than 1x full script
        expect(stage.script2x.length).toBeLessThan(stage.script.length);

        expect(stage.script5x).toBeDefined();
        expect(stage.script5x.length).toBeGreaterThan(10);
        // 5x key-points script should be shorter than 2x concise script
        expect(stage.script5x.length).toBeLessThan(stage.script2x.length);
      });
    });
  });

  it('correctly formats audio asset URLs for 1x, 2x, and 5x variants', () => {
    const url1x = getNarrationAudioUrl('tomato', 'SEED', '1x');
    const url2x = getNarrationAudioUrl('tomato', 'SEED', '2x');
    const url5x = getNarrationAudioUrl('tomato', 'SEED', '5x');

    expect(url1x).toContain('/assets/audio/narration/tomato/SEED.wav');
    expect(url2x).toContain('/assets/audio/narration/tomato/SEED_2x.wav');
    expect(url5x).toContain('/assets/audio/narration/tomato/SEED_5x.wav');
  });

  it('retrieves the matching script variant via getNarrationScript', () => {
    const stage = getStageNarration('tomato', 'GERMINATION');
    expect(getNarrationScript(stage, '1x')).toBe(stage.script);
    expect(getNarrationScript(stage, '2x')).toBe(stage.script2x);
    expect(getNarrationScript(stage, '5x')).toBe(stage.script5x);
  });
});

describe('FLORA Master Audio & Timeline Synchronization Controller', () => {
  beforeEach(() => {
    audioController.reset('tomato');
  });

  it('initializes in Guided Mode as default for immersive documentary pacing', () => {
    expect(audioController.isGuidedActive()).toBe(true);
    expect(audioController.getState().mode).toBe('guided');
    expect(audioController.getState().speedVariant).toBe('1x');
  });

  it('switches cleanly between Guided Mode and Free Simulation Mode', () => {
    audioController.setMode('free');
    expect(audioController.isGuidedActive()).toBe(false);
    expect(audioController.getState().mode).toBe('free');

    audioController.setMode('guided');
    expect(audioController.isGuidedActive()).toBe(true);
    expect(audioController.getState().mode).toBe('guided');
  });

  it('switches speed variants (1x, 2x, 5x) deterministically', () => {
    audioController.setSpeedVariant('2x');
    expect(audioController.getState().speedVariant).toBe('2x');

    audioController.setSpeedVariant('5x');
    expect(audioController.getState().speedVariant).toBe('5x');

    audioController.setSpeedVariant('1x');
    expect(audioController.getState().speedVariant).toBe('1x');
  });

  it('calculates guided progress proportionally based on audio timeline and stage configs', () => {
    const speciesCfg = getSpeciesConfig('tomato');
    const stage0Cfg = speciesCfg.stageConfigs[0]; // SEED stage

    // Manually simulate audio duration and playback position
    audioController.state.duration = 20.0;
    audioController.state.currentTime = 10.0; // 50% through stage 0

    const progress = audioController.getGuidedProgress(speciesCfg);
    expect(progress.stageFraction).toBeCloseTo(0.5, 3);

    const expectedProgress = stage0Cfg.minProgress + 0.5 * (stage0Cfg.maxProgress - stage0Cfg.minProgress);
    const expectedAge = stage0Cfg.minDay + 0.5 * (stage0Cfg.maxDay - stage0Cfg.minDay);

    expect(progress.overallProgress).toBeCloseTo(expectedProgress, 4);
    expect(progress.ageDays).toBeCloseTo(expectedAge, 3);
  });

  it('allows stepping forward in Guided Mode by a proportional increment', () => {
    audioController.state.duration = 20.0;
    audioController.state.currentTime = 2.0;

    audioController.stepForward();
    expect(audioController.state.currentTime).toBeGreaterThan(2.0);
    expect(audioController.state.stageFraction).toBeGreaterThan(0.1);
  });

  it('resets cleanly to Stage 0 with all progress zeroed', () => {
    audioController.state.stageIndex = 5;
    audioController.state.stageId = 'VEGETATIVE_GROWTH';
    audioController.state.currentTime = 12.0;

    audioController.reset('sunflower');
    const state = audioController.getState();
    expect(state.speciesId).toBe('sunflower');
    expect(state.stageIndex).toBe(0);
    expect(state.stageId).toBe('SEED');
    expect(state.currentTime).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.isCompleted).toBe(false);
  });
});

describe('FLORA Engine Deterministic Stage Progression', () => {
  it('allows explicit progress and ageDays overrides in stepSimulation without drifting', () => {
    const base = { ...INITIAL_PLANT_STATE, speciesId: SPECIES_IDS.TOMATO };
    const env = INITIAL_ENVIRONMENT;

    const result = stepSimulation(base, env, 0.05, 0.45, 40.0);
    expect(result.overallProgress).toBe(0.45);
    expect(result.ageDays).toBe(40.0);
    expect(result.stemHeight).toBeGreaterThan(0.1);
    expect(result.rootDepth).toBeGreaterThan(0.05);
  });

  it('maintains continuous dynamic environmental stress updates when explicit progress is supplied', () => {
    const base = { ...INITIAL_PLANT_STATE, speciesId: SPECIES_IDS.TOMATO, waterStress: 0.0 };
    // Severe drought environment
    const dryEnv = { ...INITIAL_ENVIRONMENT, moisture: 5 };

    const result = stepSimulation(base, dryEnv, 1.0, 0.20, 15.0);
    expect(result.overallProgress).toBe(0.20);
    expect(result.ageDays).toBe(15.0);
    expect(result.waterStress).toBeGreaterThan(0.0); // Stresses continue reacting dynamically
  });
});
