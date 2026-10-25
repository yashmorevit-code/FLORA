import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  SPECIES_NARRATIONS,
  getStageNarration,
  getAllNarrationsForSpecies,
  getNarrationAudioUrl,
} from './narrationData.js';
import { SPECIES_IDS } from './species.js';
import { PlantStages } from './types.js';

describe('FLORA Botanical Storytelling & Educational Narration System', () => {
  const supportedSpecies = Object.values(SPECIES_IDS);

  it('1. Provides complete narration datasets for all 7 supported botanical species', () => {
    expect(supportedSpecies.length).toBe(7);
    supportedSpecies.forEach((id) => {
      expect(SPECIES_NARRATIONS[id]).toBeDefined();
      expect(SPECIES_NARRATIONS[id].commonName).toBeTypeOf('string');
      expect(SPECIES_NARRATIONS[id].scientificName).toBeTypeOf('string');
      expect(SPECIES_NARRATIONS[id].family).toBeTypeOf('string');
    });
  });

  it('2. Contains exactly 12 developmental milestone stages per species (84 total)', () => {
    supportedSpecies.forEach((id) => {
      const stages = SPECIES_NARRATIONS[id].stages;
      expect(stages).toBeDefined();
      expect(stages.length).toBe(12);

      // Verify each stage has required educational and scientific properties
      stages.forEach((stage, index) => {
        expect(stage.stageIndex).toBe(index);
        expect(stage.stageId).toBeDefined();
        expect(stage.title).toBeTypeOf('string');
        expect(stage.shortSummary).toBeTypeOf('string');
        expect(stage.script).toBeTypeOf('string');
        expect(stage.script.length).toBeGreaterThan(40);
        expect(stage.biologicalProcess).toBeTypeOf('string');
        expect(stage.ecologicalSignificance).toBeTypeOf('string');
        expect(stage.environmentalInfluences).toBeTypeOf('string');
        expect(stage.references).toBeTypeOf('string');
        expect(stage.highlightOrgan).toBeTypeOf('string');
      });
    });
  });

  it('3. getStageNarration retrieves exact stage or falls back gracefully', () => {
    const tomatoSeed = getStageNarration('tomato', PlantStages.SEED);
    expect(tomatoSeed.stageId).toBe('SEED');
    expect(tomatoSeed.title).toBe('Seed Imbibition');

    const sunflowerBloom = getStageNarration('sunflower', PlantStages.FLOWERING);
    expect(sunflowerBloom.stageId).toBe('FLOWERING');
    expect(sunflowerBloom.title).toContain('Ray Anthesis');

    // Unknown stage falls back to first stage
    const fallback = getStageNarration('tomato', 'UNKNOWN_STAGE');
    expect(fallback.stageId).toBe('SEED');

    // Case insensitivity
    const caseInsensitive = getStageNarration('TOMATO', 'GERMINATION');
    expect(caseInsensitive.stageId).toBe('GERMINATION');
  });

  it('4. getAllNarrationsForSpecies returns all 12 stages for any species', () => {
    const strawberryStages = getAllNarrationsForSpecies('strawberry');
    expect(strawberryStages.length).toBe(12);
    expect(strawberryStages[0].stageId).toBe('SEED');
    expect(strawberryStages[11].stageId).toBe('MATURE');
    expect(strawberryStages[11].title).toContain('Ruby Ripe');
  });

  it('5. getNarrationAudioUrl correctly resolves audio asset paths', () => {
    expect(getNarrationAudioUrl('tomato', 'SEED')).toBe('/assets/audio/narration/tomato/SEED.wav');
    expect(getNarrationAudioUrl('WHEAT', 'FLOWERING')).toBe('/assets/audio/narration/wheat/FLOWERING.wav');
    expect(getNarrationAudioUrl('rice', 'MATURE')).toBe('/assets/audio/narration/rice/MATURE.wav');
  });

  it('6. All 84 synthesized audio files exist on disk and have valid WAV headers', () => {
    const audioRoot = path.join(process.cwd(), 'public', 'assets', 'audio', 'narration');
    expect(fs.existsSync(audioRoot)).toBe(true);

    let count = 0;
    supportedSpecies.forEach((id) => {
      const stages = SPECIES_NARRATIONS[id].stages;
      stages.forEach((stage) => {
        const filePath = path.join(audioRoot, id, `${stage.stageId}.wav`);
        expect(fs.existsSync(filePath), `Audio file missing: ${filePath}`).toBe(true);

        const stat = fs.statSync(filePath);
        // Valid audio file should be non-trivial size (> 100 KB for 20+ sec speech)
        expect(stat.size).toBeGreaterThan(100000);

        // Verify RIFF header
        const buffer = Buffer.alloc(12);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 12, 0);
        fs.closeSync(fd);

        const riff = buffer.toString('utf8', 0, 4);
        const wave = buffer.toString('utf8', 8, 12);
        expect(riff).toBe('RIFF');
        expect(wave).toBe('WAVE');

        count++;
      });
    });

    expect(count).toBe(84);
  });
});
