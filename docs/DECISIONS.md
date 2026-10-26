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

## 2026-09-16 — Sustain counter reduced from 24 to 4 frames

**Decision:** `SUSTAIN_FRAMES` is 4 (about 65 ms at 60 fps) instead of the 24 frames (about 400 ms) of the first version.

**Context:** Changed in commit `183b238`, on the same day as the first decision above, together with resuming the AudioContext on start (needed on iOS). The reason for the lower value was not recorded.

**Consequence:** Thunder is accepted after a much shorter low-frequency burst, which should miss less but can accept short loud sounds. The statements above about 400 ms no longer apply. The spectral shape check and the requirement of a preceding flash remain the main protection against false triggers.
