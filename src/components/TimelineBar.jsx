import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, StepForward, Calendar, Sparkles, AlertTriangle, ChevronLeft, ChevronRight, Headphones, Film } from 'lucide-react';
import { STAGE_CONFIGS } from '../simulation/types.js';
import { getAllStagesForSpecies, getSpeciesConfig, SPECIES_IDS } from '../simulation/species.js';
import { BotanicalGuidePanel } from './BotanicalGuidePanel.jsx';
import { audioController } from '../simulation/audioController.js';

export function TimelineBar({
  plantState,
  isPlaying,
  speed,
  onPlayPause,
  onReset,
  onStepForward,
  onChangeSpeed,
  onSelectStage,
  showBotanicalGuide,
  onToggleBotanicalGuide,
  onInspectOrgan,
}) {
  const speciesCfg = getSpeciesConfig(plantState?.speciesId);
  const stages = getAllStagesForSpecies(speciesCfg);
  const currentStage = stages[plantState.stageIndex] || stages[0];
  const isSunflower = speciesCfg.id === SPECIES_IDS.SUNFLOWER;
  const isMature = (plantState.overallProgress || 0) >= 0.98 && !plantState.isTerminal;
  const isTerminal = plantState.isTerminal || false;

  const [audioState, setAudioState] = useState(() => audioController.getState());

  useEffect(() => {
    const unsub = audioController.subscribe(setAudioState);
    return () => unsub();
  }, []);

  const isGuided = audioState.mode === 'guided';

  const handleToggleMode = () => {
    audioController.setMode(isGuided ? 'free' : 'guided');
  };

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
        {/* Playback Controls & Speed Multipliers Cluster */}
        <div className="timeline-controls-cluster">
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

          {/* Speed Multipliers, Synchronization Mode & Botanical Guide Anchor */}
          <div className="speed-and-guide-anchor">
            <div className="speed-multiplier-group">
              <span className="speed-label">Speed:</span>
              <div className="speed-pills">
                {[1, 2, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`speed-pill ${speed === s ? 'active' : ''}`}
                    onClick={() => onChangeSpeed(s)}
                    title={`Set simulation speed to ${s}x (${s === 1 ? 'Full Documentary' : s === 2 ? 'Concise Narration' : 'Key-Points'})`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Mode Toggle Button: Guided vs Free */}
              <button
                type="button"
                className={`mode-toggle-pill ${isGuided ? 'guided' : 'free'}`}
                onClick={handleToggleMode}
                title={
                  isGuided
                    ? 'Guided Mode Active: Simulation progresses in lockstep with narration. Click for Free Simulation.'
                    : 'Free Simulation Active: Independent simulation clock. Click to lock simulation to narration pace.'
                }
              >
                <Film size={12} />
                <span>{isGuided ? 'Guided Mode' : 'Free Mode'}</span>
              </button>

              {/* Narration Variant Badge in Guided Mode */}
              {isGuided && (
                <span className="narration-variant-badge" title="Active narration detail level">
                  {speed === 1 ? 'Full Story' : speed === 2 ? 'Concise' : 'Key Points'}
                </span>
              )}

              {/* Guide Launcher beside the simulation speed controls */}
              {onToggleBotanicalGuide && (
                <button
                  type="button"
                  className={`flora-btn guide-launcher-btn ${showBotanicalGuide ? 'active' : ''}`}
                  onClick={onToggleBotanicalGuide}
                  title={showBotanicalGuide ? 'Close Botanical Guide (Esc)' : 'Open Botanical Audio Guide'}
                  aria-expanded={showBotanicalGuide}
                >
                  <Headphones size={14} />
                  <span>Guide</span>
                </button>
              )}
            </div>

            {/* Botanical Guide Panel Popover anchored directly above the speed controls */}
            {showBotanicalGuide && (
              <BotanicalGuidePanel
                plantState={plantState}
                isPlayingSimulation={isPlaying}
                onToggleSimulationPlay={onPlayPause}
                onSelectStage={onSelectStage}
                onInspectOrgan={onInspectOrgan}
                onClose={onToggleBotanicalGuide}
              />
            )}
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

          {/* Guided Mode Synchronized Rhythm Indicator */}
          {isGuided && (
            <div className="status-item guided-sync-indicator" title="Simulation is synchronized with Botanical Guide narration">
              <span className={`sync-pulse-dot ${audioState.isPlaying ? 'pulsing' : ''}`} />
              <span>
                Guided Pace:{' '}
                <strong className="status-highlight-cyan">
                  {audioState.speedVariant === '1x' ? '1x Full' : audioState.speedVariant === '2x' ? '2x Concise' : '5x Key Points'}
                </strong>
              </span>
            </div>
          )}

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
                onClick={() => onSelectStage(cfg.minProgress, cfg.minDay, cfg.stage)}
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
