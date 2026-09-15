/**
 * KRISHNA-UTSAV 2K26 — Master Launch Controller
 * Glues state machine, speech recognition, celebration visual engine,
 * audio system, and operator controls.
 */
import { CONFIG } from './config.js?v=kannada2026';
import { divineAudio } from './audio.js?v=bouncy2026';
import { VoiceRecognitionEngine } from './speech.js?v=bouncy2026';
import { CelebrationEngine } from './celebration.js?v=bouncy2026';
import { littleKrishnaVoice } from './littleKrishnaVoice.js?v=kannada2026';

class LaunchApp {
  constructor() {
    this.state = 'IDLE'; // IDLE | REQUESTING_MIC | LISTENING | PHRASE_DETECTED | CELEBRATION_ACTIVE | PORTAL_TRANSITION | PORTAL_OPEN
    this.hasInaugurated = false;

    this.initElements();
    this.initEngines();
    this.bindEvents();
    this.updateUIState('IDLE');
    this.startAmbientMusic();
  }

  startAmbientMusic() {
    divineAudio.playAmbient();
    const gestureEvents = ['click', 'keydown', 'touchstart', 'mousemove', 'wheel', 'scroll'];
    const startOnGesture = () => {
      divineAudio.playAmbient();
      if (divineAudio.audio && !divineAudio.audio.paused) {
        gestureEvents.forEach(evt => window.removeEventListener(evt, startOnGesture));
      }
    };
    gestureEvents.forEach(evt => window.addEventListener(evt, startOnGesture, { passive: true }));
  }

  initElements() {
    this.dom = {
      canvas: document.getElementById('particle-canvas'),
      container: document.getElementById('launch-stage'),
      revealOverlay: document.getElementById('celebration-reveal-overlay'),
      sacredPhrase: document.getElementById('sacred-phrase-display'),
      eventIdentity: document.getElementById('event-identity-display'),
      portalTransition: document.getElementById('portal-curtain'),
      portalStatus: document.getElementById('portal-status-text'),

      // Controls & Indicators
      micButton: document.getElementById('btn-mic-toggle'),
      micStatusPill: document.getElementById('mic-status-pill'),
      micStatusText: document.getElementById('mic-status-label'),
      waveform: document.getElementById('mic-waveform'),
      manualLaunchBtn: document.getElementById('btn-manual-launch'),

      // Operator Controls & Drawer
      operatorDrawer: document.getElementById('operator-drawer'),
      btnToggleOperator: document.getElementById('btn-toggle-operator'),
      btnCloseOperator: document.getElementById('btn-close-operator'),
      btnSimulateVoice: document.getElementById('btn-simulate-voice'),
      btnTestKrishnaVoice: document.getElementById('btn-test-krishna-voice'),
      btnTestAudio: document.getElementById('btn-test-audio'),
      btnResetState: document.getElementById('btn-reset-state'),
      volumeSlider: document.getElementById('operator-volume-slider'),
      btnMute: document.getElementById('btn-toggle-mute'),
      pitchSlider: document.getElementById('operator-pitch-slider'),
      labelKrishnaPitch: document.getElementById('label-krishna-pitch'),
      portalUrlInput: document.getElementById('input-portal-url')
    };

    if (this.dom.portalUrlInput) {
      this.dom.portalUrlInput.value = CONFIG.PORTAL_URL;
      this.dom.portalUrlInput.addEventListener('change', (e) => {
        CONFIG.PORTAL_URL = e.target.value;
      });
    }
  }

  initEngines() {
    // 1. Celebration Engine
    this.celebration = new CelebrationEngine({
      canvas: this.dom.canvas,
      container: this.dom.container,
      revealOverlay: this.dom.revealOverlay,
      sacredPhrase: this.dom.sacredPhrase,
      eventIdentity: this.dom.eventIdentity,
      portalTransition: this.dom.portalTransition,
      portalStatus: this.dom.portalStatus
    });

    // 2. Speech Engine
    this.speech = new VoiceRecognitionEngine({
      onStateChange: (state) => this.handleSpeechState(state),
      onPhraseDetected: (phrase) => this.onSacredPhraseHeard(phrase),
      onError: (err) => this.handleSpeechError(err),
      onInterimText: (text) => this.handleInterimText(text)
    });
  }

  bindEvents() {
    // Microphone Button Click
    if (this.dom.micButton) {
      this.dom.micButton.addEventListener('click', () => {
        divineAudio.initContext();
        littleKrishnaVoice.initContext();
        if (this.speech.isListening) {
          this.speech.stopListening();
          this.updateUIState('IDLE');
        } else {
          this.speech.startListening();
        }
      });
    }

    // Manual Fallback Launch Button
    if (this.dom.manualLaunchBtn) {
      this.dom.manualLaunchBtn.addEventListener('click', () => {
        divineAudio.initContext();
        littleKrishnaVoice.initContext();
        this.triggerInauguration("Manual Trigger / Operator Launch");
      });
    }

    // Operator Panel Toggle
    if (this.dom.btnToggleOperator) {
      this.dom.btnToggleOperator.addEventListener('click', () => this.toggleOperatorPanel());
    }
    if (this.dom.btnCloseOperator) {
      this.dom.btnCloseOperator.addEventListener('click', () => this.toggleOperatorPanel(false));
    }

    // Operator Test Buttons
    if (this.dom.btnSimulateVoice) {
      this.dom.btnSimulateVoice.addEventListener('click', () => {
        littleKrishnaVoice.initContext();
        this.onSacredPhraseHeard("jai shree krishna (simulated)");
      });
    }
    if (this.dom.btnTestKrishnaVoice) {
      this.dom.btnTestKrishnaVoice.addEventListener('click', () => {
        littleKrishnaVoice.initContext();
        littleKrishnaVoice.speakGreeting();
      });
    }
    if (this.dom.btnTestAudio) {
      this.dom.btnTestAudio.addEventListener('click', () => {
        divineAudio.initContext();
        littleKrishnaVoice.initContext();
        divineAudio.playCelebrationCue();
      });
    }
    if (this.dom.btnResetState) {
      this.dom.btnResetState.addEventListener('click', () => this.resetApp());
    }

    // Volume & Mute Controls
    if (this.dom.volumeSlider) {
      this.dom.volumeSlider.addEventListener('input', (e) => {
        divineAudio.setVolume(parseFloat(e.target.value));
      });
    }
    if (this.dom.btnMute) {
      this.dom.btnMute.addEventListener('click', () => {
        const isMuted = divineAudio.toggleMute();
        this.dom.btnMute.innerText = isMuted ? '🔇 Unmute Sound' : '🔊 Mute Sound';
      });
    }

    // Little Krishna Voice Tone Control
    if (this.dom.pitchSlider) {
      this.dom.pitchSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        littleKrishnaVoice.setPitch(val);
        if (this.dom.labelKrishnaPitch) {
          const descriptor = val >= 1.30 ? 'Energetic Child' : (val >= 1.15 ? 'Soft Child' : (val > 1.03 ? 'Mild Modulation' : 'Natural Voice'));
          this.dom.labelKrishnaPitch.innerText = `${val.toFixed(2)}x (${descriptor})`;
        }
      });
    }

    // Stage Keyboard Shortcuts for Auditorium AV Team
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing inside an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        divineAudio.initContext();
        littleKrishnaVoice.initContext();
        this.triggerInauguration("Auditorium Hotkey Launch [Space/Enter]");
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        divineAudio.initContext();
        littleKrishnaVoice.initContext();
        if (this.speech.isListening) {
          this.speech.stopListening();
          this.updateUIState('IDLE');
        } else {
          this.speech.startListening();
        }
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        this.toggleOperatorPanel();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        this.resetApp();
      }
    });
  }

  handleSpeechState(state) {
    if (this.hasInaugurated) return;
    this.updateUIState(state);
  }

  handleInterimText(text) {
    if (this.dom.micStatusText && this.speech.isListening) {
      this.dom.micStatusText.innerText = `Hearing: "${text}"...`;
    }
  }

  handleSpeechError(err) {
    console.warn("Speech error caught:", err);
    if (err.code === 'PERMISSION_DENIED' || err.code === 'UNSUPPORTED') {
      this.updateUIState('MANUAL_FALLBACK');
    }
  }

  onSacredPhraseHeard(phrase) {
    if (this.hasInaugurated) return;
    console.log("Sacred phrase detected:", phrase);
    this.triggerInauguration(phrase);
  }

  triggerInauguration(reason = "") {
    if (this.hasInaugurated) return;
    this.hasInaugurated = true;
    this.state = 'PHRASE_DETECTED';

    // Stop speech recognition immediately to prevent double fires
    this.speech.stopListening();
    this.updateUIState('PHRASE_DETECTED');

    // 2-second auditorium anticipation gap after guest speaks sacred words
    this.inaugurationTimer = setTimeout(() => {
      this.state = 'CELEBRATION_ACTIVE';
      this.updateUIState('CELEBRATION_ACTIVE');

      // Run the synchronized visual celebration sequence
      this.celebration.startCelebrationSequence(() => {
        this.transitionToPortal();
      });
    }, 2000);
  }

  transitionToPortal() {
    this.state = 'PORTAL_OPEN';
    console.log("Navigating to portal destination:", CONFIG.PORTAL_URL);

    // If destination is a valid URL or page, redirect
    if (CONFIG.PORTAL_URL && CONFIG.PORTAL_URL !== '#') {
      window.location.href = CONFIG.PORTAL_URL;
    } else {
      // In-place showcase completion message
      if (this.dom.portalStatus) {
        this.dom.portalStatus.innerHTML = `
          <div style="font-size: 2rem; color: #ffd700; margin-bottom: 12px; font-family: 'Cinzel', serif;">
            ✦ KRISHNA-UTSAV 2K26 INAUGURATED ✦
          </div>
          <div style="font-size: 1.1rem; color: #f5f0d8;">
            Welcome to Dr. B.B. Hegde First Grade College Digital Portal.
          </div>
        `;
      }
    }
  }

  updateUIState(state) {
    this.state = state;
    const pill = this.dom.micStatusPill;
    const label = this.dom.micStatusText;
    const waveform = this.dom.waveform;
    const micBtn = this.dom.micButton;

    if (!pill || !label) return;

    pill.className = 'status-pill';

    switch (state) {
      case 'IDLE':
        pill.classList.add('status-idle');
        label.innerText = 'Microphone Ready — Tap or Press "M" to Listen';
        if (waveform) waveform.classList.remove('active');
        if (micBtn) micBtn.setAttribute('title', 'Click to activate microphone');
        break;

      case 'REQUESTING_MIC':
        pill.classList.add('status-requesting');
        label.innerText = 'Requesting Microphone Permission...';
        break;

      case 'LISTENING':
        pill.classList.add('status-listening');
        label.innerText = 'Listening for "JAI SHREE KRISHNA"...';
        if (waveform) waveform.classList.add('active');
        if (micBtn) micBtn.setAttribute('title', 'Listening active (Click to stop)');
        break;

      case 'PHRASE_DETECTED':
      case 'CELEBRATION_ACTIVE':
        pill.classList.add('status-detected');
        label.innerText = '✦ Sacred Words Recognized: JAI SHREE KRISHNA ✦';
        if (waveform) waveform.classList.remove('active');
        break;

      case 'DENIED':
      case 'PERMISSION_DENIED':
        pill.classList.add('status-error');
        label.innerText = 'Mic Denied — Use "Inaugurate Manually" Button or Spacebar';
        if (waveform) waveform.classList.remove('active');
        break;

      case 'UNSUPPORTED':
      case 'MANUAL_FALLBACK':
      default:
        pill.classList.add('status-fallback');
        label.innerText = 'Auditorium Ready — Click "Inaugurate Manually" or Press Space';
        if (waveform) waveform.classList.remove('active');
        break;
    }
  }

  toggleOperatorPanel(force) {
    if (!this.dom.operatorDrawer) return;
    const isOpen = this.dom.operatorDrawer.classList.contains('open');
    const targetState = typeof force === 'boolean' ? force : !isOpen;

    if (targetState) {
      this.dom.operatorDrawer.classList.add('open');
    } else {
      this.dom.operatorDrawer.classList.remove('open');
    }
  }

  resetApp() {
    if (this.inaugurationTimer) {
      clearTimeout(this.inaugurationTimer);
      this.inaugurationTimer = null;
    }
    this.hasInaugurated = false;
    this.speech.isActivated = false;
    this.speech.stopListening();
    this.celebration.reset();
    this.updateUIState('IDLE');
    this.toggleOperatorPanel(false);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.krishnaLaunch = new LaunchApp();
});
