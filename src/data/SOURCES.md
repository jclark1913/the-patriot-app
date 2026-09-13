# Civics content sources

This is the complete **2025 English bank**, with stable IDs `2025-001` through
`2025-128`. Retrieval and verification dates below are **September 12, 2026,
America/New_York**. They record content checks, not application builds.

## Official question bank

- [USCIS 128 Civics Questions and Answers (2025 version)](https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf),
  publication **M-1778 (09/25)**, 19 pages. Downloaded directly from USCIS.
- The retrieved PDF's metadata records modification on October 14, 2025.
- PDF SHA-256:
  `f280608c0fb6dc1eba344b4746a7ba52d02fe411fba30cedd4371819f0abe11c`.
- All 128 questions and **402 static answer bullets** were extracted with
  `pypdf` and compared against a separate `pdfplumber` extraction. Every
  question, answer, and official question note matched after normalizing
  whitespace, PDF bullets, superscript ordinals, and non-applicable asterisks.
- Page headings/footers and special-consideration asterisks are omitted from
  app data. Wording, capitalization, punctuation, parenthetical alternatives,
  and official territorial/D.C. notes are retained. No older test bank or
  special-consideration filtering is included.
- Lookup-only bullets for questions **23, 29, 30, 38, 39, 57, 61, and 62** are
  retained in `notes`; their actual answer handling lives in `answerOverrides.ts`.
- Required response counts are preserved for **10 (2), 16 (3), 19 (2), 48 (2),
  65 (3), 67 (2), 69 (2), 81 (5), and 126 (3)**. Questions 16 and 19 have complete
  combined responses within each official bullet; their added explanatory
  notes make that distinction explicit. Other questions require one accepted
  response.

## Current national answers

All accepted name variants come from the **2025** section of the
[USCIS test updates page](https://www.uscis.gov/citizenship/find-study-materials-and-resources/check-for-test-updates),
retrieved directly using its official `https://www.uscis.gov/citizenship/testupdates`
redirect. Its page says last reviewed September 18, 2025; the separate dates
in our overrides record the checks performed on September 12, 2026.

Current officeholders were also corroborated on these official sites:

- President and vice president: [White House administration](https://www.whitehouse.gov/administration/).
- Speaker: [Office of the Speaker](https://www.speaker.gov/).
- Chief justice: [Supreme Court current members](https://www.supremecourt.gov/about/biographies.aspx)
  and [Justices](https://www.supremecourt.gov/about/justices.aspx).

These four overrides are bundled as verified and remain readable offline.
They must be rechecked before the learner's interview and whenever content
is updated. There is no runtime answer service or automatic freshness claim.

## Local answers

At the user's request, **no location is collected or preconfigured**. Questions
23, 29, 61, and 62 remain in the full bank with explicit `unresolved` overrides,
empty answers, null verification dates, and practical lookup guidance:

- Senator: [Senate directory](https://www.senate.gov/senators/).
- Representative: [House representative lookup](https://www.house.gov/representatives/find-your-representative).
- Governor: [USAGov governor directory](https://www.usa.gov/state-governor).
- State/territory capital: [USAGov state governments directory](https://www.usa.gov/state-governments),
  then the learner's official state/territory website.

All four lookup pages were checked for relevance on September 12, 2026. That
does **not** verify an individual learner's answer. External lookups need an
internet connection; their instructions and official D.C./territory exceptions
are bundled for offline reading.

## Validation boundary

`validateQuestionData` checks bank coverage, identities, nonempty content,
official HTTPS sources, response counts, changing-answer coverage, verification
dates, location metadata for any verified local override, and explicit unresolved
guidance. `validate.test.ts` checks both the real bank and representative failures.
These checks protect structure and known extraction edge cases; they do not
replace comparison with the latest USCIS materials before release.
