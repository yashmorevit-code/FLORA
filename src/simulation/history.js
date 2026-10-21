/**
 * FLORA Historical Growth Sampling Engine
 * Captures compact, deterministic snapshots of the plant simulation over time.
 */

export const MAX_HISTORY_SAMPLES = 600;

/**
 * Creates a compact numeric snapshot from plantState and environment.
 */
export function createHistorySnapshot(plantState, environment) {
  return {
    ageDays: Number(plantState.ageDays.toFixed(2)),
    overallProgress: Number(plantState.overallProgress.toFixed(3)),
    stemHeight: Number((plantState.stemHeight * 10).toFixed(2)), // in cm
    rootDepth: Number((plantState.rootDepth * 10).toFixed(2)),   // in cm
    health: Number(plantState.health.toFixed(1)),                // 0 to 100%
    growthRate: Number((plantState.growthRate * 100).toFixed(1)), // %
    // Environment
    moisture: Number(environment.moisture),
    light: Number(environment.light),
    temperature: Number(environment.temperature),
    nutrients: Number(environment.nutrients),
    // Reproductive metrics
    fruitMaturity: Number(plantState.fruitMaturity.toFixed(3)),
    flowerCount: Number(plantState.flowerCount),
    fruitCount: Number(plantState.fruitCount),
    // Stresses
    waterStress: Number(plantState.waterStress.toFixed(2)),
    totalStress: Number(plantState.totalStress.toFixed(2)),
    // Categoricals
    stage: plantState.stage,
    lifecyclePhase: plantState.lifecyclePhase,
  };
}

/**
 * Appends a snapshot to the historical buffer if enough simulated time has elapsed
 * and maintains chronological order while avoiding duplicate timestamps.
 * 
 * @param {Array} history - Existing snapshot array
 * @param {Object} plantState - Authoritative plant state
 * @param {Object} environment - Current environment settings
 * @param {number} minAgeDelta - Minimum simulated days between recordings (default 0.1 days)
 * @param {boolean} force - Force recording regardless of time interval (e.g., manual step)
 */
export function recordHistorySample(
  history,
  plantState,
  environment,
  minAgeDelta = 0.1,
  force = false
) {
  if (!history) return [];

  const last = history[history.length - 1];

  // Prevent duplicate timestamps or samples too close in simulated time
  if (last && !force) {
    if (plantState.ageDays <= last.ageDays) {
      return history; // Do not record if simulated time has not advanced
    }
    if (plantState.ageDays - last.ageDays < minAgeDelta) {
      return history; // Throttle to prevent unbounded array growth
    }
  }

  // If force is true but age is identical, update existing or skip
  if (last && force && Math.abs(plantState.ageDays - last.ageDays) < 0.001) {
    return history;
  }

  const snapshot = createHistorySnapshot(plantState, environment);
  const nextHistory = [...history, snapshot];

  // Bounded buffer to prevent unbounded memory growth
  if (nextHistory.length > MAX_HISTORY_SAMPLES) {
    return nextHistory.slice(nextHistory.length - MAX_HISTORY_SAMPLES);
  }

  return nextHistory;
}
