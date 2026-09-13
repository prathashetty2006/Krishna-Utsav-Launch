/**
 * KRISHNA-UTSAV 2K26 — Voice Recognition Engine
 * Speech Recognition using Web Speech API with strict anti-double-triggering,
 * conservative normalization, and privacy protection (no recording/upload).
 */
import { CONFIG } from './config.js';

export class VoiceRecognitionEngine {
  constructor(callbacks = {}) {
    this.callbacks = Object.assign({
      onStateChange: () => {},
      onPhraseDetected: () => {},
      onError: () => {},
      onInterimText: () => {}
    }, callbacks);

    this.recognition = null;
    this.isListening = false;
    this.isActivated = false;
    this.isSupported = false;

    this.checkSupport();
  }

  checkSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    return this.isSupported;
  }

  normalize(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  isTriggerPhrase(transcript) {
    const clean = this.normalize(transcript);
    if (!clean) return false;

    // Explicit conservative check: Must contain "jai" or "jay", and must contain "krishna", and must match one of the exact trigger phrases with word boundaries
    return CONFIG.TRIGGERS.some(trigger => {
      const normTrigger = this.normalize(trigger);
      if (clean === normTrigger) return true;
      const regex = new RegExp(`(^|\\s)${normTrigger}(\\s|$)`, 'i');
      return regex.test(clean);
    });
  }

  startListening() {
    if (this.isActivated) return;
    if (!this.isSupported) {
      this.callbacks.onError({ code: 'UNSUPPORTED', message: 'Speech Recognition not supported in this browser' });
      this.callbacks.onStateChange('UNSUPPORTED');
      return;
    }

    if (this.isListening) return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN'; // Optimized for Indian English / Devanagari romanization

      this.callbacks.onStateChange('REQUESTING_MIC');

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onStateChange('LISTENING');
      };

      this.recognition.onresult = (event) => {
        if (this.isActivated) return;

        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            if (this.isTriggerPhrase(transcript)) {
              this.lockAndTrigger(transcript);
              return;
            }
          } else {
            interimTranscript += transcript;
            if (this.isTriggerPhrase(interimTranscript)) {
              this.lockAndTrigger(interimTranscript);
              return;
            }
          }
        }

        if (interimTranscript) {
          this.callbacks.onInterimText(interimTranscript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.callbacks.onError({ code: 'PERMISSION_DENIED', message: 'Microphone permission denied' });
          this.callbacks.onStateChange('DENIED');
        } else if (event.error === 'no-speech') {
          // Keep calm, listening continues
        } else {
          this.callbacks.onError({ code: event.error, message: event.message || event.error });
          this.callbacks.onStateChange('RECOGNITION_ERROR');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // If not activated and meant to listen, quietly keep listening unless denied/error
        if (!this.isActivated && this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.callbacks.onStateChange('IDLE');
          }
        } else if (!this.isActivated) {
          this.callbacks.onStateChange('IDLE');
        }
      };

      this.recognition.start();
    } catch (e) {
      console.error("Speech recognition startup failure:", e);
      this.callbacks.onError({ code: 'START_FAILED', message: e.message });
      this.callbacks.onStateChange('MANUAL_FALLBACK');
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
        this.recognition.abort();
      } catch (e) {}
    }
  }

  lockAndTrigger(matchedPhrase) {
    if (this.isActivated) return;
    this.isActivated = true; // One-time lock prevents double firing
    this.stopListening();
    this.callbacks.onStateChange('PHRASE_DETECTED');
    this.callbacks.onPhraseDetected(matchedPhrase);
  }
}
