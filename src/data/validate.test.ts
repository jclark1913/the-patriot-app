// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { answerOverrides, questions } from './index'
import { validateQuestionData } from './validate'

function freshData() {
  return {
    bank: structuredClone(questions),
    overrides: structuredClone(answerOverrides),
  }
}

describe('official 2025 civics bank', () => {
  it('has exactly the 128 official questions and valid current/local answer metadata', () => {
    expect(validateQuestionData(questions, answerOverrides)).toEqual([])
    expect(questions.map((question) => question.number)).toEqual(
      Array.from({ length: 128 }, (_, index) => index + 1),
    )
  })

  it('retains multi-response instructions, including complete combined examples', () => {
    expect(
      questions
        .filter((question) => question.requiredAnswers > 1)
        .map((question) => [question.number, question.requiredAnswers]),
    ).toEqual([
      [10, 2],
      [16, 3],
      [19, 2],
      [48, 2],
      [65, 3],
      [67, 2],
      [69, 2],
      [81, 5],
      [126, 3],
    ])
    expect(questions[15].acceptedAnswers).toContain(
      'Legislative, executive, and judicial',
    )
    expect(questions[18].acceptedAnswers).toContain(
      'Senate and House (of Representatives)',
    )
  })

  it('retains text that wraps or uses superscripts in the PDF and special accepted alternatives', () => {
    expect(questions[96].question).toBe(
      'What amendment says all persons born or naturalized in the United States, and subject to the jurisdiction thereof, are U.S. citizens?',
    )
    expect(questions[101].acceptedAnswers).toContain(
      '(With the) 19th Amendment',
    )
    expect(questions[106].acceptedAnswers).toContain(
      '34th president of the United States',
    )
    expect(questions[116].notes).toContain(
      'For a complete list of tribes, please visit bia.gov.',
    )
    expect(questions[119].acceptedAnswers).toContain(
      'Liberty Island [Also acceptable are New Jersey, near New York City, and on the Hudson (River).]',
    )
  })

  it('keeps every local question in the bank with useful lookup guidance and no assumed location', () => {
    const local = questions.filter(
      (question) => question.answerType === 'location-dependent',
    )
    expect(local.map((question) => question.number)).toEqual([23, 29, 61, 62])
    for (const question of local) {
      const override = answerOverrides[question.answerKey!]
      expect(override.status).toBe('unresolved')
      expect(override.answers).toEqual([])
      expect(override.verifiedOn).toBeNull()
      expect(override.location).toBeUndefined()
      expect(override.guidance).toBeTruthy()
    }
    expect(questions[22].notes?.[0]).toContain('has no U.S. senators')
    expect(questions[28].notes?.[0]).toContain('nonvoting Delegates')
    expect(questions[60].notes?.[0]).toContain('does not have a governor')
    expect(questions[61].notes?.[0]).toContain('capital of the territory')
  })
})

describe('data validation failures', () => {
  it('rejects missing, duplicated, and misidentified official questions', () => {
    const { bank, overrides } = freshData()
    bank.pop()
    bank[1] = structuredClone(bank[0])
    bank[2].id = '2025-999'
    const errors = validateQuestionData(bank, overrides).join(' ')
    expect(errors).toContain('exactly 128')
    expect(errors).toContain('duplicate ID')
    expect(errors).toContain('duplicate official number')
    expect(errors).toContain('ID must match')
    expect(errors).toContain('Missing official question 2')
    expect(errors).toContain('Missing official question 128')
  })

  it('rejects empty wording, answers, and missing official response counts', () => {
    const { bank, overrides } = freshData()
    bank[0].question = ' '
    bank[1].acceptedAnswers = []
    bank[2].acceptedAnswers = ['']
    bank[80].requiredAnswers = 1
    const errors = validateQuestionData(bank, overrides).join(' ')
    expect(errors).toContain('question text is empty')
    expect(errors).toContain('static accepted answers are required')
    expect(errors).toContain('an accepted answer is empty')
    expect(errors).toContain('required-answer count')
  })

  it('rejects a missing changing-answer key and unused overrides', () => {
    const { bank, overrides } = freshData()
    delete bank[37].answerKey
    const errors = validateQuestionData(bank, overrides).join(' ')
    expect(errors).toContain('changing-answer override is required')
    expect(errors).toContain('Unused answer override: president')
  })

  it.each(['2026-02-30', '2026-9-12', 'tomorrow', '2999-01-01', null])(
    'rejects an invalid verification date: %s',
    (date) => {
      const { bank, overrides } = freshData()
      overrides.president.verifiedOn = date
      expect(validateQuestionData(bank, overrides).join(' ')).toContain(
        'valid verification date',
      )
    },
  )

  it('rejects unsourced answers and a verified local answer without a location', () => {
    const { bank, overrides } = freshData()
    bank[0].sourceUrl = 'https://example.com/questions'
    overrides.president.sourceUrl = 'javascript:alert(1)'
    overrides['state-senator'] = {
      answers: ['An unscoped name'],
      status: 'verified',
      verifiedOn: '2025-10-20',
      sourceUrl: 'https://www.senate.gov/senators/',
    }
    const errors = validateQuestionData(bank, overrides).join(' ')
    expect(errors).toContain('official HTTPS source')
    expect(errors).toContain('verified local answer needs location metadata')
  })

  it('rejects unresolved overrides that show answers or imply verification', () => {
    const { bank, overrides } = freshData()
    overrides['state-governor'].answers = ['An unverified name']
    overrides['state-governor'].verifiedOn = '2025-10-20'
    delete overrides['state-governor'].guidance
    const errors = validateQuestionData(bank, overrides).join(' ')
    expect(errors).toContain('must not present unverified answers')
    expect(errors).toContain('must not claim verification')
    expect(errors).toContain('lookup guidance')
  })
})
