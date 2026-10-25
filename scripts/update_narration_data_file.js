// scripts/update_narration_data_file.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dumpPath = path.join(__dirname, 'narrations_variants_dump.json');
const rawData = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));

const fileHeader = `/**
 * FLORA Botanical Guide — Educational Documentary Narration Data
 * 
 * Provides scientifically authentic, engaging nature-documentary scripts,
 * biological explanations, visual cues, and environmental relationships for all 7 supported species
 * across all 12 developmental milestones.
 * 
 * Includes speed-aware script variants:
 * - script (1x): Full educational documentary narrative (~15-20s)
 * - script2x (2x): Concise narrative focusing on key biological mechanisms (~7-10s)
 * - script5x (5x): Key-points narrative highlighting critical milestones (~3-5s)
 * 
 * Total: 7 species * 12 stages = 84 comprehensive educational modules.
 */

export const SPECIES_NARRATIONS = ${JSON.stringify(rawData, null, 2)};

/**
 * Helper to retrieve narration entry for a specific species and stage
 */
export function getStageNarration(speciesId, stageId) {
  if (!speciesId) speciesId = 'tomato';
  const normId = speciesId.toLowerCase();
  const spec = SPECIES_NARRATIONS[normId] || SPECIES_NARRATIONS.tomato;
  
  if (!stageId) return spec.stages[0];
  
  const found = spec.stages.find((s) => s.stageId === stageId);
  return found || spec.stages[0];
}

/**
 * Returns all stages for a species
 */
export function getAllNarrationsForSpecies(speciesId) {
  const normId = (speciesId || 'tomato').toLowerCase();
  const spec = SPECIES_NARRATIONS[normId] || SPECIES_NARRATIONS.tomato;
  return spec.stages;
}

/**
 * Retrieves audio asset path for a species, stage, and speed variant ('1x' | '2x' | '5x')
 */
export function getNarrationAudioUrl(speciesId, stageId, speedVariant = '1x') {
  const normId = (speciesId || 'tomato').toLowerCase();
  const sId = stageId || 'SEED';
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
    ? import.meta.env.BASE_URL.replace(/\\/$/, '')
    : '';

  if (speedVariant === '2x' || speedVariant === 'concise') {
    return \`\${base}/assets/audio/narration/\${normId}/\${sId}_2x.wav\`;
  }
  if (speedVariant === '5x' || speedVariant === 'keypoints') {
    return \`\${base}/assets/audio/narration/\${normId}/\${sId}_5x.wav\`;
  }
  return \`\${base}/assets/audio/narration/\${normId}/\${sId}.wav\`;
}

/**
 * Retrieves the narration script corresponding to the active speed variant
 */
export function getNarrationScript(stageNarration, speedVariant = '1x') {
  if (!stageNarration) return '';
  if (speedVariant === '2x' || speedVariant === 'concise') {
    return stageNarration.script2x || stageNarration.script;
  }
  if (speedVariant === '5x' || speedVariant === 'keypoints') {
    return stageNarration.script5x || stageNarration.script;
  }
  return stageNarration.script;
}
`;

const targetPath = path.join(__dirname, '../src/simulation/narrationData.js');
fs.writeFileSync(targetPath, fileHeader, 'utf-8');
console.log(`Updated ${targetPath} successfully!`);
