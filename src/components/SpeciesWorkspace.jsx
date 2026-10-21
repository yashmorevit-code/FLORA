import React from 'react';
import {
  ArrowLeft,
  Sprout,
  CheckCircle2,
  Calendar,
  Layers,
  Sun,
  Droplets,
  Thermometer,
  Sparkles,
  Info,
} from 'lucide-react';
import { getAllSpecies, SPECIES_IDS } from '../simulation/species.js';

export function SpeciesWorkspace({
  currentSpeciesId = SPECIES_IDS.TOMATO,
  onSelectSpecies,
  onReturnToSimulator,
}) {
  const speciesList = getAllSpecies();

  return (
    <div className="flora-analytics-page">
      {/* Top Header Bar */}
      <header className="analytics-header">
        <div className="analytics-header-left">
          <button
            className="flora-btn return-btn"
            onClick={onReturnToSimulator}
            title="Return to Interactive 3D Simulator"
          >
            <ArrowLeft size={16} />
            Back to Simulator
          </button>
          <div className="analytics-title-group">
            <h2>Botanical Species Registry</h2>
            <span>Verified Species Architecture, Educational Timescales & 3D Procedural Phenotypes</span>
          </div>
        </div>

        <div className="analytics-header-right">
          <div className="status-pill">
            <Sprout size={14} color="#52c77a" />
            <span>Implemented Species: <strong>{speciesList.length}</strong></span>
          </div>
        </div>
      </header>

      {/* Species Cards Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20, marginTop: 10 }}>
        {speciesList.map((species) => {
          const isActive = currentSpeciesId === species.id;
          const lifecycle = species.lifecycle;

          return (
            <div
              key={species.id}
              className="chart-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                borderColor: isActive ? 'var(--color-primary-green)' : 'var(--color-border)',
                boxShadow: isActive ? '0 0 20px rgba(62, 168, 98, 0.18)' : 'none',
              }}
            >
              {/* Species Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--color-cream)', margin: 0 }}>
                      {species.commonName}
                    </h3>
                    <span style={{ fontStyle: 'italic', color: 'var(--color-primary-green-light)', fontSize: '0.92rem' }}>
                      {species.scientificName}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-cream-dark)', marginTop: 4 }}>
                    Family: <strong>{species.family}</strong> &bull; Variety: <strong>{species.variety}</strong>
                  </div>
                </div>

                {isActive ? (
                  <span
                    className="status-pill"
                    style={{ background: 'rgba(62, 168, 98, 0.25)', borderColor: 'var(--color-primary-green)', color: '#81c784' }}
                  >
                    <CheckCircle2 size={13} />
                    Active in Simulator
                  </span>
                ) : (
                  <span className="status-pill" style={{ opacity: 0.7 }}>
                    Ready to Launch
                  </span>
                )}
              </div>

              {/* Botanical Narrative Description */}
              <p style={{ fontSize: '0.84rem', color: 'var(--color-cream-dim)', lineHeight: 1.5, margin: 0 }}>
                {species.description}
              </p>

              {/* Architecture & Biometrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>Growth Habit:</span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500, textTransform: 'capitalize' }}>
                    {species.architecture.growthHabit.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>Max Canopy Height:</span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {(species.maxStemHeight * 10).toFixed(0)} cm ({species.maxStemHeight}m)
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>Foliage Architecture:</span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500, textTransform: 'capitalize' }}>
                    {species.architecture.leafType.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>Rhizosphere Depth:</span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {(species.maxRootDepth * 10).toFixed(0)} cm ({species.maxRootDepth}m)
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>Inflorescence Type:</span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500, textTransform: 'capitalize' }}>
                    {species.architecture.inflorescenceType.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>Generative Organs:</span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {species.architecture.hasFruit
                      ? `Berry fruit (${species.architecture.maxFruits} max)`
                      : 'Apical seed filling disk'}
                  </div>
                </div>
              </div>

              {/* Educational Lifecycle Progression */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-cream-dark)', fontWeight: 600 }}>
                    Educational Timescale (~{lifecycle.totalMaturityDays} Days to Full Maturity)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-green-light)', fontFamily: 'var(--font-mono)' }}>
                    Season: 90s @ 1x
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    overflowX: 'auto',
                    padding: '8px 0',
                  }}
                >
                  {lifecycle.phases.map((ph) => (
                    <div
                      key={ph.key}
                      title={ph.name}
                      style={{
                        flex: '1 1 0',
                        minWidth: 75,
                        background: 'var(--color-surface-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 6px',
                        textAlign: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.66rem',
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 500,
                        }}
                      >
                        {ph.name}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-primary)', fontWeight: 600, marginTop: 2 }}>
                        Days {ph.dayStart}–{ph.dayEnd}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimal Environment Indicators */}
              <div style={{ display: 'flex', gap: 12, fontSize: '0.73rem', color: 'var(--color-cream-dim)' }}>
                <span>
                  <Thermometer size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3, color: '#e06666' }} />
                  {species.optimalEnvironment.temperatureMin}–{species.optimalEnvironment.temperatureMax}°C
                </span>
                <span>
                  <Droplets size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3, color: '#4299e1' }} />
                  {species.optimalEnvironment.moistureMin}–{species.optimalEnvironment.moistureMax}%
                </span>
                <span>
                  <Sun size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3, color: '#e6a740' }} />
                  {species.optimalEnvironment.lightMin}–{species.optimalEnvironment.lightMax}% Sun
                </span>
              </div>

              {/* Selection Action Button */}
              <button
                className={`flora-btn ${isActive ? 'active' : ''}`}
                style={{ width: '100%', marginTop: 'auto', padding: '10px 14px' }}
                onClick={() => onSelectSpecies(species.id)}
              >
                <Sprout size={15} />
                {isActive ? 'Current Active Species — Return to Simulator' : `Select & Launch ${species.commonName}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
