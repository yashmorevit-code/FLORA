import React, { useState, useEffect, useCallback } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Eye,
  Minimize2,
  Maximize2,
  X,
  Layers,
  Sun,
  Shield,
  Film,
  AlertTriangle,
  Compass,
  ArrowRight
} from 'lucide-react';
import { audioController } from '../simulation/audioController.js';
import { getStageNarration, getAllNarrationsForSpecies, getNarrationScript } from '../simulation/narrationData.js';
import { getSpeciesConfig, getActiveStage } from '../simulation/species.js';

export function BotanicalGuidePanel({
  plantState,
  onSelectStage,
  onInspectOrgan,
  onClose,
}) {
  const speciesCfg = getSpeciesConfig(plantState?.speciesId);
  const activeSimStageInfo = getActiveStage(speciesCfg, plantState?.overallProgress, plantState?.ageDays);
  const simStageId = activeSimStageInfo?.stage || 'SEED';
  const simStageIndex = activeSimStageInfo?.stageIndex ?? 0;

  // Global Audio Controller state subscription
  const [playerState, setPlayerState] = useState(() => audioController.getState());

  useEffect(() => {
    const unsubscribe = audioController.subscribe((newState) => {
      setPlayerState(newState);
    });
    return () => unsubscribe();
  }, []);

  // UI tabs and layout state
  const [activeTab, setActiveTab] = useState('story'); // 'story' | 'biology' | 'environment'
  const [isMinimized, setIsMinimized] = useState(false);

  // Active species narration entry for what is CURRENTLY being narrated
  const currentNarratedStageId = playerState.stageId || simStageId;
  const currentNarratedSpeciesId = playerState.speciesId || plantState?.speciesId || 'tomato';
  const narration = getStageNarration(currentNarratedSpeciesId, currentNarratedStageId);
  const allStages = getAllNarrationsForSpecies(currentNarratedSpeciesId);

  // Detect if simulation has progressed beyond the currently narrated stage
  const isOutOfSync = simStageId !== currentNarratedStageId;

  // On mount or when species changes, ensure valid track is loaded
  useEffect(() => {
    if (!audioController.hasLoadedTrack() || playerState.speciesId !== (plantState?.speciesId || 'tomato')) {
      audioController.loadTrack(plantState?.speciesId || 'tomato', simStageId, false);
    }
  }, [plantState?.speciesId]);

  // Handle Escape key to close the guide
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Format seconds to mm:ss
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sync guide to current simulation stage
  const handleSyncToSimulation = () => {
    audioController.loadTrack(plantState?.speciesId, simStageId, playerState.isPlaying);
  };

  // User playback handlers
  const handleTogglePlay = () => {
    audioController.togglePlay();
  };

  const handleReplay = () => {
    audioController.replay();
  };

  const handleScrub = (e) => {
    const newTime = parseFloat(e.target.value);
    audioController.seek(newTime);
    if (audioController.isGuidedActive() && onSelectStage) {
      const { overallProgress, ageDays } = audioController.getGuidedProgress(speciesCfg);
      onSelectStage(overallProgress, ageDays, currentNarratedStageId);
    }
  };

  const handleNextStage = () => {
    audioController.nextStage(playerState.isPlaying);
  };

  const handlePrevStage = () => {
    audioController.prevStage(playerState.isPlaying);
  };

  const handleToggleMode = () => {
    const newMode = playerState.mode === 'guided' ? 'free' : 'guided';
    audioController.setMode(newMode);
  };

  const handleSelectSpeedVariant = (variant) => {
    audioController.setSpeedVariant(variant);
  };

  const handleInspectOrgan = () => {
    if (onInspectOrgan && narration.highlightOrgan) {
      onInspectOrgan(narration.highlightOrgan);
    }
  };

  return (
    <aside
      className={`flora-botanical-guide-card ${isMinimized ? 'minimized' : ''}`}
      role="complementary"
      aria-label="Flora Botanical Storytelling Guide"
    >
      {/* Top Header Bar */}
      <div className="guide-header">
        <div className="guide-title-box">
          <div className="guide-icon-badge">
            <Headphones size={15} color="#46B86C" />
          </div>
          <div className="guide-title-text-group">
            <div className="guide-species-title">
              {speciesCfg.commonName} <span className="guide-species-scientific">({speciesCfg.scientificName})</span>
            </div>
            <div className="guide-meta-sub">
              FLORA Guide &bull; Milestone {playerState.stageIndex + 1} of {allStages.length}
            </div>
          </div>
        </div>

        <div className="guide-header-actions">
          {/* Speed Variant Selector Pills */}
          <div className="guide-speed-pills">
            {['1x', '2x', '5x'].map((v) => (
              <button
                key={v}
                type="button"
                className={`guide-speed-pill ${playerState.speedVariant === v ? 'active' : ''}`}
                onClick={() => handleSelectSpeedVariant(v)}
                title={`${v} Narration: ${v === '1x' ? 'Full Documentary Story' : v === '2x' ? 'Concise Biological Mechanisms' : 'Key Points Milestones'}`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Guided Mode Toggle Pill */}
          <button
            type="button"
            className={`guide-mode-btn ${playerState.mode === 'guided' ? 'active' : ''}`}
            onClick={handleToggleMode}
            title={
              playerState.mode === 'guided'
                ? 'Guided Mode Active: Simulation progresses in lockstep with narration. Click for Free Simulation.'
                : 'Free Simulation Active: Independent simulation speed. Click to lock simulation to narration pace.'
            }
          >
            <Film size={12} />
            <span>{playerState.mode === 'guided' ? 'Guided Tour' : 'Free Mode'}</span>
          </button>

          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            className="guide-action-icon-btn"
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? 'Expand Guide Panel' : 'Minimize to compact audio dock'}
            aria-label={isMinimized ? 'Expand Guide Panel' : 'Minimize Guide Panel'}
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>

          {/* Close Panel */}
          {onClose && (
            <button
              type="button"
              className="guide-action-icon-btn close-btn"
              onClick={onClose}
              title="Close Botanical Guide"
              aria-label="Close Botanical Guide"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Minimized Compact Bar */}
      {isMinimized ? (
        <div className="guide-minimized-bar">
          <div className="mini-stage-info">
            <span className="mini-stage-num">0{playerState.stageIndex + 1}</span>
            <span className="mini-stage-name">{narration.title}</span>
          </div>
          <div className="mini-controls">
            <button
              type="button"
              className="guide-play-btn mini"
              onClick={handleTogglePlay}
              title={playerState.isPlaying ? 'Pause Audio' : 'Play Audio'}
            >
              {playerState.isPlaying ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: 1 }} />}
            </button>
            <button
              type="button"
              className="guide-action-icon-btn"
              onClick={handleReplay}
              title="Replay from Beginning"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded Guide Body */
        <div className="guide-body">
          {/* Botanical Tour Completed Celebration Banner */}
          {playerState.isCompleted && (
            <div className="guide-completion-banner" role="status">
              <div className="completion-content">
                <Sparkles size={16} color="#46B86C" />
                <div className="completion-text">
                  <strong>Botanical Journey Completed!</strong>
                  <span>All 12 developmental milestones of {speciesCfg.commonName} have been observed.</span>
                </div>
              </div>
              <button
                type="button"
                className="guide-restart-btn"
                onClick={() => audioController.reset(plantState?.speciesId)}
                title="Restart guided tour from Seed Imbibition"
              >
                <RotateCcw size={12} />
                <span>Restart Tour</span>
              </button>
            </div>
          )}

          {/* Guided Mode Synchronized Rhythm Notice */}
          {playerState.mode === 'guided' && !playerState.isCompleted && (
            <div className="guide-sync-status-banner">
              <span className={`sync-dot ${playerState.isPlaying ? 'active' : ''}`} />
              <span>
                Guided Pace Active &bull; Plant development locked to <strong>{playerState.speedVariant} ({playerState.speedVariant === '1x' ? 'Full' : playerState.speedVariant === '2x' ? 'Concise' : 'Key Points'})</strong> narration
              </span>
            </div>
          )}

          {/* Stage Synchronization Notice if simulation has grown past narrated stage (in Free Mode) */}
          {isOutOfSync && playerState.mode !== 'guided' && (
            <div className="guide-sync-banner" role="status">
              <div className="guide-sync-text">
                <Compass size={13} className="sync-icon" />
                <span>
                  Simulation reached <strong>Stage {simStageIndex + 1}: {activeSimStageInfo?.stageConfig?.name}</strong>
                </span>
              </div>
              <button
                type="button"
                className="guide-sync-btn"
                onClick={handleSyncToSimulation}
                title="Jump Guide narration to match current growth stage"
              >
                <span>Sync Guide</span>
                <ArrowRight size={11} />
              </button>
            </div>
          )}

          {/* Stage Headline & Short Summary Banner */}
          <div className="guide-stage-banner">
            <div className="stage-badge-pill">
              <span className="stage-num">0{playerState.stageIndex + 1}</span>
              <h3 className="stage-name-bold">{narration.title}</h3>
            </div>
            <p className="stage-summary-text">{narration.shortSummary}</p>
          </div>

          {/* Audio Loading Error Banner */}
          {playerState.hasError && (
            <div className="guide-error-banner" role="alert">
              <div className="guide-error-text">
                <AlertTriangle size={14} color="#F87171" />
                <span>{playerState.errorMessage || 'Failed to load narration audio.'}</span>
              </div>
              <button
                type="button"
                className="guide-retry-btn"
                onClick={() => audioController.retry()}
                title="Retry loading this audio track"
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Audio Player Controls Strip */}
          <div className="guide-player-strip">
            <div className="player-main-controls">
              <button
                type="button"
                className="guide-nav-btn"
                onClick={handlePrevStage}
                disabled={playerState.stageIndex === 0}
                title="Previous Milestone Narration"
                aria-label="Previous Milestone Narration"
              >
                <SkipBack size={13} />
              </button>

              <button
                type="button"
                className={`guide-play-btn ${playerState.isPlaying ? 'playing' : ''}`}
                onClick={handleTogglePlay}
                disabled={playerState.isLoading}
                title={playerState.isPlaying ? 'Pause Narration' : 'Listen to Nature Documentary Narration'}
                aria-label={playerState.isPlaying ? 'Pause Narration' : 'Play Narration'}
              >
                {playerState.isLoading ? (
                  <span className="audio-loading-spinner" />
                ) : playerState.isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} style={{ marginLeft: '2px' }} />
                )}
              </button>

              <button
                type="button"
                className="guide-nav-btn"
                onClick={handleNextStage}
                disabled={playerState.stageIndex === allStages.length - 1}
                title="Next Milestone Narration"
                aria-label="Next Milestone Narration"
              >
                <SkipForward size={13} />
              </button>

              <button
                type="button"
                className="guide-nav-btn"
                onClick={handleReplay}
                title="Replay from Beginning"
                aria-label="Replay Narration"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Scrubber & Timestamp */}
            <div className="player-scrubber-box">
              <input
                type="range"
                className="guide-timeline-scrub"
                min="0"
                max={playerState.duration || 100}
                step="0.1"
                value={playerState.currentTime}
                onChange={handleScrub}
                title="Scrub Narration Audio"
                aria-label="Audio playback scrub bar"
              />
              <div className="scrub-time-label">
                <span>{formatTime(playerState.currentTime)}</span>
                <span>/</span>
                <span>{formatTime(playerState.duration)}</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="player-extra-controls">
              <button
                type="button"
                className="guide-icon-toggle"
                onClick={() => audioController.setMuted(!playerState.isMuted)}
                title={playerState.isMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label={playerState.isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {playerState.isMuted || playerState.volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              <input
                type="range"
                className="guide-volume-slider"
                min="0"
                max="1"
                step="0.05"
                value={playerState.isMuted ? 0 : playerState.volume}
                onChange={(e) => audioController.setVolume(parseFloat(e.target.value))}
                title="Adjust Narration Volume"
                aria-label="Narration volume"
              />
            </div>
          </div>

          {/* Interactive Organ Callout & 3D Focus */}
          {narration.highlightOrgan && (
            <div className="guide-organ-callout">
              <div className="organ-callout-text">
                <Eye size={13} color="#46B86C" />
                <span>Primary Structure: <strong>{narration.highlightOrgan.toUpperCase()}</strong></span>
              </div>
              <button
                type="button"
                className="guide-inspect-btn"
                onClick={handleInspectOrgan}
                title={`Center and inspect ${narration.highlightOrgan} in 3D scene`}
              >
                <span>Inspect in 3D</span>
              </button>
            </div>
          )}

          {/* Educational Tab Switcher */}
          <div className="guide-tab-strip" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'story'}
              className={`guide-tab-btn ${activeTab === 'story' ? 'active' : ''}`}
              onClick={() => setActiveTab('story')}
            >
              <BookOpen size={12} />
              <span>Transcript</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'biology'}
              className={`guide-tab-btn ${activeTab === 'biology' ? 'active' : ''}`}
              onClick={() => setActiveTab('biology')}
            >
              <Layers size={12} />
              <span>Biology</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'environment'}
              className={`guide-tab-btn ${activeTab === 'environment' ? 'active' : ''}`}
              onClick={() => setActiveTab('environment')}
            >
              <Sun size={12} />
              <span>Ecology</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="guide-tab-content" role="tabpanel">
            {activeTab === 'story' && (
              <div className="transcript-panel">
                <div className="transcript-variant-tag">
                  <span>
                    {playerState.speedVariant === '1x'
                      ? 'Full Educational Documentary Script (1x)'
                      : playerState.speedVariant === '2x'
                        ? 'Concise Biological Mechanism Script (2x)'
                        : 'Key Milestones Summary Script (5x)'}
                  </span>
                </div>
                <blockquote className="narration-script-text">
                  &ldquo;{getNarrationScript(narration, playerState.speedVariant)}&rdquo;
                </blockquote>
                <div className="visual-changes-box">
                  <strong>Visible Botanical Changes:</strong>
                  <p>{narration.visualChanges}</p>
                </div>
              </div>
            )}

            {activeTab === 'biology' && (
              <div className="biology-panel">
                <div className="concept-card">
                  <div className="concept-header">
                    <Sparkles size={13} color="#46B86C" />
                    <strong>Cellular & Developmental Process</strong>
                  </div>
                  <p>{narration.biologicalProcess}</p>
                </div>

                <div className="concept-card">
                  <div className="concept-header">
                    <Shield size={13} color="#52c77a" />
                    <strong>Evolutionary & Survival Value</strong>
                  </div>
                  <p>{narration.ecologicalSignificance}</p>
                </div>
              </div>
            )}

            {activeTab === 'environment' && (
              <div className="environment-panel-info">
                <div className="env-influence-box">
                  <div className="env-header-row">
                    <Sun size={13} color="#D4A359" />
                    <strong>Environmental Influences & Requirements</strong>
                  </div>
                  <p>{narration.environmentalInfluences}</p>
                </div>

                <div className="scientific-reference-box">
                  <strong>Botanical Sources & References:</strong>
                  <p>{narration.references}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
