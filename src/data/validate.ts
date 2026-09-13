import type { AnswerOverride, CivicsQuestion } from './types'

// A content invariant from the official questions, including combined responses
// for the three branches (16) and the two parts of Congress (19).
const REQUIRED_ANSWERS: Record<number, number> = {
  10: 2,
  16: 3,
  19: 2,
  48: 2,
  65: 3,
  67: 2,
  69: 2,
  81: 5,
  126: 3,
}

function isOfficialSource(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('.gov')
  } catch {
    return false
  }
}

function isVerificationDate(value: string | null): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value <= new Date().toISOString().slice(0, 10)
  )
}

export function validateQuestionData(
  questions: CivicsQuestion[],
  answerOverrides: Record<string, AnswerOverride>,
): string[] {
  const errors: string[] = []
  if (questions.length !== 128) errors.push('Expected exactly 128 questions.')

  const ids = new Set<string>()
  const numbers = new Set<number>()
  const usedKeys = new Set<string>()

  for (const question of questions) {
    const label = `Question ${question.number}`
    if (ids.has(question.id))
      errors.push(`${label}: duplicate ID ${question.id}.`)
    if (numbers.has(question.number))
      errors.push(`${label}: duplicate official number.`)
    ids.add(question.id)
    numbers.add(question.number)

    if (
      !Number.isInteger(question.number) ||
      question.number < 1 ||
      question.number > 128
    ) {
      errors.push(`${label}: official number must be an integer from 1 to 128.`)
    }
    if (question.id !== `2025-${String(question.number).padStart(3, '0')}`) {
      errors.push(`${label}: ID must match its official number.`)
    }
    if (!question.question.trim())
      errors.push(`${label}: question text is empty.`)
    if (!question.category.trim()) errors.push(`${label}: category is empty.`)
    if (!isOfficialSource(question.sourceUrl))
      errors.push(`${label}: official HTTPS source is required.`)
    if (question.requiredAnswers !== (REQUIRED_ANSWERS[question.number] ?? 1)) {
      errors.push(
        `${label}: required-answer count does not match the official instruction.`,
      )
    }
    if (question.acceptedAnswers.some((answer) => !answer.trim())) {
      errors.push(`${label}: an accepted answer is empty.`)
    }
    if (question.notes?.some((note) => !note.trim()))
      errors.push(`${label}: a note is empty.`)

    if (question.answerType === 'static') {
      if (!question.acceptedAnswers.length)
        errors.push(`${label}: static accepted answers are required.`)
      if (question.answerKey)
        errors.push(`${label}: static questions must not use an override.`)
      continue
    }

    if (!['current', 'location-dependent'].includes(question.answerType)) {
      errors.push(`${label}: unknown answer type.`)
      continue
    }
    const key = question.answerKey
    if (!key || !Object.hasOwn(answerOverrides, key)) {
      errors.push(`${label}: a changing-answer override is required.`)
      continue
    }
    usedKeys.add(key)
    const override = answerOverrides[key]
    if (!isOfficialSource(override.sourceUrl))
      errors.push(`${label}: override needs an official HTTPS source.`)

    if (override.status === 'verified') {
      if (
        !override.answers.length ||
        override.answers.some((answer) => !answer.trim())
      ) {
        errors.push(`${label}: verified override needs nonempty answers.`)
      }
      if (!isVerificationDate(override.verifiedOn))
        errors.push(`${label}: valid verification date is required.`)
      if (
        question.answerType === 'location-dependent' &&
        !override.location?.trim()
      ) {
        errors.push(`${label}: verified local answer needs location metadata.`)
      }
    } else if (override.status === 'unresolved') {
      if (override.answers.length)
        errors.push(
          `${label}: unresolved override must not present unverified answers.`,
        )
      if (override.verifiedOn !== null)
        errors.push(
          `${label}: unresolved override must not claim verification.`,
        )
      if (!override.guidance?.trim())
        errors.push(`${label}: unresolved override needs lookup guidance.`)
    } else {
      errors.push(`${label}: override needs verified or unresolved status.`)
    }
  }

  for (let number = 1; number <= 128; number += 1) {
    if (!numbers.has(number))
      errors.push(`Missing official question ${number}.`)
  }
  for (const key of Object.keys(answerOverrides)) {
    if (!usedKeys.has(key)) errors.push(`Unused answer override: ${key}.`)
  }
  return errors
}
