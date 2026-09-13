/**
 * KRISHNA-UTSAV 2K26 — Celebration & Visual Awakening Engine
 * Canvas Particle System, Drifting Peacock Feathers, Mandala Bloom,
 * and Sacred Typography Reveal Sequence.
 */
import { CONFIG } from './config.js';
import { divineAudio } from './audio.js';
import { littleKrishnaVoice } from './littleKrishnaVoice.js';

export class CelebrationEngine {
  constructor(elements = {}) {
    this.canvas = elements.canvas;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.container = elements.container;
    this.revealOverlay = elements.revealOverlay;
    this.sacredPhraseEl = elements.sacredPhrase;
    this.eventIdentityEl = elements.eventIdentity;
    this.portalTransitionEl = elements.portalTransition;
    this.portalStatusEl = elements.portalStatus;

    this.particles = [];
    this.rays = [];
    this.animId = null;
    this.isRunning = false;
    this.isCelebrationActive = false;

    this.initCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  initCanvas() {
    if (!this.canvas) return;
    this.resizeCanvas();
    this.startAmbientParticles();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Calm, meditative golden stardust before activation
   */
  startAmbientParticles() {
    this.particles = [];
    const count = Math.min(65, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.5 - 0.1,
        opacity: Math.random() * 0.6 + 0.2,
        pulsing: Math.random() * Math.PI,
        color: Math.random() > 0.3 ? '#d4af37' : '#fff5cc'
      });
    }

    this.isRunning = true;
    this.loop();
  }

  /**
   * Main animation loop handling ambient and celebration states
   */
  loop() {
    if (!this.isRunning || !this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // 1. Draw Golden Radiating Rays if Celebration Active
    if (this.isCelebrationActive && this.rays.length > 0) {
      this.ctx.save();
      this.rays.forEach(ray => {
        ray.angle += ray.rotSpeed;
        const grad = this.ctx.createRadialGradient(cx, cy, 10, cx, cy, ray.length);
        grad.addColorStop(0, `rgba(255, 235, 150, ${ray.opacity * 0.5})`);
        grad.addColorStop(0.5, `rgba(212, 175, 55, ${ray.opacity * 0.25})`);
        grad.addColorStop(1, 'rgba(212, 175, 55, 0)');

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.arc(cx, cy, ray.length, ray.angle - ray.width, ray.angle + ray.width);
        this.ctx.closePath();
        this.ctx.fillStyle = grad;
        this.ctx.fill();
      });
      this.ctx.restore();
    }

    // 2. Render and update particles
    this.particles.forEach((p, index) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulsing += 0.03;

      const currentOpacity = Math.max(0.1, p.opacity + Math.sin(p.pulsing) * 0.25);

      if (this.isCelebrationActive) {
        // Particles slowly drift away or fade
        p.speedX *= 0.985;
        p.speedY *= 0.985;
      } else {
        // Ambient wrapping
        if (p.y < -10) p.y = this.canvas.height + 10;
        if (p.x < -10) p.x = this.canvas.width + 10;
        if (p.x > this.canvas.width + 10) p.x = -10;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = this.isCelebrationActive ? 12 : 5;
      this.ctx.globalAlpha = currentOpacity;
      this.ctx.fill();
      this.ctx.restore();
    });

    this.animId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Divine Burst Particles from Center during Awakening
   */
  triggerDivineBurst() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Rays of divine light
    this.rays = [];
    for (let i = 0; i < 16; i++) {
      this.rays.push({
        angle: (i / 16) * Math.PI * 2,
        width: 0.08 + Math.random() * 0.06,
        length: Math.max(cx, cy) * 1.5,
        opacity: 0.6 + Math.random() * 0.3,
        rotSpeed: (Math.random() - 0.5) * 0.004
      });
    }

    // 150 Golden Stardust burst particles
    for (let i = 0; i < 160; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2.5;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        size: Math.random() * 3.5 + 1.2,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        opacity: 0.9,
        pulsing: Math.random() * Math.PI,
        color: Math.random() > 0.4 ? '#ffd700' : '#fff4b8'
      });
    }
  }

  /**
   * Orchestrates the 7.5s inauguration sequence matching Master Plan Timeline
   */
  startCelebrationSequence(onComplete = () => {}) {
    if (this.isCelebrationActive) return;
    this.isCelebrationActive = true;

    // Trigger synchronized audio sound cue
    divineAudio.playCelebrationCue();

    // Stage 1: Recognition & Divine Bloom
    document.body.classList.add('celebration-started');
    this.triggerDivineBurst();

    // Stage 3: Sacred Phrase "JAI SHREE KRISHNA" Reveal (Timeline 3.0s)
    setTimeout(() => {
      if (this.revealOverlay) {
        this.revealOverlay.classList.add('visible');
      }
      if (this.sacredPhraseEl) {
        this.sacredPhraseEl.classList.add('animate-reveal');
      }
      // Divine Child Return Greeting: Little Krishna speaks back to the guest
      littleKrishnaVoice.speakGreeting();
    }, CONFIG.TIMINGS.SACRED_PHRASE_REVEAL);

    // Stage 4: Event Identity "KRISHNA-UTSAV 2K26" Reveal (Timeline 4.5s)
    setTimeout(() => {
      if (this.eventIdentityEl) {
        this.eventIdentityEl.classList.add('animate-reveal');
      }
    }, CONFIG.TIMINGS.EVENT_IDENTITY_REVEAL);

    // Stage 5: Portal Light Cover Transition (Timeline 6.2s)
    setTimeout(() => {
      if (this.portalTransitionEl) {
        this.portalTransitionEl.classList.add('active');
      }
      if (this.portalStatusEl) {
        this.portalStatusEl.innerText = "Entering Krishna-Utsav Portal...";
      }
    }, CONFIG.TIMINGS.PORTAL_TRANSITION_START);

    // Stage 6: Final Navigation / Complete (Timeline 7.8s)
    setTimeout(() => {
      onComplete();
    }, CONFIG.TIMINGS.PORTAL_NAVIGATE);
  }

  /**
   * Reset for rehearsal testing
   */
  reset() {
    this.isCelebrationActive = false;
    document.body.classList.remove('celebration-started');

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    divineAudio.restoreVolume();

    if (this.revealOverlay) this.revealOverlay.classList.remove('visible');
    if (this.sacredPhraseEl) this.sacredPhraseEl.classList.remove('animate-reveal');
    if (this.eventIdentityEl) this.eventIdentityEl.classList.remove('animate-reveal');
    if (this.portalTransitionEl) this.portalTransitionEl.classList.remove('active');

    this.rays = [];
    this.startAmbientParticles();
  }
}
