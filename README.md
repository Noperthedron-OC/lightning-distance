# Lightning Distance

Measures how far away a thunderstorm is. Detects lightning flashes through the camera and thunder through the microphone. The delay between them gives the distance.

**Production URL:** https://ai-lab.erichweihs.com/lightning-distance/

## How It Works

1. Grant camera and microphone access
2. Point the camera at the sky
3. The app detects luminance spikes (lightning) and low-frequency audio (thunder)
4. Distance = (elapsed seconds) x speed of sound

If camera access is denied, use the manual "I saw a flash!" button.

## Install

**iPhone/iPad:** Open in Safari → Share → Add to Home Screen → Add

**Android:** Open in Chrome → menu → Add to Home screen → Install

**Desktop:** Install icon in Chrome/Edge address bar

## Local Development

Prerequisites: Node.js 22+, npm

```
npm ci
npm run dev
```

Then open http://localhost:5173/lightning-distance/

## Build & Preview

```
npm run build
npm run preview
```

## Deployment

Do not deploy manually. Merge to `main` after CI passes. The deployment workflow handles the rest.

## Data & Privacy

- Camera and microphone are used locally only
- No data is sent anywhere
- No analytics
- History resets when you close the app

## Known Limitations

- Flash detection is unreliable in very bright scenes (average luminance > 180)
- Thunder detection may false-trigger on loud nearby sounds; the sustain requirement (24 frames) reduces this
- Requires HTTPS or localhost for camera/mic access
