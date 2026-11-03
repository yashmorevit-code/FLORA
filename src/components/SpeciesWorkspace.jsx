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
  Shield,
  Activity,
} from 'lucide-react';
import { getAllSpecies, SPECIES_IDS } from '../simulation/species.js';
import { useTranslation } from '../i18n/index.jsx';

export function SpeciesWorkspace({
  currentSpeciesId = SPECIES_IDS.TOMATO,
  onSelectSpecies,
  onReturnToSimulator,
}) {
  const { t } = useTranslation();
  const speciesList = getAllSpecies();

  return (
    <div className="flora-analytics-page">
      {/* Top Header Bar */}
      <header className="analytics-header">
        <div className="analytics-header-left">
          <button
            className="flora-btn return-btn"
            onClick={onReturnToSimulator}
            title={t('speciesRegistry.backToSimulator', 'Back to Simulator')}
          >
            <ArrowLeft size={16} />
            {t('speciesRegistry.backToSimulator', 'Back to Simulator')}
          </button>
          <div className="analytics-title-group">
            <h2>{t('speciesRegistry.title', 'Botanical Species Registry')}</h2>
            <span>
              {t(
                'speciesRegistry.subtitle',
                'Verified Species Architecture, Educational Timescales & 3D Procedural Phenotypes'
              )}
            </span>
          </div>
        </div>

        <div className="analytics-header-right">
          <div className="status-pill">
            <Sprout size={14} color="#52c77a" />
            <span>
              {t('speciesRegistry.implementedCount', 'Implemented Species: {count}', {
                count: speciesList.length,
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Species Cards Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: 20,
          marginTop: 10,
        }}
      >
        {speciesList.map((species) => {
          const isActive = currentSpeciesId === species.id;
          const lifecycle = species.lifecycle;

          const localizedCommonName = t(`speciesData.${species.id}.commonName`, species.commonName);
          const localizedFamily = t(`speciesData.${species.id}.family`, species.family);
          const localizedVariety = t(`speciesData.${species.id}.variety`, species.variety);
          const localizedDescription = t(`speciesData.${species.id}.description`, species.description);
          const localizedGrowthHabit = t(
            `speciesData.${species.id}.growthHabit`,
            species.architecture.growthHabit.replace('_', ' ')
          );
          const localizedFoliage = t(
            `speciesData.${species.id}.foliage`,
            species.architecture.leafType.replace('_', ' ')
          );
          const localizedInflorescence = t(
            `speciesData.${species.id}.inflorescence`,
            species.architecture.inflorescenceType.replace('_', ' ')
          );
          const defaultGenerative = species.architecture.hasFruit
            ? `Berry fruit (${species.architecture.maxFruits} max)`
            : 'Apical seed filling disk';
          const localizedGenerative = t(`speciesData.${species.id}.generative`, defaultGenerative);
          const localizedEnvExplanation = t(
            `speciesData.${species.id}.envExplanation`,
            'Thrives in controlled microclimates.'
          );

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
                      {localizedCommonName}
                    </h3>
                    <span
                      style={{
                        fontStyle: 'italic',
                        color: 'var(--color-primary-green-light)',
                        fontSize: '0.92rem',
                      }}
                    >
                      {species.scientificName}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-cream-dark)', marginTop: 4 }}>
                    {t('speciesRegistry.family', 'Family')}: <strong>{localizedFamily}</strong> &bull;{' '}
                    {t('speciesRegistry.variety', 'Variety')}: <strong>{localizedVariety}</strong>
                  </div>
                </div>

                {isActive ? (
                  <span
                    className="status-pill"
                    style={{
                      background: 'rgba(62, 168, 98, 0.25)',
                      borderColor: 'var(--color-primary-green)',
                      color: '#81c784',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    {t('speciesRegistry.activeInSimulator', 'Active in Simulator')}
                  </span>
                ) : (
                  <span className="status-pill" style={{ opacity: 0.7 }}>
                    {t('speciesRegistry.readyToLaunch', 'Ready to Launch')}
                  </span>
                )}
              </div>

              {/* Botanical Narrative Description */}
              <p
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--color-cream-dim)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {localizedDescription}
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
                  <span style={{ color: 'var(--color-cream-dark)' }}>
                    {t('speciesRegistry.growthHabit', 'Growth Habit:')}
                  </span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {localizedGrowthHabit}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>
                    {t('speciesRegistry.maxCanopyHeight', 'Max Canopy Height:')}
                  </span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {(species.maxStemHeight * 10).toFixed(0)} cm ({species.maxStemHeight}m)
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>
                    {t('speciesRegistry.foliageArchitecture', 'Foliage Architecture:')}
                  </span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {localizedFoliage}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>
                    {t('speciesRegistry.rhizosphereDepth', 'Rhizosphere Depth:')}
                  </span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {(species.maxRootDepth * 10).toFixed(0)} cm ({species.maxRootDepth}m)
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>
                    {t('speciesRegistry.inflorescenceType', 'Inflorescence Type:')}
                  </span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {localizedInflorescence}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-cream-dark)' }}>
                    {t('speciesRegistry.reproductiveStrategy', 'Reproductive Strategy:')}
                  </span>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {localizedGenerative}
                  </div>
                </div>
              </div>

              {/* Educational Lifecycle Progression */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--color-cream-dark)',
                      fontWeight: 600,
                    }}
                  >
                    {t(
                      'speciesRegistry.timescaleHeading',
                      'Educational Timescale (~{days} Days to Full Maturity)',
                      { days: lifecycle.totalMaturityDays }
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-primary-green-light)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {t('speciesRegistry.seasonDuration', 'Season: 90s @ 1x')}
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
                  {lifecycle.phases.map((ph, idx) => {
                    const phaseName = t(`speciesData.${species.id}.phases.${idx}`, ph.name);
                    return (
                      <div
                        key={ph.key}
                        title={phaseName}
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
                          {phaseName}
                        </div>
                        <div
                          style={{
                            fontSize: '0.70rem',
                            color: 'var(--color-text-primary)',
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          {t('speciesRegistry.days', 'Days {start}–{end}', {
                            start: ph.dayStart,
                            end: ph.dayEnd,
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optimal Environmental Envelope Box */}
              <div
                style={{
                  background: 'rgba(15, 26, 19, 0.65)',
                  border: '1px solid rgba(177, 203, 177, 0.16)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#52c77a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Sun size={13} color="#52c77a" />
                  <span>{t('speciesRegistry.optimalEnvelope', 'Optimal Environmental Envelope')}</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                    fontSize: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ color: 'var(--color-cream-dark)', fontSize: '0.68rem', display: 'block' }}>
                      <Thermometer size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3, color: '#e06666' }} />
                      {t('speciesRegistry.thermalZone', 'Thermal Zone')}
                    </span>
                    <strong style={{ color: 'var(--color-cream)', fontSize: '0.78rem' }}>
                      {species.optimalEnvironment.temperatureMin}–{species.optimalEnvironment.temperatureMax}°C
                    </strong>
                  </div>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ color: 'var(--color-cream-dark)', fontSize: '0.68rem', display: 'block' }}>
                      <Droplets size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3, color: '#4299e1' }} />
                      {t('speciesRegistry.soilMoisture', 'Soil Moisture')}
                    </span>
                    <strong style={{ color: 'var(--color-cream)', fontSize: '0.78rem' }}>
                      {species.optimalEnvironment.moistureMin}–{species.optimalEnvironment.moistureMax}%
                    </strong>
                  </div>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ color: 'var(--color-cream-dark)', fontSize: '0.68rem', display: 'block' }}>
                      <Sun size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3, color: '#e6a740' }} />
                      {t('speciesRegistry.solarIrradiance', 'Solar Irradiance')}
                    </span>
                    <strong style={{ color: 'var(--color-cream)', fontSize: '0.78rem' }}>
                      {species.optimalEnvironment.lightMin}–{species.optimalEnvironment.lightMax}%
                    </strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.73rem', color: 'var(--color-cream-dim)', lineHeight: 1.4 }}>
                  {localizedEnvExplanation}
                </div>
              </div>

              {/* Selection Action Button */}
              <button
                className={`flora-btn ${isActive ? 'active' : ''}`}
                style={{ width: '100%', marginTop: 'auto', padding: '10px 14px' }}
                onClick={() => onSelectSpecies(species.id)}
              >
                <Sprout size={15} />
                {isActive
                  ? t('speciesRegistry.currentActiveBtn', 'Current Active Species — Return to Simulator')
                  : t('speciesRegistry.launchBtn', 'Select & Launch {species}', {
                      species: localizedCommonName,
                    })}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
