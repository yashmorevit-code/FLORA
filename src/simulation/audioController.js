/**
 * FLORA Botanical Audio Controller & Master Synchronization Engine
 * 
 * Centralized, authoritative controller coordinating:
 * 1. Synchronized Guided Mode: Plant morphological development and stage progression proceed
 *    in direct lockstep with educational narration.
 * 2. Free Simulation Mode: Independent clock-driven simulation where user can run at any speed.
 * 3. Speed-Aware Concise Narration Variants:
 *    - 1x Speed: Full, detailed botanical documentary narration (~15-20s)
 *    - 2x Speed: Concise narration focusing on key biological mechanisms (~7-10s)
 *    - 5x Speed: Key-points narration highlighting critical developmental milestones (~3-5s)
 * 4. Deterministic single source of truth preventing race conditions, overlapping audio tracks,
 *    and timeline desynchronization.
 */

import { getNarrationAudioUrl, getAllNarrationsForSpecies, getStageNarration } from './narrationData.js';

class BotanicalAudioController {
  constructor() {
    this._audio = null;
    this._token = 0;
    this._listeners = new Set();

    // Persistent settings
    let initialVolume = 0.85;
    let initialMuted = false;
    let initialMode = 'guided'; // Guided Mode by default for immersive botanical documentary experience
    let initialSpeedVariant = '1x';

    try {
      const savedVol = sessionStorage.getItem('flora_audio_volume');
      if (savedVol !== null) initialVolume = parseFloat(savedVol);
      const savedMute = sessionStorage.getItem('flora_audio_muted');
      if (savedMute !== null) initialMuted = savedMute === 'true';
      const savedMode = sessionStorage.getItem('flora_audio_mode');
      if (savedMode === 'free' || savedMode === 'manual') initialMode = 'free';
      else if (savedMode === 'guided') initialMode = 'guided';
      const savedVariant = sessionStorage.getItem('flora_speed_variant');
      if (savedVariant === '2x' || savedVariant === '5x') initialSpeedVariant = savedVariant;
    } catch (e) {}

    this.state = {
      speciesId: 'tomato',
      stageId: 'SEED',
      stageIndex: 0,
      title: 'Seed Imbibition',
      isPlaying: false,
      isLoading: false,
      isBuffering: false,
      hasError: false,
      errorMessage: null,
      audioUrl: null,
      currentTime: 0,
      duration: 0,
      volume: initialVolume,
      isMuted: initialMuted,
      mode: initialMode, // 'guided' | 'free'
      speedVariant: initialSpeedVariant, // '1x' | '2x' | '5x'
      stageFraction: 0.0,
      isCompleted: false,
    };

    if (typeof window !== 'undefined') {
      this._initAudioElement();
    }
  }

  _logDiag(level, event, data = {}) {
    const isDev = typeof process !== 'undefined'
      ? process.env?.NODE_ENV !== 'production'
      : (typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.FLORA_DEBUG_AUDIO));

    if (isDev) {
      const prefix = `[FLORA Audio Controller #${this._token}]`;
      if (level === 'error') {
        console.error(prefix, event, data);
      } else if (level === 'warn') {
        console.warn(prefix, event, data);
      } else {
        console.log(prefix, event, data);
      }
    }
  }

  _initAudioElement() {
    if (this._audio) return;
    try {
      this._audio = new Audio();
      this._audio.volume = this.state.isMuted ? 0 : this.state.volume;
      this._audio.muted = this.state.isMuted;
      this._audio.preload = 'auto';
    } catch (e) {
      console.warn('Audio element initialization deferred:', e.message);
    }
  }

  _notify() {
    for (const listener of this._listeners) {
      try {
        listener(this.getState());
      } catch (e) {
        console.error('AudioController listener error:', e);
      }
    }
  }

  getState() {
    return { ...this.state };
  }

  hasLoadedTrack() {
    return !!(this._audio && this._audio.src && this.state.duration > 0 && !this.state.hasError);
  }

  getAudioSrc() {
    return this._audio?.src || '';
  }

  isGuidedActive() {
    return this.state.mode === 'guided';
  }

  subscribe(listener) {
    this._listeners.add(listener);
    listener(this.getState());
    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Authoritative calculation of synchronized simulation progress in Guided Mode
   */
  getGuidedProgress(speciesConfig) {
    const fraction = (this.state.duration > 0)
      ? Math.min(1.0, Math.max(0.0, (this.state.currentTime || 0) / this.state.duration))
      : (this.state.isCompleted ? 1.0 : 0.0);

    const sConfigs = speciesConfig?.stageConfigs || [];
    const activeCfg = sConfigs[this.state.stageIndex] || sConfigs[0] || {
      minProgress: 0.0,
      maxProgress: 0.05,
      minDay: 0.0,
      maxDay: 2.0,
    };

    const overallProgress = this.state.isCompleted
      ? 1.0
      : activeCfg.minProgress + fraction * (activeCfg.maxProgress - activeCfg.minProgress);

    const ageDays = this.state.isCompleted
      ? (speciesConfig?.lifecycle?.totalMaturityDays || 100.0)
      : activeCfg.minDay + fraction * (activeCfg.maxDay - activeCfg.minDay);

    return {
      stageIndex: this.state.stageIndex,
      stageId: this.state.stageId,
      stageFraction: fraction,
      overallProgress: Math.min(1.0, Math.max(0.0, overallProgress)),
      ageDays: Math.max(0.0, ageDays),
      isPlaying: this.state.isPlaying,
      isCompleted: this.state.isCompleted,
    };
  }

  /**
   * Set simulation speed multiplier / narration variant: '1x' | '2x' | '5x'
   * Mid-stage transitions preserve exact developmental fraction without jumping
   */
  setSpeedVariant(variant) {
    const validVariant = (variant === '2x' || variant === 2)
      ? '2x'
      : (variant === '5x' || variant === 5)
        ? '5x'
        : '1x';

    if (this.state.speedVariant === validVariant) return;

    const currentFraction = (this.state.duration > 0)
      ? (this.state.currentTime / this.state.duration)
      : 0;

    this.state.speedVariant = validVariant;
    try {
      sessionStorage.setItem('flora_speed_variant', validVariant);
    } catch (e) {}

    // Reload active stage using the new concise/keypoints speed variant, preserving developmental fraction
    this.loadTrack(this.state.speciesId, this.state.stageId, this.state.isPlaying, validVariant, currentFraction);
  }

  /**
   * Set operational mode: 'guided' (Synchronized documentary) or 'free' (Independent sandbox)
   */
  setMode(mode) {
    const validMode = (mode === 'guided') ? 'guided' : 'free';
    if (this.state.mode === validMode) return;

    this.state.mode = validMode;
    try {
      sessionStorage.setItem('flora_audio_mode', validMode);
    } catch (e) {}
    this._notify();
  }

  /**
   * Loads a narration track for a species, stage, and speed variant.
   * If seekFraction > 0, seeks to that proportional position upon loading metadata.
   */
  loadTrack(speciesId, stageId, autoPlay = false, speedVariant = null, seekFraction = 0) {
    if (!speciesId) speciesId = 'tomato';
    if (!stageId) stageId = 'SEED';

    const normSpecies = speciesId.toLowerCase();
    const narration = getStageNarration(normSpecies, stageId);
    const activeVariant = speedVariant || this.state.speedVariant || '1x';
    const audioUrl = getNarrationAudioUrl(normSpecies, stageId, activeVariant);

    // Invalidate any previous asynchronous callbacks
    const token = ++this._token;

    this._initAudioElement();
    const audio = this._audio;

    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    }

    this.state = {
      ...this.state,
      speciesId: normSpecies,
      stageId: narration.stageId,
      stageIndex: narration.stageIndex,
      title: narration.title,
      speedVariant: activeVariant,
      isPlaying: false,
      isLoading: true,
      isBuffering: false,
      hasError: false,
      errorMessage: null,
      audioUrl,
      currentTime: 0,
      duration: 0,
      stageFraction: seekFraction || 0,
      isCompleted: false,
    };
    this._notify();
    this._logDiag('info', 'loadTrack requested', {
      species: normSpecies,
      stage: stageId,
      variant: activeVariant,
      url: audioUrl,
      autoPlay,
      seekFraction,
    });

    if (!audio) {
      this.state.isLoading = false;
      this.state.hasError = true;
      this.state.errorMessage = 'Audio playback engine unavailable.';
      this._notify();
      return;
    }

    audio.preload = 'auto';
    audio.src = audioUrl;

    audio.onloadedmetadata = () => {
      if (token !== this._token) return;
      const dur = audio.duration;
      if (Number.isFinite(dur) && dur > 0) {
        this.state.duration = dur;
        if (seekFraction > 0) {
          const targetTime = Math.min(dur - 0.05, Math.max(0, seekFraction * dur));
          audio.currentTime = targetTime;
          this.state.currentTime = targetTime;
          this.state.stageFraction = seekFraction;
        }
      }
      this.state.isLoading = false;
      this.state.hasError = false;
      this.state.errorMessage = null;
      this._notify();

      if (autoPlay) {
        this.play();
      }
    };

    audio.oncanplay = () => {
      if (token !== this._token) return;
      if (this.state.duration === 0 && Number.isFinite(audio.duration) && audio.duration > 0) {
        this.state.duration = audio.duration;
      }
      this.state.isLoading = false;
      this.state.hasError = false;
      this._notify();
    };

    audio.onwaiting = () => {
      if (token !== this._token) return;
      this.state.isBuffering = true;
      this._notify();
    };

    audio.onplaying = () => {
      if (token !== this._token) return;
      this.state.isPlaying = true;
      this.state.isLoading = false;
      this.state.isBuffering = false;
      this._notify();
    };

    audio.onpause = () => {
      if (token !== this._token) return;
      this.state.isPlaying = false;
      this.state.isBuffering = false;
      this._notify();
    };

    audio.ontimeupdate = () => {
      if (token !== this._token) return;
      this.state.currentTime = audio.currentTime || 0;
      if (this.state.duration > 0) {
        this.state.stageFraction = Math.min(1.0, Math.max(0.0, this.state.currentTime / this.state.duration));
      }
      this._notify();
    };

    audio.onended = () => {
      if (token !== this._token) return;
      this._logDiag('info', 'Track ended naturally', {
        stage: this.state.stageId,
        stageIndex: this.state.stageIndex,
        mode: this.state.mode,
      });

      this.state.currentTime = this.state.duration;
      this.state.stageFraction = 1.0;

      // In Guided Mode, automatically advance to next stage upon genuine audio completion
      if (this.state.mode === 'guided') {
        const allStages = getAllNarrationsForSpecies(this.state.speciesId);
        if (this.state.stageIndex < allStages.length - 1) {
          this.nextStage(true);
        } else {
          // Reached final maturity stage
          this.state.isCompleted = true;
          this.state.isPlaying = false;
          this._notify();
        }
      } else {
        this.state.isPlaying = false;
        this._notify();
      }
    };

    audio.onstalled = () => {
      if (token !== this._token) return;
      this._logDiag('warn', 'Media download stalled', { url: audioUrl });
    };

    audio.onerror = () => {
      if (token !== this._token) return;
      this.state.isLoading = false;
      this.state.isPlaying = false;
      this.state.hasError = true;

      const err = audio.error;
      let msg = 'Failed to load narration track.';
      if (err) {
        switch (err.code) {
          case 1: msg = 'Audio playback was aborted.'; break;
          case 2: msg = 'Network connection failed while downloading audio.'; break;
          case 3: msg = 'Audio decoding error or corrupted format.'; break;
          case 4: msg = 'Audio track asset not found or format unsupported.'; break;
          default: msg = err.message || 'Unknown media error.';
        }
      }
      this.state.errorMessage = msg;
      this._logDiag('error', 'Audio loading error', { code: err?.code, message: msg, url: audioUrl });
      this._notify();
    };

    try {
      audio.load();
    } catch (e) {
      if (token === this._token) {
        this.state.isLoading = false;
        this.state.hasError = true;
        this.state.errorMessage = e.message || 'Failed to initiate audio load.';
        this._notify();
      }
    }
  }

  async play() {
    this._initAudioElement();
    const audio = this._audio;
    if (!audio) return;

    if (!audio.src || audio.src === window.location.href) {
      this.loadTrack(this.state.speciesId, this.state.stageId, true);
      return;
    }

    const token = this._token;
    try {
      audio.volume = this.state.isMuted ? 0 : this.state.volume;
      audio.muted = this.state.isMuted;
      await audio.play();
      if (token === this._token) {
        this.state.isPlaying = true;
        this.state.hasError = false;
        this.state.errorMessage = null;
        this.state.isCompleted = false;
        this._notify();
      }
    } catch (err) {
      if (token === this._token) {
        this._logDiag('warn', 'Playback request rejected', { err: err.message });
        this.state.isPlaying = false;
        this._notify();
      }
    }
  }

  pause() {
    const audio = this._audio;
    if (!audio) return;
    try {
      audio.pause();
    } catch (e) {}
    this.state.isPlaying = false;
    this._notify();
  }

  togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  retry() {
    this._logDiag('info', 'Retrying track load', {
      species: this.state.speciesId,
      stage: this.state.stageId,
      variant: this.state.speedVariant,
    });
    this.loadTrack(this.state.speciesId, this.state.stageId, true);
  }

  replay() {
    const audio = this._audio;
    if (!audio) return;
    audio.currentTime = 0;
    this.state.currentTime = 0;
    this.state.stageFraction = 0;
    this.state.isCompleted = false;
    this.play();
  }

  seek(seconds) {
    const clamped = Math.max(0, Math.min(this.state.duration || 100, seconds));
    if (this._audio) {
      try {
        this._audio.currentTime = clamped;
      } catch (e) {}
    }
    this.state.currentTime = clamped;
    if (this.state.duration > 0) {
      this.state.stageFraction = Math.min(1.0, Math.max(0.0, clamped / this.state.duration));
    }
    this._notify();
  }

  /**
   * Step forward in Guided Mode by a meaningful increment
   */
  stepForward() {
    if (this.state.duration > 0) {
      const stepSeconds = Math.max(1.5, this.state.duration * 0.20);
      const nextTime = this.state.currentTime + stepSeconds;
      if (nextTime < this.state.duration - 0.2) {
        this.seek(nextTime);
      } else {
        this.nextStage(false);
      }
    } else {
      this.nextStage(false);
    }
  }

  setVolume(vol) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state.volume = clamped;
    this.state.isMuted = false;
    if (this._audio) {
      this._audio.volume = clamped;
      this._audio.muted = false;
    }
    try {
      sessionStorage.setItem('flora_audio_volume', clamped.toString());
      sessionStorage.setItem('flora_audio_muted', 'false');
    } catch (e) {}
    this._notify();
  }

  setMuted(muted) {
    this.state.isMuted = muted;
    if (this._audio) {
      this._audio.muted = muted;
      this._audio.volume = muted ? 0 : this.state.volume;
    }
    try {
      sessionStorage.setItem('flora_audio_muted', muted.toString());
    } catch (e) {}
    this._notify();
  }

  nextStage(autoPlay = false) {
    const allStages = getAllNarrationsForSpecies(this.state.speciesId);
    const nextIdx = this.state.stageIndex + 1;
    if (nextIdx < allStages.length) {
      const nextStage = allStages[nextIdx];
      this.loadTrack(this.state.speciesId, nextStage.stageId, autoPlay, this.state.speedVariant, 0);
      return nextStage;
    } else {
      this.state.isCompleted = true;
      this.state.isPlaying = false;
      this.state.stageFraction = 1.0;
      this._notify();
      return null;
    }
  }

  prevStage(autoPlay = false) {
    const allStages = getAllNarrationsForSpecies(this.state.speciesId);
    const prevIdx = this.state.stageIndex - 1;
    if (prevIdx >= 0) {
      const prevStage = allStages[prevIdx];
      this.loadTrack(this.state.speciesId, prevStage.stageId, autoPlay, this.state.speedVariant, 0);
      return prevStage;
    }
    return null;
  }

  reset(speciesId = null) {
    const targetSpecies = (speciesId || this.state.speciesId || 'tomato').toLowerCase();
    this.stop();
    this.state.stageIndex = 0;
    this.state.stageId = 'SEED';
    this.state.currentTime = 0;
    this.state.stageFraction = 0;
    this.state.isCompleted = false;
    this.loadTrack(targetSpecies, 'SEED', false, this.state.speedVariant, 0);
  }

  stop() {
    this._token++;
    if (this._audio) {
      try {
        this._audio.pause();
        this._audio.currentTime = 0;
      } catch (e) {}
    }
    this.state.isPlaying = false;
    this.state.currentTime = 0;
    this.state.stageFraction = 0;
    this._notify();
  }
}

// Global Singleton Instance ensuring only ONE authoritative synchronization controller
export const audioController = new BotanicalAudioController();
