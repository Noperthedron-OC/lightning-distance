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

## 2026-11-04 — Website typography and square corners instead of the house defaults

**Decision:** The app uses the "warm dark" theme of erichweihs.com: Josefin Sans and Lato (self-hosted, latin subset), all radius tokens 0, sentence case, hairlines instead of shadows.

**Context:** Erich asked for the app to look like the website where it is presented. The Portable Web App Standard keeps body and UI typography and the corner-radius family constant across apps and defaults to a system sans-serif stack.

**Consequence:** This deviates from the house type and radius defaults; the token structure (house and theme layers, semantic names) is unchanged, so other apps are not affected. The fonts are part of the bundle and precached (`globPatterns` includes `woff2`), so the app looks the same offline. If more apps adopt the website style, move these values into the shared starter instead of repeating this deviation.

## 2026-11-04 — Hero picture rendered from the running app

**Decision:** The explanatory picture is rendered by a script (`npm run hero`) that runs the built app with a drawn sky as fake camera and a frozen clock for exact delays, instead of being drawn by hand.

**Context:** The picture is used on erichweihs.com as article image and project card. A hand-drawn phone screen would drift from the real interface.

**Consequence:** The phone screen in the picture is the real interface. The values (1.27 km after 3.70 s, history of five strikes) are those of the original screenshot from use; the picture is an illustration, not a field measurement.
