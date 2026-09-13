import { describe, expect, it } from 'vitest'
import { questions } from './data'
import {
  createPracticeSession,
  getPracticeScore,
  parseQuestionCount,
  reducePractice,
} from './practice'

describe('practice counts and selection', () => {
  it.each([1, 20, 47, 128])(
    'accepts and selects %i unique questions',
    (count) => {
      expect(parseQuestionCount(String(count))).toBe(count)
      const originalIds = questions.map(({ id }) => id)
      const session = createPracticeSession(count, () => 0.25)
      expect(session.questions).toHaveLength(count)
      expect(new Set(session.questions.map(({ id }) => id)).size).toBe(count)
      expect(
        session.questions.every((question) => questions.includes(question)),
      ).toBe(true)
      expect(questions.map(({ id }) => id)).toEqual(originalIds)
      if (count === 128) {
        expect(session.questions.map(({ id }) => id).sort()).toEqual(
          [...originalIds].sort(),
        )
        expect(session.questions.map(({ id }) => id)).not.toEqual(originalIds)
      }
    },
  )

  it.each([
    '',
    ' ',
    'abc',
    '0',
    '-1',
    '129',
    '1.5',
    '20.25',
    'Infinity',
    'NaN',
    '1e2',
  ])('rejects invalid input %j', (input) => {
    expect(parseQuestionCount(input)).toBeNull()
  })

  it.each([0, -1, 129, 1.5, NaN, Infinity])(
    'cannot create an invalid session with %s questions',
    (count) => {
      expect(() => createPracticeSession(count)).toThrow(RangeError)
    },
  )
})

describe('practice grading', () => {
  it('requires reveal, ignores old events, and grades each question only once', () => {
    const initial = createPracticeSession(2)
    const firstId = initial.questions[0].id
    const firstGrade = {
      type: 'grade' as const,
      questionId: firstId,
      correct: true,
    }
    expect(reducePractice(initial, firstGrade)).toBe(initial)
    const revealed = reducePractice(initial, {
      type: 'toggle-answer',
      questionId: firstId,
    })
    const graded = reducePractice(revealed, firstGrade)
    expect(graded.grades).toEqual([true])
    expect(graded.revealed).toBe(false)
    expect(graded.questions).toBe(initial.questions)
    expect(reducePractice(graded, firstGrade)).toBe(graded)
    expect(
      reducePractice(graded, { type: 'toggle-answer', questionId: firstId }),
    ).toBe(graded)

    const secondId = graded.questions[1].id
    const secondReveal = reducePractice(graded, {
      type: 'toggle-answer',
      questionId: secondId,
    })
    expect(reducePractice(secondReveal, firstGrade)).toBe(secondReveal)
    const done = reducePractice(secondReveal, {
      type: 'grade',
      questionId: secondId,
      correct: false,
    })
    expect(done.grades).toEqual([true, false])
    expect(reducePractice(done, firstGrade)).toBe(done)
    expect(
      reducePractice(done, { type: 'toggle-answer', questionId: secondId }),
    ).toBe(done)
  })

  it.each([1, 20, 47, 128])(
    'finishes exactly %i grades and preserves the selected order',
    (count) => {
      let session = createPracticeSession(count)
      const selected = session.questions
      for (let index = 0; index < count; index += 1) {
        const questionId = session.questions[index].id
        session = reducePractice(session, { type: 'toggle-answer', questionId })
        session = reducePractice(session, {
          type: 'grade',
          questionId,
          correct: true,
        })
        expect(session.questions).toBe(selected)
        expect(session.grades.length).toBe(index + 1)
        expect(Boolean(session.questions[session.grades.length])).toBe(
          index + 1 < count,
        )
      }
      expect(getPracticeScore(session)).toEqual({
        completed: count,
        total: count,
        correct: count,
        incorrect: 0,
        percentage: 100,
        passed: count === 20 ? true : null,
      })
    },
  )

  it.each([
    { count: 20, correct: 0, percentage: 0 },
    { count: 20, correct: 12, percentage: 60 },
    { count: 20, correct: 11, percentage: 55 },
    { count: 3, correct: 2, percentage: 67 },
  ])(
    'scores $correct correct out of $count without stopping early',
    ({ count, correct, percentage }) => {
      let session = createPracticeSession(count)
      for (let index = 0; index < count; index += 1) {
        const questionId = session.questions[index].id
        session = reducePractice(session, { type: 'toggle-answer', questionId })
        session = reducePractice(session, {
          type: 'grade',
          questionId,
          correct: index < correct,
        })
        expect(session.grades).toHaveLength(index + 1)
      }
      expect(getPracticeScore(session)).toEqual({
        completed: count,
        total: count,
        correct,
        incorrect: count - correct,
        percentage,
        passed: count === 20 ? correct >= 12 : null,
      })
    },
  )

  it.each([0, 11, 12, 19])(
    'does not assign pass/fail after only %i of 20 grades',
    (graded) => {
      const session = {
        ...createPracticeSession(20),
        grades: Array<boolean>(graded).fill(true),
      }
      expect(getPracticeScore(session).passed).toBeNull()
    },
  )

  it.each([1, 19, 21, 128])(
    'does not assign pass/fail for a completed %i-question session',
    (count) => {
      const session = {
        ...createPracticeSession(count),
        grades: Array<boolean>(count).fill(true),
      }
      expect(getPracticeScore(session).passed).toBeNull()
    },
  )
})
