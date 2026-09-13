import type { AnswerOverride } from './types'

const TEST_UPDATES_URL =
  'https://www.uscis.gov/citizenship/find-study-materials-and-resources/check-for-test-updates'

// Verification is a deliberate content check, never the date of an app build.
const VERIFIED_ON = '2026-09-12'

export const answerOverrides: Record<string, AnswerOverride> = {
  'state-senator': {
    answers: [],
    status: 'unresolved',
    verifiedOn: null,
    sourceUrl: 'https://www.senate.gov/senators/',
    guidance:
      'Open the official Senate directory and find your state. Learn the name of one of its current U.S. senators. This lookup needs an internet connection.',
  },
  'us-representative': {
    answers: [],
    status: 'unresolved',
    verifiedOn: null,
    sourceUrl: 'https://www.house.gov/representatives/find-your-representative',
    guidance:
      'Use the official House lookup to find the representative for your home address. A ZIP code can cover more than one district. This lookup needs an internet connection.',
  },
  'house-speaker': {
    answers: ['Mike Johnson', 'Johnson', 'James Michael Johnson (birth name)'],
    status: 'verified',
    verifiedOn: VERIFIED_ON,
    sourceUrl: TEST_UPDATES_URL,
  },
  president: {
    answers: ['Donald J. Trump', 'Donald Trump', 'Trump'],
    status: 'verified',
    verifiedOn: VERIFIED_ON,
    sourceUrl: TEST_UPDATES_URL,
  },
  'vice-president': {
    answers: ['JD Vance', 'Vance'],
    status: 'verified',
    verifiedOn: VERIFIED_ON,
    sourceUrl: TEST_UPDATES_URL,
  },
  'chief-justice': {
    answers: ['John Roberts', 'John G. Roberts, Jr.', 'Roberts'],
    status: 'verified',
    verifiedOn: VERIFIED_ON,
    sourceUrl: TEST_UPDATES_URL,
  },
  'state-governor': {
    answers: [],
    status: 'unresolved',
    verifiedOn: null,
    sourceUrl: 'https://www.usa.gov/state-governor',
    guidance:
      'Choose your state in the official governor directory, then check its governor’s website for the current name. This lookup needs an internet connection.',
  },
  'state-capital': {
    answers: [],
    status: 'unresolved',
    verifiedOn: null,
    sourceUrl: 'https://www.usa.gov/state-governments',
    guidance:
      'Choose your state or territory in the official directory. Follow its government website and find its capital in the state facts or About section. This lookup needs an internet connection.',
  },
}
