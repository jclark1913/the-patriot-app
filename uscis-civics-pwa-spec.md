# Civics Study PWA — Product & Technical Specification

**Status:** Simplified MVP scope, approved by the project owner  
**Target:** Mobile-first web PWA, optimized for iPhone  
**Audience:** One learner preparing in English for the standard 2025 civics test  
**Scope:** Civics study and configurable practice; no saved learner progress

## 1. Product goal

Build a small app that the learner can open from a URL, add to the iPhone Home Screen, and use offline after its initial download.

The app has two main activities: Study and Practice Test. Keep the interface and implementation simple. The learner can start immediately without an account or onboarding questionnaire.

This revision replaces the earlier requirements for multiple test profiles, saved progress, bookmarks, weak-question tracking, test history, and storage infrastructure.

## 2. MVP scope

Include:

- The 128 official English questions for the standard 2025 civics test.
- Study mode with answer reveal and ordered or shuffled navigation.
- Practice sessions with a user-selected question count from 1–128.
- Correct/incorrect self-grading and a result for the current practice session.
- Offline use, iPhone Home Screen installation, and safe app/content updates.
- Accessible mobile layouts and brief sources/install help.
- Sourced current and location-dependent answers.

Exclude:

- The 2008 bank, 65/20 profiles, test-version selection, and eligibility onboarding.
- Saved progress, bookmarks, weak-question tracking, historical statistics, and session recovery.
- Saved settings, storage repositories, schema migrations, export/import, and cloud backup.
- A separate official-exam simulation mode or configurable passing thresholds.
- User accounts, a backend, cloud sync, analytics, payments, and notifications.
- Multiple choice, AI grading, speech recognition, translations, and English-language assessment.
- Native app development and App Store distribution.

Future features require a concrete need and separate approval. Custom development skills are deferred until repeated work warrants them.

## 3. Home and navigation

Home should show a brief "2025 Civics Test · English" label, prominent Study and Practice Test actions, and a smaller Help & Sources link.

Keep navigation shallow. Practice setup, questions, and results are stages of the same flow. A fresh page load with no live session should return to Home or practice setup, never a broken results screen.

Do not include progress dashboards, an onboarding wizard, or a general Settings screen.

## 4. Study mode

- Start with the full question bank in official question order.
- Offer a simple shuffle control for the current study session.
- Show the official question number, question text, and the current position in the session. Keep question identity distinct from shuffled position.
- Keep accepted answers hidden until the learner taps Show Answer.
- Show the official accepted answer examples and any instructions about how many responses are required.
- Allow the learner to move backward and forward. Hide the answer when moving to a different question.
- The learner considers an answer before revealing the accepted answers. Study navigation does not record grades or track learning history.
- Show source/verification information where an answer changes over time or depends on location.

## 5. Practice Test

### Setup

The learner chooses how many questions to practice before starting.

- Default: 20 questions.
- Quick choices: 20 questions and All 128.
- A labeled numeric input also accepts any whole number from 1–128, inclusive.
- Empty, fractional, non-numeric, zero, negative, and out-of-range entries prevent starting and show a short inline explanation.
- Starting a session locks its selected count and question list. Changing the count requires starting a new session.
- A fresh setup defaults to 20; the preference is not saved.

Suggested helper text: "Choose how many questions to practice. You'll answer every question you select."

### Selection and flow

1. Randomly select the chosen number of unique questions from the full bank.
2. For All 128, shuffle the entire bank and ask each question exactly once.
3. Preserve that order for the life of the session; a rerender must not reshuffle it.
4. Show the current position, such as "Question 7 of 40", separately from the official question number.
5. Let the learner consider an answer before revealing the accepted answers.
6. After reveal, offer Incorrect and Correct.
7. Record one grade for that question in memory and advance to the next question with its answer hidden.
8. Finish after exactly the selected number of graded questions. Prevent repeated taps from grading twice or skipping a question.

There is no timer or automatic answer grading. Exiting an unfinished practice session returns to Home and discards that session; confirm an intentional exit once answers have been graded.

### Completion and score

Every session runs through its chosen question count, including a 20-question session. Do not end early after reaching a score threshold.

Show:

- Number of questions completed.
- Correct and incorrect counts.
- Percentage correct, calculated from correct answers divided by the selected count.
- Start Another Practice and Home actions.

These are practice scores, with no pass/fail label or inferred passing score for custom lengths. Starting another practice returns to setup.

The official standard 2025 test uses a bank of 128 questions, asks up to 20, and requires 12 correct answers. Explain that distinction briefly in Help & Sources, using official USCIS references. The app supports longer or shorter practice and is not a complete naturalization-exam simulator.

## 6. Session state and offline cache

Use ordinary in-memory React state for the current screen, study order/position, practice count, selected questions, answer visibility, and current session results.

Do not persist learner state to localStorage, sessionStorage, IndexedDB, cookies, or a server. Do not build storage adapters, migrations, saved preferences, or recovery logic.

A page reload or fresh app launch starts over. Backgrounding may leave the live session in memory; recovery after the browser terminates it is not required. Briefly explain before practice: "Your score is only kept for this session."

The service worker still caches application assets and bundled question data for offline use. This cache is necessary app content, not saved learner progress.

## 7. Question data and source fidelity

Keep one bundled question bank, with a small TypeScript model containing:

- Stable question ID, such as 2025-001, and official question number.
- Official question wording and accepted answer examples.
- Any official instructions about the required number of responses.
- Answer type: static, current, or location-dependent.
- Source reference and a key for changing answers when needed.

Use stable IDs rather than array positions. Do not add multi-version profile abstractions or special-consideration filters.

Preserve official wording and accepted alternatives. Never invent civics answers or replace an official answer list with a generated summary.

### Current and location-dependent answers

Keep changing national answers in a small bundled answer-override file, separate from base question definitions. Include the answer, official source URL, and verification date. Local questions use lookup guidance and official links instead of a preconfigured answer.

Do not ask for, collect, or preconfigure the learner's location. For local questions, link to the official Senate, House, or state-government directory and explain how to find the answer. No GPS, address lookup service inside the app, national location database, or saved learner profile is required.

Local answers remain explicitly unresolved in the bundled data. If a current national answer cannot be verified, label it similarly and provide official lookup guidance. Never show an unrelated jurisdiction's answer as correct. Keep all of these questions in the 128-question pool.

Bundle verified answers so they remain readable offline. Following an external source link may require connectivity. Display verification dates honestly; an app build date is not an answer-verification date.

Update answers through normal deployments after source verification and data validation. Do not add a runtime content API. Keep the app and content versions visible in Help & Sources.

## 8. PWA, installation, and updates

### Offline support

Use a service worker, preferably through the spec's proposed vite-plugin-pwa integration, to cache everything needed for Study and Practice:

- HTML, JavaScript, and CSS.
- Icons and any other required local assets.
- The complete question bank and bundled answer overrides.
- Help/install content that can be displayed without opening external links.

After the initial online load and successful cache preparation, all selected practice lengths and Study must work offline. Do not require network requests for navigation, questions, fonts, or grading. Only show "Ready offline" once required content has actually been cached.

### iPhone installation

Provide a valid manifest with name, start URL, scope, standalone display, and appropriate icons, including an apple-touch-icon.

Help should explain opening the deployed HTTPS site in Safari, opening Share, choosing Add to Home Screen, enabling Open as Web App, and tapping Add. Verify the instructions against Apple's current guidance before release.

Respect iPhone safe-area insets and keep controls clear of the home indicator. Do not depend on a browser install prompt for iPhone.

### Updates

Detect new app/content versions while online and offer a small Update action. Do not force a reload during Study or Practice.

Apply updates from Home, after the learner has finished or explicitly exited an active session. A reload starts fresh. Keep the existing cached version usable until the new version is ready; a failed update must not disable offline study.

Browser/site-data removal can remove cached content, requiring another online load. Do not promise permanent offline availability after cache removal.

## 9. Mobile design and accessibility

- Design a readable, uncluttered phone layout first.
- Use semantic HTML, real buttons, clear labels, and visible keyboard focus.
- Use comfortable touch targets and sufficient contrast.
- Support enlarged text without horizontal scrolling or clipped controls.
- Convey correct/incorrect and validation states with text, not color alone.
- Keep reveal, grading, and next-step actions easy to find and reach.
- Verify keyboard and screen-reader use of practice setup and changing question content.

Agree on the first screen's visual direction before extending styling across the app.

## 10. Technical approach

Use React, TypeScript, and Vite, with ordinary React state. Retain the proposed Vitest, Testing Library, ESLint, and Prettier tooling as appropriate to the implementation.

Use a small set of components and pure functions for question selection, count validation, and score calculation. Keep question data, session logic, and presentation separate without building generic frameworks.

Routing can remain simple screen state. Add React Router only if real URL navigation becomes useful; if path-based routing is introduced, hosting must support route refreshes.

A compact structure is sufficient: app/components, data, session logic, styles, and colocated tests. Create files as needed; no empty feature folders or storage layer.

No backend, persistent state library, or runtime schema library is required. Add a dependency only when it resolves a concrete need.

## 11. Validation

### Data checks

Fail the production build if bundled data validation fails. Check:

- Exactly 128 questions, with unique IDs and official numbers covering 1–128.
- Nonempty question text and accepted answers for static questions.
- Preserved instructions for questions requiring more than one response.
- Every changing-answer key resolves to verified answer content or an explicit unresolved status.
- Verified answers include valid verification dates, source URLs, and applicable location metadata.

Automated structure checks do not prove factual correctness. Compare content with official sources before release, and make unresolved current/local answers visible.

### Session and UI checks

Test observable behavior appropriate to the feature:

- Valid counts, including 1, 20, an intermediate count, and 128; rejection of invalid counts.
- Exactly the selected number of unique questions, with all 128 appearing once in a full-bank session.
- Stable question selection/order across rerenders.
- Answer reveal before grading and correct advancement with the next answer hidden.
- Each question graded once, including rapid repeated taps.
- Completion only at the selected count, including after 12 correct or 9 incorrect answers.
- Correct counts and percentages for all-correct, all-incorrect, and mixed results.
- Fresh setup defaults and fresh state after reload.
- Study navigation, shuffle behavior, and accessible count validation.
- Safe update behavior around active sessions.

No saved-progress, migration, or historical-statistics tests are needed.

### Manual iPhone acceptance

Verify Safari layout, enlarged text, Home Screen installation, standalone launch, safe areas, and offline operation on a real iPhone.

After preparing the cache online, enable Airplane Mode and relaunch. Study questions, complete a 20-question practice, and exercise an All 128 session. Reload and confirm the app still works offline with a fresh session. Verify a subsequent online update and offline use of the updated content.

Distinguish automated browser checks from real-device results. Do not mark unperformed iPhone checks as passed.

## 12. Implementation milestones

1. **Foundation and Study:** scaffold the small app, add the official 2025 bank and source metadata, validate data, and build Home plus a mobile Study flow.
2. **Configurable Practice:** add count selection, randomized sessions, reveal/self-grading, current-session results, and focused tests.
3. **PWA and finish:** add offline caching, icons, install/source help, safe updates, accessibility polish, and device acceptance checks.

Before each milestone, present a concrete implementation plan and obtain approval under AGENTS.md. Deployment requires explicit authorization. Approval of this specification does not authorize scaffolding or implementation.

## 13. Definition of done

The learner can receive an HTTPS URL, install the app on an iPhone, study the standard 2025 English questions, and practice any selected count from 1–128 without repeated questions. A session completes the chosen count and reports its score.

After the initial cache preparation, Study and Practice work offline. Reloading starts fresh without requiring an Internet connection. Updated app/question content can be received safely when online. No account, saved progress, or developer assistance is required for ordinary use.

## 14. Authoritative references

Verify factual content and platform behavior against official sources during implementation and before release.

- [USCIS study materials](https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test)
- [2025 Civics Test: 128 Questions and Answers](https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf)
- [USCIS test updates and current answers](https://www.uscis.gov/citizenship/find-study-materials-and-resources/check-for-test-updates)
- [Apple: Turn a website into an app in Safari on iPhone](https://support.apple.com/guide/iphone/iphea86e5236/ios)

Help & Sources must identify the app as an independent study aid, not affiliated with or endorsed by USCIS/DHS. Do not use government seals for branding. Remind the learner to verify current and local answers before the interview.
