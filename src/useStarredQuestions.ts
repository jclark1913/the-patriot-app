import { useRef, useState } from 'react'
import { questions } from './data'

// Include the app and bank, but not the build version: updates retain stars.
export const STARRED_QUESTIONS_KEY = 'the-patriot-app:2025:starred-questions'
const knownIds = new Set(questions.map((question) => question.id))
const unavailableNotice =
  'Stars can only be kept for this session because saving on this device is unavailable.'

type StarredState = { ids: string[]; notice: string | null }

function readStars(): StarredState {
  let saved: string | null
  try {
    saved = window.localStorage.getItem(STARRED_QUESTIONS_KEY)
  } catch {
    return { ids: [], notice: unavailableNotice }
  }

  try {
    const value: unknown = saved === null ? [] : JSON.parse(saved)
    if (!Array.isArray(value))
      throw new Error('Expected a list of question IDs')
    const ids = value.filter(
      (id): id is string => typeof id === 'string' && knownIds.has(id),
    )
    return { ids: [...new Set(ids)], notice: null }
  } catch {
    return {
      ids: [],
      notice:
        'Saved stars couldn’t be read. Star questions to start a new list.',
    }
  }
}

export function useStarredQuestions() {
  const [state, setState] = useState(readStars)
  const currentIds = useRef(state.ids)

  function toggleStar(questionId: string) {
    if (!knownIds.has(questionId)) return
    const ids = currentIds.current.includes(questionId)
      ? currentIds.current.filter((id) => id !== questionId)
      : [...currentIds.current, questionId]

    // Save from the event, not an effect or state updater. Mounting and React's
    // repeated updater checks must never overwrite a saved list.
    currentIds.current = ids
    let notice: string | null = null
    try {
      window.localStorage.setItem(STARRED_QUESTIONS_KEY, JSON.stringify(ids))
    } catch {
      notice = unavailableNotice
    }
    setState({ ids, notice })
  }

  return { ...state, toggleStar }
}
