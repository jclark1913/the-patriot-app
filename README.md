# The Patriot App

A small mobile-first civics study app using the official 2025 English question bank.

## Run locally

Use Node.js 22.12 or newer (developed with Node 24).

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite. No environment variables or API keys are needed.

## Current milestone

Home, Study, Practice Test, and Help & Sources are implemented. Study includes all 128 questions,
answer reveal, previous/next navigation, shuffle, official source links, and dated
current answers. Local questions link to official directories; the app never asks
for a location. Learner state exists only in memory.

Practice accepts 1–128 questions, defaults to 20, and offers All 128. Each session
asks its full selection in random order, reveals answers before self-grading, and
shows correct/incorrect counts and accuracy. Leaving a partially graded session
requires confirmation. Scores are kept only for the current session.

For 20-question practice only, setup shows the passing score of 12 correct and
completed results include Practice passed or Practice not passed. All selected
questions are still asked. Other lengths show counts and accuracy only.

The production build is an installable PWA. It downloads the app, all 128
questions, answer overrides, icons, and Help for offline use. Home shows
“Ready offline” only after checking that the complete cache exists. No learner
state is saved.

Updates download in the background and wait for the learner to tap Update on
Home. Study and Practice never reload automatically, including when another tab
applies an update. The previous cache remains available if a download fails.

Help includes iPhone installation steps, offline limitations, and app/content
versions. Physical iPhone acceptance and HTTPS deployment are still pending.

## Try the PWA locally

```sh
npm run build
npm run preview
```

Open [the production preview](http://127.0.0.1:4173/the-patriot-app/) and wait
for “Ready offline.” Stop that preview
server, reload, and try Study or Practice: the cached app should still work.
Reloading starts a fresh session. External source/lookup links require Internet.
Clearing browser site data removes the download and requires another online load.

`npm run dev` deliberately does not register a service worker, so development
changes stay visible. Use the production preview for offline and update checks.

## GitHub Pages deployment

The app is configured for
[jclark1913.github.io/the-patriot-app/](https://jclark1913.github.io/the-patriot-app/).

1. In the repository's **Settings → Pages**, set **Build and deployment → Source**
   to **GitHub Actions**.
2. Commit and push the app and `.github/workflows/deploy.yml` to `main` when
   ready to publish. Each subsequent push to `main` also deploys the app.
3. Wait for **Deploy to GitHub Pages** in the Actions tab to succeed, then open
   the site URL above. The workflow can also be run manually from Actions.

The workflow uses Node 24, installs locked dependencies with `npm ci`, runs
the build (including question-data and TypeScript checks), and deploys `dist/`.
Do not publish the source folder directly: its `index.html` needs Vite's build
step before a browser can run the app. There is no need to commit `dist/` or
maintain a separate deployment branch.

Production builds and previews use `/the-patriot-app/` for assets, installation,
and the service worker. `npm run dev` still uses `/`. If the repository name or
hosting path changes, update `base` in `vite.config.ts` and rebuild. This app does
not use URL routes. See [Vite's Pages guide](https://vite.dev/guide/static-deploy.html#github-pages).

Preparing these files does not publish the app; commit, push, and deployment
still require the project owner's approval.

## iPhone acceptance

On a real iPhone, open the HTTPS site in Safari, use Share → Add to Home Screen,
enable Open as Web App if shown, and tap Add. Open the installed icon online and
wait for “Ready offline.” The instructions follow
[Apple's installation guidance](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios).

Before release, check these on the device:

- Safari and standalone layout, enlarged text, touch controls, and safe areas.
- Airplane Mode launch/reload; Study, a complete 20-question practice, and All 128.
- An online update while a session is open: finish/exit, update from Home, then
  use the new version offline.

Desktop browser checks are not a substitute for these physical-device checks.

## Checks

```sh
npm test
npm run lint
npm run format:check
npm run build
```

Build runs data validation and TypeScript checks before bundling. To inspect the
production bundle locally, run `npm run preview` after building.

PWA tests cover cache readiness, failed downloads, deferred activation, multiple
tabs, and protecting Study/Practice sessions. The service worker uses
`vite-plugin-pwa` with Workbox precaching. Its small message handler verifies the
cache and activates an update only on request; the requesting tab alone reloads.

Question source/provenance and answer-maintenance notes are in
[src/data/SOURCES.md](src/data/SOURCES.md). Product scope and the approval workflow
are in the root specification and AGENTS.md.
