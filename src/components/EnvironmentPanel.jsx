import React from 'react';
import {
  Droplets,
  Sun,
  Thermometer,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  Wind,
  Camera,
  Compass,
  Layers,
  Tag,
  Leaf,
  Plus,
  Minus,
} from 'lucide-react';
import { getAllSpecies } from '../simulation/species.js';

export function EnvironmentPanel({
  environment,
  onChangeEnvironment,
  currentSpeciesId,
  onSelectSpecies,
  showRoots,
  onToggleRoots,
  showAnnotations = true,
  onToggleAnnotations,
  annotationMode = 'overview',
  onChangeAnnotationMode,
  onResetCamera,
  activeCameraPreset = 'overview',
  onSelectCameraPreset,
  windIntensity,
  onChangeWind,
}) {
  const handleChange = (key, value) => {
    onChangeEnvironment({
      ...environment,
      [key]: Number(value),
    });
  };

  const getWindLabel = (w) => {
    if (w < 0.1) return 'Calm';
    if (w < 0.4) return 'Gentle Breeze';
    if (w < 0.7) return 'Moderate Breeze';
    return 'Fresh Breeze';
  };

  const speciesList = getAllSpecies();

  return (
    <aside className="flora-floating-panel flora-side-panel left" aria-label="Environment Controls">
      <div className="panel-header">
        <div className="panel-title-group">
          <h2>
            <Sparkles size={16} className="panel-header-icon" />
            Environment Controls
          </h2>
          <span className="panel-subtitle">Rhizosphere & Atmosphere</span>
        </div>
      </div>

      <div className="panel-scroll-content">
        {/* Quick Species Switcher */}
        {onSelectSpecies && (
          <div className="control-group species-group">
            <label className="control-label" htmlFor="flora-species-select">
              <Leaf size={14} className="control-icon leaf" />
              <span>Botanical Species</span>
            </label>
            <div className="select-wrapper">
              <select
                id="flora-species-select"
                value={currentSpeciesId || ''}
                onChange={(e) => onSelectSpecies(e.target.value)}
                className="species-dropdown-select"
              >
                {speciesList.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.commonName} — {sp.scientificName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Soil Moisture */}
        <div className="control-group">
          <div className="control-header">
            <label className="control-label">
              <Droplets size={14} className="control-icon water" />
              <span>Soil Moisture</span>
            </label>
            <span className="control-value">{environment.moisture}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={environment.moisture}
            onChange={(e) => handleChange('moisture', e.target.value)}
            className="slider-input"
            aria-label="Soil Moisture percentage"
          />
          <div className="button-row">
            <button
              type="button"
              className="flora-btn flora-btn-secondary"
              onClick={() => handleChange('moisture', Math.min(100, environment.moisture + 15))}
              title="Add water to soil moisture (+15%)"
            >
              <Plus size={13} /> Water (+15%)
            </button>
            <button
              type="button"
              className="flora-btn flora-btn-secondary"
              onClick={() => handleChange('moisture', Math.max(0, environment.moisture - 15))}
              title="Dry soil moisture (-15%)"
            >
              <Minus size={13} /> Dry (-15%)
            </button>
          </div>
        </div>

        {/* Sunlight Intensity */}
        <div className="control-group">
          <div className="control-header">
            <label className="control-label">
              <Sun size={14} className="control-icon sun" />
              <span>Sunlight</span>
            </label>
            <span className="control-value">{environment.light}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={environment.light}
            onChange={(e) => handleChange('light', e.target.value)}
            className="slider-input"
            aria-label="Sunlight intensity percentage"
          />
        </div>

        {/* Ambient Temperature */}
        <div className="control-group">
          <div className="control-header">
            <label className="control-label">
              <Thermometer size={14} className="control-icon temp" />
              <span>Temperature</span>
            </label>
            <span className="control-value">{environment.temperature}°C</span>
          </div>
          <input
            type="range"
            min="5"
            max="42"
            value={environment.temperature}
            onChange={(e) => handleChange('temperature', e.target.value)}
            className="slider-input"
            aria-label="Ambient Temperature in Celsius"
          />
        </div>

        {/* Mineral Nutrients */}
        <div className="control-group">
          <div className="control-header">
            <label className="control-label">
              <Sparkles size={14} className="control-icon nutrients" />
              <span>Nutrients (N-P-K)</span>
            </label>
            <span className="control-value">{environment.nutrients}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={environment.nutrients}
            onChange={(e) => handleChange('nutrients', e.target.value)}
            className="slider-input"
            aria-label="Mineral nutrients percentage"
          />
          <div className="button-row">
            <button
              type="button"
              className="flora-btn flora-btn-secondary"
              onClick={() => handleChange('nutrients', Math.min(100, environment.nutrients + 20))}
              title="Apply mineral fertilization (+20%)"
            >
              <Plus size={13} /> Fertilize (+20%)
            </button>
          </div>
        </div>

        {/* Wind Breeze Intensity */}
        <div className="control-group">
          <div className="control-header">
            <label className="control-label">
              <Wind size={14} className="control-icon wind" />
              <span>Canopy Breeze</span>
            </label>
            <span className="control-value text-muted">{getWindLabel(windIntensity)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={windIntensity}
            onChange={(e) => onChangeWind?.(Number(e.target.value))}
            className="slider-input"
            aria-label="Canopy wind breeze intensity"
          />
        </div>

        {/* View & Camera Perspectives Section */}
        <div className="panel-section-divider" />

        <div className="control-group">
          <div className="section-title">
            <Camera size={14} className="section-icon" />
            <span>Camera Viewpoints</span>
          </div>
          <div className="camera-presets-grid">
            <button
              type="button"
              className={`camera-preset-btn ${activeCameraPreset === 'overview' ? 'active' : ''}`}
              onClick={() => onSelectCameraPreset?.('overview')}
              title="Overview: Whole plant and rhizosphere framing"
            >
              <Compass size={13} />
              <span>Overview</span>
            </button>
            <button
              type="button"
              className={`camera-preset-btn ${activeCameraPreset === 'canopy' ? 'active' : ''}`}
              onClick={() => onSelectCameraPreset?.('canopy')}
              title="Canopy: Foliage, leaf nodes, and shoot apex"
            >
              <Eye size={13} />
              <span>Canopy</span>
            </button>
            <button
              type="button"
              className={`camera-preset-btn ${activeCameraPreset === 'rhizosphere' ? 'active' : ''}`}
              onClick={() => onSelectCameraPreset?.('rhizosphere')}
              title="Roots: Subsoil root system architecture"
            >
              <Layers size={13} />
              <span>Roots</span>
            </button>
            <button
              type="button"
              className={`camera-preset-btn ${activeCameraPreset === 'reproductive' ? 'active' : ''}`}
              onClick={() => onSelectCameraPreset?.('reproductive')}
              title="Flowers & Fruit: Reproductive organs and floral clusters"
            >
              <Sparkles size={13} />
              <span>Flowers/Fruit</span>
            </button>
          </div>
        </div>

        {/* Anatomical 3D Label Modes */}
        <div className="control-group">
          <div className="section-title">
            <Tag size={14} className="section-icon" />
            <span>3D Anatomy Labels</span>
          </div>
          <div className="annotation-mode-grid">
            <button
              type="button"
              className={`annotation-mode-btn ${annotationMode === 'overview' ? 'active' : ''}`}
              onClick={() => onChangeAnnotationMode?.('overview')}
              title="Overview Mode: Displays 3-4 essential labels with uncluttered silhouette"
            >
              Overview
            </button>
            <button
              type="button"
              className={`annotation-mode-btn ${annotationMode === 'all' ? 'active' : ''}`}
              onClick={() => onChangeAnnotationMode?.('all')}
              title="All Anatomy Mode: Comprehensive botanical labeling of organs"
            >
              All Anatomy
            </button>
            <button
              type="button"
              className={`annotation-mode-btn ${annotationMode === 'hidden' ? 'active' : ''}`}
              onClick={() => onChangeAnnotationMode?.('hidden')}
              title="Hidden Mode: Disable all 3D organ labels"
            >
              Off
            </button>
          </div>
        </div>

        {/* View Toggle Actions */}
        <div className="action-buttons-group">
          <button
            type="button"
            className={`flora-btn flora-btn-action ${showRoots ? 'active' : ''}`}
            onClick={onToggleRoots}
            title={showRoots ? 'Hide subsoil roots' : 'View subsoil roots'}
          >
            {showRoots ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{showRoots ? 'Hide Subsoil Roots' : 'View Subsoil Roots'}</span>
          </button>

          <button
            type="button"
            className={`flora-btn flora-btn-action ${showAnnotations ? 'active' : ''}`}
            onClick={onToggleAnnotations}
            title="Toggle 3D anatomical organ callout annotations"
          >
            <Tag size={14} />
            <span>{showAnnotations ? 'Hide Anatomy Labels' : 'Show Anatomy Labels'}</span>
          </button>

          {onResetCamera && (
            <button
              type="button"
              className="flora-btn flora-btn-action"
              onClick={onResetCamera}
              title="Reset 3D camera to default viewpoint"
            >
              <RotateCcw size={14} />
              <span>Reset Camera View</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
