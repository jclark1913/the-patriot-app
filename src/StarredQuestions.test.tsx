import { StrictMode } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { questions } from './data'
import { STARRED_QUESTIONS_KEY } from './useStarredQuestions'

beforeEach(() => window.localStorage.removeItem(STARRED_QUESTIONS_KEY))
afterEach(() => vi.restoreAllMocks())

function click(name: string | RegExp) {
  fireEvent.click(screen.getByRole('button', { name }))
}

function seed(ids: unknown) {
  window.localStorage.setItem(STARRED_QUESTIONS_KEY, JSON.stringify(ids))
}

function savedIds() {
  return JSON.parse(window.localStorage.getItem(STARRED_QUESTIONS_KEY)!)
}

function expectPosition(position: number, total: number) {
  expect(screen.getByText(/Question.*of/, { selector: 'p' })).toHaveTextContent(
    `Question ${position} of ${total}`,
  )
}

describe('Starred questions', () => {
  it('offers an accessible empty review and a route into the full Study bank', () => {
    render(<App />)
    click('Review starred questions · 0')
    expect(
      screen.getByRole('heading', { name: 'No starred questions yet' }),
    ).toHaveFocus()
    expect(
      screen.queryByRole('button', { name: 'Shuffle' }),
    ).not.toBeInTheDocument()
    click('Start studying')
    expectPosition(1, 128)
    expect(
      screen.getByRole('button', { name: 'Star question' }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('stars with keyboard before and after reveal, preserving position and answer visibility across toggles', async () => {
    const user = userEvent.setup()
    render(<App />)
    click('Start studying')
    const star = screen.getByRole('button', { name: 'Star question' })
    star.focus()
    await user.keyboard(' ')
    expect(star).toHaveFocus()
    expect(star).toHaveAttribute('aria-pressed', 'true')
    expect(savedIds()).toEqual([questions[0].id])
    expect(
      screen.queryByRole('region', { name: 'Revealed answer' }),
    ).not.toBeInTheDocument()
    click('Show answer')
    click('Star question')
    expect(savedIds()).toEqual([])
    expect(
      screen.getByRole('region', { name: 'Revealed answer' }),
    ).toBeVisible()
    expectPosition(1, 128)
    click('Star question')
    click('Next question')
    click('Previous')
    expect(star).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Show answer' })).toBeVisible()
  })

  it('restores only stars after a fresh launch, including removal, without resetting other app storage', () => {
    window.localStorage.setItem('unrelated-test-key', 'keep')
    const first = render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    click('Start studying')
    click('Star question')
    click('Next question')
    click('Star question')
    click('Show answer')
    first.unmount()
    const second = render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    click('Review starred questions · 2')
    expectPosition(1, 2)
    expect(screen.getByRole('button', { name: 'Show answer' })).toBeVisible()
    click('Star question')
    expectPosition(1, 2)
    second.unmount()
    render(<App />)
    click('Review starred questions · 1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[1].question,
    )
    expect(window.localStorage.getItem('unrelated-test-key')).toBe('keep')
    window.localStorage.removeItem('unrelated-test-key')
  })

  it('keeps the captured review selection through unstar, rerender, navigation, and shuffle', () => {
    seed([questions[7].id, questions[1].id, questions[4].id])
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const view = render(<App />)
    click('Review starred questions · 3')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[1].question,
    )
    click('Show answer')
    click('Star question')
    view.rerender(<App />)
    expectPosition(1, 3)
    expect(screen.getByRole('button', { name: 'Hide answer' })).toBeVisible()
    click('Next question')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[4].question,
    )
    click('Previous')
    expect(
      screen.getByRole('button', { name: 'Star question' }),
    ).toHaveAttribute('aria-pressed', 'false')
    click('Shuffle')
    const shuffledFirst = screen.getByRole('heading', { level: 1 }).textContent
    click('Show answer')
    view.rerender(<App />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      shuffledFirst,
    )
    expectPosition(1, 3)
    click('Shuffle on')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[1].question,
    )
    expect(screen.getByRole('button', { name: 'Show answer' })).toBeVisible()
    click('Home')
    click('Review starred questions · 2')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[4].question,
    )
    expectPosition(1, 2)
  })

  it('allows removing and restoring the last star and finishing a one-question review', () => {
    seed([questions[20].id])
    render(<App />)
    click('Review starred questions · 1')
    expectPosition(1, 1)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    click('Star question')
    expectPosition(1, 1)
    click('Star question')
    click('Finish review')
    click('Review starred questions · 1')
    click('Star question')
    click('Finish review')
    click('Review starred questions · 0')
    expect(
      screen.getByRole('heading', { name: 'No starred questions yet' }),
    ).toBeVisible()
  })

  it('reviews all 128 once in shuffled order and leaves stars in place on completion', () => {
    seed(questions.map((question) => question.id))
    render(<App />)
    click('Review starred questions · 128')
    click('Shuffle')
    const seen = new Set<string>()
    for (let index = 0; index < questions.length; index += 1) {
      expectPosition(index + 1, 128)
      seen.add(screen.getByText(/^NO\./).textContent!)
      if (index < questions.length - 1) click('Next question')
    }
    expect(seen.size).toBe(128)
    click('Finish review')
    expect(
      screen.getByRole('button', { name: 'Review starred questions · 128' }),
    ).toBeVisible()
  })

  it('keeps manual stars independent from practice grading and session exit', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    render(<App />)
    click('Practice test')
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } })
    click('Start practice')
    const first = screen.getByRole('heading', { level: 1 }).textContent
    click('Star question')
    expectPosition(1, 3)
    expect(
      screen.queryByRole('button', { name: 'Correct' }),
    ).not.toBeInTheDocument()
    click('Show answer')
    click('Star question')
    click('Star question')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(first)
    click('Correct')
    expectPosition(2, 3)
    click('Show answer')
    click('Incorrect')
    expect(savedIds()).toHaveLength(1)
    click('Star question')
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    click('End practice')
    expect(confirm).toHaveBeenCalledOnce()
    click('Review starred questions · 2')
    expectPosition(1, 2)
    click('Home')
    click('Practice test')
    expect(screen.getByRole('spinbutton')).toHaveValue(20)
  })

  it('deduplicates saved IDs, ignores unknown values, and uses current bundled questions', () => {
    seed([
      questions[3].id,
      '2025-999',
      questions[3].id,
      3,
      null,
      { id: questions[1].id },
    ])
    render(<App />)
    click('Review starred questions · 1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[3].question,
    )
    click('Show answer')
    for (const answer of questions[3].acceptedAnswers)
      expect(screen.getByText(answer)).toBeVisible()
    click('Star question')
    expect(savedIds()).toEqual([])
  })

  it.each(['broken JSON', '{}', 'null'])(
    'recovers from malformed saved data (%s)',
    (value) => {
      window.localStorage.setItem(STARRED_QUESTIONS_KEY, value)
      render(<App />)
      expect(screen.getByRole('status')).toHaveTextContent(
        'Saved stars couldn’t be read',
      )
      click('Start studying')
      click('Star question')
      expect(savedIds()).toEqual([questions[0].id])
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    },
  )

  it('keeps changes in memory with a notice when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Stars can only be kept for this session',
    )
    click('Start studying')
    click('Star question')
    click('Home')
    click('Review starred questions · 1')
    expectPosition(1, 1)
    click('Show answer')
    expect(
      screen.getByRole('region', { name: 'Revealed answer' }),
    ).toBeVisible()
  })

  it('preserves loaded stars after a failed write, then saves the in-memory list if storage recovers', () => {
    seed([questions[5].id])
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Full')
      })
    render(<App />)
    click('Start studying')
    click('Star question')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Stars can only be kept for this session',
    )
    click('Home')
    expect(
      screen.getByRole('button', { name: 'Review starred questions · 2' }),
    ).toBeVisible()
    expect(savedIds()).toEqual([questions[5].id])
    setItem.mockRestore()
    click('Start studying')
    click('Next question')
    click('Star question')
    expect(new Set(savedIds())).toEqual(
      new Set([questions[0].id, questions[1].id, questions[5].id]),
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('processes rapid toggles once each without duplicating IDs in Strict Mode', () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    click('Start studying')
    const star = screen.getByRole('button', { name: 'Star question' })
    act(() => {
      fireEvent.click(star)
      fireEvent.click(star)
      fireEvent.click(star)
    })
    expect(savedIds()).toEqual([questions[0].id])
    expect(star).toHaveAttribute('aria-pressed', 'true')
  })
})
