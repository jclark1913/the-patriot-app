import { questions } from './data'
import type { CivicsQuestion } from './data'
import { shuffledCopy } from './study'

export const CIVICS_TEST_COUNT = 20
export const CIVICS_PASSING_SCORE = 12

export type PracticeSession = {
  questions: readonly CivicsQuestion[]
  grades: readonly boolean[]
  revealed: boolean
}

export type PracticeAction =
  | { type: 'toggle-answer'; questionId: string }
  | { type: 'grade'; questionId: string; correct: boolean }

export function parseQuestionCount(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const count = Number(trimmed)
  return Number.isInteger(count) && count >= 1 && count <= questions.length
    ? count
    : null
}

export function createPracticeSession(
  count: number,
  random = Math.random,
): PracticeSession {
  if (!Number.isInteger(count) || count < 1 || count > questions.length)
    throw new RangeError(
      `Question count must be between 1 and ${questions.length}.`,
    )

  return {
    questions: shuffledCopy(questions, random).slice(0, count),
    grades: [],
    revealed: false,
  }
}

export function reducePractice(
  session: PracticeSession,
  action: PracticeAction,
): PracticeSession {
  const current = session.questions[session.grades.length]
  // An event from the previous question must never grade or reveal the next one.
  if (!current || current.id !== action.questionId) return session

  if (action.type === 'toggle-answer')
    return { ...session, revealed: !session.revealed }

  if (!session.revealed) return session
  return {
    ...session,
    grades: [...session.grades, action.correct],
    revealed: false,
  }
}

export function getPracticeScore(session: PracticeSession) {
  const correct = session.grades.filter(Boolean).length
  return {
    completed: session.grades.length,
    total: session.questions.length,
    correct,
    incorrect: session.grades.length - correct,
    percentage: Math.round((correct / session.questions.length) * 100),
    passed:
      session.questions.length === CIVICS_TEST_COUNT &&
      session.grades.length === CIVICS_TEST_COUNT
        ? correct >= CIVICS_PASSING_SCORE
        : null,
  }
}
