
/**
 * KRISHNA-UTSAV 2K26 — Audio Engine
 * Exclusively plays the user's authentic devotional audio: krishna_flute.mp3
 * (All old synthetic sounds/oscillators have been completely removed).
 */
import { CONFIG } from './config.js';

class DivineAudioEngine {
  constructor() {
    this.isMuted = false;
    this.volume = CONFIG.AUDIO.DEFAULT_VOLUME || 0.85;
    this.audio = null;
    this.initAudio();
  }

  initAudio() {
    try {
      this.audio = new Audio(CONFIG.AUDIO.CUE_PATH);
      this.audio.preload = 'auto';
      this.audio.volume = this.isMuted ? 0 : this.volume;
    } catch (e) {
      console.warn("Audio initialization notice:", e);
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  /**
   * Plays the official Krishna Flute MP3 during inauguration
   */
  playCelebrationCue() {
    if (!this.audio) {
      this.initAudio();
    }
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.volume = this.isMuted ? 0 : this.volume;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log("Audio play notice (user interaction required):", err.message);
        });
      }
    }
  }

  /**
   * Plays the devotional background flute music automatically on opening
   */
  playAmbient() {
    if (!this.audio) {
      this.initAudio();
    }
    if (this.audio) {
      this.audio.loop = true;
      this.audio.volume = this.isMuted ? 0 : this.volume;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Devotional background song started automatically.");
        }).catch(err => {
          console.log("Autoplay waiting for user gesture:", err.message);
        });
      }
    }
  }

  /**
   * Smoothly dips background flute music volume so speech is heard clearly
   */
  duckVolume(target = 0.2, stepMs = 30) {
    if (!this.audio || this.isMuted) return;
    this.originalVolume = this.volume;
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    let current = this.audio.volume;
    this.fadeInterval = setInterval(() => {
      current = Math.max(target, current - 0.05);
      if (this.audio) this.audio.volume = current;
      if (current <= target) clearInterval(this.fadeInterval);
    }, stepMs);
  }

  /**
   * Smoothly restores background flute music to its pre-duck level
   */
  restoreVolume(stepMs = 40) {
    if (!this.audio || this.isMuted) return;
    const target = this.originalVolume || this.volume || 0.85;
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    let current = this.audio.volume;
    this.fadeInterval = setInterval(() => {
      current = Math.min(target, current + 0.05);
      if (this.audio) this.audio.volume = current;
      if (current >= target) clearInterval(this.fadeInterval);
    }, stepMs);
  }

  initContext() {
    // Prime the audio on user gesture
    if (!this.audio) {
      this.initAudio();
    }
  }
}

export const divineAudio = new DivineAudioEngine();
