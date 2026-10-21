import React from 'react';
import {
  X,
  Compass,
  Eye,
  Heart,
  Activity,
  Sprout,
  HelpCircle,
  Cpu,
  BookOpen,
  Microscope,
  Sun,
  Droplets,
  Thermometer,
} from 'lucide-react';
import { getOrganDetails } from '../simulation/anatomyData.js';

/**
 * InspectionModal:
 * Dedicated Botanical Anatomical Inspection Drawer.
 * Clearly segments:
 * 1. Direct Simulation Measurements (live numerical state from engine).
 * 2. Model-Calculated Values (derived by procedural geometry generators).
 * 3. General Botanical Context & Anatomical Functions.
 * 4. Environmental Influences actually modeled by the engine.
 * 5. Unavailable Measurements (honest disclosure of engine-level modeling).
 * 6. Quick Camera Navigation (Focus 3D View & Return to Overview).
 */
export function InspectionModal({
  part,
  plantState,
  onClose,
  onFocusOrgan,
  onReturnToOverview,
}) {
  if (!part) return null;

  const details = getOrganDetails(part, plantState);
  if (!details) return null;

  const isSenescent = (plantState?.senescenceProgress || 0) > 0;

  return (
    <div
      className="flora-inspection-card"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Header with Organ Title & Category Badge */}
      <div className="inspection-header">
        <div className="inspection-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="part-badge">{details.partType.toUpperCase()}</span>
            <span className="species-badge">{details.species}</span>
          </div>
          <h3>{details.partName}</h3>
          <span className="inspection-attachment">
            Attached to: <em>{details.attachment}</em>
          </span>
        </div>
        <button
          className="flora-btn close-btn"
          onClick={onClose}
          title="Deselect organ and close inspection drawer"
        >
          <X size={14} />
        </button>
      </div>

      {/* 2. Camera Navigation Action Bar */}
      <div className="inspection-action-bar">
        <button
          className="flora-btn focus-action-btn"
          onClick={onFocusOrgan}
          title="Smoothly glide camera to focus on this organ in 3D"
        >
          <Compass size={13} color="#64ffda" />
          Focus 3D View
        </button>
        <button
          className="flora-btn overview-action-btn"
          onClick={onReturnToOverview}
          title="Reset camera viewpoint to whole plant overview"
        >
          <Eye size={13} />
          Return to Overview
        </button>
      </div>

      <div className="inspection-body">
        {/* SECTION 1: DIRECT SIMULATION MEASUREMENTS */}
        <div className="inspection-section">
          <div className="section-title-row">
            <Cpu size={13} color="#52c77a" />
            <h4>Direct Simulation Measurements</h4>
          </div>
          <div className="section-content">
            {details.directMeasurements.map((item, idx) => (
              <div key={idx} className="inspection-row">
                <span className="row-label" title={item.source}>
                  {item.label}:
                </span>
                <span className="row-value font-mono highlight-green">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: MODEL-CALCULATED DERIVATIONS */}
        {details.modelCalculatedValues.length > 0 && (
          <div className="inspection-section">
            <div className="section-title-row">
              <Microscope size={13} color="#4fc3f7" />
              <h4>Model-Calculated State</h4>
            </div>
            <div className="section-content">
              {details.modelCalculatedValues.map((item, idx) => (
                <div key={idx} className="inspection-row">
                  <span className="row-label" title={item.derivation}>
                    {item.label}:
                  </span>
                  <span className="row-value font-semibold">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: BOTANICAL FUNCTION & CONTEXT */}
        <div className="inspection-section botanical-context-box">
          <div className="section-title-row">
            <BookOpen size={13} color="#ffd54f" />
            <h4>Botanical & Anatomical Context</h4>
          </div>
          <div className="botanical-desc">
            <p className="botanical-function">
              <strong>Function:</strong> {details.botanicalContext.primaryFunction}
            </p>
            <div className="botanical-sub-specs">
              <span><strong>Tissues:</strong> {details.botanicalContext.tissueType}</span>
              <span><strong>Vascular:</strong> {details.botanicalContext.vascularization}</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: ENVIRONMENTAL INFLUENCE (Actually Modeled Factors) */}
        <div className="inspection-section">
          <div className="section-title-row">
            <Droplets size={13} color="#29b6f6" />
            <h4>Environmental Influences (Modeled)</h4>
          </div>
          <div className="section-content">
            <div className="inspection-row">
              <span className="row-label">Water Deficit:</span>
              <span className="row-value font-mono">
                {plantState.waterStress > 0.25
                  ? `${Math.round(plantState.waterStress * 100)}% (Turgor loss & wilting)`
                  : '0% (Full turgor)'}
              </span>
            </div>
            <div className="inspection-row">
              <span className="row-label">Thermal Stress:</span>
              <span className="row-value font-mono">
                {plantState.tempStress > 0.2
                  ? `${Math.round(plantState.tempStress * 100)}% (Metabolic constraint)`
                  : 'Optimal enzymatic range'}
              </span>
            </div>
            <div className="inspection-row">
              <span className="row-label">Light & Chlorophyll:</span>
              <span className="row-value font-mono">
                {plantState.lightStress > 0.25
                  ? `${Math.round(plantState.lightStress * 100)}% (Photosynthetic stress)`
                  : 'Balanced PAR flux'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 5: UNAVAILABLE MEASUREMENTS (Transparency Disclosure) */}
        {details.unavailableMeasurements.length > 0 && (
          <div className="inspection-section unavailable-section">
            <div className="section-title-row">
              <HelpCircle size={13} color="#90a4ae" />
              <h4>Sensor / Engine Limitations</h4>
            </div>
            <ul className="unavailable-list">
              {details.unavailableMeasurements.map((item, idx) => (
                <li key={idx}>
                  <strong style={{ color: '#b0bec5' }}>{item.metric}:</strong>{' '}
                  <span>{item.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Whole-Plant Physiological Health Footer */}
        <div className="inspection-footer-stats">
          <div className="footer-metric">
            <Heart size={12} color="#52c77a" />
            <span>Health: <strong>{Math.round(plantState.health)}%</strong></span>
          </div>
          <div className="footer-metric">
            <Activity size={12} color="#52c77a" />
            <span>Vigour: <strong>{(plantState.growthRate * 100).toFixed(0)}%</strong></span>
          </div>
          <div className="footer-metric">
            <Sprout size={12} color="#52c77a" />
            <span>Age: <strong>{(plantState.ageDays || 0).toFixed(1)} d</strong></span>
          </div>
          {isSenescent && (
            <div className="footer-metric">
              <span style={{ color: '#ffb74d' }}>
                Senescence: <strong>{Math.round(plantState.senescenceProgress * 100)}%</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
