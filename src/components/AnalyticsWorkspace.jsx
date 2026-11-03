import React from 'react';
import {
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Sun,
  Droplets,
  Sprout,
  Heart,
} from 'lucide-react';
import { BotanicalLineChart } from './BotanicalLineChart.jsx';
import { STAGE_CONFIGS } from '../simulation/types.js';
import { getSpeciesConfig } from '../simulation/species.js';
import { useTranslation } from '../i18n/index.jsx';

export function AnalyticsWorkspace({
  plantState,
  history = [],
  onReturnToSimulator,
}) {
  const { t } = useTranslation();
  const speciesCfg = getSpeciesConfig(plantState?.speciesId);
  const stages = speciesCfg?.stageConfigs || STAGE_CONFIGS;
  const currentStageConfig = stages[plantState.stageIndex] || stages[0];
  const isSunflower = speciesCfg.id === 'sunflower';

  const localizedSpeciesName = t(`speciesData.${speciesCfg.id}.commonName`, speciesCfg.commonName);
  const localizedStageName = t(`stages.${currentStageConfig.stage}.name`, currentStageConfig.name);

  return (
    <div className="flora-analytics-page">
      {/* Analytics Page Top Header */}
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
            <h2>{t('analytics.title', 'Botanical Growth Analytics')}</h2>
            <span>
              {localizedSpeciesName} ({speciesCfg.scientificName}) &bull;{' '}
              {t('analytics.subtitle', 'Physiological Time-Series Workspace')}
            </span>
          </div>
        </div>

        <div className="analytics-header-right">
          <div className="status-pill">
            <Activity size={14} color="#52c77a" />
            <span>
              {t('analytics.snapshots', 'Sampled Snapshots')}: <strong>{history.length}</strong>
            </span>
          </div>
          <div className="status-pill">
            <Sparkles size={14} color="#64ffda" />
            <span>
              {t('analytics.lifecycle', 'Lifecycle')}: <strong>{plantState.lifecycleStatusLabel}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Primary KPI Summary Cards */}
      <section className="analytics-kpi-grid">
        <div className="analytics-card">
          <div className="kpi-icon-row">
            <span>{t('timeline.simulatedAge', 'Simulated Age')}</span>
            <Calendar size={16} color="#81c784" />
          </div>
          <strong className="kpi-value">
            {plantState.ageDays.toFixed(1)} <small>{t('timeline.day', 'days')}</small>
          </strong>
          <span className="kpi-subtitle">
            {t('vitals.cycleProgress', 'Cycle Progress')}: {Math.round(plantState.overallProgress * 100)}%
          </span>
        </div>

        <div className="analytics-card">
          <div className="kpi-icon-row">
            <span>{t('vitals.stemHeight', 'Shoot Height')}</span>
            <Sprout size={16} color="#66bb6a" />
          </div>
          <strong className="kpi-value">
            {(plantState.stemHeight * 10).toFixed(1)} <small>cm</small>
          </strong>
          <span className="kpi-subtitle">
            Base Caliper: {(plantState.stemThickness * 10).toFixed(2)} cm
          </span>
        </div>

        <div className="analytics-card">
          <div className="kpi-icon-row">
            <span>{t('vitals.rootDepth', 'Rhizosphere Depth')}</span>
            <Layers size={16} color="#8d6e63" />
          </div>
          <strong className="kpi-value">
            {(plantState.rootDepth * 10).toFixed(1)} <small>cm</small>
          </strong>
          <span className="kpi-subtitle">
            Spread Radius: {(plantState.rootSpread * 10).toFixed(1)} cm
          </span>
        </div>

        <div className="analytics-card">
          <div className="kpi-icon-row">
            <span>{t('vitals.health', 'Plant Health')}</span>
            <Heart
              size={16}
              color={plantState.health > 70 ? '#52c77a' : plantState.health > 40 ? '#e6a740' : '#d94b41'}
            />
          </div>
          <strong
            className="kpi-value"
            style={{
              color: plantState.health > 70 ? '#52c77a' : plantState.health > 40 ? '#e6a740' : '#d94b41',
            }}
          >
            {Math.round(plantState.health)}%
          </strong>
          <span className="kpi-subtitle">
            {t('vitals.growthVigour', 'Growth Vigour')}: {(plantState.growthRate * 100).toFixed(0)}%
          </span>
        </div>

        <div className="analytics-card">
          <div className="kpi-icon-row">
            <span>{t('timeline.phase', 'Development Stage')}</span>
            <Sparkles size={16} color="#4fc3f7" />
          </div>
          <strong className="kpi-value stage-name">{localizedStageName}</strong>
          <span className="kpi-subtitle">
            {t('analytics.lifecycle', 'Phase')}: {plantState.lifecycleStatusLabel}
          </span>
        </div>
      </section>

      {/* Historical Growth Graphs Grid */}
      <section className="analytics-charts-grid">
        {/* GRAPH A: SHOOT AND ROOT GROWTH */}
        <BotanicalLineChart
          title={t('analytics.shootRootChart', 'Shoot & Root Morphological Elongation')}
          data={history}
          xKey="ageDays"
          xUnit="d"
          series={[
            { key: 'stemHeight', label: t('vitals.stemHeight', 'Stem Height'), color: '#4caf50', unit: 'cm' },
            { key: 'rootDepth', label: t('vitals.rootDepth', 'Root Depth'), color: '#8d6e63', unit: 'cm' },
          ]}
          emptyMessage="No historical snapshots yet. Run the simulation in Simulator view to observe growth curves."
        />

        {/* GRAPH B: PLANT HEALTH & VIGOUR */}
        <BotanicalLineChart
          title={t('analytics.healthVigourChart', 'Physiological Health & Vigour')}
          data={history}
          xKey="ageDays"
          xUnit="d"
          series={[
            { key: 'health', label: t('vitals.health', 'Plant Health'), color: '#64ffda', unit: '%' },
            { key: 'growthRate', label: t('vitals.growthVigour', 'Growth Vigour'), color: '#ffd54f', unit: '%' },
          ]}
          emptyMessage="Historical health curve will populate as simulated time advances."
        />

        {/* GRAPH C: ENVIRONMENTAL CONDITIONS */}
        <BotanicalLineChart
          title={t('analytics.environmentChart', 'Environmental Micro-Climate Parameters')}
          data={history}
          xKey="ageDays"
          xUnit="d"
          series={[
            { key: 'moisture', label: t('environment.moisture', 'Soil Moisture'), color: '#42a5f5', unit: '%' },
            { key: 'temperature', label: t('environment.temperature', 'Temperature'), color: '#ef5350', unit: '°C' },
            { key: 'light', label: t('environment.sunlight', 'Sunlight'), color: '#ffca28', unit: '%' },
            { key: 'nutrients', label: t('environment.nutrients', 'Nutrients (N-P-K)'), color: '#ab47bc', unit: '%' },
          ]}
          emptyMessage="Environmental trends over time will appear here."
        />

        {/* GRAPH D: REPRODUCTIVE DEVELOPMENT */}
        <BotanicalLineChart
          title={
            isSunflower
              ? t('analytics.sunflowerReproductiveChart', 'Generative Flowering & Seed Maturation')
              : t('analytics.reproductiveChart', 'Reproductive & Generative Development')
          }
          data={history}
          xKey="ageDays"
          xUnit="d"
          series={
            isSunflower
              ? [
                  { key: 'flowerCount', label: 'Capitulum Inflorescence', color: '#ffca28', unit: 'head' },
                  { key: 'fruitMaturity', label: 'Achene Seed Filling', color: '#8d6e63', unit: 'ratio' },
                ]
              : [
                  { key: 'flowerCount', label: t('vitals.flowers', 'Flowers'), color: '#ffee58', unit: 'count' },
                  { key: 'fruitCount', label: t('vitals.fruits', 'Fruits'), color: '#ff7043', unit: 'count' },
                  { key: 'fruitMaturity', label: 'Fruit Ripening', color: '#e53935', unit: 'ratio' },
                ]
          }
          emptyMessage="Floral and reproductive development curves will appear as the plant reaches bud and flowering stages."
        />
      </section>
    </div>
  );
}
