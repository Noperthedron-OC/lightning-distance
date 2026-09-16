# Lightning Distance — App Spec

## Problem

Users during a thunderstorm want to know how far away lightning is. The traditional rule ("count seconds, divide by 3") requires mental arithmetic. This app automates it.

## Non-goals

- No weather data or forecasts
- No storm tracking or map
- No history persistence across sessions
- No analytics

## Primary Journey

1. User opens app, reads intro, grants camera + mic permissions
2. App watches camera feed for luminance spikes (lightning flash)
3. On flash detection: timer starts, overlay flashes
4. App listens for low-frequency audio energy (thunder rumble)
5. On thunder detection: distance displayed in km and miles
6. Result and history shown; app resets to watching

## Fallback Journey (camera denied)

1. User grants mic only
2. Manual "I saw a flash!" button shown
3. Thunder detection continues normally

## Acceptance Criteria

- Flash detected within 1 frame of luminance spike exceeding threshold
- Thunder detection requires 24 consecutive frames above exceedance threshold
- Spectral shape check: low band >= mid band x 0.5 (rejects wind noise)
- Distance formula: speed_of_sound x elapsed_seconds; speed = 331.3 + 0.606 x temperature_celsius
- Result shown in km and miles
- History accumulates within session
- Audio-only fallback works correctly
- Settings sliders adjust detection parameters in real time

## Data Model

All state is in-memory only. No persistence required.

## Offline Behavior

Level 2 — Local-first. App works fully offline after first load. No network calls at runtime.

## Error States

- Camera denied: audio-only fallback mode
- Microphone denied: error message, stop
- Very bright scene (avg lum > 180): warning shown

## Critical Bug Note

The video element srcObject must be set to `new MediaStream(stream.getVideoTracks())` — NOT the full stream. Passing the full stream to the video element causes audio playback through speakers.
