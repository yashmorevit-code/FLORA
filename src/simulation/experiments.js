import { INITIAL_ENVIRONMENT, INITIAL_PLANT_STATE, PlantStages } from './types.js';
import { createHistorySnapshot } from './history.js';
import { getSpeciesConfig, SPECIES_IDS, getAllSpecies, normalizeSpeciesId as normalizeSpeciesIdCanonical } from './species.js';

export const EXPERIMENTS_STORAGE_KEY = 'flora_experiments_v1';
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Supported species list for UI dropdowns and registry views
 */
export const SUPPORTED_SPECIES = getAllSpecies().map((sp) => ({
  id: sp.id,
  name: `${sp.commonName} (${sp.scientificName})`,
  commonName: sp.commonName,
  scientificName: sp.scientificName,
  variety: sp.variety,
  description: sp.description,
}));

/**
 * Generates a unique experiment ID
 */
export function generateExperimentId() {
  return `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Normalizes legacy or raw speciesId to stable canonical ID
 */
export function normalizeSpeciesId(speciesId) {
  if (!speciesId) return SPECIES_IDS.TOMATO;
  const lower = String(speciesId).toLowerCase().trim();
  if (lower === 'solanum_lycopersicum') return 'solanum_lycopersicum';
  return normalizeSpeciesIdCanonical(speciesId);
}

/**
 * Creates a new experiment object starting from baseline seed or custom conditions.
 * Guaranteed to start at age zero unless explicit plantState with age is provided.
 */
export function createExperiment({
  name,
  description = '',
  speciesId = 'solanum_lycopersicum',
  environment = INITIAL_ENVIRONMENT,
  speed = 1,
  plantState = null,
  history = null,
}) {
  const now = new Date().toISOString();
  const normalizedSpeciesId = normalizeSpeciesId(speciesId);
  const speciesCfg = getSpeciesConfig(normalizedSpeciesId);

  const initialEnv = {
    moisture: Math.max(0, Math.min(100, Number(environment.moisture ?? INITIAL_ENVIRONMENT.moisture))),
    light: Math.max(0, Math.min(100, Number(environment.light ?? INITIAL_ENVIRONMENT.light))),
    temperature: Math.max(5, Math.min(45, Number(environment.temperature ?? INITIAL_ENVIRONMENT.temperature))),
    nutrients: Math.max(0, Math.min(100, Number(environment.nutrients ?? INITIAL_ENVIRONMENT.nutrients))),
  };

  // A new experiment starts at age 0.0 unless an existing plantState with age is explicitly passed
  const initialPlant = plantState
    ? { ...plantState, speciesId: normalizedSpeciesId }
    : { ...INITIAL_PLANT_STATE, speciesId: normalizedSpeciesId, ageDays: 0.0 };

  const initialHistory = history && history.length > 0
    ? [...history]
    : [createHistorySnapshot(initialPlant, initialEnv)];

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: generateExperimentId(),
    name: name?.trim() || `Trial ${new Date().toLocaleDateString()}`,
    description: description.trim(),
    speciesId: normalizedSpeciesId,
    speciesName: `${speciesCfg.commonName} (${speciesCfg.scientificName})`,
    createdAt: now,
    updatedAt: now,
    status: initialPlant.overallProgress >= 1.0 ? 'Completed' : 'Active',
    speed: [1, 2, 5].includes(speed) ? speed : 1,
    environment: initialEnv,
    plantState: initialPlant,
    history: initialHistory,
  };
}

/**
 * Normalizes and ensures legacy experiment records have valid species configuration and age
 */
export function sanitizeLoadedExperiment(exp) {
  if (!exp) return null;
  const normalizedSpeciesId = normalizeSpeciesId(exp.speciesId);
  const speciesCfg = getSpeciesConfig(normalizedSpeciesId);

  const plantState = exp.plantState || { ...INITIAL_PLANT_STATE };
  const safeAgeDays = typeof plantState.ageDays === 'number' && !isNaN(plantState.ageDays)
    ? plantState.ageDays
    : 0.0;

  return {
    ...exp,
    speciesId: normalizedSpeciesId,
    speciesName: exp.speciesName || `${speciesCfg.commonName} (${speciesCfg.scientificName})`,
    plantState: {
      ...plantState,
      speciesId: normalizedSpeciesId,
      ageDays: safeAgeDays,
    },
  };
}

/**
 * Loads all experiments from localStorage safely with backward compatibility
 */
export function loadSavedExperiments() {
  try {
    const raw = localStorage.getItem(EXPERIMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(validateExperimentStructure)
      .map(sanitizeLoadedExperiment);
  } catch (err) {
    console.error('Failed to load experiments from localStorage:', err);
    return [];
  }
}

/**
 * Persists an experiment list to localStorage
 */
export function saveExperimentsList(experiments) {
  try {
    localStorage.setItem(EXPERIMENTS_STORAGE_KEY, JSON.stringify(experiments));
    return true;
  } catch (err) {
    console.error('Failed to save experiments to localStorage:', err);
    return false;
  }
}

/**
 * Saves or updates a single experiment in storage
 */
export function persistExperiment(experiment) {
  if (!validateExperimentStructure(experiment)) {
    throw new Error('Invalid experiment structure cannot be saved.');
  }

  const sanitized = sanitizeLoadedExperiment(experiment);
  const experiments = loadSavedExperiments();
  const existingIdx = experiments.findIndex((e) => e.id === sanitized.id);

  const updatedExp = {
    ...sanitized,
    updatedAt: new Date().toISOString(),
    status: sanitized.plantState.overallProgress >= 1.0 ? 'Completed' : 'Active',
  };

  let nextList;
  if (existingIdx >= 0) {
    nextList = [...experiments];
    nextList[existingIdx] = updatedExp;
  } else {
    nextList = [updatedExp, ...experiments];
  }

  saveExperimentsList(nextList);
  return updatedExp;
}

/**
 * Deletes an experiment by ID
 */
export function deleteExperimentById(id) {
  const experiments = loadSavedExperiments();
  const filtered = experiments.filter((e) => e.id !== id);
  saveExperimentsList(filtered);
  return filtered;
}

/**
 * Validates an experiment schema structure
 */
export function validateExperimentStructure(exp) {
  if (!exp || typeof exp !== 'object') return false;
  if (!exp.id || typeof exp.id !== 'string') return false;
  if (!exp.name || typeof exp.name !== 'string') return false;
  if (!exp.environment || typeof exp.environment !== 'object') return false;
  if (!exp.plantState || typeof exp.plantState !== 'object') return false;
  if (typeof exp.plantState.overallProgress !== 'number') return false;
  if (typeof exp.plantState.ageDays !== 'number') return false;
  if (!Array.isArray(exp.history)) return false;
  return true;
}

/**
 * Exports an experiment as a downloadable JSON string
 */
export function exportExperimentToJSON(experiment) {
  if (!validateExperimentStructure(experiment)) {
    throw new Error('Cannot export invalid experiment object.');
  }
  const sanitized = sanitizeLoadedExperiment(experiment);
  return JSON.stringify(sanitized, null, 2);
}

/**
 * Parses and validates an imported JSON string into an experiment object
 */
export function importExperimentFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!validateExperimentStructure(parsed)) {
      throw new Error('Imported data does not match the FLORA experiment schema.');
    }

    const sanitized = sanitizeLoadedExperiment(parsed);

    // Refresh id & dates to prevent collisions when re-importing
    const validated = {
      ...sanitized,
      id: generateExperimentId(),
      name: `${sanitized.name} (Imported)`,
      updatedAt: new Date().toISOString(),
    };
    return validated;
  } catch (err) {
    throw new Error(`Failed to parse experiment JSON: ${err.message}`);
  }
}
