# Portable Web App Standard

Version 0.2 — baseline instructions for OpenClaw

## Purpose

Use this standard whenever creating or modifying one of Erich's portable web apps. The goal is to make every app:

In this system, **PWA means Portable Web App**. The apps use Progressive Web App browser capabilities—such as manifests, service workers, offline behavior, and Home Screen installation—but “PWA” in project names and instructions expands to “Portable Web App.”

- installable on iOS and Android;
- reliable after deployments, including for already-installed users;
- maintainable through Git and reproducible builds;
- responsive, accessible, local-first where practical, and pleasant on mobile;
- visually distinct while recognizably part of the same family;
- documented well enough that another technically inclined person can run, deploy, and maintain it.

These are defaults, not a reason to over-engineer a tiny tool. Deviations are allowed when the app genuinely requires them, but they must be recorded in `docs/DECISIONS.md`.

**Mandatory OpenClaw rule:** Whenever the user asks to create, change, diagnose, review, deploy, or otherwise work on a PWA, read and apply this standard before planning or editing. If the canonical standard cannot be accessed, use the repository snapshot and explicitly report that the canonical version could not be checked.

The expected canonical path on the OpenClaw machine is `/home/mimir/shared/standards/Portable-Web-App-Standard.md`. If the user chooses a different canonical path, update OpenClaw's persistent instructions and every starter repository's `AGENTS.md` together.

## 1. Agent operating rules

When beginning work:

1. Read this canonical standard first, then `README.md`, `AGENTS.md`, `docs/APP_SPEC.md`, and `docs/DECISIONS.md` if present.
2. Inspect the repository state and preserve unrelated user changes.
3. Confirm the app's purpose, primary user journey, data sensitivity, hosting target, and offline requirements.
4. Write or update a short acceptance checklist before implementation.
5. Prefer the existing architecture. Do not replace frameworks or major dependencies merely because another option is fashionable.

While working:

- Keep the app runnable after each coherent commit.
- Use native HTML semantics first and shared primitives for complex interactive behavior.
- Never put secrets, private API keys, or privileged credentials in frontend code.
- Do not edit production files manually. Production must be derived from a Git commit through an automated deployment.
- Do not report completion until the production build, automated checks, and deployment smoke test pass.
- If a required behavior cannot be verified, say exactly what remains unverified.

When finishing:

- Update documentation and the changelog.
- Commit all source, configuration, PWA metadata, icons, and deployment files needed to reproduce the app.
- Report the commit SHA, deployed version, production URL, tests run, and any known limitations.

## 2. Default technical profile

Use this profile for interactive personal utilities unless the repository already has a suitable stack:

| Area                   | Default                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Application            | React + TypeScript                                                                          |
| Build tool             | Vite                                                                                        |
| Package manager        | npm with committed `package-lock.json`                                                      |
| UI behavior primitives | Base UI for dialogs, popovers, menus, selects, tooltips, tabs, and similar complex controls |
| Styling                | Plain CSS or CSS Modules using shared CSS custom-property tokens                            |
| Icons inside the UI    | One consistent open-source icon set, preferably Lucide                                      |
| PWA generation         | `vite-plugin-pwa` / Workbox                                                                 |
| Unit tests             | Vitest                                                                                      |
| Browser smoke tests    | Playwright                                                                                  |
| Code quality           | ESLint, TypeScript strict mode, and Prettier                                                |
| Hosting                | `https://ai-lab.erichweihs.com/<app-slug>/`                                                 |
| Source and releases    | GitHub; `main` is the production branch                                                     |

Use vanilla TypeScript with Vite instead of React only when the app has very little state and no meaningful need for reusable interactive components. Keep the same tokens, assets, documentation, quality gates, and PWA behavior.

Prefer static-first architecture. Add a backend only for needs that cannot safely or reliably be met in the browser, such as shared server state, secrets, privileged third-party APIs, or authenticated multi-user access.

For an app that must reach a private home service, deploy the frontend normally when safe, but keep the service behind WireGuard or another explicit access-control layer. Document the network dependency and never embed private credentials in the app.

## 3. Repository and Git standard

Use one GitHub repository per independently deployed app. A suggested structure is:

```text
/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── APP_SPEC.md
│   ├── DESIGN.md
│   ├── DECISIONS.md
│   └── RELEASE.md
├── public/
│   ├── icons/
│   ├── apple-touch-icon.png
│   ├── favicon.svg
│   ├── .htaccess
│   └── _headers
├── src/
│   ├── components/
│   ├── design-system/
│   │   ├── tokens.css
│   │   └── primitives/
│   ├── pwa/
│   ├── app-config.ts
│   └── main.tsx
├── scripts/
│   └── deploy.sh
├── tests/
├── .env.example
├── .gitignore
├── .nvmrc
├── AGENTS.md
├── CHANGELOG.md
├── README.md
├── package-lock.json
├── package.json
└── vite.config.ts
```

In the maintained starter, `vite.config.ts` is the committed source for the generated `manifest.webmanifest`; the generated file is verified in the production build rather than edited independently.

Rules:

- `main` must always be deployable.
- Normal work happens on a short-lived branch and enters `main` through a pull request.
- Require CI to pass before merging.
- Use small, descriptive commits. Each commit should contain one coherent change.
- Tag intentional releases using semantic versions: `vMAJOR.MINOR.PATCH`.
- Every production build must embed the Git SHA and human-readable version.
- Commit the lockfile. CI installs with `npm ci`, never an unconstrained `npm install`.
- Pin the Node major version in `.nvmrc` and CI.
- Keep `.env.example` current, containing names and explanations but no secrets.
- Enable automated dependency update pull requests. Review and test them; do not auto-merge major upgrades.

`CHANGELOG.md` should explain user-visible changes, not merely restate commit messages.

## 4. Required app documentation

Every repository must include a `README.md` containing:

1. What the app does and whom it is for.
2. Production URL and current support status.
3. Screenshots or a short visual overview when useful.
4. Installation instructions for iOS, Android, and desktop.
5. Local development prerequisites and exact commands.
6. Production build and local preview commands.
7. Deployment method and rollback instructions.
8. Data storage, export, import, deletion, privacy, and offline behavior.
9. Known limitations and supported browsers.
10. Troubleshooting, including how to identify the installed version and force an update.

`docs/APP_SPEC.md` must define the problem, non-goals, primary journeys, acceptance criteria, data model, offline behavior, and error states.

`docs/DESIGN.md` must name the app theme tokens, icon concept, navigation model, and intentional deviations from the shared design system.

`docs/DECISIONS.md` is a lightweight architectural decision log. Record important choices with date, context, decision, and consequences.

## 5. PWA and installation baseline

Every app must work as a normal responsive website and as an installed Progressive Web App over HTTPS.

### Required manifest fields

Provide one linked `manifest.webmanifest` with at least:

- stable app `id`;
- `name` and a `short_name` that is unlikely to truncate;
- `description`;
- `start_url`;
- explicit `scope`;
- `display: "standalone"`;
- opaque `theme_color` and `background_color` values;
- icon entries with correct MIME types and sizes.

Do not change the manifest `id` or scope after release without treating it as an installation migration.

### Required icon artifacts

Commit generated artifacts, not only the source artwork:

| Artifact               | Minimum requirement                                             |
| ---------------------- | --------------------------------------------------------------- |
| Standard PWA icon      | PNG, 192 × 192                                                  |
| Standard PWA icon      | PNG, 512 × 512                                                  |
| High-resolution source | PNG or SVG, preferably 1024 × 1024 or vector                    |
| Maskable Android icon  | PNG, 512 × 512, important content inside the maskable safe zone |
| Apple touch icon       | Opaque PNG, 180 × 180, linked from HTML                         |
| Browser favicon        | SVG plus a compatible fallback if needed                        |

Icons must have an intentional opaque background. Test the maskable icon in circular and rounded-square crops. Do not use a screenshot as an icon.

### Mobile browser requirements

- Set a correct responsive viewport.
- Support notches and home indicators using `env(safe-area-inset-*)` where the layout reaches screen edges.
- Use `theme-color`, including light/dark variants if the app supports both.
- Avoid hover-only interaction.
- Ensure controls remain usable with zoom and larger text.
- Test standalone mode; do not assume it behaves identically to a browser tab.

### Installation help

Include an in-app Help or About screen with current instructions:

**iPhone/iPad:** Open the production URL in Safari, open Share, choose **Add to Home Screen**, confirm the name, then tap **Add**. iOS does not provide the same programmatic install prompt as Chromium, so do not show a fake install button. Show concise manual instructions instead.

**Android:** Open the production URL in Chrome, then use the browser's **Install app** or **Add to Home screen** action. When `beforeinstallprompt` is available, an in-app install action may invoke the browser's real prompt. If it is unavailable, show browser-menu instructions.

**Desktop:** In Chrome or Edge, use the install icon in the address bar or the browser's install menu item.

Only display platform-specific instructions when the app can reasonably identify the platform. Always leave a generic instructions link available.

## 6. Offline and local data behavior

Decide and document one explicit offline level:

| Level             | Behavior                                                             |
| ----------------- | -------------------------------------------------------------------- |
| 0 — Online only   | A clear offline state; no misleading cached shell                    |
| 1 — Shell offline | UI opens offline and explains which actions require a connection     |
| 2 — Local-first   | Core journeys work offline and synchronize when connectivity returns |

The default for self-contained utilities is Level 2. The default for apps depending on a private API is Level 1.

Rules:

- Use Cache Storage for deployable resources, not for irreplaceable user data.
- Store structured user data in IndexedDB when it exceeds simple preferences.
- Version the local-data schema and provide forward migrations.
- Never silently discard user data during an application or service-worker update.
- Provide export and import for meaningful user-created data. Use a documented, versioned JSON format unless another open format is more appropriate.
- Provide an intentional delete/reset action with confirmation.
- Namespace all Cache Storage keys and browser-storage keys with the app ID.
- Never delete caches or storage belonging to another app on the same origin.

## 7. Deployment and update reliability

The canonical flow is:

```text
feature branch → pull request → CI → merge to main → production build → deploy exact artifact → smoke test
```

### Deployment rules

- A push to `main` starts the production workflow.
- Build once and deploy that exact `dist/` artifact. Do not rebuild differently during a later deployment step.
- Use GitHub environments and least-privilege workflow permissions.
- Keep preview deployments for pull requests when the host supports them.
- Keep the previous successful deployment available for rollback.
- A failed build or smoke test must not replace the known-good production release.
- Record the source SHA, release version, build timestamp, and production URL in the workflow summary.
- Production is immutable: fixes are new commits and new deployments.

The canonical production location is:

```text
https://ai-lab.erichweihs.com/<app-slug>/
```

The slug must be lowercase ASCII with numbers and single hyphens, must be stable after release, and must match the Vite base path, manifest `id`, `start_url`, `scope`, and server deployment directory. An app named “Pocket Timer”, for example, should normally use `pocket-timer` and be deployed at `https://ai-lab.erichweihs.com/pocket-timer/`.

Deployment is performed by OpenClaw through the repository's deployment script after the relevant GitHub CI run passes. Upload credentials must be stored only in OpenClaw's secrets store. They must never be committed to Git, written into app configuration, placed in GitHub repository secrets, echoed to logs, or included in reports.

The deployment adapter expects these logical secrets, injected into the deployment process as environment variables or secure file references:

| Secret                       | Purpose                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `AI_LAB_DEPLOY_HOST`         | SSH/SFTP host name                                                                                    |
| `AI_LAB_DEPLOY_USER`         | Restricted deployment account                                                                         |
| `AI_LAB_DEPLOY_PORT`         | SSH port; optional, default `22`                                                                      |
| `AI_LAB_DEPLOY_ROOT`         | Absolute server directory corresponding to the root of `ai-lab.erichweihs.com`                        |
| `AI_LAB_DEPLOY_SSH_KEY_FILE` | Path to a temporary private-key file materialized securely by OpenClaw, when an SSH agent is not used |

OpenClaw must retrieve secrets only at deployment time, inject them into the child process without printing their values, and remove any temporary key material immediately afterward. Prefer a restricted deployment user and key that can write only below the AI Lab web root. The deploy script must derive the final target by appending the validated app slug; it must never accept `/`, the web root itself, `..`, a glob, or an arbitrary deletion target.

If the host supports SSH and symbolic links, deploy into a versioned release directory and atomically repoint the app path. Retain at least the immediately preceding release for rollback. If only SFTP is available, use a staged upload and document the host-specific promotion and rollback mechanism before the first deployment.

### HTTP caching policy

Use content-hashed filenames for generated JavaScript, CSS, fonts, and other build assets.

| Resource                                        | Required policy                                      |
| ----------------------------------------------- | ---------------------------------------------------- |
| Hashed assets such as `/assets/app.abcd1234.js` | `Cache-Control: public, max-age=31536000, immutable` |
| `index.html` and SPA navigation fallback        | `Cache-Control: no-cache`                            |
| Service-worker script                           | `Cache-Control: no-cache`                            |
| `manifest.webmanifest`                          | `Cache-Control: no-cache`                            |
| `version.json`                                  | `Cache-Control: no-store`                            |

Never apply a long immutable cache lifetime to unhashed HTML, the manifest, `version.json`, or the service-worker script.

### Service-worker update policy

- Keep the service-worker URL stable. Update its contents, not its filename.
- Use Workbox-generated, revisioned precaching and keep outdated-cache cleanup enabled.
- Default to an **update available** prompt. When a new worker is ready, show a small persistent notice with **Update now**; activate and reload only after the user chooses it.
- Preserve unsaved work. Before reloading, save drafts or warn the user.
- Automatic activation/reload is allowed only for apps with no editable state or after verified autosave.
- Check for a service-worker update at startup, when the app returns to the foreground, and periodically during unusually long sessions.
- After the controlling worker changes, reload once in a guarded way. Prevent reload loops.
- Give every cache an app-specific prefix. Delete only obsolete caches with that prefix.

This policy matters because a newly installed service worker normally waits while an older version still controls open clients. A normal refresh alone may not activate it.

### Visible version and diagnostics

Expose a small About/Diagnostics view containing:

- semantic app version;
- abbreviated Git SHA;
- build timestamp;
- current online/offline state;
- whether the app is running standalone;
- service-worker state;
- a **Check for updates** action;
- an advanced **Reset cached application files** action that does not delete user data.

Generate `version.json` during the build from the same version and SHA. The deployment smoke test must compare it with the expected commit.

## 8. Shared design system: warm modernist

The design family should feel calm, warm, precise, and lightly expressive—more like a well-made personal tool than a generic corporate dashboard.

### What remains constant across apps

- body and UI typography;
- spacing scale and layout rhythm;
- corner-radius family;
- control sizes and interaction patterns;
- focus treatment;
- icon style;
- motion timing and reduced-motion behavior;
- navigation, settings, installation help, empty states, and update notices;
- accessibility and responsive rules;
- a discreet attribution in About, such as “An Erich app.”

### What may vary per app

- primary and accent palette;
- app icon and name;
- one optional display typeface for sparse headings only;
- one graphic motif, such as lines, dots, paper texture, geometric fields, or restrained illustration;
- information density within defined comfortable/compact modes.

Do not vary core component behavior, spacing logic, focus states, or basic typography per app.

### Token architecture

Define tokens in two layers:

1. **House tokens** describe stable system qualities: spacing, type scale, radii, shadows, control heights, motion, breakpoints, and semantic states.
2. **Theme tokens** describe the individual app: canvas, surface, text, muted text, border, primary, accent, and their contrast colors.

Components must consume semantic tokens, never raw app-specific hex values.

Minimum semantic color tokens:

```css
:root {
  --color-canvas: ...;
  --color-surface: ...;
  --color-surface-raised: ...;
  --color-text: ...;
  --color-text-muted: ...;
  --color-border: ...;
  --color-primary: ...;
  --color-on-primary: ...;
  --color-accent: ...;
  --color-focus: ...;
  --color-success: ...;
  --color-warning: ...;
  --color-danger: ...;
}
```

Start with warm off-white canvas and charcoal text rather than pure white and black. Give each app one dominant muted color and one sparingly used brighter accent. Validate contrast in both light and dark themes.

### Typography and layout

- Default to a high-quality system sans-serif stack for speed and platform fit.
- Use tabular numerals for changing measurements and timers.
- Keep body copy comfortably readable; do not use text below 16 CSS px for primary mobile content.
- Use a 4 px base spacing grid with a restrained named scale.
- Prefer one clear content column on phones. Introduce additional columns only when the information benefits from them.
- Keep primary actions reachable with one hand without placing destructive actions beside them.
- Use generous whitespace, but do not waste mobile space with oversized decorative headers.

### Components and primitives

Maintain shared implementations for:

- Button and IconButton;
- TextField and TextArea;
- Checkbox, Radio, Switch, Select, and Slider;
- Dialog/AlertDialog and bottom Sheet;
- Menu, Popover, Tooltip, and Toast;
- Tabs and compact navigation;
- Card, ListRow, EmptyState, StatusBadge, and InlineNotice;
- InstallHelp, UpdateNotice, OfflineNotice, and AboutDiagnostics.

Use native HTML for simple controls. Use Base UI primitives for interaction patterns where keyboard behavior, focus management, dismissal, positioning, or ARIA semantics are easy to get wrong. Wrap primitives behind local components so the application is not coupled throughout to a library's API.

Do not copy arbitrary shadcn components into each app. If a shadcn implementation is used as a reference, restyle and consolidate it into the shared local component layer.

### Accessibility and motion

- Target WCAG 2.2 AA.
- All functions must work by keyboard and with visible focus.
- Controls need accessible names and errors must be programmatically associated with fields.
- Do not encode meaning by color alone.
- Aim for at least 44 × 44 CSS px touch targets for primary mobile controls.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Avoid motion longer than necessary; use motion to explain state change, not decorate routine interaction.
- Preserve zoom, reflow, screen-reader landmarks, correct heading order, and sufficient contrast.

Begin by copying this design layer from the maintained starter template. After at least three apps reveal genuinely stable shared code, consider extracting it into a versioned package. A shared package too early creates maintenance work without proving the abstraction.

## 9. Quality gates

The following commands must exist and pass in CI:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

The pull-request pipeline must verify:

- clean dependency installation from the lockfile;
- formatting, linting, and strict type checking;
- unit tests;
- production build;
- key Playwright journeys at mobile and desktop viewport sizes;
- no broken manifest or missing referenced PWA assets;
- no obvious accessibility violations in core views;
- no credentials or secret files committed.

Before the first release, and after changes to PWA configuration, storage, authentication, navigation, or responsive layout, manually test:

- Safari on a current iPhone, both browser tab and installed Home Screen app;
- Chrome on a current Android device, both browser tab and installed PWA;
- a desktop Chromium browser;
- a fresh installation;
- update from the previous production version without clearing browser data;
- offline launch and reconnection behavior;
- export/import and schema migration when the app stores meaningful data.

Performance budgets should be app-specific. As a default, keep the initial experience small and responsive, avoid unnecessary third-party scripts, lazy-load secondary views, and optimize images. Do not chase a score while making interaction worse.

## 10. Security and privacy baseline

- Collect no analytics by default. If analytics are added, document purpose, provider, retention, and consent requirements.
- Do not load third-party scripts without a concrete need.
- Use restrictive security headers appropriate to the app: Content Security Policy, `X-Content-Type-Options`, Referrer Policy, Permissions Policy, and frame restrictions.
- Request browser permissions only in response to an understandable user action.
- Explain where data lives and whether it leaves the device.
- Treat unlisted URLs as discoverable, not as access control.
- For sensitive apps, use real authentication or keep access behind the private network.
- Sanitize untrusted content and avoid dangerous HTML injection.
- Keep dependencies current, but test updates before release.

## 11. Definition of done

An app or release is not done until:

- [ ] The intended user journey and acceptance criteria work.
- [ ] The production build is reproducible from a clean checkout.
- [ ] CI passes on the commit being deployed.
- [ ] The deployment is tied to that exact Git SHA.
- [ ] The production URL returns the expected `version.json`.
- [ ] Existing installations receive or can explicitly activate the update.
- [ ] User data survives the update.
- [ ] Manifest, standard icons, maskable icon, and Apple touch icon are present and referenced.
- [ ] iOS, Android, and desktop installation instructions are in the README and in the app.
- [ ] Core mobile, desktop, keyboard, offline, and error states are tested.
- [ ] The app uses house design tokens and shared primitives.
- [ ] Accessibility checks pass and manual keyboard/focus behavior is sensible.
- [ ] Security headers and data/privacy documentation are present.
- [ ] Changelog, version, screenshots where useful, and rollback instructions are current.

## 12. Recommended implementation sequence

For a new app:

1. Write `APP_SPEC.md` and decide the offline level.
2. Create the GitHub repository from the maintained starter template.
3. Set the app ID, theme tokens, icon source, manifest, and central app configuration.
4. Implement the smallest complete primary journey using shared components.
5. Add local-data schema, migrations, and export/import if needed.
6. Add PWA caching and the update flow only after normal browser behavior works.
7. Add automated tests and CI.
8. Create a preview deployment and test it on real devices.
9. Merge to `main`, deploy the exact build artifact, and run the production smoke test.
10. Install the app on iOS and Android, then verify an update from that release to the next test release.

For an existing app, first document its current behavior and data model. Introduce this standard incrementally; never jeopardize stored user data merely to make the repository look uniform.

## 13. Sources informing this standard

- [Service worker lifecycle](https://web.dev/articles/service-worker-lifecycle)
- [PWA installation behavior on iOS, Android, and desktop](https://web.dev/learn/pwa/installation)
- [Web app manifest guidance](https://web.dev/learn/pwa/web-app-manifest)
- [Vite PWA update behavior](https://vite-pwa-org.netlify.app/guide/auto-update.html)
- [Vite static deployment guidance](https://vite.dev/guide/static-deploy)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Base UI overview](https://base-ui.com/react/overview/about)
