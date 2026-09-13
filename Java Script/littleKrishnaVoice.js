/**
 * KRISHNA-UTSAV 2K26 — Little Krishna Voice Engine (Cartoon Character Sound Design)
 * Crafts the authentic Little Krishna animation voice:
 * - Native Hindi: "जय श्री कृष्णा! कृष्णा उत्सव में आपका स्वागत है"
 * - Web Audio API High-pass filter (220 Hz) to eliminate adult chest resonance
 * - Peaking presence filter (3200 Hz, +5dB) for animated cartoon vocal clarity
 * - Playback rate (1.32x) for energetic, sweet child pitch
 * - Gentle divine sparkle chime intro
 * - Dynamic audio ducking of background flute music
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

    this.preloadBuffer();
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  setPitch(rate) {
    this.pitchRate = Math.max(1.0, Math.min(1.6, parseFloat(rate) || 1.32));
    if (CONFIG.KRISHNA_VOICE) {
      CONFIG.KRISHNA_VOICE.CARTOON_PITCH = this.pitchRate;
    }
  }

  /**
   * Pre-fetches and decodes the audio buffer into memory for instant playback
   */
  async preloadBuffer() {
    const audioPath = CONFIG.KRISHNA_VOICE.AUDIO_CLIP_PATH || "../Image and Audio/audio/little_krishna_hindi.mp3";
    try {
      const response = await fetch(audioPath);
      const arrayBuffer = await response.arrayBuffer();
      const ctx = this.getAudioContext();
      if (ctx) {
        this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        console.log("🌸 Little Krishna cartoon audio buffer ready in memory.");
      }
    } catch (e) {
      console.warn("Audio buffer preloading notice:", e);
    }
  }

  /**
   * Generates a sweet, gentle divine temple chime / stardust sparkle (D6 - G6 - B6)
   */
  playDivineChime(ctx, startTime) {
    if (!ctx) return;
    try {
      const notes = [1174.66, 1567.98, 1975.53]; // D6, G6, B6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const t = startTime + idx * 0.07;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (e) {}
  }

  /**
   * Speaks Little Krishna greeting using cartoon voice processing
   */
  async speakGreeting(customText = null) {
    if (!CONFIG.KRISHNA_VOICE || !CONFIG.KRISHNA_VOICE.ENABLED) return;
    const textToSpeak = customText || CONFIG.KRISHNA_VOICE.RESPONSE_TEXT;

    console.log("🌸 Little Krishna Cartoon Voice Greeting initiated:", textToSpeak);

    // Duck background music for clarity in auditorium
    divineAudio.duckVolume(0.15);

    const ctx = this.getAudioContext();

    // 1. Try Web Audio API with Cartoon Vocal Formant Shaping
    if (ctx) {
      try {
        if (!this.audioBuffer) {
          await this.preloadBuffer();
        }

        if (this.audioBuffer) {
          if (this.currentSource) {
            try { this.currentSource.stop(); } catch (e) {}
          }

          const now = ctx.currentTime;

          // Divine chime sparkle right as Little Krishna speaks
          this.playDivineChime(ctx, now);

          const source = ctx.createBufferSource();
          source.buffer = this.audioBuffer;
          source.playbackRate.value = this.pitchRate; // 1.32x: Playful child pitch

          // High-pass filter (220 Hz): cuts out adult chest resonance
          const highPass = ctx.createBiquadFilter();
          highPass.type = 'highpass';
          highPass.frequency.value = 220;

          // Peaking filter (3200 Hz, +5dB): adds bright animated cartoon clarity
          const presenceBoost = ctx.createBiquadFilter();
          presenceBoost.type = 'peaking';
          presenceBoost.frequency.value = 3200;
          presenceBoost.Q.value = 1.2;
          presenceBoost.gain.value = 5.0;

          // Master voice volume
          const gainNode = ctx.createGain();
          gainNode.gain.value = 1.2;

          // Connect audio graph
          source.connect(highPass);
          highPass.connect(presenceBoost);
          presenceBoost.connect(gainNode);
          gainNode.connect(ctx.destination);

          this.currentSource = source;
          this.isSpeaking = true;

          source.onended = () => {
            console.log("🌸 Little Krishna cartoon voice finished.");
            this.isSpeaking = false;
            divineAudio.restoreVolume();
          };

          // Start speech right as chime resonates
          source.start(now + 0.12);
          return;
        }
      } catch (e) {
        console.warn("Web Audio processing fallback:", e);
      }
    }

    // 2. Direct HTMLAudioElement Fallback
    const audioPath = CONFIG.KRISHNA_VOICE.AUDIO_CLIP_PATH || "../Image and Audio/audio/little_krishna_hindi.mp3";
    try {
      if (this.fallbackAudio) {
        this.fallbackAudio.pause();
        this.fallbackAudio.currentTime = 0;
      }
      const audio = new Audio(audioPath);
      this.fallbackAudio = audio;
      audio.volume = 1.0;
      audio.playbackRate = this.pitchRate;
      audio.preservesPitch = false;
      audio.mozPreservesPitch = false;
      audio.webkitPreservesPitch = false;

      audio.onended = () => {
        divineAudio.restoreVolume();
        this.isSpeaking = false;
      };

      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          this.isSpeaking = true;
        }).catch(() => {
          divineAudio.restoreVolume();
        });
      }
    } catch (e) {
      divineAudio.restoreVolume();
    }
  }
}

export const littleKrishnaVoice = new LittleKrishnaVoiceEngine();
