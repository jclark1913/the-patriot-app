import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { answerOverrides, questions } from './data'

afterEach(() => vi.restoreAllMocks())

async function openSetup() {
  const user = userEvent.setup()
  const view = render(<App />)
  await user.click(screen.getByRole('button', { name: 'Practice test' }))
  return { user, ...view }
}

async function startPractice(count = 20) {
  const view = await openSetup()
  const input = screen.getByRole('spinbutton', { name: 'Number of questions' })
  if (count !== 20) {
    await view.user.clear(input)
    await view.user.type(input, String(count))
  }
  await view.user.click(screen.getByRole('button', { name: 'Start practice' }))
  return view
}

function grade(correct: boolean) {
  fireEvent.click(screen.getByRole('button', { name: 'Show answer' }))
  fireEvent.click(
    screen.getByRole('button', {
      name: correct ? 'Correct' : 'Incorrect',
    }),
  )
}

function scoreValue(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling
    ?.textContent
}

function expectPosition(position: number, total: number) {
  expect(screen.getByText(/Question.*of/, { selector: 'p' })).toHaveTextContent(
    `Question ${position} of ${total}`,
  )
}

describe('Practice Test', () => {
  it('defaults to 20, supports presets and custom counts, and reports accessible validation', async () => {
    const { user } = await openSetup()
    const input = screen.getByRole('spinbutton', {
      name: 'Number of questions',
    })
    const start = screen.getByRole('button', {
      name: 'Start practice',
    })
    expect(input).toHaveValue(20)
    expect(screen.getByText('Passing score: 12 of 20 correct.')).toBeVisible()
    expect(input).toHaveAccessibleDescription(/Passing score: 12 of 20 correct/)
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'All 128' }))
    expect(input).toHaveValue(128)
    expect(screen.queryByText(/Passing score/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All 128' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: '20 questions' }))
    expect(input).toHaveValue(20)
    expect(screen.getByText('Passing score: 12 of 20 correct.')).toBeVisible()
    for (const value of ['1', '19', '21', '47', '128']) {
      fireEvent.change(input, { target: { value } })
      expect(screen.queryByText(/Passing score/)).not.toBeInTheDocument()
    }
    fireEvent.change(input, { target: { value: '20' } })
    expect(screen.getByText('Passing score: 12 of 20 correct.')).toBeVisible()
    for (const value of ['', '0', '-1', '129', '1.5', 'abc']) {
      fireEvent.change(input, { target: { value } })
      expect(start).toBeDisabled()
      expect(screen.queryByText(/Passing score/)).not.toBeInTheDocument()
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAccessibleDescription(
        'Enter a whole number from 1 to 128.',
      )
      expect(screen.getByRole('alert')).toBeVisible()
      fireEvent.submit(input.closest('form')!)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Practice test',
      )
    }
    await user.type(input, '47')
    expect(start).toBeEnabled()
    expect(input).toHaveAttribute('aria-invalid', 'false')
    // Enter submits a valid count without requiring a pointer.
    await user.keyboard('{Enter}')
    expectPosition(1, 47)
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
  })

  it('requires reveal, keeps the order across rerenders, and ignores repeated grading taps', async () => {
    const { user, rerender } = await startPractice(3)
    const firstQuestion = screen.getByRole('heading', { level: 1 }).textContent
    expect(
      screen.queryByRole('group', { name: 'Grade your answer' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show answer' }))
    expect(
      screen.getByRole('region', { name: 'Revealed answer' }),
    ).toBeVisible()
    rerender(<App />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      firstQuestion,
    )
    await user.click(screen.getByRole('button', { name: 'Hide answer' }))
    expect(
      screen.queryByRole('group', { name: 'Grade your answer' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show answer' }))
    const correct = screen.getByRole('button', { name: 'Correct' })
    act(() => {
      correct.click()
      correct.click()
      correct.click()
    })
    expectPosition(2, 3)
    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toBe(
      firstQuestion,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Show answer' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(
      screen.queryByRole('group', { name: 'Grade your answer' }),
    ).not.toBeInTheDocument()
    grade(false)
    grade(true)
    expect(scoreValue('Accuracy')).toBe('67%')
    expect(scoreValue('Correct')).toBe('2')
    expect(scoreValue('Incorrect')).toBe('1')
    expect(screen.queryByText(/passed|Passing score/)).not.toBeInTheDocument()
  })

  it.each([true, false])(
    'asks all 20 questions even with every answer graded %s',
    async (correct) => {
      await startPractice()
      for (let index = 1; index <= 20; index += 1) {
        expectPosition(index, 20)
        expect(
          screen.queryByRole('heading', { name: /^Practice (not )?passed$/ }),
        ).not.toBeInTheDocument()
        grade(correct)
      }
      expect(
        screen.getByRole('heading', { name: 'Practice complete' }),
      ).toHaveFocus()
      expect(screen.getByText('20 of 20 questions completed')).toBeVisible()
      expect(scoreValue('Correct')).toBe(correct ? '20' : '0')
      expect(scoreValue('Incorrect')).toBe(correct ? '0' : '20')
      expect(scoreValue('Accuracy')).toBe(correct ? '100%' : '0%')
      expect(
        screen.getByRole('heading', {
          name: correct ? 'Practice passed' : 'Practice not passed',
        }),
      ).toBeVisible()
      expect(screen.getByText('Passing score: 12 of 20 correct.')).toBeVisible()
    },
  )

  it.each([11, 12])(
    'uses the 12-correct cutoff after completing 20 questions with %i correct',
    async (correct) => {
      await startPractice()
      for (let index = 0; index < 20; index += 1) grade(index < correct)
      expect(
        screen.getByRole('heading', {
          name: correct === 12 ? 'Practice passed' : 'Practice not passed',
        }),
      ).toBeVisible()
      expect(scoreValue('Correct')).toBe(String(correct))
      expect(scoreValue('Accuracy')).toBe(correct === 12 ? '60%' : '55%')
    },
  )

  it('asks every official question exactly once in an All 128 session, including local lookups', async () => {
    const { container } = await startPractice(128)
    const seen = new Set<number>()
    for (let position = 1; position <= 128; position += 1) {
      expectPosition(position, 128)
      const number = Number(
        container
          .querySelector('.question-number')!
          .textContent!.replace('NO.', '')
          .trim(),
      )
      expect(seen.has(number)).toBe(false)
      seen.add(number)
      fireEvent.click(screen.getByRole('button', { name: 'Show answer' }))
      const question = questions[number - 1]
      const answer = screen.getByRole('region', { name: 'Revealed answer' })
      if (question.answerType === 'static') {
        expect(within(answer).getAllByRole('listitem')).toHaveLength(
          question.acceptedAnswers.length,
        )
      } else if (question.answerType === 'location-dependent') {
        expect(
          within(answer).getByRole('link', { name: /find your answer/i }),
        ).toHaveAttribute(
          'href',
          answerOverrides[question.answerKey!].sourceUrl,
        )
      }
      fireEvent.click(
        screen.getByRole('button', {
          name: position % 2 ? 'Correct' : 'Incorrect',
        }),
      )
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(
      questions.map(({ number }) => number),
    )
    expect(scoreValue('Correct')).toBe('64')
    expect(scoreValue('Incorrect')).toBe('64')
    expect(scoreValue('Accuracy')).toBe('50%')
    expect(screen.queryByText(/passed|Passing score/)).not.toBeInTheDocument()
  }, 20000)

  it('completes one question and starts another practice with the default count', async () => {
    const { user } = await startPractice(1)
    grade(false)
    expect(screen.getByText('1 of 1 questions completed')).toBeVisible()
    expect(scoreValue('Accuracy')).toBe('0%')
    expect(screen.queryByText(/passed|Passing score/)).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Start another practice' }),
    )
    expect(screen.getByRole('spinbutton')).toHaveValue(20)
    expect(screen.queryByText('Practice complete')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
  })

  it.each(['End practice', 'The Patriot App home', 'Help & sources'])(
    'guards leaving through %s after grading, preserving the session when canceled',
    async (exit) => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const { user } = await startPractice(3)
      grade(true)
      await user.click(screen.getByRole('button', { name: 'Show answer' }))
      const current = screen.getByRole('heading', { level: 1 }).textContent
      await user.click(screen.getByRole('button', { name: exit }))
      expect(confirm).toHaveBeenCalledTimes(1)
      expectPosition(2, 3)
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
        current,
      )
      expect(
        screen.getByRole('region', { name: 'Revealed answer' }),
      ).toBeVisible()
      confirm.mockReturnValue(true)
      await user.click(screen.getByRole('button', { name: exit }))
      expect(confirm).toHaveBeenCalledTimes(2)
      if (exit === 'Help & sources')
        await user.click(screen.getByRole('button', { name: 'Home' }))
      await user.click(screen.getByRole('button', { name: 'Practice test' }))
      expect(screen.getByRole('spinbutton')).toHaveValue(20)
    },
  )

  it('does not ask to discard an ungraded session or a completed session', async () => {
    const confirm = vi.spyOn(window, 'confirm')
    const { user } = await startPractice(1)
    await user.click(screen.getByRole('button', { name: 'End practice' }))
    expect(confirm).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Practice test' }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } })
    await user.click(screen.getByRole('button', { name: 'Start practice' }))
    grade(true)
    await user.click(screen.getByRole('button', { name: 'Home' }))
    expect(confirm).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Practice test' })).toBeVisible()
  })

  it('starts fresh after the app is unloaded and mounted again', async () => {
    const { user, unmount } = await startPractice(3)
    grade(true)
    unmount()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Practice test' }))
    expect(screen.getByRole('spinbutton')).toHaveValue(20)
    expect(
      screen.queryByRole('region', { name: 'Practice question' }),
    ).not.toBeInTheDocument()
  })
})
