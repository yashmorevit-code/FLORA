import React, { useState } from 'react';
import { X, Sparkles, Droplets, Sun, Thermometer, FlaskConical, Play } from 'lucide-react';
import { INITIAL_ENVIRONMENT, INITIAL_PLANT_STATE } from '../simulation/types.js';
import { SUPPORTED_SPECIES, createExperiment } from '../simulation/experiments.js';

export function CreateExperimentModal({ isOpen, onClose, onCreateAndLaunch }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [speciesId, setSpeciesId] = useState('tomato');
  const [moisture, setMoisture] = useState(INITIAL_ENVIRONMENT.moisture);
  const [light, setLight] = useState(INITIAL_ENVIRONMENT.light);
  const [temperature, setTemperature] = useState(INITIAL_ENVIRONMENT.temperature);
  const [nutrients, setNutrients] = useState(INITIAL_ENVIRONMENT.nutrients);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an experiment trial name.');
      return;
    }

    const exp = createExperiment({
      name: name.trim(),
      description: description.trim(),
      speciesId,
      environment: {
        moisture: Number(moisture),
        light: Number(light),
        temperature: Number(temperature),
        nutrients: Number(nutrients),
      },
      speed: Number(speed),
    });

    onCreateAndLaunch(exp);
    onClose();
  };

  return (
    <div className="flora-modal-backdrop" onClick={onClose}>
      <div className="flora-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="flora-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlaskConical size={20} color="#64ffda" />
            <h3>Configure Botanical Experiment</h3>
          </div>
          <button className="flora-btn close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flora-modal-form">
          {error && <div className="form-error-banner">{error}</div>}

          {/* Name & Description */}
          <div className="form-group">
            <label>Experiment Title *</label>
            <input
              type="text"
              className="flora-input"
              placeholder="e.g., Drought & Thermal Stress Adaptation Trial"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Research Hypotheses / Notes (Optional)</label>
            <textarea
              className="flora-input textarea"
              rows={2}
              placeholder="Hypothesis on stomatal closure and vegetative rate under low hydraulic pressure..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Species Selection */}
          <div className="form-group">
            <label>Botanical Species</label>
            <select
              className="flora-input select"
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
            >
              {SUPPORTED_SPECIES.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name} — {sp.variety}
                </option>
              ))}
            </select>
          </div>

          {/* Environmental Trial Conditions */}
          <div className="form-section-title">
            <span>Environmental Micro-Climate Parameters</span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <div className="control-item-header">
                <span>
                  <Droplets size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#42a5f5' }} />
                  Soil Moisture
                </span>
                <strong>{moisture}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
                className="slider-input"
              />
            </div>

            <div className="form-group">
              <div className="control-item-header">
                <span>
                  <Sun size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#ffca28' }} />
                  Sunlight
                </span>
                <strong>{light}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={light}
                onChange={(e) => setLight(Number(e.target.value))}
                className="slider-input"
              />
            </div>

            <div className="form-group">
              <div className="control-item-header">
                <span>
                  <Thermometer size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#ef5350' }} />
                  Temperature
                </span>
                <strong>{temperature}°C</strong>
              </div>
              <input
                type="range"
                min="5"
                max="42"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="slider-input"
              />
            </div>

            <div className="form-group">
              <div className="control-item-header">
                <span>
                  <Sparkles size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#ab47bc' }} />
                  Nutrients (N-P-K)
                </span>
                <strong>{nutrients}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={nutrients}
                onChange={(e) => setNutrients(Number(e.target.value))}
                className="slider-input"
              />
            </div>
          </div>

          {/* Speed Preference */}
          <div className="form-group">
            <label>Simulation Rate</label>
            <div className="button-row">
              {[1, 2, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  className={`flora-btn ${speed === s ? 'active' : ''}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}x Speed
                </button>
              ))}
            </div>
          </div>

          <div className="flora-modal-footer">
            <button type="button" className="flora-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="flora-btn active" style={{ minWidth: 150 }}>
              <Play size={14} />
              Launch Experiment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
