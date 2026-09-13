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

Home, Study, and Help & Sources are implemented. Study includes all 128 questions,
answer reveal, previous/next navigation, shuffle, official source links, and dated
current answers. Local questions link to official directories; the app never asks
for a location. Learner state exists only in memory.

Configurable Practice and installable/offline PWA behavior are the next approved
milestones to plan. This first preview does not yet install a service worker or
claim to work offline. It has not yet been tested on a physical iPhone.

## Checks

```sh
npm test
npm run lint
npm run format:check
npm run build
```

Build runs data validation and TypeScript checks before bundling. To inspect the
production bundle locally, run `npm run preview` after building.

Question source/provenance and answer-maintenance notes are in
[src/data/SOURCES.md](src/data/SOURCES.md). Product scope and the approval workflow
are in the root specification and AGENTS.md.
