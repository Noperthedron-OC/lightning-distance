# PWA Starter

Here **PWA means Portable Web App**. These apps use Progressive Web App browser capabilities, but portability across hosts and devices is the defining project goal.

This is the maintained starting point for Erich's installable web utilities. It provides the shared warm-modernist design layer, mobile installation help, update-safe service-worker handling, visible build diagnostics, CI, and guarded deployment to AI Lab.

## Create an app

1. Create a new GitHub repository from this starter.
2. Install the Node version in `.nvmrc`.
3. Run:

   ```bash
   npm ci
   npm run configure -- --slug my-app --name "My App" --short-name "My App"
   ```

4. Update the description and theme values in `app.config.json`.
5. Customize the semantic app-theme tokens at the top of `src/design-system/tokens.css`. Keep the house tokens stable.
6. Replace the source and generated icon files under `public/icons/` plus `public/apple-touch-icon.png`.
7. Replace the sample page with the app's smallest complete primary journey.
8. Complete `docs/APP_SPEC.md`, `docs/DESIGN.md`, and `docs/DECISIONS.md`.

The production URL will be `https://ai-lab.erichweihs.com/my-app/`. The slug is a stable identifier and must not be changed casually after release.

## Local development

```bash
npm ci
npm run dev
```

Build and preview the production form:

```bash
npm run build
npm run preview
```

Run all local checks:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run check:pwa
npm run build
npm run test:e2e
```

Install the Playwright browser once with `npx playwright install chromium` if needed.

## Install the app

### iPhone or iPad

Open the production URL in Safari, open Share, choose **Add to Home Screen**, confirm the name, and tap **Add**.

### Android

Open the production URL in Chrome. Use the app's **Install app** action when offered, or open the browser menu and choose **Install app** or **Add to Home screen**.

### Desktop

In Chrome or Edge, use the install icon in the address bar or the browser's install menu item.

## Data and privacy

The starter collects no analytics and sends no application data anywhere. Document any app-specific storage, network calls, permissions, export/import, and deletion behavior before release. Never place a secret in frontend code: all browser-delivered code is public to its user.

## Deployment

Production deployment is run by OpenClaw after GitHub CI succeeds for the exact commit:

```bash
npm run deploy
```

The script expects deployment values to be injected from OpenClaw's secrets store. It validates the app slug and web root, runs all checks, builds with the current Git SHA, uploads into a versioned release directory, atomically points `/<app-slug>/` at that release, and verifies the public `version.json`.

Required logical secrets are documented in `OPENCLAW-INSTRUCTIONS.md`. Never save their values in `.env`, GitHub, the repository, or logs.

### Rollback

Each release is stored below:

```text
<AI_LAB_DEPLOY_ROOT>/.releases/<app-slug>/<git-sha>/
```

Rollback means repointing `<AI_LAB_DEPLOY_ROOT>/<app-slug>` to a previously verified release. OpenClaw must identify the exact app slug and target SHA, verify both paths, and obtain confirmation before changing the production link.

## Updates and cache recovery

Generated assets use content hashes and long immutable caching. HTML, the manifest, service worker, and `version.json` remain revalidatable. When a new service worker is ready, the app shows **Update now** rather than reloading over unsaved work.

The About & diagnostics panel shows the version, commit, build time, connectivity, display mode, and service-worker state. **Reset cached app files** removes only cache entries prefixed with the app ID; it does not delete IndexedDB or other user data.

## Maintenance

Read `AGENTS.md` and `docs/Portable-Web-App-Standard.md` before making changes. Update `CHANGELOG.md` for user-visible releases and record architectural deviations in `docs/DECISIONS.md`.
