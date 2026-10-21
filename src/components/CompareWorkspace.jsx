import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight,
  XCircle,
  Play,
  Droplets,
  Sun,
  Thermometer,
  Layers,
  Sprout,
  Heart,
  Sparkles,
  Calendar,
  AlertTriangle,
  FlaskConical,
  Plus,
} from 'lucide-react';
import { loadSavedExperiments } from '../simulation/experiments.js';
import { BotanicalComparisonChart } from './BotanicalComparisonChart.jsx';
import { STAGE_CONFIGS } from '../simulation/types.js';
import { getSpeciesConfig } from '../simulation/species.js';

/**
 * CompareWorkspace:
 * Side-by-side Experiment Comparison Workspace.
 * Enables selecting two experiments (A and B), comparing micro-climate conditions and
 * live vital signs with explicit difference deltas, plotting comparative historical growth curves,
 * and seamlessly loading either experiment into the 3D simulator.
 */
export function CompareWorkspace({
  savedExperiments: externalSavedExperiments = null,
  selectedIdA: controlledIdA = null,
  selectedIdB: controlledIdB = null,
  onSelectIdA = null,
  onSelectIdB = null,
  onLaunchExperiment,
  onNavigateToExperiments,
}) {
  // Load experiments from storage or external prop
  const [internalExperiments, setInternalExperiments] = useState(() => loadSavedExperiments());
  const experiments = externalSavedExperiments || internalExperiments;

  // Manage selection state (supports controlled or uncontrolled)
  const [localIdA, setLocalIdA] = useState(() => {
    if (controlledIdA) return controlledIdA;
    if (experiments.length > 0) return experiments[0].id;
    return '';
  });

  const [localIdB, setLocalIdB] = useState(() => {
    if (controlledIdB) return controlledIdB;
    if (experiments.length > 1) return experiments[1].id;
    return '';
  });

  const activeIdA = controlledIdA !== null ? controlledIdA : localIdA;
  const activeIdB = controlledIdB !== null ? controlledIdB : localIdB;

  const setActiveIdA = (id) => {
    if (onSelectIdA) onSelectIdA(id);
    else setLocalIdA(id);
  };

  const setActiveIdB = (id) => {
    if (onSelectIdB) onSelectIdB(id);
    else setLocalIdB(id);
  };

  // Synchronize when experiments list updates
  useEffect(() => {
    if (!activeIdA && experiments.length > 0) {
      setActiveIdA(experiments[0].id);
    }
    if (!activeIdB && experiments.length > 1 && (!activeIdA || activeIdA !== experiments[1].id)) {
      setActiveIdB(experiments[1].id);
    }
  }, [experiments]);

  // Lookup experiment objects safely
  const experimentA = useMemo(
    () => experiments.find((e) => e.id === activeIdA) || null,
    [experiments, activeIdA]
  );
  const experimentB = useMemo(
    () => experiments.find((e) => e.id === activeIdB) || null,
    [experiments, activeIdB]
  );

  // Is duplicate selection warning needed
  const isDuplicateSelection = Boolean(
    activeIdA && activeIdB && activeIdA === activeIdB && experimentA
  );

  // Swap action
  const handleSwap = () => {
    const tempA = activeIdA;
    const tempB = activeIdB;
    setActiveIdA(tempB);
    setActiveIdB(tempA);
  };

  // Clear action
  const handleClear = () => {
    setActiveIdA('');
    setActiveIdB('');
  };

  // Helper for computing metric delta
  const computeDelta = (valA, valB, format = (v) => v.toFixed(1), unit = '') => {
    if (typeof valA !== 'number' || typeof valB !== 'number') return null;
    const diff = valB - valA;
    const sign = diff > 0 ? '+' : '';
    return {
      diff,
      text: `${sign}${format(diff)}${unit}`,
      isPositive: diff > 0,
      isZero: Math.abs(diff) < 0.0001,
    };
  };

  // 1. Empty state: 0 saved experiments
  if (experiments.length === 0) {
    return (
      <div className="flora-compare-page">
        <header className="compare-header">
          <div>
            <h2>Experiment Comparison</h2>
            <span>Side-by-side botanical trials and physiological growth trajectories</span>
          </div>
        </header>

        <div className="compare-empty-state">
          <FlaskConical size={48} color="var(--color-cream-dark)" />
          <h3>No Saved Experiments to Compare</h3>
          <p>
            You need at least two saved trials to perform comparative analysis between different
            micro-climates, soil moisture profiles, and developmental stages.
          </p>
          <button
            className="flora-btn active"
            onClick={onNavigateToExperiments}
          >
            <Plus size={16} />
            Go to Experiments Workspace
          </button>
        </div>
      </div>
    );
  }

  // 2. Single experiment state: only 1 experiment exists
  if (experiments.length === 1) {
    return (
      <div className="flora-compare-page">
        <header className="compare-header">
          <div>
            <h2>Experiment Comparison</h2>
            <span>Side-by-side botanical trials and physiological growth trajectories</span>
          </div>
        </header>

        <div className="compare-empty-state">
          <FlaskConical size={48} color="#64ffda" />
          <h3>1 Saved Experiment Found</h3>
          <p>
            Currently, only one experiment ("{experiments[0].name}") is stored. Create or run a
            second experiment trial with contrasting environmental parameters to observe differences.
          </p>
          <button
            className="flora-btn active"
            onClick={onNavigateToExperiments}
          >
            <Plus size={16} />
            Create Another Experiment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flora-compare-page">
      {/* Header Bar */}
      <header className="compare-header">
        <div className="compare-header-left">
          <div className="compare-badge">
            <ArrowLeftRight size={20} color="#64ffda" />
          </div>
          <div>
            <h2>Experiment Comparison</h2>
            <span>Cross-examine dual micro-climates, physiological divergence, and morphological rates</span>
          </div>
        </div>

        <div className="compare-header-actions">
          <button
            className="flora-btn"
            onClick={handleSwap}
            disabled={!activeIdA && !activeIdB}
            title="Swap Experiment A and Experiment B"
          >
            <ArrowLeftRight size={15} />
            Swap A &harr; B
          </button>

          <button
            className="flora-btn"
            onClick={handleClear}
            disabled={!activeIdA && !activeIdB}
            title="Clear current selections"
          >
            <XCircle size={15} />
            Clear
          </button>
        </div>
      </header>

      {/* Duplicate warning notification */}
      {isDuplicateSelection && (
        <div className="compare-warning-banner">
          <AlertTriangle size={18} color="#ffd54f" />
          <span>
            <strong>Identical Trial Selected:</strong> You have selected "{experimentA?.name}" for
            both Experiment A and Experiment B. Comparison curves and metrics will be identical.
          </span>
        </div>
      )}

      {/* Cross-Species Comparative Note */}
      {experimentA && experimentB && experimentA.speciesId !== experimentB.speciesId && (
        <div className="compare-warning-banner" style={{ backgroundColor: 'rgba(100, 255, 218, 0.08)', borderColor: 'rgba(100, 255, 218, 0.35)', color: 'var(--color-cream)' }}>
          <Sparkles size={18} color="#64ffda" />
          <span>
            <strong>Cross-Species Comparison:</strong> Comparing <em>{experimentA.speciesName}</em> with <em>{experimentB.speciesName}</em>. Differentials in height, canopy, and rooting reflect differing configured biological growth characteristics rather than inherent physiological superiority.
          </span>
        </div>
      )}

      {/* Selection Dropdown Row */}
      <section className="compare-selectors-grid">
        {/* Selector A */}
        <div className="compare-selector-card card-a">
          <div className="selector-header">
            <span className="selector-tag tag-a">EXPERIMENT A</span>
            {experimentA && (
              <button
                className="flora-btn load-sim-btn"
                onClick={() => onLaunchExperiment(experimentA)}
                title="Open Experiment A in Simulator"
              >
                <Play size={13} />
                Open in Simulator
              </button>
            )}
          </div>

          <select
            className="flora-input select"
            value={activeIdA}
            onChange={(e) => setActiveIdA(e.target.value)}
          >
            <option value="">-- Choose Experiment A --</option>
            {experiments.map((exp) => (
              <option key={`a-${exp.id}`} value={exp.id}>
                {exp.name} [{exp.speciesName || 'Tomato'}] ({exp.plantState.ageDays.toFixed(1)}d &bull; {(exp.plantState.stemHeight * 10).toFixed(1)}cm)
              </option>
            ))}
          </select>

          {experimentA && (
            <div className="selector-summary">
              <p className="exp-meta-desc">{experimentA.description || 'No description provided.'}</p>
              <div className="selector-meta-row">
                <span><strong>Species:</strong> {experimentA.speciesName}</span>
                <span>Created: {new Date(experimentA.createdAt).toLocaleDateString()}</span>
                <span>Snapshots: {experimentA.history?.length || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Selector B */}
        <div className="compare-selector-card card-b">
          <div className="selector-header">
            <span className="selector-tag tag-b">EXPERIMENT B</span>
            {experimentB && (
              <button
                className="flora-btn load-sim-btn"
                onClick={() => onLaunchExperiment(experimentB)}
                title="Open Experiment B in Simulator"
              >
                <Play size={13} />
                Open in Simulator
              </button>
            )}
          </div>

          <select
            className="flora-input select"
            value={activeIdB}
            onChange={(e) => setActiveIdB(e.target.value)}
          >
            <option value="">-- Choose Experiment B --</option>
            {experiments.map((exp) => (
              <option key={`b-${exp.id}`} value={exp.id}>
                {exp.name} [{exp.speciesName || 'Tomato'}] ({exp.plantState.ageDays.toFixed(1)}d &bull; {(exp.plantState.stemHeight * 10).toFixed(1)}cm)
              </option>
            ))}
          </select>

          {experimentB && (
            <div className="selector-summary">
              <p className="exp-meta-desc">{experimentB.description || 'No description provided.'}</p>
              <div className="selector-meta-row">
                <span><strong>Species:</strong> {experimentB.speciesName}</span>
                <span>Created: {new Date(experimentB.createdAt).toLocaleDateString()}</span>
                <span>Snapshots: {experimentB.history?.length || 0}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Side-by-Side Environmental Comparison Table */}
      <section className="compare-section">
        <h3 className="section-title">Micro-Climate & Environmental Regimen</h3>
        <div className="compare-table-container">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Environmental Variable</th>
                <th className="col-a">{experimentA ? experimentA.name : 'Experiment A'}</th>
                <th className="col-delta">Differential (&Delta; B &minus; A)</th>
                <th className="col-b">{experimentB ? experimentB.name : 'Experiment B'}</th>
              </tr>
            </thead>
            <tbody>
              {/* Moisture */}
              <tr>
                <td className="row-label">
                  <Droplets size={15} color="#42a5f5" />
                  <span>Soil Moisture</span>
                </td>
                <td className="val-a">
                  {experimentA ? `${experimentA.environment.moisture}%` : '—'}
                </td>
                <td className="val-delta">
                  {experimentA && experimentB ? (
                    <DeltaBadge
                      delta={computeDelta(experimentA.environment.moisture, experimentB.environment.moisture, (v) => v.toFixed(0), '%')}
                    />
                  ) : '—'}
                </td>
                <td className="val-b">
                  {experimentB ? `${experimentB.environment.moisture}%` : '—'}
                </td>
              </tr>

              {/* Temperature */}
              <tr>
                <td className="row-label">
                  <Thermometer size={15} color="#ef5350" />
                  <span>Ambient Temperature</span>
                </td>
                <td className="val-a">
                  {experimentA ? `${experimentA.environment.temperature}°C` : '—'}
                </td>
                <td className="val-delta">
                  {experimentA && experimentB ? (
                    <DeltaBadge
                      delta={computeDelta(experimentA.environment.temperature, experimentB.environment.temperature, (v) => v.toFixed(1), '°C')}
                    />
                  ) : '—'}
                </td>
                <td className="val-b">
                  {experimentB ? `${experimentB.environment.temperature}°C` : '—'}
                </td>
              </tr>

              {/* Light */}
              <tr>
                <td className="row-label">
                  <Sun size={15} color="#ffca28" />
                  <span>Photoperiod / Light Intensity</span>
                </td>
                <td className="val-a">
                  {experimentA ? `${experimentA.environment.light}%` : '—'}
                </td>
                <td className="val-delta">
                  {experimentA && experimentB ? (
                    <DeltaBadge
                      delta={computeDelta(experimentA.environment.light, experimentB.environment.light, (v) => v.toFixed(0), '%')}
                    />
                  ) : '—'}
                </td>
                <td className="val-b">
                  {experimentB ? `${experimentB.environment.light}%` : '—'}
                </td>
              </tr>

              {/* Nutrients */}
              <tr>
                <td className="row-label">
                  <Sparkles size={15} color="#ab47bc" />
                  <span>Nutrient Availability (N-P-K)</span>
                </td>
                <td className="val-a">
                  {experimentA ? `${experimentA.environment.nutrients}%` : '—'}
                </td>
                <td className="val-delta">
                  {experimentA && experimentB ? (
                    <DeltaBadge
                      delta={computeDelta(experimentA.environment.nutrients, experimentB.environment.nutrients, (v) => v.toFixed(0), '%')}
                    />
                  ) : '—'}
                </td>
                <td className="val-b">
                  {experimentB ? `${experimentB.environment.nutrients}%` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Side-by-Side Physiological & Morphological Metrics */}
      <section className="compare-section">
        <h3 className="section-title">Physiological & Morphological Metrics</h3>
        <div className="compare-table-container">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Plant Vital Sign</th>
                <th className="col-a">{experimentA ? experimentA.name : 'Experiment A'}</th>
                <th className="col-delta">Differential (&Delta; B &minus; A)</th>
                <th className="col-b">{experimentB ? experimentB.name : 'Experiment B'}</th>
              </tr>
            </thead>
            <tbody>
              {/* Age */}
              <tr>
                <td className="row-label">
                  <Calendar size={15} color="#81c784" />
                  <span>Simulated Age</span>
                </td>
                <td className="val-a">
                  {experimentA ? `${experimentA.plantState.ageDays.toFixed(1)} days` : '—'}
                </td>
                <td className="val-delta">
                  {experimentA && experimentB ? (
                    <DeltaBadge
                      delta={computeDelta(experimentA.plantState.ageDays, experimentB.plantState.ageDays, (v) => v.toFixed(1), ' d')}
                    />
                  ) : '—'}
                </td>
                <td className="val-b">
                  {experimentB ? `${experimentB.plantState.ageDays.toFixed(1)} days` : '—'}
                </td>
              </tr>

              {/* Shoot Height */}
              <tr>
                <td className="row-label">
                  <Sprout size={15} color="#66bb6a" />
                  <span>Shoot Height</span>
                </td>
                <td className="val-a">
                  {experimentA ? `${(experimentA.plantState.stemHeight * 10).toFixed(1)} cm` : '—'}
                </td>
                <td className="val-delta">
                  {experimentA && experimentB ? (
                    <DeltaBadge
                      delta={computeDelta(
                        experimentA.plantState.stemHeight * 10,
                        experimentB.plantState.stemHeight * 10,
                        (v) => v.toFixed(1),
                        ' cm'
                      )}
                    />
                  ) : '—'}
                </td>
                <td className="val-b">
                  {experimentB ? `${(experimentB.plantState.stemHeight * 10).toFixed(1)} cm` : '—'}
                </td>
              </tr>

              {/* Root Depth */}
              <tr>
                <td className="row-label">
                  <Layers size={15} color="#8d6e63" />
                  <span>Rhizosphere Depth</span>
                </td>
                <td className="val-a">
                  {experimentA ? `${(experimentA.plantState.rootDepth * 10).toFixed(1)} cm` : '—'}
                </td>
                <td className="val-delta">
                  {experimentA && experimentB ? (
                    <DeltaBadge
                      delta={computeDelta(
                        experimentA.plantState.rootDepth * 10,
                        experimentB.plantState.rootDepth * 10,
                        (v) => v.toFixed(1),
                        ' cm'
                      )}
                    />
                  ) : '—'}
                </td>
                <td className="val-b">
                  {experimentB ? `${(experimentB.plantState.rootDepth * 10).toFixed(1)} cm` : '—'}
                </td>
              </tr>

              {/* Plant Health */}
              <tr>
                <td className="row-label">
                  <Heart size={15} color="#52c77a" />
                  <span>Physiological Health</span>
                </td>
                <td className="val-a">
                  {experimentA ? `${Math.round(experimentA.plantState.health)}%` : '—'}
                </td>
                <td className="val-delta">
                  {experimentA && experimentB ? (
                    <DeltaBadge
                      delta={computeDelta(experimentA.plantState.health, experimentB.plantState.health, (v) => v.toFixed(0), '%')}
                    />
                  ) : '—'}
                </td>
                <td className="val-b">
                  {experimentB ? `${Math.round(experimentB.plantState.health)}%` : '—'}
                </td>
              </tr>

              {/* Growth Vigour */}
              <tr>
                <td className="row-label">
                  <Sparkles size={15} color="#ffd54f" />
                  <span>Growth Vigour Rate</span>
                </td>
                <td className="val-a">
                  {experimentA ? `${(experimentA.plantState.growthRate * 100).toFixed(0)}%` : '—'}
                </td>
                <td className="val-delta">
                  {experimentA && experimentB ? (
                    <DeltaBadge
                      delta={computeDelta(
                        experimentA.plantState.growthRate * 100,
                        experimentB.plantState.growthRate * 100,
                        (v) => v.toFixed(0),
                        '%'
                      )}
                    />
                  ) : '—'}
                </td>
                <td className="val-b">
                  {experimentB ? `${(experimentB.plantState.growthRate * 100).toFixed(0)}%` : '—'}
                </td>
              </tr>

              {/* Stage & Lifecycle Phase */}
              <tr>
                <td className="row-label">
                  <Sparkles size={15} color="#4fc3f7" />
                  <span>Stage / Lifecycle Phase</span>
                </td>
                <td className="val-a">
                  {experimentA
                    ? `${getSpeciesConfig(experimentA.speciesId || experimentA.plantState?.speciesId)?.stageConfigs?.[experimentA.plantState.stageIndex]?.name || experimentA.plantState.stage} (${experimentA.plantState.lifecycleStatusLabel || 'Active'})`
                    : '—'}
                </td>
                <td className="val-delta">
                  <span className="neutral-badge">Categorical</span>
                </td>
                <td className="val-b">
                  {experimentB
                    ? `${getSpeciesConfig(experimentB.speciesId || experimentB.plantState?.speciesId)?.stageConfigs?.[experimentB.plantState.stageIndex]?.name || experimentB.plantState.stage} (${experimentB.plantState.lifecycleStatusLabel || 'Active'})`
                    : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Comparative Historical Growth Curves */}
      <section className="compare-section">
        <h3 className="section-title">Comparative Historical Time-Series Trajectories</h3>
        <div className="analytics-charts-grid">
          {/* Chart 1: Shoot Height */}
          <BotanicalComparisonChart
            title="Shoot Elongation Trajectory (Stem Height)"
            dataA={experimentA?.history || []}
            dataB={experimentB?.history || []}
            labelA={experimentA?.name || 'Trial A'}
            labelB={experimentB?.name || 'Trial B'}
            metricKey="stemHeight"
            metricLabel="Stem Height"
            unit="cm"
            colorA="#64ffda"
            colorB="#ffca28"
          />

          {/* Chart 2: Root Depth */}
          <BotanicalComparisonChart
            title="Rhizosphere Depth Trajectory (Root Depth)"
            dataA={experimentA?.history || []}
            dataB={experimentB?.history || []}
            labelA={experimentA?.name || 'Trial A'}
            labelB={experimentB?.name || 'Trial B'}
            metricKey="rootDepth"
            metricLabel="Root Depth"
            unit="cm"
            colorA="#64ffda"
            colorB="#ffca28"
          />

          {/* Chart 3: Health */}
          <BotanicalComparisonChart
            title="Physiological Health Over Simulated Days"
            dataA={experimentA?.history || []}
            dataB={experimentB?.history || []}
            labelA={experimentA?.name || 'Trial A'}
            labelB={experimentB?.name || 'Trial B'}
            metricKey="health"
            metricLabel="Plant Health"
            unit="%"
            colorA="#64ffda"
            colorB="#ffca28"
          />

          {/* Chart 4: Fruit Ripening / Reproductive Development */}
          <BotanicalComparisonChart
            title="Fruit Ripening & Reproductive Progression"
            dataA={experimentA?.history || []}
            dataB={experimentB?.history || []}
            labelA={experimentA?.name || 'Trial A'}
            labelB={experimentB?.name || 'Trial B'}
            metricKey="fruitMaturity"
            metricLabel="Fruit Ripening"
            unit="ratio"
            colorA="#64ffda"
            colorB="#ffca28"
          />
        </div>
      </section>
    </div>
  );
}

/**
 * Delta chip badge showing + / - / 0
 */
function DeltaBadge({ delta }) {
  if (!delta) return <span>—</span>;
  if (delta.isZero) {
    return <span className="delta-chip zero">0.0</span>;
  }
  return (
    <span className={`delta-chip ${delta.isPositive ? 'pos' : 'neg'}`}>
      {delta.text}
    </span>
  );
}
