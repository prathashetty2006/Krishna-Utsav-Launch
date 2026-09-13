/**
 * KRISHNA-UTSAV 2K26 — Master Configuration
 * All configurable event parameters, timings and endpoints.
 */
export const CONFIG = {
  // Institutional Details
  INSTITUTION_NAME: "Dr. B.B. Hegde First Grade College, Kundapura",
  MANAGEMENT_NAME: "Coondapur Education Society (R.)",
  EVENT_NAME: "KRISHNA-UTSAV 2K26",
  EVENT_DATE: "16 September 2026",
  EVENT_VENUE: "Mookambika Auditorium, Dr. B.B. Hegde First Grade College, Kundapura",
  TAGLINE: "A Celebration of Devotion, Culture & Technology",

  // Sacred Voice Activation Triggers (Strictly "JAI SHREE KRISHNA" variations only)
  TRIGGERS: [
    "jai shree krishna",
    "jai shri krishna",
    "jai sri krishna",
    "jay shree krishna",
    "jay shri krishna",
    "jay sri krishna"
  ],

  // Portal Integration Target URL — Seamless Auditorium Auto-Scroll Showcase of Live Portal
  PORTAL_URL: "./portal_showcase.html",

  // Whether repeat visits should remember inauguration
  PERSIST_INAUGURATION: false,

  // Animation Timings (in milliseconds) based on Master Plan Section 15
  TIMINGS: {
    RECOGNITION_BLOOM_START: 0,
    DIVINE_BLOOM_START: 1500,
    FEATHERS_START: 2000,
    PARTICLES_START: 2500,
    SACRED_PHRASE_REVEAL: 3000,
    EVENT_IDENTITY_REVEAL: 4500,
    PORTAL_TRANSITION_START: 7200,
    PORTAL_NAVIGATE: 9500
  },

  // Audio Settings
  AUDIO: {
    DEFAULT_VOLUME: 0.85,
    ENABLED: true,
    CUE_PATH: "../Image and Audio/audio/krishna_flute.mp3"
  },

  // Little Krishna Voice Greeting Settings (Authentic Hindi & Cartoon Child Modulation)
  KRISHNA_VOICE: {
    ENABLED: true,
    RESPONSE_TEXT: "जय श्री कृष्णा! कृष्णा उत्सव में आपका स्वागत है",
    RESPONSE_TEXT_ENGLISH: "Jai Shri Krishna! Welcome to the Krishna Utsav.",
    CARTOON_PITCH: 1.32,
    AUDIO_CLIP_PATH: "../Image and Audio/audio/little_krishna_hindi.mp3"
  }
};
