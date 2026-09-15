# KRISHNA-UTSAV 2K26 — Auditorium Operator & AV Guide

**Event:** KRISHNA-UTSAV 2K26  
**Institution:** Dr. B.B. Hegde First Grade College, Kundapura (Coondapur Education Society R.)  
**Venue:** Mookambika Auditorium, Kundapura  
**Date:** 16 September 2026  

---

## 1. Folder Structure Organization

In accordance with your explicit folder structure requirements, the codebase is partitioned into dedicated, clean directories:

```
Website Lonch 16/
├── index.html                           # Root Gateway / Static Host Entry
├── HTML and CSS/
│   ├── index.html                       # Master Launch Interface (16:9 Projector Optimized)
│   ├── portal_showcase.html             # Post-Inauguration Event Portal Destination
│   └── style.css                        # Design System, Glassmorphism, Theme & Keyframes
├── Java Script/
│   ├── config.js                        # Master Configuration (PORTAL_URL, triggers, timings)
│   ├── audio.js                         # Web Audio API Synthesizer (Bansuri, Shankhnad, Ghanti)
│   ├── speech.js                        # Web Speech API Recognition & Conservative Matching
│   ├── celebration.js                   # Canvas Particle Burst, Peacock Feathers, Staggered Reveal
│   ├── littleKrishnaVoice.js            # Authentic Little Krishna Animated Voice Engine (DSP & Ducking)
│   └── launch.js                        # State Machine, Hotkey Bindings & Operator Drawer
├── Image and Audio/
│   ├── images/
│   │   ├── krishna_flute.png            # Sri Krishna Bansuri Motif
│   │   ├── krishna_tilak.svg            # Sri Krishna Tilak Icon
│   │   ├── peacock_feather.png          # Royal Peacock Feather (Favicon)
│   │   └── sacred_mandala.svg           # Sacred Rotating 16-Petal Vedic Mandala
│   └── audio/
│       ├── krishna_flute.mp3            # Official Devotional Krishna Flute Audio
│       ├── little_krishna_welcome_kannada.mp3 # Official Little Krishna Welcome Voice in Kannada
│       └── Little Krishna Voice.mp3     # Authentic Little Krishna Animated Series Voice Reference
└── Documentation/
    └── AUDITORIUM_OPERATOR_GUIDE.md     # This comprehensive guide
```

---

## 2. Auditorium Stage Hotkeys & Quick Controls

For zero-delay live event operations from the AV control desk:

| Hotkey | Action | Purpose |
| :--- | :--- | :--- |
| **`Space`** or **`Enter`** | **Ceremonial Launch** | Instantly triggers the divine awakening sequence (no mic needed). |
| **`M`** | **Microphone Toggle** | Starts or stops Web Speech listening mode. |
| **`O`** | **Operator Panel** | Slides out the secret AV rehearsal control drawer. |
| **`R`** | **Rehearsal Reset** | Resets the screen back to initial waiting state for dry runs. |

---

## 3. Voice Activation Specifications

- **Sacred Phrase:** `"JAI SHREE KRISHNA"`
- **Accepted Variants:**
  - `jai shri krishna`
  - `jay shree krishna`
  - `jay shri krishna`
  - `radhe krishna`
- **Normalization:** Punctuation is stripped, multiple spaces collapsed, and text lowercased before comparison.
- **Immediate Lock:** Once the phrase is recognized, recognition immediately halts to prevent double activations.
- **Privacy Assurance:** 100% on-device speech processing. No voice is recorded or transmitted to any server.

---

## 4. Live Event Fallback & Stage Reliability

- **Microphone Denied / Unsupported / Noisy Hall:**
  The golden **"INAUGURATE MANUALLY"** button is always visible and functional. The operator or stage guest can simply tap the button or press `Space` on the podium keyboard.
- **Audio Autoplay Blocked:**
  The audio engine utilizes a dual system: an HTMLAudioElement alongside a Web Audio API procedural synthesizer. The visual celebration continues seamlessly and uninterrupted under all conditions.

---

## 5. Portal URL Configuration

To set the production portal destination when deployed:
1. Open [`Java Script/config.js`](file:///c:/Users/ranji/OneDrive/Desktop/Website%20Lonch%2016/Java%20Script/config.js).
2. Update `PORTAL_URL`:
   ```javascript
   PORTAL_URL: "https://your-production-krishna-utsav-portal.edu",
   ```
3. Or update it on the fly during rehearsals directly via the Operator Drawer (`O` key).
