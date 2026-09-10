# Agent instructions

## Mandatory standard

For every request that creates, changes, diagnoses, reviews, or deploys this PWA:

1. Read the canonical standard at `/home/mimir/shared/standards/Portable-Web-App-Standard.md` before planning or editing.
2. Then read this repository's snapshot at `docs/Portable-Web-App-Standard.md` and the project documents under `docs/`.
3. Apply the stricter rule if the two copies differ, and tell Erich that the snapshot needs synchronization.
4. If the canonical file cannot be accessed, proceed from the repository snapshot only when safe and explicitly report that the canonical version was unavailable.

Do not treat this instruction as optional merely because a requested change appears small.

## Repository rules

- Production URL: `https://ai-lab.erichweihs.com/<slug>/`, where `<slug>` comes from `app.config.json`.
- `main` must remain deployable; use a short-lived branch and pull request for normal changes.
- Never commit secrets or print them. Deployment credentials live only in OpenClaw's secrets store.
- Run the complete checks defined in `package.json` before reporting completion.
- Deployment is allowed only after CI passes for the exact commit.
- Use `npm run deploy`; do not manually upload individual production files.
- Preserve local user data and explicitly test PWA updates when changing storage or service-worker behavior.
- Record significant deviations in `docs/DECISIONS.md`.
