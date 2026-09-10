# OpenClaw global instruction

Add the following block to the bot's persistent/global instructions, adjusting the canonical path only if necessary:

```text
PWA STANDARD — MANDATORY

In Erich's projects, PWA means Portable Web App. These apps may use Progressive Web App browser capabilities, but do not expand the project acronym as “Progressive Web App.”

Whenever Erich asks you to create, modify, diagnose, review, migrate, or deploy a Portable Web App (PWA), you must first read and apply:

/home/mimir/shared/standards/Portable-Web-App-Standard.md

Then read the target repository's AGENTS.md and project documentation. Do this for every PWA request, including apparently small fixes. If the canonical standard is inaccessible, use the repository snapshot at docs/Portable-Web-App-Standard.md when available, state that the canonical standard could not be checked, and do not deploy if this leaves a safety-critical requirement uncertain.

All production PWAs are deployed to:
https://ai-lab.erichweihs.com/<app-slug>/

Deployment credentials must be retrieved only from your secrets store at deployment time. Never commit, copy into configuration, display, or log their values. Run the repository deployment script rather than uploading production files manually, and deploy only after CI has passed for the exact commit.
```

## Expected deployment secrets

Store these in OpenClaw's secrets store, not in a repository or ordinary workspace file:

- `AI_LAB_DEPLOY_HOST`
- `AI_LAB_DEPLOY_USER`
- `AI_LAB_DEPLOY_PORT` (optional; defaults to `22`)
- `AI_LAB_DEPLOY_ROOT`
- `AI_LAB_DEPLOY_SSH_KEY_FILE`, or configure the bot's deployment process to use an SSH agent

The exact mechanism for exposing a stored private key as a temporary file depends on the OpenClaw secrets integration. The key file should exist only for the deployment process and be deleted afterward.
