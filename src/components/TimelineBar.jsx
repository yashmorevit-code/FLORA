import React, { useRef } from 'react';
import { Play, Pause, RotateCcw, StepForward, Calendar, Sparkles, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { STAGE_CONFIGS } from '../simulation/types.js';
import { getAllStagesForSpecies, getSpeciesConfig, SPECIES_IDS } from '../simulation/species.js';

export function TimelineBar({
  plantState,
  isPlaying,
  speed,
  onPlayPause,
  onReset,
  onStepForward,
  onChangeSpeed,
  onSelectStage,
}) {
  const speciesCfg = getSpeciesConfig(plantState?.speciesId);
  const stages = getAllStagesForSpecies(speciesCfg);
  const currentStage = stages[plantState.stageIndex] || stages[0];
  const isSunflower = speciesCfg.id === SPECIES_IDS.SUNFLOWER;
  const isMature = (plantState.overallProgress || 0) >= 0.98 && !plantState.isTerminal;
  const isTerminal = plantState.isTerminal || false;

  const scrollTrackRef = useRef(null);

  const handleScrollLeft = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: -180, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  return (
    <footer className="flora-floating-dock flora-bottom-timeline" aria-label="Simulation Timeline and Controls">
      {/* Terminal Lifecycle Completion Banner */}
      {isTerminal && (
        <div className="terminal-timeline-banner">
          <div className="terminal-banner-content">
            <AlertTriangle size={16} className="terminal-icon" />
            <strong className="terminal-heading">LIFECYCLE COMPLETE — SENESCENCE FINISHED</strong>
            <span className="terminal-subtext">
              Natural lifecycle concluded at Day {Math.floor(plantState.ageDays)}
            </span>
          </div>
          <button
            type="button"
            className="flora-btn flora-btn-danger compact"
            onClick={onReset}
            title="Reset simulation to seed stage while retaining active species"
          >
            <RotateCcw size={13} />
            <span>Reset to Seed</span>
          </button>
        </div>
      )}

      {/* Top Tier: Controls, Multipliers & Scientific Status */}
      <div className="timeline-top-tier">
        {/* Playback Button Group */}
        <div className="playback-button-group">
          <button
            type="button"
            className={`flora-btn flora-btn-primary ${isPlaying ? 'active' : ''}`}
            onClick={onPlayPause}
            disabled={isTerminal}
            title={isTerminal ? 'Simulation completed' : isPlaying ? 'Pause continuous simulation' : 'Play continuous growth simulation'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            className="flora-btn flora-btn-secondary"
            onClick={onStepForward}
            disabled={isTerminal}
            title={isTerminal ? 'Plant lifecycle complete' : 'Advance 1 step (~1.5 simulated days)'}
          >
            <StepForward size={14} />
            <span>Step</span>
          </button>

          <button
            type="button"
            className="flora-btn flora-btn-secondary danger-action"
            onClick={onReset}
            title="Reset to Day 0 (Seed stage)"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Multipliers */}
        <div className="speed-multiplier-group">
          <span className="speed-label">Speed:</span>
          <div className="speed-pills">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                type="button"
                className={`speed-pill ${speed === s ? 'active' : ''}`}
                onClick={() => onChangeSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="timeline-status-group">
          {/* Simulated Age Indicator */}
          <div className="status-item age-indicator">
            <Calendar size={14} className="status-item-icon" />
            <span>
              Simulated Age:{' '}
              <strong className="status-highlight">
                Day {Math.floor(plantState.ageDays || 0)}
              </strong>{' '}
              <small className="status-sub">({(plantState.ageDays || 0).toFixed(1)} d)</small>
            </span>
          </div>

          {/* Current Lifecycle Stage Indicator */}
          <div className="status-item phase-indicator">
            <span>
              Phase:{' '}
              <strong className="status-highlight-green">
                {currentStage?.name}
              </strong>{' '}
              <span className="status-sub">
                ({Math.round((plantState.stageProgress || 0) * 100)}%)
              </span>
            </span>
          </div>

          {/* Reproductive Organs Readout */}
          <div className="status-item organ-indicator">
            {isSunflower ? (
              <span>
                Head: <strong className="organ-value">{plantState.flowerCount > 0 ? 'Capitulum Inflorescence' : 'Vegetative Apex'}</strong>
                {plantState.fruitMaturity > 0 && (
                  <span> &bull; Achene Fill: <strong className="organ-value-alt">{Math.round((plantState.fruitMaturity || 0) * 100)}%</strong></span>
                )}
              </span>
            ) : speciesCfg.architecture?.fruitType === 'spike_caryopsis' || speciesCfg.architecture?.fruitType === 'panicle_grain' ? (
              <span>
                Inflorescence: <strong className="organ-value">{plantState.flowerCount > 0 ? (speciesCfg.architecture.fruitType === 'spike_caryopsis' ? 'Grain Spike' : 'Panicle') : 'Vegetative Tillers'}</strong>
                {plantState.fruitMaturity > 0 && (
                  <span> &bull; Grain Fill: <strong className="organ-value-alt">{Math.round((plantState.fruitMaturity || 0) * 100)}%</strong></span>
                )}
              </span>
            ) : speciesCfg.architecture?.fruitType === 'rose_hip' ? (
              <span>
                Blossoms: <strong className="organ-value">{plantState.flowerCount}</strong>
                {plantState.fruitCount > 0 && (
                  <span> &bull; Hips: <strong className="organ-value-alt">{plantState.fruitCount}</strong> ({Math.round((plantState.fruitMaturity || 0) * 100)}% ripe)</span>
                )}
              </span>
            ) : (
              <span>
                Flowers: <strong className="organ-value">{plantState.flowerCount}</strong>
                {plantState.fruitCount > 0 && (
                  <span> &bull; Fruits: <strong className="organ-value-alt">{plantState.fruitCount}</strong> ({Math.round((plantState.fruitMaturity || 0) * 100)}% ripe)</span>
                )}
              </span>
            )}
          </div>

          {/* Full Maturity Badge */}
          {isMature && (
            <div className="maturity-badge">
              <Sparkles size={12} />
              <span>Full Maturity</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tier: Interactive Growth Stages Track with Scroll Chevrons */}
      <div className="timeline-stages-wrapper">
        <button
          type="button"
          className="stage-scroll-btn left"
          onClick={handleScrollLeft}
          title="Scroll stages left"
          aria-label="Scroll stages left"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="timeline-stages-bar" ref={scrollTrackRef}>
          {stages.map((cfg, idx) => {
            const isActive = plantState.stageIndex === idx;
            const isCompleted = plantState.stageIndex > idx;
            return (
              <button
                key={cfg.stage}
                type="button"
                className={`timeline-stage-chip ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => onSelectStage(cfg.minProgress, cfg.minDay)}
                title={`${cfg.name} (Day ${cfg.minDay}–${cfg.maxDay}): ${cfg.desc}`}
              >
                <span className="stage-chip-step">{idx + 1}</span>
                <span className="stage-chip-name">{cfg.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="stage-scroll-btn right"
          onClick={handleScrollRight}
          title="Scroll stages right"
          aria-label="Scroll stages right"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </footer>
  );
}
