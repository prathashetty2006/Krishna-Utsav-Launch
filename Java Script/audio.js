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

  initContext() {
    // Prime the audio on user gesture
    if (!this.audio) {
      this.initAudio();
    }
  }
}

export const divineAudio = new DivineAudioEngine();
