import React, { useState } from 'react';
import {
  Sprout,
  ArrowRight,
  Compass,
  Sparkles,
  ChevronDown,
  Layers,
  Droplets,
  Sun,
  Activity,
  Maximize2,
} from 'lucide-react';
import { LandingNavigation } from './LandingNavigation.jsx';
import { BotanicalHeroScene } from './BotanicalHeroScene.jsx';
import { SpeciesShowcaseSection } from './SpeciesShowcaseSection.jsx';
import { EnvironmentPhysicsSection } from './EnvironmentPhysicsSection.jsx';
import { LifecycleSection } from './LifecycleSection.jsx';
import { TelemetrySection } from './TelemetrySection.jsx';
import { LandingFooter } from './LandingFooter.jsx';
import './LandingPage.css';

const HERO_SPECIMENS = [
  { id: 'tomato', name: 'Tomato', latin: 'Solanum lycopersicum', tag: 'GH-01 Twin' },
  { id: 'strawberry', name: 'Strawberry', latin: 'Fragaria × ananassa', tag: 'Rosette' },
  { id: 'sunflower', name: 'Sunflower', latin: 'Helianthus annuus', tag: 'Capitulum' },
  { id: 'chilli', name: 'Chilli', latin: 'Capsicum annuum', tag: 'Sympodial' },
];

export function LandingPage({ onEnterSimulator }) {
  const [activeSpecimen, setActiveSpecimen] = useState('tomato');
  const [hoveredPart, setHoveredPart] = useState(null);

  const currentSpecimenMeta = HERO_SPECIMENS.find((s) => s.id === activeSpecimen) || HERO_SPECIMENS[0];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flora-landing-container">
      {/* Top Glass Navigation */}
      <LandingNavigation onEnterSimulator={onEnterSimulator} />

      {/* Hero Section */}
      <header id="hero" className="flora-landing-hero">
        {/* Subtle background ambient atmospheric glow */}
        <div className="flora-hero-ambient-glow" />

        <div className="flora-hero-content-grid">
          {/* Left Column: Editorial & Brand Information */}
          <div className="flora-hero-text-col">
            <div className="flora-hero-eyebrow">
              <span className="flora-eyebrow-dot" />
              <span className="flora-eyebrow-text">A LIVING BOTANICAL SIMULATION LABORATORY</span>
            </div>

            <h1 className="flora-hero-headline">
              Where Science Meets <br />
              <span className="flora-headline-italic">Living Nature.</span>
            </h1>

            <p className="flora-hero-lead">
              Explore plant growth as an interconnected biophysical system.
              Shape rhizosphere hydrology, tune photosynthetic radiation, and uncover
              the cellular science behind every stage of plant life.
            </p>

            {/* Call to Actions */}
            <div className="flora-hero-actions-row">
              <button
                type="button"
                className="flora-landing-btn-primary large"
                onClick={() => onEnterSimulator(activeSpecimen)}
                title="Enter the live 3D greenhouse simulation environment"
              >
                <span>Enter the Greenhouse</span>
                <ArrowRight size={18} className="flora-btn-arrow" />
              </button>

              <button
                type="button"
                className="flora-landing-btn-ghost"
                onClick={() => scrollToSection('species')}
              >
                <span>Explore Flora</span>
                <ChevronDown size={17} />
              </button>
            </div>

            {/* Specimen Switcher Bar */}
            <div className="flora-hero-specimen-selector">
              <span className="flora-specimen-selector-label">Inspect 3D Specimen:</span>
              <div className="flora-specimen-pills">
                {HERO_SPECIMENS.map((sp) => {
                  const isCurrent = sp.id === activeSpecimen;
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      className={`flora-specimen-pill ${isCurrent ? 'active' : ''}`}
                      onClick={() => setActiveSpecimen(sp.id)}
                    >
                      <span className="flora-pill-dot" />
                      <span className="flora-pill-name">{sp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Botanical Metrics Row */}
            <div className="flora-hero-stats-row">
              <div className="flora-stat-item">
                <span className="flora-stat-val">7</span>
                <span className="flora-stat-lbl">Living Species</span>
              </div>
              <div className="flora-stat-sep" />
              <div className="flora-stat-item">
                <span className="flora-stat-val">12</span>
                <span className="flora-stat-lbl">Phenological Stages</span>
              </div>
              <div className="flora-stat-sep" />
              <div className="flora-stat-item">
                <span className="flora-stat-val">100%</span>
                <span className="flora-stat-lbl">Deterministic Biophysics</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Botanical Stage */}
          <div className="flora-hero-stage-col">
            <div className="flora-hero-3d-card">
              {/* Floating Specimen Info Tag */}
              <div className="flora-stage-specimen-tag">
                <div className="flora-tag-top">
                  <span className="flora-tag-live-dot" />
                  <span className="flora-tag-latin">{currentSpecimenMeta.latin}</span>
                </div>
                <div className="flora-tag-body">
                  <span className="flora-tag-name">{currentSpecimenMeta.name}</span>
                  <span className="flora-tag-badge">{currentSpecimenMeta.tag}</span>
                </div>
                {hoveredPart && (
                  <div className="flora-tag-hover-info">
                    <span className="flora-hover-bullet">&rsaquo;</span>
                    <span>{hoveredPart}</span>
                  </div>
                )}
              </div>

              {/* 3D Scene */}
              <BotanicalHeroScene
                activeSpecimen={activeSpecimen}
                onHoverPart={setHoveredPart}
              />

              {/* Interaction Hint Pill */}
              <div className="flora-stage-hint-pill">
                <Compass size={13} />
                <span>Drag to Orbit &bull; Scroll to Zoom</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="flora-scroll-indicator" onClick={() => scrollToSection('species')}>
          <span className="flora-scroll-text">DISCOVER MORE</span>
          <ChevronDown size={16} className="flora-scroll-chevron" />
        </div>
      </header>

      {/* Showcase Section A: Living Species Registry */}
      <SpeciesShowcaseSection
        onEnterSimulator={onEnterSimulator}
        onPreviewSpecies={(id) => {
          if (['tomato', 'strawberry', 'sunflower', 'chilli'].includes(id)) {
            setActiveSpecimen(id);
          }
        }}
      />

      {/* Showcase Section B: Biophysical Microclimate Sandbox */}
      <EnvironmentPhysicsSection />

      {/* Showcase Section C: 12 Phenological Growth Milestones */}
      <LifecycleSection onEnterSimulator={onEnterSimulator} />

      {/* Showcase Section D: Scientific Telemetry & 4 Workspaces */}
      <TelemetrySection onEnterSimulator={onEnterSimulator} />

      {/* Comprehensive Botanical Footer */}
      <LandingFooter onEnterSimulator={onEnterSimulator} />
    </div>
  );
}
