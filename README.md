# Lightning Distance

Measures how far away a thunderstorm is. Detects lightning flashes through the camera and thunder through the microphone. The delay between them gives the distance.

**Production URL:** https://ai-lab.erichweihs.com/lightning-distance/

## Background

Lightning Distance started as a voice prompt. On 23 August 2026 the author was on the way home from a festival, dictated the idea to an AI coding agent (detect the flash with the camera, detect the thunder with the microphone, compute the distance), and ten minutes later, when arriving home, the app was already deployed and working. The thunderstorm was over by then, so the first test was a YouTube video of a thunderstorm, and it kind of worked. Since then the thunder detection has been refined; the commit history and [docs/DECISIONS.md](docs/DECISIONS.md) show the steps.

It is a small experiment in how quickly a useful single-purpose tool can go from an idea to a deployed Portable Web App, and in how much a simple heuristic can do. The detection is deliberately simple and not a scientific instrument: expect false and missed detections, and tune the sliders in the settings for your situation.

## How It Works

1. Grant camera and microphone access
2. Point the camera at the sky
3. The app detects luminance spikes (lightning) and low-frequency audio (thunder)
4. Distance = (elapsed seconds) x speed of sound

If camera access is denied, use the manual "I saw a flash!" button.

### Detection in more detail

- **Flash:** the camera image is reduced to its average brightness for every frame. A flash is a frame that is brighter than the rolling average of the last frames (20 by default) by more than a threshold (20 % by default). After a flash the detector pauses briefly.
- **Thunder:** the microphone signal is analysed in the frequency domain. Thunder is only listened for after a flash. It counts when the low-frequency energy (20 to 100 Hz) exceeds an adaptive noise floor by a factor set by the sensitivity slider, while staying at least half as strong as the energy at 200 to 700 Hz (this rejects wind and voices), for 4 consecutive frames.
- **Distance:** speed of sound = 331.3 + 0.606 x temperature in degrees Celsius (20 degrees by default, adjustable), multiplied by the seconds between flash and thunder. The result is shown in kilometres and miles.

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
- Thunder detection may false-trigger on loud nearby sounds; the sustain requirement (4 consecutive frames) reduces this
- Requires HTTPS or localhost for camera/mic access
