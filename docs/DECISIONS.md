# Decisions

## 2026-09-16 — Video element srcObject isolation

**Decision:** Set `video.srcObject = new MediaStream(stream.getVideoTracks())` instead of the full combined stream.

**Context:** Passing the full stream (which includes audio tracks) to a video element's srcObject causes audio to play back through the device speakers, creating feedback loops during thunder detection.

**Consequence:** Must create a video-only MediaStream for display. Audio is handled separately via AudioContext.

## 2026-09-16 — No data persistence

**Decision:** No IndexedDB or localStorage for strike history.

**Context:** Lightning measurements are ephemeral — they're useful during the storm, not after. Persisting them adds complexity with no user value.

**Consequence:** History resets on each session. Documented in APP_SPEC.md as intended.

## 2026-09-16 — Thunder detection uses sustain counter

**Decision:** Require 24 consecutive frames (~400ms at 60fps) above the exceedance threshold before confirming thunder.

**Context:** Single loud sounds (door slam, voice) can momentarily exceed the noise floor. A sustain requirement dramatically reduces false positives.

**Consequence:** Thunder must last at least ~400ms to be detected. This matches real thunder characteristics.
