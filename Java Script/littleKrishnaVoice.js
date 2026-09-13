/**
 * KRISHNA-UTSAV 2K26 — Little Krishna Voice Engine
 * Plays the divine Little Krishna voice return greeting in authentic Hindi:
 * "जय श्री कृष्णा! कृष्णा उत्सव में आपका स्वागत है"
 * (Jai Shri Krishna! Welcome to the Krishna Utsav.)
 * 
 * 1. Plays authentic native Hindi audio file with child-pitch modulation (1.15x, preservesPitch=false)
 * 2. Seamless Web Speech API synthesis fallback (retains active utterance reference for Chrome V8 GC)
 * 3. Ducks background flute music for crystal-clear auditorium acoustics
 */
import { CONFIG } from './config.js';
import { divineAudio } from './audio.js';

class LittleKrishnaVoiceEngine {
  constructor() {
    this.activeAudio = null;
    this.isSpeaking = false;
  }

  /**
   * Speaks "जय श्री कृष्णा! कृष्णा उत्सव में आपका स्वागत है"
   */
  speakGreeting(customText = null) {
    if (!CONFIG.KRISHNA_VOICE || !CONFIG.KRISHNA_VOICE.ENABLED) return;
    const textToSpeak = customText || CONFIG.KRISHNA_VOICE.RESPONSE_TEXT;

    console.log("🌸 Little Krishna Voice Greeting initiated (Hindi):", textToSpeak);

    // Smoothly dip background flute music so Little Krishna's voice shines
    divineAudio.duckVolume(0.18);

    // 1. Primary: Play high-fidelity voice audio with divine child pitch modulation
    const audioPath = CONFIG.KRISHNA_VOICE.AUDIO_CLIP_PATH || "../Image and Audio/audio/little_krishna_hindi.mp3";

    try {
      if (this.activeAudio) {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      }

      const audio = new Audio(audioPath);
      this.activeAudio = audio;
      audio.volume = 1.0;

      // Pitch shift up to divine child timbre
      audio.playbackRate = 1.15;
      audio.preservesPitch = false;
      audio.mozPreservesPitch = false;
      audio.webkitPreservesPitch = false;

      audio.onended = () => {
        console.log("🌸 Little Krishna audio greeting finished.");
        divineAudio.restoreVolume();
        this.isSpeaking = false;
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isSpeaking = true;
          console.log("🌸 Little Krishna divine audio playing successfully!");
        }).catch((err) => {
          console.warn("Direct audio play failed or blocked, falling back to Web Speech:", err.message);
          this.synthesizeVoice(textToSpeak);
        });
      }
    } catch (e) {
      console.warn("Audio creation failed, falling back to Web Speech:", e);
      this.synthesizeVoice(textToSpeak);
    }
  }

  /**
   * Web Speech API Fallback with anti-garbage-collection and proper language pairing
   */
  synthesizeVoice(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      divineAudio.restoreVolume();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      // Keep global reference to prevent Chrome V8 garbage collector from dropping speech
      window.__activeKrishnaUtterance = utterance;

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      if (voices && voices.length > 0) {
        // Look for Indian English/Hindi voice first
        selectedVoice = voices.find(v => v.lang.startsWith('hi') || v.lang === 'en-IN');
        // Otherwise look for natural female voice as base for child pitch
        if (!selectedVoice) {
          selectedVoice = voices.find(v => /zira|female|natural|samantha/i.test(v.name));
        }
        if (!selectedVoice) {
          selectedVoice = voices[0];
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang; // Must match voice to prevent Windows SAPI rejection
      }

      utterance.pitch = CONFIG.KRISHNA_VOICE.PITCH || 1.45; // Child-like divine pitch
      utterance.rate = CONFIG.KRISHNA_VOICE.RATE || 0.95;
      utterance.volume = 1.0;

      utterance.onend = () => {
        window.__activeKrishnaUtterance = null;
        this.isSpeaking = false;
        divineAudio.restoreVolume();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        window.__activeKrishnaUtterance = null;
        this.isSpeaking = false;
        divineAudio.restoreVolume();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis failed:", e);
      divineAudio.restoreVolume();
    }
  }
}

export const littleKrishnaVoice = new LittleKrishnaVoiceEngine();
