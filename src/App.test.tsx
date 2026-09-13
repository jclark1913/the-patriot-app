import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { answerOverrides, questions } from './data'

afterEach(() => vi.restoreAllMocks())

async function startStudy() {
  const user = userEvent.setup()
  const view = render(<App />)
  await user.click(screen.getByRole('button', { name: /start studying/i }))
  return { user, ...view }
}

describe('Home and Study', () => {
  it('reveals official answers only on request and hides them on forward/back navigation', async () => {
    const { user } = await startStudy()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[0].question,
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(
      screen.queryByRole('region', { name: 'Revealed answer' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /show answer/i }))
    const answer = screen.getByRole('region', { name: 'Revealed answer' })
    for (const text of questions[0].acceptedAnswers)
      expect(within(answer).getByText(text)).toBeVisible()
    expect(
      screen.getByRole('button', { name: /hide answer/i }),
    ).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('button', { name: /next question/i }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[1].question,
    )
    expect(
      screen.queryByRole('region', { name: 'Revealed answer' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /previous/i }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[0].question,
    )
    expect(
      screen.getByRole('button', { name: /show answer/i }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps shuffle order across reveal/rerender and restores official order when toggled off', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.25)
    const { user, rerender } = await startStudy()
    await user.click(screen.getByRole('button', { name: /^shuffle$/i }))
    const firstShuffled = screen.getByRole('heading', { level: 1 }).textContent
    expect(screen.getByRole('button', { name: /shuffle on/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: /show answer/i }))
    rerender(<App />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      firstShuffled,
    )
    await user.click(screen.getByRole('button', { name: /next question/i }))
    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toBe(
      firstShuffled,
    )
    await user.click(screen.getByRole('button', { name: /previous/i }))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      firstShuffled,
    )
    await user.click(screen.getByRole('button', { name: /shuffle on/i }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[0].question,
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('shows the required response count alongside the full official alternatives', async () => {
    const { user } = await startStudy()
    for (let index = 1; index < 10; index += 1)
      await user.click(screen.getByRole('button', { name: /next question/i }))
    await user.click(screen.getByRole('button', { name: /show answer/i }))
    expect(
      screen.getByText('Your answer should include 2 items.'),
    ).toBeVisible()
    const answer = screen.getByRole('region', { name: 'Revealed answer' })
    expect(within(answer).getAllByRole('listitem')).toHaveLength(
      questions[9].acceptedAnswers.length,
    )
  })

  it('uses official local lookup links, preserving territorial guidance without asking for location', async () => {
    const { user } = await startStudy()
    for (let index = 1; index < 23; index += 1)
      await user.click(screen.getByRole('button', { name: /next question/i }))
    await user.click(screen.getByRole('button', { name: /show answer/i }))
    expect(
      screen.getByRole('link', { name: /find your answer/i }),
    ).toHaveAttribute('href', answerOverrides['state-senator'].sourceUrl)
    expect(screen.getByText(/This one depends on where you live/)).toBeVisible()
    expect(screen.getByText(/has no U.S. senators/)).toBeVisible()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByText(/Verified/)).not.toBeInTheDocument()
  })

  it('starts fresh after unmounting and mounting the app again', async () => {
    const { user, unmount } = await startStudy()
    await user.click(screen.getByRole('button', { name: /next question/i }))
    await user.click(screen.getByRole('button', { name: /show answer/i }))
    unmount()
    render(<App />)
    expect(
      screen.getByRole('button', { name: /start studying/i }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: /start studying/i }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      questions[0].question,
    )
    expect(
      screen.queryByRole('region', { name: 'Revealed answer' }),
    ).not.toBeInTheDocument()
  })

  it('provides working source navigation and returns to Home', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /help & sources/i }))
    expect(
      screen.getByRole('link', { name: /official question bank/i }),
    ).toHaveAttribute('href', questions[0].sourceUrl)
    await user.click(screen.getByRole('button', { name: 'Home' }))
    expect(
      screen.getByRole('button', { name: /start studying/i }),
    ).toBeVisible()
  })
})
