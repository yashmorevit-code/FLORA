import { describe, it, expect, beforeEach } from 'vitest';
import en from '../i18n/translations/en.js';
import hi from '../i18n/translations/hi.js';
import mr from '../i18n/translations/mr.js';
import {
  getStageNarration,
  getAllNarrationsForSpecies,
  getNarrationAudioUrl,
  getNarrationScript
} from './narrationData.js';
import { audioController } from './audioController.js';

describe('FLORA Multilingual Localization System', () => {
  it('should have complete dictionary parity between en, hi, and mr', () => {
    function assertParity(enObj, hiObj, mrObj, path = '') {
      for (const key of Object.keys(enObj)) {
        const currentPath = path ? `${path}.${key}` : key;
        const val = enObj[key];

        expect(hiObj[key], `Missing Hindi translation at "${currentPath}"`).toBeDefined();
        expect(mrObj[key], `Missing Marathi translation at "${currentPath}"`).toBeDefined();

        if (typeof val === 'object' && val !== null) {
          assertParity(val, hiObj[key], mrObj[key], currentPath);
        } else {
          expect(typeof hiObj[key], `Hindi value at "${currentPath}" must be string`).toBe('string');
          expect(hiObj[key].length, `Hindi value at "${currentPath}" must not be empty`).toBeGreaterThan(0);
          expect(typeof mrObj[key], `Marathi value at "${currentPath}" must be string`).toBe('string');
          expect(mrObj[key].length, `Marathi value at "${currentPath}" must not be empty`).toBeGreaterThan(0);
        }
      }
    }

    assertParity(en, hi, mr);
  });

  it('should retrieve localized stage narration for en, hi, and mr', () => {
    const enStage = getStageNarration('tomato', 'SEED', 'en');
    const hiStage = getStageNarration('tomato', 'SEED', 'hi');
    const mrStage = getStageNarration('tomato', 'SEED', 'mr');

    expect(enStage.title).toBe('Seed Imbibition');
    expect(hiStage.title).toContain('बीज अंतःशोषण');
    expect(mrStage.title).toContain('बीज अंतर्शोषण');

    expect(enStage.script).toContain('imbibition');
    expect(hiStage.script).toContain('अंतःशोषण');
    expect(mrStage.script).toContain('अंतर्शोषणा');

    expect(hiStage.language).toBe('hi');
    expect(mrStage.language).toBe('mr');
  });

  it('should provide speed-aware script variants (1x, 2x, 5x) in all 3 languages', () => {
    for (const lang of ['en', 'hi', 'mr']) {
      const stage = getStageNarration('tomato', 'SEED', lang);

      const script1x = getNarrationScript(stage, '1x');
      const script2x = getNarrationScript(stage, '2x');
      const script5x = getNarrationScript(stage, '5x');

      expect(script1x.length, `${lang} 1x script should be substantial`).toBeGreaterThan(50);
      expect(script2x.length, `${lang} 2x script should be concise`).toBeGreaterThan(20);
      expect(script5x.length, `${lang} 5x script should be succinct`).toBeGreaterThan(15);

      // 1x should be longer than 2x, which is longer than 5x
      expect(script1x.length).toBeGreaterThan(script2x.length);
      expect(script2x.length).toBeGreaterThan(script5x.length);
    }
  });

  it('should generate correct audio URLs for all languages and speed variants', () => {
    // English
    expect(getNarrationAudioUrl('tomato', 'SEED', '1x', 'en')).toBe('/assets/audio/narration/tomato/SEED.wav');
    expect(getNarrationAudioUrl('tomato', 'SEED', '2x', 'en')).toBe('/assets/audio/narration/tomato/SEED_2x.wav');
    expect(getNarrationAudioUrl('tomato', 'SEED', '5x', 'en')).toBe('/assets/audio/narration/tomato/SEED_5x.wav');

    // Hindi
    expect(getNarrationAudioUrl('tomato', 'SEED', '1x', 'hi')).toBe('/assets/audio/narration/hi/tomato/SEED.wav');
    expect(getNarrationAudioUrl('tomato', 'SEED', '2x', 'hi')).toBe('/assets/audio/narration/hi/tomato/SEED_2x.wav');
    expect(getNarrationAudioUrl('tomato', 'SEED', '5x', 'hi')).toBe('/assets/audio/narration/hi/tomato/SEED_5x.wav');

    // Marathi
    expect(getNarrationAudioUrl('tomato', 'SEED', '1x', 'mr')).toBe('/assets/audio/narration/mr/tomato/SEED.wav');
    expect(getNarrationAudioUrl('tomato', 'SEED', '2x', 'mr')).toBe('/assets/audio/narration/mr/tomato/SEED_2x.wav');
    expect(getNarrationAudioUrl('tomato', 'SEED', '5x', 'mr')).toBe('/assets/audio/narration/mr/tomato/SEED_5x.wav');
  });

  it('should support language switching in audioController without resetting state', () => {
    audioController.loadTrack('tomato', 'SEED', false, '1x', 0, 'en');
    expect(audioController.state.language).toBe('en');
    expect(audioController.state.title).toBe('Seed Imbibition');

    audioController.setLanguage('hi');
    expect(audioController.state.language).toBe('hi');
    expect(audioController.state.title).toContain('बीज अंतःशोषण');
    expect(audioController.state.audioUrl).toBe('/assets/audio/narration/hi/tomato/SEED.wav');

    audioController.setLanguage('mr');
    expect(audioController.state.language).toBe('mr');
    expect(audioController.state.title).toContain('बीज अंतर्शोषण');
    expect(audioController.state.audioUrl).toBe('/assets/audio/narration/mr/tomato/SEED.wav');

    // Reset back to English
    audioController.setLanguage('en');
    expect(audioController.state.language).toBe('en');
  });
});
