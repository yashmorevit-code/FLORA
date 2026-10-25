import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sprout, Compass, ShieldCheck, SlidersHorizontal, Activity, Headphones } from 'lucide-react';
import { INITIAL_ENVIRONMENT, INITIAL_PLANT_STATE } from './simulation/types.js';
import { stepSimulation } from './simulation/engine.js';
import { recordHistorySample, createHistorySnapshot } from './simulation/history.js';
import { persistExperiment, createExperiment } from './simulation/experiments.js';
import { BotanicalScene } from './components/BotanicalScene.jsx';
import { EnvironmentPanel } from './components/EnvironmentPanel.jsx';
import { StatusPanel } from './components/StatusPanel.jsx';
import { TimelineBar } from './components/TimelineBar.jsx';
import { ReferenceVideoModal } from './components/ReferenceVideoModal.jsx';
import { InspectionModal } from './components/InspectionModal.jsx';
import { NavigationBar } from './components/NavigationBar.jsx';
import { AnalyticsWorkspace } from './components/AnalyticsWorkspace.jsx';
import { ExperimentsWorkspace } from './components/ExperimentsWorkspace.jsx';
import { CompareWorkspace } from './components/CompareWorkspace.jsx';
import { SpeciesWorkspace } from './components/SpeciesWorkspace.jsx';
import { PlaceholderWorkspace } from './components/PlaceholderWorkspace.jsx';
import { LandingPage } from './components/landing/LandingPage.jsx';
import { BotanicalGuidePanel } from './components/BotanicalGuidePanel.jsx';
import { normalizeSpeciesId, getSpeciesConfig, SPECIES_IDS } from './simulation/species.js';
import { audioController } from './simulation/audioController.js';

export default function App() {
  // Top-level Application Route ('landing' | 'simulator')
  // Opens landing page by default on root, or simulator if explicitly on /simulator or query parameters exist
  const [appRoute, setAppRoute] = useState(() => {
    try {
      const pathname = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (
        pathname.includes('/simulator') ||
        params.has('species') ||
        params.has('progress') ||
        params.has('tab')
      ) {
        return 'simulator';
      }
    } catch (e) {}
    return 'landing';
  });

  // Navigation workspace state ('simulator' | 'analytics' | 'experiments' | 'compare' | 'species')
  const [currentWorkspace, setCurrentWorkspace] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      if (urlTab && ['simulator', 'analytics', 'experiments', 'compare', 'species'].includes(urlTab)) {
        return urlTab;
      }
    } catch (e) {}
    return 'simulator';
  });

  // Browser History and Popstate synchronization (supports browser back and forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const pathname = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        if (
          pathname.includes('/simulator') ||
          params.has('species') ||
          params.has('progress') ||
          params.has('tab')
        ) {
          setAppRoute('simulator');
          const urlTab = params.get('tab');
          if (urlTab && ['simulator', 'analytics', 'experiments', 'compare', 'species'].includes(urlTab)) {
            setCurrentWorkspace(urlTab);
          }
        } else {
          setAppRoute('landing');
        }
      } catch (e) {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Comparison workspace persistent selection IDs
  const [compareIdA, setCompareIdA] = useState('');
  const [compareIdB, setCompareIdB] = useState('');

  // Currently active experiment (null if default baseline run)
  const [activeExperiment, setActiveExperiment] = useState(null);

  const [environment, setEnvironment] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSpecies = params.get('species');
      if (urlSpecies) {
        const cfg = getSpeciesConfig(normalizeSpeciesId(urlSpecies));
        return {
          ...INITIAL_ENVIRONMENT,
          temperature: Math.round((cfg.optimalEnvironment.temperatureMin + cfg.optimalEnvironment.temperatureMax) / 2),
          light: Math.round((cfg.optimalEnvironment.lightMin + cfg.optimalEnvironment.lightMax) / 2),
          moisture: Math.round((cfg.optimalEnvironment.moistureMin + cfg.optimalEnvironment.moistureMax) / 2),
          nutrients: Math.round((cfg.optimalEnvironment.nutrientsMin + cfg.optimalEnvironment.nutrientsMax) / 2),
        };
      }
    } catch (e) {}
    return INITIAL_ENVIRONMENT;
  });

  const [plantState, setPlantState] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSpecies = params.get('species');
      const urlProgress = params.get('progress');
      if (urlSpecies || urlProgress !== null) {
        const speciesId = urlSpecies ? normalizeSpeciesId(urlSpecies) : 'tomato';
        const cfg = getSpeciesConfig(speciesId);
        const progress = urlProgress !== null ? Math.max(0, Math.min(1, parseFloat(urlProgress))) : 0.0;
        const targetAge = progress * (cfg.lifecycle?.totalMaturityDays || 100);
        const baseState = {
          ...INITIAL_PLANT_STATE,
          speciesId,
          overallProgress: progress,
          ageDays: targetAge,
        };
        return stepSimulation(baseState, INITIAL_ENVIRONMENT, 0.001);
      }
    } catch (e) {}
    return INITIAL_PLANT_STATE;
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showRoots, setShowRoots] = useState(true);
  const [annotationMode, setAnnotationMode] = useState('overview'); // 'overview' | 'all' | 'hidden'
  const showAnnotations = annotationMode !== 'hidden';
  const [showControlsPanel, setShowControlsPanel] = useState(true);
  const [showStatusPanel, setShowStatusPanel] = useState(true);
  const [showBotanicalGuide, setShowBotanicalGuide] = useState(true);
  const [focusToken, setFocusToken] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Historical simulation sampling buffer
  const [history, setHistory] = useState(() => [
    createHistorySnapshot(INITIAL_PLANT_STATE, INITIAL_ENVIRONMENT),
  ]);

  // Controllable natural wind intensity (0.0 to 1.0, default 0.35 gentle breeze)
  const [windIntensity, setWindIntensity] = useState(0.35);

  // Selected plant part for interactive botanical inspection
  const [selectedPart, setSelectedPart] = useState(null);

  // Authoritative Audio Controller state synchronization
  const [audioState, setAudioState] = useState(() => audioController.getState());

  // References for deterministic requestAnimationFrame loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const envRef = useRef(environment);
  envRef.current = environment;

  const plantStateRef = useRef(plantState);
  plantStateRef.current = plantState;

  const lastTimeRef = useRef(performance.now());

  // Fixed/delta time simulation update step with automatic historical sampling
  const tickSimulation = useCallback((dt, forceSample = false, explicitProgress = null, explicitAgeDays = null) => {
    setPlantState((prev) => {
      const next = stepSimulation(prev, envRef.current, dt, explicitProgress, explicitAgeDays);

      // Record historical sample when simulation advances
      setHistory((prevHistory) =>
        recordHistorySample(prevHistory, next, envRef.current, 0.15, forceSample)
      );

      return next;
    });
  }, []);

  // Synchronize with audioController state changes and scrub updates
  useEffect(() => {
    const unsubscribe = audioController.subscribe((newState) => {
      setAudioState(newState);
      if (newState.mode === 'guided') {
        setIsPlaying(newState.isPlaying);

        // When paused and user scrubs the narration slider, immediately update the 3D plant to the scrubbed fraction
        if (!newState.isPlaying && !newState.isLoading && newState.duration > 0 && appRoute === 'simulator') {
          const speciesCfg = getSpeciesConfig(plantStateRef.current.speciesId);
          const { overallProgress, ageDays } = audioController.getGuidedProgress(speciesCfg);
          tickSimulation(0.0001, true, overallProgress, ageDays);
        }
      }
    });
    return () => unsubscribe();
  }, [tickSimulation, appRoute]);

  useEffect(() => {
    if (appRoute !== 'simulator') return;
    let animId;

    const loop = (currentTime) => {
      const realDt = Math.min(0.1, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      const isGuided = audioController.isGuidedActive();

      if (isGuided) {
        // Guided Mode: Narration is the master pace controller
        if (audioController.state.isPlaying || audioController.state.isCompleted) {
          const speciesCfg = getSpeciesConfig(plantStateRef.current.speciesId);
          const { overallProgress, ageDays } = audioController.getGuidedProgress(speciesCfg);
          tickSimulation(realDt, false, overallProgress, ageDays);
        }
      } else {
        // Free Simulation Mode: Independent clock-driven simulation speed
        if (isPlayingRef.current) {
          const effectiveDt = realDt * speedRef.current;
          tickSimulation(effectiveDt, false);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [tickSimulation, appRoute]);

  // Handler functions
  const handlePlayPause = () => {
    if (audioController.isGuidedActive()) {
      if (audioController.state.isPlaying) {
        audioController.pause();
        setIsPlaying(false);
      } else {
        audioController.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleChangeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    const variant = (newSpeed === 2) ? '2x' : (newSpeed === 5) ? '5x' : '1x';
    audioController.setSpeedVariant(variant);
  };

  const handleReset = () => {
    setIsPlaying(false);
    const currentSpecies = plantState.speciesId || SPECIES_IDS.TOMATO;
    audioController.reset(currentSpecies);
    const resetState = {
      ...INITIAL_PLANT_STATE,
      speciesId: currentSpecies,
      ageDays: 0.0,
      overallProgress: 0.0,
    };
    setPlantState(resetState);
    setEnvironment(INITIAL_ENVIRONMENT);
    setSelectedPart(null);
    setActiveExperiment(null);
    setHistory([createHistorySnapshot(resetState, INITIAL_ENVIRONMENT)]);
  };

  const handleStepForward = () => {
    if (plantState.isTerminal) return;
    if (audioController.isGuidedActive()) {
      setIsPlaying(false);
      audioController.pause();
      audioController.stepForward();
      const speciesCfg = getSpeciesConfig(plantState.speciesId);
      const { overallProgress, ageDays } = audioController.getGuidedProgress(speciesCfg);
      tickSimulation(0.001, true, overallProgress, ageDays);
    } else {
      setIsPlaying(false);
      tickSimulation(1.5, true);
    }
  };

  const handleSelectPart = (part) => {
    setSelectedPart(part);
    if (part) {
      setFocusToken((prev) => prev + 1);
    }
  };

  const handleFocusOrgan = () => {
    setFocusToken((prev) => prev + 1);
  };

  const handleReturnToOverview = () => {
    setSelectedPart(null);
    handleSelectCameraPreset('overview');
  };

  const handleSelectStage = (minProgress, minDay, stageId = null) => {
    const speciesId = plantStateRef.current.speciesId || 'tomato';
    const speciesCfg = getSpeciesConfig(speciesId);
    const targetAge = typeof minDay === 'number'
      ? minDay
      : minProgress * (speciesCfg.lifecycle?.totalMaturityDays || 100);

    let targetStageId = stageId;
    if (!targetStageId && speciesCfg.stageConfigs) {
      const match = speciesCfg.stageConfigs.find((s) => minProgress >= s.minProgress && minProgress < s.maxProgress)
        || speciesCfg.stageConfigs[0];
      targetStageId = match?.stage || 'SEED';
    }

    if (audioController.isGuidedActive()) {
      audioController.loadTrack(
        speciesId,
        targetStageId,
        isPlayingRef.current,
        audioController.state.speedVariant,
        0
      );
    }

    setPlantState((prev) => {
      const next = { ...prev, overallProgress: minProgress, ageDays: targetAge };
      const computed = stepSimulation(next, envRef.current, 0.001, minProgress, targetAge);
      setHistory((prevH) => recordHistorySample(prevH, computed, envRef.current, 0.01, true));
      return computed;
    });
  };

  const controlsRef = useRef(null);
  const [cameraPreset, setCameraPreset] = useState('overview');
  const [cameraPresetToken, setCameraPresetToken] = useState(0);

  const handleSelectCameraPreset = (preset) => {
    setCameraPreset(preset);
    setCameraPresetToken((prev) => prev + 1);
  };

  const handleResetCamera = () => {
    setCameraPreset('overview');
    setCameraPresetToken((prev) => prev + 1);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Switch or launch a botanical species from the Species Registry
  const handleSelectSpecies = (newSpeciesId) => {
    const normalized = normalizeSpeciesId(newSpeciesId);
    setIsPlaying(false);
    audioController.stop();
    audioController.loadTrack(normalized, 'SEED', false);
    setActiveExperiment(null);
    setSelectedPart(null);

    const speciesCfg = getSpeciesConfig(normalized);
    const newPlantState = {
      ...INITIAL_PLANT_STATE,
      speciesId: normalized,
      ageDays: 0.0,
      overallProgress: 0.0,
    };
    const newEnv = {
      ...INITIAL_ENVIRONMENT,
      temperature: Math.round((speciesCfg.optimalEnvironment.temperatureMin + speciesCfg.optimalEnvironment.temperatureMax) / 2),
      light: Math.round((speciesCfg.optimalEnvironment.lightMin + speciesCfg.optimalEnvironment.lightMax) / 2),
      moisture: Math.round((speciesCfg.optimalEnvironment.moistureMin + speciesCfg.optimalEnvironment.moistureMax) / 2),
      nutrients: Math.round((speciesCfg.optimalEnvironment.nutrientsMin + speciesCfg.optimalEnvironment.nutrientsMax) / 2),
    };

    setPlantState(newPlantState);
    setEnvironment(newEnv);
    setHistory([createHistorySnapshot(newPlantState, newEnv)]);
    setCurrentWorkspace('simulator');

    setCameraPreset('overview');
    setCameraPresetToken((prev) => prev + 1);
  };

  // Launch a saved or newly created experiment into the simulator session
  const handleLaunchExperiment = (exp) => {
    setIsPlaying(false);
    setActiveExperiment(exp);
    setEnvironment({ ...exp.environment });
    setPlantState({ ...exp.plantState });
    setSpeed(exp.speed || 1);
    setSelectedPart(null);
    setHistory(exp.history && exp.history.length > 0 ? [...exp.history] : [createHistorySnapshot(exp.plantState, exp.environment)]);
    setCurrentWorkspace('simulator');
  };

  // Save the current simulation run as an experiment
  const handleSaveCurrentExperiment = () => {
    const exp = createExperiment({
      name: activeExperiment?.name || `Snapshot Run ${new Date().toLocaleTimeString()}`,
      description: activeExperiment?.description || 'Saved simulation trial run.',
      speciesId: plantState.speciesId || activeExperiment?.speciesId || SPECIES_IDS.TOMATO,
      environment,
      speed,
      plantState,
      history,
    });

    if (activeExperiment?.id) {
      exp.id = activeExperiment.id;
    }

    const saved = persistExperiment(exp);
    setActiveExperiment(saved);
    return saved;
  };

  // Navigates into the greenhouse simulator, optionally setting selected species
  const handleEnterSimulator = (targetSpeciesId = null) => {
    if (targetSpeciesId) {
      handleSelectSpecies(targetSpeciesId);
    }
    setAppRoute('simulator');
    try {
      const targetUrl = targetSpeciesId ? `/simulator?species=${targetSpeciesId}` : '/simulator';
      window.history.pushState(null, '', targetUrl);
    } catch (e) {}
  };

  // Returns to the landing page showcase
  const handleReturnToLanding = () => {
    audioController.stop();
    setAppRoute('landing');
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {}
  };

  // Guide & Panel toggle handlers
  const handleToggleGuide = () => {
    setShowBotanicalGuide((prev) => !prev);
  };

  const handleToggleStatusPanel = () => {
    setShowStatusPanel((prev) => !prev);
  };

  const handleCloseGuide = () => {
    setShowBotanicalGuide(false);
  };

  // Render cinematic landing page when on root route
  if (appRoute === 'landing') {
    return <LandingPage onEnterSimulator={handleEnterSimulator} />;
  }

  return (
    <div
      className={`flora-app ${showBotanicalGuide ? 'has-guide-open' : ''} ${showControlsPanel ? 'has-controls-open' : ''} ${showStatusPanel ? 'has-vitals-open' : ''}`}
    >
      {/* Top Header Bar */}
      <header className="flora-header">
        <div className="flora-branding">
          <div
            className="flora-logo-badge"
            onClick={handleReturnToLanding}
            style={{ cursor: 'pointer' }}
            title="Return to Flora Landing Page"
          >
            <Sprout size={18} />
          </div>
          <div
            className="flora-title-group"
            style={{ cursor: 'pointer' }}
            onClick={() => setCurrentWorkspace('species')}
            title="Click to switch or view Botanical Species Registry"
          >
            <h1>FLORA</h1>
            <span className="flora-branding-subtitle">
              Botanical Plant Growth Simulator &bull;{' '}
              <strong style={{ color: 'var(--color-primary-green-light)', textDecoration: 'underline' }}>
                {(() => {
                  const sp = getSpeciesConfig(plantState.speciesId);
                  return `${sp.scientificName} (${sp.commonName})`;
                })()}
              </strong>
            </span>
          </div>
        </div>

        {/* Global Application Navigation Bar */}
        <NavigationBar
          currentWorkspace={currentWorkspace}
          onSelectWorkspace={setCurrentWorkspace}
        />

        <div className="flora-top-status">
          <button
            type="button"
            className="flora-btn flora-overview-btn"
            onClick={handleReturnToLanding}
            title="Return to the Flora Landing Showcase"
          >
            <span>Overview</span>
          </button>
          {currentWorkspace === 'simulator' && (
            <div className="panel-toggles-group">
              <button
                type="button"
                className={`panel-toggle-btn ${showControlsPanel ? 'active' : ''}`}
                onClick={() => setShowControlsPanel((prev) => !prev)}
                title={showControlsPanel ? 'Hide Environment Controls panel' : 'Show Environment Controls panel'}
                aria-pressed={showControlsPanel}
              >
                <SlidersHorizontal size={13} />
                <span>Controls</span>
              </button>
              <button
                type="button"
                className={`panel-toggle-btn ${showStatusPanel ? 'active' : ''}`}
                onClick={handleToggleStatusPanel}
                title={showStatusPanel ? 'Hide Plant Vital Signs panel' : 'Show Plant Vital Signs panel'}
                aria-pressed={showStatusPanel}
              >
                <Activity size={13} />
                <span>Vitals</span>
              </button>
              <button
                type="button"
                className={`panel-toggle-btn ${showBotanicalGuide ? 'active' : ''}`}
                onClick={handleToggleGuide}
                title={showBotanicalGuide ? 'Hide Botanical Storytelling Guide' : 'Open Botanical Storytelling Guide'}
                aria-pressed={showBotanicalGuide}
              >
                <Headphones size={13} />
                <span>Guide</span>
              </button>
            </div>
          )}
          <div className="status-pill">
            <Compass size={14} color="#52c77a" />
            <span>Engine: <strong>Three.js / R3F</strong></span>
          </div>
          <div className="status-pill">
            <ShieldCheck size={14} color="#52c77a" />
            <span>Simulation: <strong>Deterministic</strong></span>
          </div>
        </div>
      </header>

      {/* 3D Scene Viewport: Kept mounted in background or foreground */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          visibility: currentWorkspace === 'simulator' ? 'visible' : 'hidden',
          pointerEvents: currentWorkspace === 'simulator' ? 'auto' : 'none',
        }}
      >
        <BotanicalScene
          plantState={plantState}
          environment={environment}
          showRoots={showRoots}
          showAnnotations={showAnnotations}
          annotationMode={annotationMode}
          focusToken={focusToken}
          controlsRef={controlsRef}
          windIntensity={windIntensity}
          selectedPart={selectedPart}
          onSelectPart={handleSelectPart}
          onDeselect={() => setSelectedPart(null)}
          cameraPreset={cameraPreset}
          cameraPresetToken={cameraPresetToken}
        />
      </div>

      {/* Simulator Workspace HUD Overlay */}
      {currentWorkspace === 'simulator' && (
        <>
          {/* Active Experiment banner pill when running experiment */}
          {activeExperiment && (
            <div className="active-exp-pill">
              <span>Trial: <strong>{activeExperiment.name}</strong></span>
              <button
                className="pill-clear-btn"
                onClick={() => setActiveExperiment(null)}
                title="Detach trial name"
              >
                &times;
              </button>
            </div>
          )}

          {/* Environmental Controls Side Panel (Left) */}
          {showControlsPanel && (
            <EnvironmentPanel
              environment={environment}
              onChangeEnvironment={setEnvironment}
              currentSpeciesId={plantState.speciesId}
              onSelectSpecies={handleSelectSpecies}
              showRoots={showRoots}
              onToggleRoots={() => setShowRoots((prev) => !prev)}
              showAnnotations={showAnnotations}
              onToggleAnnotations={() =>
                setAnnotationMode((prev) => (prev === 'hidden' ? 'overview' : 'hidden'))
              }
              annotationMode={annotationMode}
              onChangeAnnotationMode={setAnnotationMode}
              onResetCamera={handleResetCamera}
              activeCameraPreset={cameraPreset}
              onSelectCameraPreset={handleSelectCameraPreset}
              windIntensity={windIntensity}
              onChangeWind={setWindIntensity}
            />
          )}

          {/* Plant Vital Signs & Stress Monitor Side Panel (Right) */}
          {showStatusPanel && (
            <StatusPanel
              plantState={plantState}
              onReferenceVideoClick={() => setIsVideoModalOpen(true)}
            />
          )}

          {/* Floating Interactive 12-Stage Timeline with Anchored Botanical Guide */}
          <TimelineBar
            plantState={plantState}
            isPlaying={isPlaying}
            speed={speed}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onStepForward={handleStepForward}
            onChangeSpeed={handleChangeSpeed}
            onSelectStage={handleSelectStage}
            showBotanicalGuide={showBotanicalGuide}
            onToggleBotanicalGuide={handleToggleGuide}
            onInspectOrgan={handleSelectPart}
          />

          {/* Interactive Part Inspection Card */}
          {selectedPart && (
            <InspectionModal
              part={selectedPart}
              plantState={plantState}
              onClose={() => setSelectedPart(null)}
              onFocusOrgan={handleFocusOrgan}
              onReturnToOverview={handleReturnToOverview}
            />
          )}
        </>
      )}

      {/* Analytics Workspace Page */}
      {currentWorkspace === 'analytics' && (
        <AnalyticsWorkspace
          plantState={plantState}
          history={history}
          onReturnToSimulator={() => setCurrentWorkspace('simulator')}
        />
      )}

      {/* Experiments Workspace Page */}
      {currentWorkspace === 'experiments' && (
        <ExperimentsWorkspace
          currentExperiment={activeExperiment}
          currentPlantState={plantState}
          currentEnvironment={environment}
          currentHistory={history}
          onLaunchExperiment={handleLaunchExperiment}
          onSaveCurrentExperiment={handleSaveCurrentExperiment}
        />
      )}

      {/* Compare Experiments Workspace Page */}
      {currentWorkspace === 'compare' && (
        <CompareWorkspace
          selectedIdA={compareIdA}
          selectedIdB={compareIdB}
          onSelectIdA={setCompareIdA}
          onSelectIdB={setCompareIdB}
          onLaunchExperiment={handleLaunchExperiment}
          onNavigateToExperiments={() => setCurrentWorkspace('experiments')}
        />
      )}

      {currentWorkspace === 'species' && (
        <SpeciesWorkspace
          currentSpeciesId={plantState.speciesId}
          onSelectSpecies={handleSelectSpecies}
          onReturnToSimulator={() => setCurrentWorkspace('simulator')}
        />
      )}

      {/* Botanical Reference Video Modal */}
      <ReferenceVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
}