import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  Upload,
  Download,
  Trash2,
  Play,
  Calendar,
  Clock,
  Sparkles,
  Droplets,
  Sun,
  Thermometer,
  Layers,
  ArrowRight,
  Save,
  CheckCircle,
} from 'lucide-react';
import {
  loadSavedExperiments,
  deleteExperimentById,
  exportExperimentToJSON,
  importExperimentFromJSON,
  persistExperiment,
} from '../simulation/experiments.js';
import { CreateExperimentModal } from './CreateExperimentModal.jsx';

export function ExperimentsWorkspace({
  currentExperiment,
  currentPlantState,
  currentEnvironment,
  currentHistory,
  onLaunchExperiment,
  onSaveCurrentExperiment,
}) {
  const [experiments, setExperiments] = useState(() => loadSavedExperiments());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Refresh saved experiments
  const refreshList = () => {
    setExperiments(loadSavedExperiments());
  };

  // Filtered experiments list
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      const matchSearch =
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && exp.status !== 'Completed') ||
        (statusFilter === 'completed' && exp.status === 'Completed');

      return matchSearch && matchStatus;
    });
  }, [experiments, searchQuery, statusFilter]);

  // Handle deleting experiment
  const handleDelete = (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteExperimentById(id);
      refreshList();
    }
  };

  // Handle exporting experiment to JSON
  const handleExport = (exp, e) => {
    e.stopPropagation();
    try {
      const json = exportExperimentToJSON(exp);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exp.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_flora_experiment.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // Handle importing experiment file
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const imported = importExperimentFromJSON(content);
        persistExperiment(imported);
        refreshList();
        alert(`Experiment "${imported.name}" imported successfully.`);
      } catch (err) {
        alert(`Import error: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle saving the currently running simulation as an experiment or updating active
  const handleSaveActiveRun = () => {
    const saved = onSaveCurrentExperiment();
    if (saved) {
      refreshList();
      setSaveSuccessMsg(`Saved snapshot of "${saved.name}" successfully.`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="flora-experiments-page">
      {/* Top Banner and Actions */}
      <header className="experiments-header">
        <div className="experiments-header-left">
          <div className="experiments-badge">
            <FlaskConical size={20} color="#64ffda" />
          </div>
          <div>
            <h2>Controlled Botanical Experiments</h2>
            <span>Isolate variables, save time-series trials, and validate physiological responses</span>
          </div>
        </div>

        <div className="experiments-header-actions">
          {/* Quick save button for active running simulation */}
          <button className="flora-btn" onClick={handleSaveActiveRun} title="Save current simulation snapshot">
            <Save size={15} color="#52c77a" />
            Save Current Run
          </button>

          <label className="flora-btn" style={{ cursor: 'pointer' }} title="Import experiment from JSON file">
            <Upload size={15} />
            Import JSON
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
          </label>

          <button
            className="flora-btn active"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            Create Experiment
          </button>
        </div>
      </header>

      {saveSuccessMsg && (
        <div className="save-success-banner">
          <CheckCircle size={16} color="#52c77a" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Currently Active Experiment Card Header (if running an experiment) */}
      {currentExperiment && (
        <div className="active-experiment-card">
          <div className="active-badge">CURRENTLY RUNNING IN SIMULATOR</div>
          <div className="active-details">
            <div>
              <h3>{currentExperiment.name}</h3>
              <p>{currentExperiment.description || 'Custom botanical micro-climate trial session.'}</p>
            </div>
            <div className="active-metrics">
              <div className="mini-kpi">
                <span>Age:</span>
                <strong>{currentPlantState.ageDays.toFixed(1)} d</strong>
              </div>
              <div className="mini-kpi">
                <span>Progress:</span>
                <strong>{Math.round(currentPlantState.overallProgress * 100)}%</strong>
              </div>
              <div className="mini-kpi">
                <span>Snapshots:</span>
                <strong>{currentHistory.length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="experiments-filter-bar">
        <div className="search-box">
          <Search size={15} color="var(--color-cream-dark)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search experiments by title or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {['all', 'active', 'completed'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Experiments Grid / List */}
      <div className="experiments-grid">
        {filteredExperiments.length === 0 ? (
          <div className="experiments-empty-card">
            <FlaskConical size={42} color="var(--color-cream-dark)" />
            <h3>No experiments found</h3>
            <p>
              {searchQuery
                ? 'No experiments match your search criteria.'
                : 'Create your first botanical experiment trial to study plant development under custom climate and nutrient regimens.'}
            </p>
            <button
              className="flora-btn active"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={15} />
              New Experiment
            </button>
          </div>
        ) : (
          filteredExperiments.map((exp) => {
            const isCurrentlyActive = currentExperiment?.id === exp.id;
            return (
              <div
                key={exp.id}
                className={`experiment-card ${isCurrentlyActive ? 'active-border' : ''}`}
                onClick={() => onLaunchExperiment(exp)}
              >
                <div className="exp-card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className={`exp-status-pill ${exp.status === 'Completed' ? 'completed' : 'active'}`}>
                        {exp.status || 'Active'}
                      </span>
                      <span className="exp-species-pill">
                        {exp.speciesName || 'Tomato'}
                      </span>
                    </div>
                    <h3 className="exp-title">{exp.name}</h3>
                  </div>

                  <div className="exp-card-actions">
                    <button
                      className="icon-action-btn"
                      title="Export experiment JSON"
                      onClick={(e) => handleExport(exp, e)}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      className="icon-action-btn danger"
                      title="Delete experiment"
                      onClick={(e) => handleDelete(exp.id, exp.name, e)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {exp.description && (
                  <p className="exp-desc">{exp.description}</p>
                )}

                {/* Micro-climate settings summary badges */}
                <div className="exp-env-badges">
                  <span className="env-badge">
                    <Droplets size={12} color="#42a5f5" />
                    {exp.environment.moisture}%
                  </span>
                  <span className="env-badge">
                    <Sun size={12} color="#ffca28" />
                    {exp.environment.light}%
                  </span>
                  <span className="env-badge">
                    <Thermometer size={12} color="#ef5350" />
                    {exp.environment.temperature}°C
                  </span>
                  <span className="env-badge">
                    <Sparkles size={12} color="#ab47bc" />
                    {exp.environment.nutrients}%
                  </span>
                </div>

                {/* State metrics snapshot */}
                <div className="exp-snapshot-stats">
                  <div>
                    <span>Age:</span>
                    <strong>{exp.plantState.ageDays.toFixed(1)} d</strong>
                  </div>
                  <div>
                    <span>Height:</span>
                    <strong>{(exp.plantState.stemHeight * 10).toFixed(1)} cm</strong>
                  </div>
                  <div>
                    <span>Health:</span>
                    <strong style={{ color: exp.plantState.health > 70 ? '#52c77a' : '#e6a740' }}>
                      {Math.round(exp.plantState.health)}%
                    </strong>
                  </div>
                  <div>
                    <span>History:</span>
                    <strong>{exp.history?.length || 0} pts</strong>
                  </div>
                </div>

                <div className="exp-card-footer">
                  <span className="exp-date">
                    <Calendar size={12} />
                    {new Date(exp.updatedAt || exp.createdAt).toLocaleDateString()}
                  </span>

                  <button className="flora-btn load-btn">
                    <Play size={13} />
                    {isCurrentlyActive ? 'Resume' : 'Load Trial'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Experiment Modal */}
      <CreateExperimentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateAndLaunch={(newExp) => {
          persistExperiment(newExp);
          refreshList();
          onLaunchExperiment(newExp);
        }}
      />
    </div>
  );
}
