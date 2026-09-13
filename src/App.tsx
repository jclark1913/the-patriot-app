import { useEffect, useRef, useState } from 'react'
import { bankMetadata, questions } from './data'
import type { CivicsQuestion } from './data'
import { Icon } from './components/Icon'
import { QuestionContent } from './components/QuestionContent'
import { PracticeFlow } from './PracticeFlow'
import { createPracticeSession, reducePractice } from './practice'
import type { PracticeAction, PracticeSession } from './practice'
import { shuffledCopy } from './study'
import { usePwa } from './usePwa'
import { useStarredQuestions } from './useStarredQuestions'

type Screen = 'home' | 'study' | 'review' | 'practice' | 'help'

function Brand({ onHome }: { onHome: () => void }) {
  return (
    <button
      className="brand"
      onClick={onHome}
      aria-label="The Patriot App home"
    >
      <span className="brand-mark">
        <Icon name="star" />
      </span>
      <span>The Patriot App</span>
    </button>
  )
}

function StudyArtwork() {
  return (
    <div className="chapter-art" aria-hidden="true">
      <div className="art-circle" />
      <div className="paper paper-back" />
      <div className="paper paper-middle" />
      <div className="paper paper-front">
        <div className="paper-top">
          <span>CIVICS STUDY</span>
          <Icon name="star" />
        </div>
        <div className="paper-book">
          <Icon name="book" />
        </div>
        <span className="paper-title">
          Civics
          <br />
          2025
        </span>
        <div className="paper-bottom">
          <span>{questions.length} QUESTIONS</span>
          <span>ENGLISH</span>
        </div>
      </div>
      <span className="art-spark spark-one">✳</span>
      <Icon name="star" className="art-spark spark-two" />
    </div>
  )
}

function Home({
  onStudy,
  onPractice,
  onHelp,
  onReview,
  starredCount,
  pwa,
}: {
  onStudy: () => void
  onPractice: () => void
  onHelp: () => void
  onReview: () => void
  starredCount: number
  pwa: ReturnType<typeof usePwa>
}) {
  return (
    <main id="main-content" className="home-main">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="little-line" />
            2025 · English · {questions.length} questions
          </p>
          <h1 id="home-title">
            Study for the
            <br />
            <em>USCIS civics test</em>
          </h1>
          <p className="hero-description">
            Prepare for your U.S. citizenship interview with the{' '}
            {questions.length} official civics questions and answers from the
            USCIS website.
          </p>
          <a
            className="hero-source"
            href={bankMetadata.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            View official USCIS questions <Icon name="external" />
          </a>
        </div>
        <StudyArtwork />
        <div className="hero-actions">
          <button
            className="button button-primary hero-button"
            onClick={onStudy}
            disabled={pwa.updating}
          >
            Start studying <Icon name="arrow-right" />
          </button>
          <button
            className="button button-secondary hero-button"
            onClick={onPractice}
            disabled={pwa.updating}
          >
            Practice test <Icon name="arrow-right" />
          </button>
          <div className="home-starred">
            <button
              className="text-button"
              onClick={onReview}
              disabled={pwa.updating}
            >
              <Icon name="star-outline" />
              Review starred questions · {starredCount}
              <Icon name="arrow-right" />
            </button>
            <p>Save difficult questions for later.</p>
          </div>
        </div>
      </section>
      {pwa.enabled && (
        <div className="pwa-panel" aria-label="Offline and installation">
          <div className="pwa-status-row">
            <p role="status">
              {pwa.offlineReady
                ? 'Ready offline'
                : !pwa.supported
                  ? 'Offline use isn’t available in this browser.'
                  : pwa.error
                    ? 'Not ready offline'
                    : 'Preparing offline use…'}
            </p>
            <button className="text-button" onClick={onHelp}>
              Add to Home Screen <Icon name="arrow-right" />
            </button>
          </div>
          {pwa.error && (
            <p className="pwa-error" role="status">
              {pwa.error}
            </p>
          )}
          {pwa.updateReady && (
            <div className="pwa-update">
              <p role="status">
                {pwa.updating ? 'Updating…' : 'Update available'}
              </p>
              <button
                className="button button-secondary"
                disabled={pwa.updating}
                onClick={pwa.applyUpdate}
              >
                Update
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

function Study({
  onHome,
  onStudy,
  initialQuestions,
  review,
  starredIds,
  onToggleStar,
}: {
  onHome: () => void
  onStudy: () => void
  initialQuestions: readonly CivicsQuestion[]
  review: boolean
  starredIds: readonly string[]
  onToggleStar: (questionId: string) => void
}) {
  // Star changes affect the next review, including after toggling shuffle.
  const [selection] = useState(() => [...initialQuestions])
  const [order, setOrder] = useState(() => [...initialQuestions])
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const question = order[index]
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    emptyHeadingRef.current?.focus({ preventScroll: true })
  }, [])

  function navigate(nextIndex: number) {
    setIndex(nextIndex)
    setRevealed(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function toggleShuffle() {
    setOrder(shuffled ? [...selection] : shuffledCopy(selection))
    setShuffled(!shuffled)
    setIndex(0)
    setRevealed(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <main id="main-content" className="study-main">
      <div className="study-toolbar">
        <button className="text-button" onClick={onHome}>
          <Icon name="arrow-left" />
          Home
        </button>
        <span className="eyebrow">{review ? 'STARRED REVIEW' : 'STUDY'}</span>
      </div>
      {!question ? (
        <section className="practice-panel" aria-labelledby="empty-stars-title">
          <h1 id="empty-stars-title" ref={emptyHeadingRef} tabIndex={-1}>
            No starred questions yet
          </h1>
          <p className="practice-description">
            Tap Star on a question in Study or Practice to save it for later.
          </p>
          <button
            className="button button-primary practice-start"
            onClick={onStudy}
          >
            Start studying <Icon name="arrow-right" />
          </button>
        </section>
      ) : (
        <>
          {review && (
            <p className="review-note">
              Removing a star updates your next review. This review keeps its
              starting questions.
            </p>
          )}
          <section
            className="study-sheet"
            aria-label={review ? 'Starred review question' : 'Study question'}
          >
            <div className="study-position">
              <p>
                Question <strong>{index + 1}</strong> of {order.length}
              </p>
              <button
                className={`shuffle-button ${shuffled ? 'is-active' : ''}`}
                aria-pressed={shuffled}
                onClick={toggleShuffle}
                title="Change order and start from the first question"
              >
                <Icon name="shuffle" />
                {shuffled ? 'Shuffle on' : 'Shuffle'}
              </button>
            </div>
            <progress
              className="question-progress"
              value={index + 1}
              max={order.length}
              aria-label="Question position"
            />
            <QuestionContent
              question={question}
              starred={starredIds.includes(question.id)}
              onToggleStar={() => onToggleStar(question.id)}
              revealed={revealed}
              onToggleReveal={() => setRevealed(!revealed)}
            />
            <div className="study-navigation">
              <button
                className="button button-previous"
                onClick={() => navigate(index - 1)}
                disabled={index === 0}
              >
                <Icon name="arrow-left" />
                Previous
              </button>
              {index < order.length - 1 ? (
                <button
                  className="button button-next"
                  onClick={() => navigate(index + 1)}
                >
                  Next question
                  <Icon name="arrow-right" />
                </button>
              ) : (
                <button className="button button-next" onClick={onHome}>
                  {review ? 'Finish review' : 'Finish studying'}
                  <Icon name="arrow-right" />
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

function Help({ onHome }: { onHome: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <main id="main-content" className="help-main">
      <button className="text-button" onClick={onHome}>
        <Icon name="arrow-left" />
        Home
      </button>
      <h1 ref={headingRef} tabIndex={-1}>
        About The Patriot App
      </h1>
      <section>
        <h2>Question sources</h2>
        <p>
          The {questions.length} official English questions for the 2025 USCIS
          civics test.
        </p>
        <a
          className="lookup-link"
          href={bankMetadata.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Read the official question bank
          <Icon name="external" />
        </a>
      </section>
      <section>
        <h2>Current and local answers</h2>
        <p>
          Current answers include a verification date and official source. Local
          questions link to official directories. These websites require an
          Internet connection.
        </p>
        <a
          className="lookup-link"
          href="https://www.uscis.gov/citizenship/find-study-materials-and-resources/check-for-test-updates"
          target="_blank"
          rel="noreferrer"
        >
          Check USCIS test updates
          <Icon name="external" />
        </a>
      </section>
      <section>
        <h2>Practice and the USCIS test</h2>
        <p>
          Practice asks every question you select and reports your score. The
          standard 2025 USCIS civics test asks up to 20 questions and requires
          12 correct answers to pass. This app is a study aid, not a complete
          citizenship exam simulation.
        </p>
        <a
          className="lookup-link"
          href={bankMetadata.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          USCIS test format <Icon name="external" />
        </a>
      </section>
      <section>
        <h2>Use offline</h2>
        <p>
          Open the app online and wait for “Ready offline” on Home. All 128
          questions, Study, Practice, starred review, and this help will then
          work without a connection. Source and lookup links still need the
          Internet. If your browser removes the downloaded app data, open it
          online again.
        </p>
      </section>
      <section>
        <h2>Add to your iPhone Home Screen</h2>
        <p>
          Open this site in Safari and choose Share (under More in some
          layouts). Tap Add to Home Screen, turn on Open as Web App if shown,
          then tap Add. Open the new icon while online and wait for “Ready
          offline” before using it without a connection.
        </p>
        <a
          className="lookup-link"
          href="https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios"
          target="_blank"
          rel="noreferrer"
        >
          Apple installation help <Icon name="external" />
        </a>
      </section>
      <section>
        <h2>App updates</h2>
        <p>
          When a new version is downloaded, an Update button appears on Home.
          Finish or leave your session first, then tap Update. Study, Practice,
          and starred review won’t reload automatically. Saved stars stay in
          place when you update.
        </p>
      </section>
      <section>
        <h2>Starred questions</h2>
        <p>
          Tap Star in Study or Practice to save a question, then choose Review
          starred questions on Home. Review uses answer reveal, previous/next,
          and shuffle. Remove a star whenever you’re ready; the change applies
          to your next review. Grading an answer or finishing a review doesn’t
          change stars.
        </p>
        <p>
          Stars are saved only in this browser or installed app, with no account
          or sync. Safari and the iPhone Home Screen app keep separate stars.
          Clearing website data can remove them, and private browsing may keep
          them only temporarily. Star questions in the app you plan to use.
        </p>
      </section>
      <section>
        <h2>Session scores and history</h2>
        <p>
          Study history and practice scores aren’t saved. Reloading starts a new
          session; saved stars remain.
        </p>
      </section>
      <div className="source-details">
        <p>App version: {__APP_VERSION__}</p>
        <p>{bankMetadata.sourceEdition}</p>
        <p>Question data: {bankMetadata.version}</p>
        <p>
          The Patriot App is an independent civics study aid, not affiliated
          with or endorsed by USCIS or the Department of Homeland Security.
          Confirm current and local answers before your interview.
        </p>
      </div>
    </main>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [practiceSession, setPracticeSession] =
    useState<PracticeSession | null>(null)
  const brandRef = useRef<HTMLDivElement>(null)
  const pwa = usePwa(screen === 'home')
  const stars = useStarredQuestions()

  function goTo(next: Screen) {
    if (pwa.updating) return
    if (
      screen === 'practice' &&
      practiceSession &&
      practiceSession.grades.length > 0 &&
      practiceSession.grades.length < practiceSession.questions.length &&
      !window.confirm('End practice and discard your score?')
    )
      return

    setPracticeSession(null)
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (next === 'home') brandRef.current?.querySelector('button')?.focus()
  }

  function updatePractice(action: PracticeAction) {
    setPracticeSession((session) =>
      session ? reducePractice(session, action) : null,
    )
  }

  useEffect(() => {
    document.title =
      screen === 'home'
        ? 'The Patriot App'
        : `${screen === 'study' ? 'Study' : screen === 'review' ? 'Starred Review' : screen === 'practice' ? 'Practice Test' : 'Help & Sources'} — The Patriot App`
  }, [screen])

  return (
    <div className={`app app-${screen}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div ref={brandRef}>
          <Brand onHome={() => goTo('home')} />
        </div>
        <button
          className="header-link"
          onClick={() => goTo('help')}
          aria-current={screen === 'help' ? 'page' : undefined}
        >
          Help & sources
          <Icon name="arrow-right" />
        </button>
      </header>
      {stars.notice && (
        <p className="stars-notice" role="status">
          {stars.notice}
        </p>
      )}
      {screen === 'home' && (
        <Home
          onStudy={() => goTo('study')}
          onPractice={() => goTo('practice')}
          onHelp={() => goTo('help')}
          onReview={() => goTo('review')}
          starredCount={stars.ids.length}
          pwa={pwa}
        />
      )}
      {(screen === 'study' || screen === 'review') && (
        <Study
          key={screen}
          onHome={() => goTo('home')}
          onStudy={() => goTo('study')}
          initialQuestions={
            screen === 'review'
              ? questions.filter((question) => stars.ids.includes(question.id))
              : questions
          }
          review={screen === 'review'}
          starredIds={stars.ids}
          onToggleStar={stars.toggleStar}
        />
      )}
      {screen === 'practice' && (
        <PracticeFlow
          session={practiceSession}
          onStart={(count) => setPracticeSession(createPracticeSession(count))}
          onAction={updatePractice}
          onHome={() => goTo('home')}
          onRestart={() => setPracticeSession(null)}
          starredIds={stars.ids}
          onToggleStar={stars.toggleStar}
        />
      )}
      {screen === 'help' && <Help onHome={() => goTo('home')} />}
    </div>
  )
}
