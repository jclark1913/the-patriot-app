import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const pwa = vi.hoisted(() => ({
  enabled: true,
  supported: true,
  offlineReady: false,
  updateReady: false,
  updating: false,
  error: null as string | null,
  applyUpdate: vi.fn(),
}))
vi.mock('./usePwa', () => ({ usePwa: () => pwa }))

beforeEach(() => {
  Object.assign(pwa, {
    offlineReady: false,
    updateReady: false,
    updating: false,
    error: null,
    supported: true,
  })
  pwa.applyUpdate.mockClear()
})

describe('Home PWA controls', () => {
  it('shows readiness only after the cache is confirmed', () => {
    const view = render(<App />)
    expect(screen.getByText('Preparing offline use…')).toBeVisible()
    expect(screen.queryByText('Ready offline')).not.toBeInTheDocument()
    pwa.offlineReady = true
    view.rerender(<App />)
    expect(screen.getByText('Ready offline')).toBeVisible()
  })

  it('explains unavailable offline support and links to installation help', () => {
    pwa.supported = false
    render(<App />)
    expect(
      screen.getByText('Offline use isn’t available in this browser.'),
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Add to Home Screen' }))
    expect(
      screen.getByRole('heading', { name: 'Add to your iPhone Home Screen' }),
    ).toBeVisible()
    expect(screen.getByText(/App version:/)).toBeVisible()
  })

  it('keeps a Study question open when an update arrives and offers it on Home', () => {
    const view = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Start studying' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }))
    fireEvent.click(screen.getByRole('button', { name: 'Show answer' }))
    const question = screen.getByRole('heading', { level: 1 }).textContent
    pwa.updateReady = true
    view.rerender(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      question!,
    )
    expect(screen.getByRole('button', { name: 'Hide answer' })).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Update' }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Home' }))
    fireEvent.click(screen.getByRole('button', { name: 'Update' }))
    expect(pwa.applyUpdate).toHaveBeenCalledOnce()
  })

  it('preserves a graded practice session until the learner confirms leaving', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const view = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Practice test' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start practice' }))
    fireEvent.click(screen.getByRole('button', { name: 'Show answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Correct' }))
    pwa.updateReady = true
    view.rerender(<App />)
    expect(
      screen.getByText(/Question.*of/, { selector: 'p' }),
    ).toHaveTextContent('Question 2 of 20')
    expect(
      screen.queryByRole('button', { name: 'Update' }),
    ).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'The Patriot App home' }),
    )
    expect(
      screen.getByText(/Question.*of/, { selector: 'p' }),
    ).toHaveTextContent('Question 2 of 20')
    confirm.mockReturnValue(true)
    fireEvent.click(
      screen.getByRole('button', { name: 'The Patriot App home' }),
    )
    expect(screen.getByRole('button', { name: 'Update' })).toBeVisible()
    confirm.mockRestore()
  })

  it('prevents a new session while an approved update is activating', () => {
    pwa.updateReady = true
    pwa.updating = true
    render(<App />)
    expect(
      screen.getByRole('button', { name: 'Start studying' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Practice test' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Help & sources' }))
    expect(screen.getByText('Updating…')).toBeVisible()
  })
})
