# Release checklist

- [ ] Acceptance criteria pass.
- [ ] Working tree is clean and the intended commit is on `main`.
- [ ] Pull request CI passed for the exact commit.
- [ ] Version and `CHANGELOG.md` are current.
- [ ] Production build succeeds from `npm ci`.
- [ ] Manifest and all icons pass `npm run check:pwa`.
- [ ] Browser smoke tests pass at mobile and desktop sizes.
- [ ] Existing user data survives the update.
- [ ] Update from the previous installed PWA was tested when relevant.
- [ ] iOS Safari/Home Screen and Android Chrome/installed behavior were tested when relevant.
- [ ] OpenClaw injects deployment credentials from its secrets store without logging them.
- [ ] `npm run deploy` verifies the expected SHA in public `version.json`.
- [ ] The previous release remains available for rollback.
