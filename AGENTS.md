# AGENTS.md

## Project

A small, mobile-first civics study app for one learner preparing in English
for the standard 2025 test, delivered as an offline-capable iPhone web PWA.
The MVP offers Study and configurable Practice with no saved learner progress.

Read `uscis-civics-pwa-spec.md` before planning product or technical work.
Treat it as the product baseline. Surface ambiguities and proposed
departures for discussion; do not silently reinterpret or edit the spec.

## Communication

- Lead with the main point. Use plain language and explain technical terms
  when they matter to a decision.
- Be concise by default; provide depth for meaningful choices, tradeoffs,
  or unfamiliar concepts.
- Make recommendations and explain why. If there are credible alternatives,
  describe the practical differences and identify your preferred option.
- Distinguish confirmed facts, assumptions, proposals, and completed work.
- Explain non-obvious code and design decisions. Prefer clear names and
  focused comments over documenting self-evident behavior.

## Plan and approval

- Read-only inspection, research, and discussion may proceed without approval.
- Before modifying anything, present a concrete plan and wait for the user's
  explicit go-ahead. This includes code, documentation, configuration,
  generated files, dependency installation, and repository changes.
- Keep the plan proportional to the task: intended outcome, proposed changes,
  important decisions, and how the result will be checked. A small edit may
  need only a sentence; larger work should use small, reviewable milestones.
- Ask focused questions when something is unclear. Explain why the answer
  matters and recommend a default when useful. Continue independent
  read-only work while awaiting answers.
- Discussion, a request for recommendations, and silence are not approval.
- Once a plan is approved, complete its implementation and validation without
  repeatedly requesting permission for steps already covered.
- If the work requires a material scope change, explain the revised plan and
  obtain approval before making changes outside the approved scope.
- Commit, push, deploy, or perform destructive cleanup only when explicitly
  authorized. Implementation approval alone does not include these actions.

## Product and engineering principles

- Keep the app small. Follow the spec's proposed stack unless an alternative
  is discussed and approved. Add dependencies and abstractions only for a
  concrete need.
- Design for a narrow phone screen first: readable text, clear actions,
  comfortable touch targets, accessible controls, and safe-area spacing.
- Let the learner consider their answer before revealing accepted answers.
  Practice uses correct/incorrect self-grading; Study provides simple navigation.
- Practice accepts 1–128 questions, defaults to 20, and offers All 128.
  Ask every selected question once, then show the session score.
- Only for 20-question practice, show the passing score of 12 correct during
  setup and a practice passed/not passed label after all 20 are graded.
  Omit the passing-score note and result label for other lengths. Do not add
  early stopping, configurable thresholds, or a separate exam-simulation mode.
- Treat offline Study and Practice as core requirements. Cache the app and
  bundled questions; core use must not depend on remote services or assets.
- Keep learner state in memory only. Do not add saved progress, bookmarks,
  history, saved settings, storage adapters, migrations, or session recovery.
- Keep question data, session logic, and presentation separate. Use small,
  independently testable functions without generic profile frameworks.
- Use official sources for civics content and test rules. Verify changing
  facts when working on them; retain source and verification metadata.
- Provide official lookup links for local answers. Do not collect or
  preconfigure the learner's location.
- Keep stable question IDs for reliable content references. Bundle one 2025
  English bank; do not add older banks or special-consideration profiles.
- Apply app/content updates safely outside active sessions. A fresh load
  starts over; an asset cache is not persisted learner state.
- Keep MVP scope aligned with the spec. Propose additional features separately.
- Defer custom skills until repeated work demonstrates a concrete need.

## Validation and completion

- Run checks appropriate to the approved change and follow the spec's
  applicable testing requirements.
- Prioritize question-data validity, count validation, unique question
  selection, grading, session completion, and offline operation. Verify
  mobile layouts when changing the interface.
- Distinguish automated/browser checks from actual iPhone testing.
  Never claim device validation that has not been performed.
- Finish with what changed, why, what was checked, and any remaining gaps.
  Give the user a simple way to review or try the result.
