import React from 'react';
import { Activity, Sprout, ShieldAlert, Sparkles, AlertTriangle, BookOpen } from 'lucide-react';
import { STAGE_CONFIGS, LifecyclePhases } from '../simulation/types.js';
import { getSpeciesConfig } from '../simulation/species.js';
import { useTranslation } from '../i18n/index.jsx';

export function StatusPanel({ plantState, onReferenceVideoClick }) {
  const { t } = useTranslation();
  const speciesCfg = getSpeciesConfig(plantState?.speciesId);
  const stages = speciesCfg?.stageConfigs || STAGE_CONFIGS;
  const currentStageConfig = stages[plantState.stageIndex] || stages[0];

  const getLifecycleBadgeStyle = (phase) => {
    switch (phase) {
      case LifecyclePhases.TERMINAL:
        return {
          bg: 'rgba(199, 106, 106, 0.18)',
          border: 'rgba(199, 106, 106, 0.4)',
          text: '#f2a8a8',
          icon: <AlertTriangle size={14} />,
        };
      case LifecyclePhases.SENESCENCE:
        return {
          bg: 'rgba(212, 163, 89, 0.18)',
          border: 'rgba(212, 163, 89, 0.4)',
          text: '#f2ca88',
          icon: <AlertTriangle size={14} />,
        };
      case LifecyclePhases.DECLINE:
        return {
          bg: 'rgba(199, 106, 106, 0.16)',
          border: 'rgba(199, 106, 106, 0.35)',
          text: '#f2a8a8',
          icon: <AlertTriangle size={14} />,
        };
      case LifecyclePhases.ENVIRONMENTAL_STRESS:
        return {
          bg: 'rgba(212, 163, 89, 0.16)',
          border: 'rgba(212, 163, 89, 0.35)',
          text: '#f2ca88',
          icon: <ShieldAlert size={14} />,
        };
      case LifecyclePhases.FULL_MATURITY:
        return {
          bg: 'rgba(94, 158, 114, 0.22)',
          border: 'rgba(94, 158, 114, 0.45)',
          text: '#a8e0bc',
          icon: <Sparkles size={14} />,
        };
      case LifecyclePhases.FRUIT_RIPENING:
        return {
          bg: 'rgba(224, 134, 90, 0.18)',
          border: 'rgba(224, 134, 90, 0.4)',
          text: '#f5b596',
          icon: <Activity size={14} />,
        };
      default:
        return {
          bg: 'rgba(66, 107, 80, 0.22)',
          border: 'rgba(145, 173, 145, 0.35)',
          text: '#cbe0cb',
          icon: <Sprout size={14} />,
        };
    }
  };

  const badgeStyle = getLifecycleBadgeStyle(plantState.lifecyclePhase);

  const getHealthColor = (health) => {
    if (health > 70) return '#91ad91';
    if (health > 40) return '#d4a359';
    return '#c76a6a';
  };

  return (
    <aside className="flora-floating-panel flora-side-panel right" aria-label="Plant Vital Signs">
      <div className="panel-header">
        <div className="panel-title-group">
          <h2>
            <Activity size={16} className="panel-header-icon" />
            {t('vitals.title')}
          </h2>
          <span className="panel-subtitle">{t('vitals.subtitle')}</span>
        </div>
      </div>

      <div className="panel-scroll-content">
        {/* Terminal Lifecycle Completion Banner */}
        {plantState.isTerminal && (
          <div className="terminal-status-banner">
            <AlertTriangle size={15} className="banner-icon danger" />
            <div className="banner-text">
              <strong>{t('vitals.lifecycleComplete')}</strong>
              <span>Senescence finished at Day {Math.floor(plantState.ageDays)}</span>
            </div>
          </div>
        )}

        {/* Operational Lifecycle Status Badge */}
        <div
          className="lifecycle-status-badge"
          style={{
            backgroundColor: badgeStyle.bg,
            borderColor: badgeStyle.border,
            color: badgeStyle.text,
          }}
        >
          {badgeStyle.icon}
          <span>Lifecycle: {plantState.lifecycleStatusLabel || 'Active Development'}</span>
        </div>

        {/* Senescence Progress Monitor */}
        {plantState.senescenceProgress > 0 && !plantState.isTerminal && (
          <div className="senescence-progress-card">
            <div className="senescence-header">
              <span>Senescence Progression</span>
              <strong>{Math.round(plantState.senescenceProgress * 100)}%</strong>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill warning"
                style={{ width: `${Math.round(plantState.senescenceProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="metric-grid primary-metrics">
          <div className="metric-card">
            <span className="metric-label">{t('vitals.health')}</span>
            <strong className="metric-value" style={{ color: getHealthColor(plantState.health) }}>
              {Math.round(plantState.health)}%
            </strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">{t('vitals.growthVigour')}</span>
            <strong className="metric-value">{(plantState.growthRate * 100).toFixed(0)}%</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">{t('vitals.simulatedAge')}</span>
            <strong className="metric-value">{plantState.ageDays.toFixed(1)} d</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">{t('vitals.cycleProgress')}</span>
            <strong className="metric-value">{Math.round(plantState.overallProgress * 100)}%</strong>
          </div>
        </div>

        {/* Morphological Dimensions */}
        <div className="metric-grid morphological-metrics">
          <div className="metric-card">
            <span className="metric-label">{t('vitals.stemHeight')}</span>
            <strong className="metric-value">
              {(plantState.stemHeight || 0) >= 1.0
                ? `${(plantState.stemHeight || 0).toFixed(2)} m`
                : `${((plantState.stemHeight || 0) * 100).toFixed(1)} cm`}
            </strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">{t('vitals.rootDepth')}</span>
            <strong className="metric-value">
              {(plantState.rootDepth || 0) >= 1.0
                ? `${(plantState.rootDepth || 0).toFixed(2)} m`
                : `${((plantState.rootDepth || 0) * 100).toFixed(1)} cm`}
            </strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">
              {plantState.speciesId === 'sunflower' ? 'Flower Head' : t('vitals.flowers')}
            </span>
            <strong className="metric-value">
              {plantState.speciesId === 'sunflower'
                ? plantState.flowerCount > 0
                  ? '1 Capitulum'
                  : 'Bud'
                : plantState.flowerCount}
            </strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">
              {plantState.speciesId === 'sunflower' ? 'Seed Filling' : t('vitals.fruits')}
            </span>
            <strong className="metric-value">
              {plantState.speciesId === 'sunflower'
                ? `${Math.round((plantState.fruitMaturity || 0) * 100)}%`
                : plantState.fruitCount}
            </strong>
          </div>
        </div>

        {/* Botanical Narrative Explanation */}
        <div className="botanical-narrative">
          <div className="narrative-header">
            <Sprout size={14} className="narrative-icon" />
            <span>{t('vitals.observation')}</span>
          </div>
          <p className="narrative-text">{plantState.explanation}</p>
        </div>

        {/* Environmental Stress Factors */}
        <div className="stress-section">
          <div className="section-title">
            <ShieldAlert size={14} className="section-icon" />
            <span>{t('vitals.stressAnalysis')}</span>
          </div>

          <div className="stress-rows-list">
            <div className="stress-row">
              <div className="stress-row-label">
                <span>{t('vitals.waterDeficit')}</span>
                <span className="stress-percent">{Math.round(plantState.waterStress * 100)}%</span>
              </div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${
                    plantState.waterStress > 0.6
                      ? 'danger'
                      : plantState.waterStress > 0.25
                      ? 'warning'
                      : 'normal'
                  }`}
                  style={{ width: `${Math.round(plantState.waterStress * 100)}%` }}
                />
              </div>
            </div>

            <div className="stress-row">
              <div className="stress-row-label">
                <span>{t('vitals.waterlogging')}</span>
                <span className="stress-percent">
                  {Math.round(plantState.waterloggingStress * 100)}%
                </span>
              </div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${
                    plantState.waterloggingStress > 0.6
                      ? 'danger'
                      : plantState.waterloggingStress > 0.25
                      ? 'warning'
                      : 'normal'
                  }`}
                  style={{ width: `${Math.round(plantState.waterloggingStress * 100)}%` }}
                />
              </div>
            </div>

            <div className="stress-row">
              <div className="stress-row-label">
                <span>{t('vitals.lightStress')}</span>
                <span className="stress-percent">{Math.round(plantState.lightStress * 100)}%</span>
              </div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${
                    plantState.lightStress > 0.6
                      ? 'danger'
                      : plantState.lightStress > 0.25
                      ? 'warning'
                      : 'normal'
                  }`}
                  style={{ width: `${Math.round(plantState.lightStress * 100)}%` }}
                />
              </div>
            </div>

            <div className="stress-row">
              <div className="stress-row-label">
                <span>{t('vitals.thermalStress')}</span>
                <span className="stress-percent">{Math.round(plantState.tempStress * 100)}%</span>
              </div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${
                    plantState.tempStress > 0.6
                      ? 'danger'
                      : plantState.tempStress > 0.25
                      ? 'warning'
                      : 'normal'
                  }`}
                  style={{ width: `${Math.round(plantState.tempStress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reference Botanical Video Button */}
        {onReferenceVideoClick && (
          <div className="panel-footer-action">
            <button
              type="button"
              className="flora-btn flora-btn-action secondary-action"
              onClick={onReferenceVideoClick}
            >
              <BookOpen size={14} />
              <span>Botanical Reference Study</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
