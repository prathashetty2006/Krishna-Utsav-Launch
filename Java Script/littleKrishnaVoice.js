/**
 * KRISHNA-UTSAV 2K26 — Little Krishna Voice Engine
 * Handles the divine return greeting when the sacred reveal screen appears.
 * Tunes Web Speech API speech synthesis to sound like a joyful, divine child (Little Krishna),
 * with support for Indian accents and optional custom MP3 audio playback.
 */
import { CONFIG } from './config.js';
import { divineAudio } from './audio.js';

class LittleKrishnaVoiceEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeaking = false;
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const updateVoices = () => {
      this.voices = this.synth.getVoices();
    };
    updateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoices;
    }
  }

  /**
   * Finds the most melodious and authentic voice for Little Krishna:
   * Prioritizes Indian English/Hindi female or youthful natural voices,
   * then sweet/natural voices, before generic fallbacks.
   */
  getBestVoice() {
    if (!this.voices || this.voices.length === 0) {
      if (this.synth) this.voices = this.synth.getVoices();
    }
    if (!this.voices || this.voices.length === 0) return null;

    // 1. Indian English / Hindi Voices (most authentic pronunciation of "Jai Shree Krishna")
    const indianVoices = this.voices.filter(v => 
      v.lang.startsWith('hi') || 
      v.lang === 'en-IN' || 
      /heera|neerja|kalpana|geeta|swara|prabhat|ravi|veena/i.test(v.name)
    );
    if (indianVoices.length > 0) {
      // Prefer female/higher natural timbre if present as base for child pitch
      const femaleIndian = indianVoices.find(v => /female|heera|neerja|kalpana|veena/i.test(v.name));
      return femaleIndian || indianVoices[0];
    }

    // 2. High-quality natural female voices (shift effortlessly to childlike divine pitch)
    const naturalFemale = this.voices.find(v => 
      (v.lang.startsWith('en')) && /natural|aria|jenny|zira|samantha|karen|victoria/i.test(v.name)
    );
    if (naturalFemale) return naturalFemale;

    // 3. Any English voice
    const anyEnglish = this.voices.find(v => v.lang.startsWith('en'));
    return anyEnglish || this.voices[0];
  }

  /**
   * Speaks "Jai Shree Krishna! Welcome to Krishna-Utsav 2K26"
   * Ducks the background flute music while speaking and restores it afterwards.
   */
  speakGreeting(customText = null) {
    if (!CONFIG.KRISHNA_VOICE || !CONFIG.KRISHNA_VOICE.ENABLED) return;
    const textToSpeak = customText || CONFIG.KRISHNA_VOICE.RESPONSE_TEXT;

    console.log("🌸 Little Krishna Voice Greeting initiated:", textToSpeak);

    // Duck background music for clarity in auditorium
    divineAudio.duckVolume(0.18);

    // Try playing dedicated MP3 audio file first if it exists
    if (CONFIG.KRISHNA_VOICE.AUDIO_CLIP_PATH) {
      const audioClip = new Audio(CONFIG.KRISHNA_VOICE.AUDIO_CLIP_PATH);
      let clipPlayed = false;

      audioClip.oncanplaythrough = () => {
        if (clipPlayed) return;
        clipPlayed = true;
        audioClip.volume = 1.0;
        audioClip.play().then(() => {
          console.log("Playing recorded Little Krishna voice clip.");
          audioClip.onended = () => {
            divineAudio.restoreVolume();
          };
        }).catch(() => {
          this.synthesizeVoice(textToSpeak);
        });
      };

      audioClip.onerror = () => {
        // MP3 file not found or failed, seamlessly fall back to browser synthesis
        this.synthesizeVoice(textToSpeak);
      };

      // Set timeout fallback in case audio load hangs
      setTimeout(() => {
        if (!clipPlayed && !this.isSpeaking) {
          this.synthesizeVoice(textToSpeak);
        }
      }, 350);
      return;
    }

    this.synthesizeVoice(textToSpeak);
  }

  /**
   * Synthesizes Little Krishna voice using browser Web Speech API
   */
  synthesizeVoice(text) {
    if (!this.synth) {
      console.warn("Speech synthesis not supported in this environment.");
      divineAudio.restoreVolume();
      return;
    }

    try {
      this.synth.cancel(); // Clear any ongoing utterances

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getBestVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'en-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      // Little Krishna Divine Child Acoustics
      utterance.pitch = CONFIG.KRISHNA_VOICE.PITCH || 1.45; // Higher child pitch
      utterance.rate = CONFIG.KRISHNA_VOICE.RATE || 0.95;   // Gentle, clear rhythm
      utterance.volume = 1.0;

      this.isSpeaking = true;

      const finishSpeaking = () => {
        this.isSpeaking = false;
        setTimeout(() => {
          divineAudio.restoreVolume();
        }, 300);
      };

      utterance.onend = finishSpeaking;
      utterance.onerror = (e) => {
        console.warn("Little Krishna voice synthesis error:", e);
        finishSpeaking();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.error("Error synthesizing Little Krishna voice:", e);
      divineAudio.restoreVolume();
    }
  }
}

export const littleKrishnaVoice = new LittleKrishnaVoiceEngine();
