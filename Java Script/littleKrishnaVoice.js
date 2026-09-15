/**
 * KRISHNA-UTSAV 2K26 — Little Krishna Voice Engine (Mac OS & Cross-Platform Universal Audio Architecture)
 * Plays the authentic Little Krishna animation voice with full support for macOS (Safari/Chrome), iOS, and Windows:
 * - Reference Source: Authentic Little Krishna character audio with multi-candidate loading
 * - Universal Web Audio API initialization with Safari user-gesture unlock (silent 1-sample trigger)
 * - Safe ArrayBuffer cloning & dual-mode (Promise/Callback) decodeAudioData for macOS WebKit
 * - Studio formant shaping: High-pass filter (180 Hz) + Peaking presence filter (3400 Hz, +4.0dB)
 * - Harmonious divine sparkle chime intro (D6 - G6 - B6) with WebKit positive-ramp protection
 * - Pitch modulation (1.32x) with vendor-prefixed webkitPreservesPitch overrides for Safari
 * - Automatic 3-tier cascade: Web Audio API -> HTMLAudioElement -> Native Web Speech API
 * - Smart multi-lingual speech synthesis fallback (Hindi 'Lekha' / English child pitch) so it ALWAYS wishes properly
 * - Dynamic audio ducking of background flute music and single-call safety onEnded callback
 */
import { CONFIG } from './config.js';
import { divineAudio } from './audio.js';

class LittleKrishnaVoiceEngine {
  constructor() {
    this.audioCtx = null;
    this.audioBuffer = null;
    this.currentSource = null;
    this.fallbackAudio = null;
    this.isSpeaking = false;
    this.pitchRate = (CONFIG.KRISHNA_VOICE && CONFIG.KRISHNA_VOICE.CARTOON_PITCH) || 1.32;
    this.activeAudioPath = null;
    this._unlocked = false;
    this._preloadPromise = null;

    // Auto-attach user-gesture unlock listeners for macOS Safari & iOS WebKit
    if (typeof window !== 'undefined') {
      const unlockHandler = () => this.unlockAudio();
      ['click', 'touchstart', 'touchend', 'keydown', 'mousedown'].forEach(evt => {
        window.addEventListener(evt, unlockHandler, { capture: true, passive: true });
      });
    }

    this.preloadBuffer();
  }

  /**
   * Initializes or returns the Web Audio context with webkitAudioContext fallback
   */
  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    return this.audioCtx;
  }

  /**
   * Public hook to prime and unlock audio on user gesture (called from UI triggers)
   */
  initContext() {
    this.unlockAudio();
  }

  /**
   * Unlocks Web Audio on macOS Safari & iOS by playing a 1-sample silent buffer synchronously
   */
  unlockAudio() {
    try {
      const ctx = this.getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        if (!this._unlocked) {
          const silentBuf = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = silentBuf;
          source.connect(ctx.destination);
          source.start(0);
          this._unlocked = true;
          console.log("🌸 Little Krishna audio context unlocked for macOS/Safari.");
        }
      }
    } catch (e) {
      // Passive catch for non-fatal unlock attempts
    }

    // Pre-warm HTMLAudioElement for Safari
    try {
      if (!this.fallbackAudio && typeof Audio !== 'undefined') {
        const defaultPath = (CONFIG.KRISHNA_VOICE && CONFIG.KRISHNA_VOICE.AUDIO_CLIP_PATH) ||
          "../Image and Audio/audio/little_krishna_welcome_hindi.mp3";
        this.fallbackAudio = new Audio(encodeURI(defaultPath));
        this.fallbackAudio.preload = 'auto';
        this.fallbackAudio.load();
      }
    } catch (e) {}
  }

  setPitch(rate) {
    this.pitchRate = Math.max(1.0, Math.min(1.6, parseFloat(rate) || 1.32));
    if (CONFIG.KRISHNA_VOICE) {
      CONFIG.KRISHNA_VOICE.CARTOON_PITCH = this.pitchRate;
    }
  }

  /**
   * Safe, cross-browser wrapper for ctx.decodeAudioData supporting both Promise and Callback forms
   */
  decodeAudio(ctx, arrayBuffer) {
    return new Promise((resolve, reject) => {
      try {
        // macOS Safari can detach ArrayBuffers upon decoding; always supply a copy
        const bufferCopy = arrayBuffer.slice(0);
        let resolved = false;

        const onDecoded = (decoded) => {
          if (!resolved) {
            resolved = true;
            resolve(decoded);
          }
        };

        const onError = (err) => {
          if (!resolved) {
            resolved = true;
            reject(err);
          }
        };

        const result = ctx.decodeAudioData(bufferCopy, onDecoded, onError);
        if (result && typeof result.then === 'function') {
          result.then(onDecoded).catch(onError);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Pre-fetches and decodes the audio buffer into memory with multi-candidate resilience
   */
  async preloadBuffer() {
    if (this.audioBuffer) return this.audioBuffer;
    if (this._preloadPromise) return this._preloadPromise;

    this._preloadPromise = (async () => {
      const candidates = [
        (CONFIG.KRISHNA_VOICE && CONFIG.KRISHNA_VOICE.AUDIO_CLIP_PATH),
        "../Image and Audio/audio/little_krishna_welcome_hindi.mp3",
        "../Image and Audio/audio/little_krishna_hindi.mp3",
        "../Image and Audio/audio/little_krishna_voice.wav",
        "../Image and Audio/audio/little_krishna_welcome_2k26.mp3"
      ].filter(Boolean);

      // Deduplicate candidates preserving priority
      const uniqueCandidates = [...new Set(candidates)];
      const ctx = this.getAudioContext();

      for (const path of uniqueCandidates) {
        try {
          const response = await fetch(encodeURI(path));
          if (!response.ok) continue;
          const arrayBuffer = await response.arrayBuffer();
          if (!arrayBuffer || arrayBuffer.byteLength === 0) continue;

          if (ctx) {
            const decoded = await this.decodeAudio(ctx, arrayBuffer);
            if (decoded && decoded.duration > 0) {
              this.audioBuffer = decoded;
              this.activeAudioPath = path;
              console.log(`🌸 Little Krishna voice loaded successfully from: ${path}`);
              return this.audioBuffer;
            }
          }
        } catch (e) {
          console.warn(`Notice: Audio candidate at ${path} not loaded, trying next:`, e.message || e);
        }
      }
      return null;
    })();

    return this._preloadPromise;
  }

  /**
   * Generates a sweet, gentle divine temple chime / stardust sparkle (D6 - G6 - B6)
   * Hardened for macOS WebKit audio scheduling to prevent RangeError / negative time exceptions
   */
  playDivineChime(ctx, startTime) {
    if (!ctx) return;
    try {
      const notes = [1174.66, 1567.98, 1975.53]; // D6, G6, B6
      const baseTime = Math.max(ctx.currentTime, startTime);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';

        const t = baseTime + 0.02 + idx * 0.07;
        osc.frequency.setValueAtTime(freq, t);

        // Safari requires positive initial values before exponential ramp
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.06, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (e) {
      console.warn("Chime generation notice:", e);
    }
  }

  /**
   * Immediately stops any active voice speech and restores background music
   */
  stopGreeting() {
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch (e) {}
      this.currentSource = null;
    }
    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.pause();
        this.fallbackAudio.currentTime = 0;
      } catch (e) {}
      this.fallbackAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    this.isSpeaking = false;
    divineAudio.restoreVolume();
  }

  /**
   * Speaks Little Krishna greeting using authentic reference audio and DSP enhancement
   * Implements a resilient 3-tier cascade: Web Audio API -> HTMLAudioElement -> Native Web Speech API
   * @param {Function} onEndedCallback - Optional callback triggered once voice finishes
   * @param {string} customText - Optional log message or speech identifier
   */
  async speakGreeting(onEndedCallback = null, customText = null) {
    if (!CONFIG.KRISHNA_VOICE || !CONFIG.KRISHNA_VOICE.ENABLED) {
      if (typeof onEndedCallback === 'function') onEndedCallback();
      return;
    }

    const textToSpeak = customText || CONFIG.KRISHNA_VOICE.RESPONSE_TEXT;
    console.log("🌸 Little Krishna Greeting initiated:", textToSpeak);

    // Duck background flute music for crystal-clear acoustics
    divineAudio.duckVolume(0.12);

    // Guaranteed single-fire completion callback with safety watchdog
    let callbackFired = false;
    const safeComplete = () => {
      if (callbackFired) return;
      callbackFired = true;
      if (safetyWatchdog) clearTimeout(safetyWatchdog);
      this.isSpeaking = false;
      divineAudio.restoreVolume();
      if (typeof onEndedCallback === 'function') {
        onEndedCallback();
      }
    };

    // Safety watchdog: ensure celebration timeline is never blocked if audio hangs
    const safetyWatchdog = setTimeout(() => {
      if (!callbackFired) {
        console.warn("Little Krishna speech watchdog elapsed; releasing celebration sequence.");
        safeComplete();
      }
    }, 7000);

    const ctx = this.getAudioContext();

    // Ensure context is actively running (re-awakens suspended contexts on macOS)
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {}
    }

    // =========================================================================
    // Tier 1: High-Fidelity Web Audio API with Studio Filters & Divine Chime
    // =========================================================================
    if (ctx && ctx.state === 'running') {
      try {
        if (!this.audioBuffer) {
          await this.preloadBuffer();
        }

        if (this.audioBuffer) {
          this.stopGreeting();

          const now = ctx.currentTime;
          this.playDivineChime(ctx, now);

          const source = ctx.createBufferSource();
          source.buffer = this.audioBuffer;
          source.playbackRate.value = this.pitchRate; // Child vocal modulation

          // High-pass filter (180 Hz): eliminates auditorium stage sub-rumble
          const highPass = ctx.createBiquadFilter();
          highPass.type = 'highpass';
          highPass.frequency.value = 180;

          // Peaking filter (3400 Hz, +4.0dB): adds crystal-clear vocal projection
          const presenceBoost = ctx.createBiquadFilter();
          presenceBoost.type = 'peaking';
          presenceBoost.frequency.value = 3400;
          presenceBoost.Q.value = 1.1;
          presenceBoost.gain.value = 4.0;

          // Master voice gain
          const gainNode = ctx.createGain();
          gainNode.gain.value = 1.25;

          // Audio graph connection
          source.connect(highPass);
          highPass.connect(presenceBoost);
          presenceBoost.connect(gainNode);
          gainNode.connect(ctx.destination);

          this.currentSource = source;
          this.isSpeaking = true;

          source.onended = () => {
            console.log("🌸 Little Krishna welcome voice speech completed via Web Audio.");
            safeComplete();
          };

          // Start speech in harmony with the divine chime
          source.start(now + 0.1);
          return;
        }
      } catch (e) {
        console.warn("Web Audio playback notice on macOS, falling back to HTMLAudio:", e);
      }
    }

    // =========================================================================
    // Tier 2: Direct HTMLAudioElement Fallback (with macOS Safari pitch overrides)
    // =========================================================================
    const audioPath = this.activeAudioPath ||
      (CONFIG.KRISHNA_VOICE && CONFIG.KRISHNA_VOICE.AUDIO_CLIP_PATH) ||
      "../Image and Audio/audio/little_krishna_welcome_hindi.mp3";

    try {
      this.stopGreeting();

      const audio = new Audio(encodeURI(audioPath));
      this.fallbackAudio = audio;
      audio.volume = 1.0;
      audio.playbackRate = this.pitchRate;

      // Ensure pitch shift occurs across Safari/WebKit & Gecko
      audio.preservesPitch = false;
      audio.webkitPreservesPitch = false;
      audio.mozPreservesPitch = false;

      audio.onended = () => {
        console.log("🌸 Little Krishna audio greeting completed via HTMLAudioElement.");
        safeComplete();
      };

      audio.onerror = () => {
        console.warn("HTMLAudioElement encountered error, transitioning to Web Speech API fallback.");
        this.synthesizeVoice(textToSpeak, safeComplete);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isSpeaking = true;
          console.log("🌸 Little Krishna audio playing via HTMLAudioElement.");
        }).catch((err) => {
          console.warn("Direct HTMLAudio play blocked or unavailable, using Web Speech:", err.message);
          this.synthesizeVoice(textToSpeak, safeComplete);
        });
        return;
      }
    } catch (e) {
      console.warn("HTMLAudioElement instantiation failed, using Web Speech:", e);
    }

    // =========================================================================
    // Tier 3: Native Web Speech API Fallback (Guaranteed to wish on macOS)
    // =========================================================================
    this.synthesizeVoice(textToSpeak, safeComplete);
  }

  /**
   * Native browser SpeechSynthesis fallback configured for authentic Indian / Child acoustics.
   * Ensures Little Krishna always wishes properly even when audio decoding or autoplay is restricted.
   */
  synthesizeVoice(text, onComplete = null) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      // Keep global reference so Safari/Chrome garbage collectors don't drop the speech midway
      window.__activeKrishnaUtterance = utterance;

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      if (voices && voices.length > 0) {
        // 1. Prefer Hindi voices (macOS has native 'Lekha', Chrome has Google हिन्दी)
        selectedVoice = voices.find(v => v.lang.startsWith('hi') || /lekha|hindi/i.test(v.name));

        // 2. Prefer Indian English voices (Rishi, Sangeeta, Veena)
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang === 'en-IN' || /rishi|sangeeta|heera|veena/i.test(v.name));
        }

        // 3. Prefer natural, youthful female voices for child pitch base on macOS/iOS
        if (!selectedVoice) {
          selectedVoice = voices.find(v => /samantha|victoria|karen|tessa|flo|sandy|natural/i.test(v.name));
        }

        if (!selectedVoice) {
          selectedVoice = voices[0];
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;

        // If only an English voice is available, speak the English greeting so it doesn't sound broken
        if (!selectedVoice.lang.startsWith('hi') && /[\u0900-\u097F]/.test(text)) {
          utterance.text = (CONFIG.KRISHNA_VOICE && CONFIG.KRISHNA_VOICE.RESPONSE_TEXT_ENGLISH) ||
            "Jai Shri Krishna! Welcome to the Krishna Utsav.";
        }
      }

      utterance.pitch = 1.35; // Gentle child timbre
      utterance.rate = 0.95;  // Clear, celebratory rhythm
      utterance.volume = 1.0;

      this.isSpeaking = true;

      const finishSpeech = () => {
        window.__activeKrishnaUtterance = null;
        if (typeof onComplete === 'function') {
          onComplete();
        }
      };

      utterance.onend = finishSpeech;
      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        finishSpeech();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis execution failed:", e);
      if (typeof onComplete === 'function') onComplete();
    }
  }
}

export const littleKrishnaVoice = new LittleKrishnaVoiceEngine();
