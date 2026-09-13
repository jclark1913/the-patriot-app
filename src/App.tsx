import { useEffect, useRef, useState } from 'react'
import { answerOverrides, bankMetadata, questions } from './data'
import type { CivicsQuestion } from './data'
import { Icon } from './components/Icon'
import { shuffledCopy } from './study'

type Screen = 'home' | 'study' | 'help'

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

function Home({ onStudy }: { onStudy: () => void }) {
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
        <button className="button button-primary hero-button" onClick={onStudy}>
          Start studying <Icon name="arrow-right" />
        </button>
      </section>
    </main>
  )
}

function AnswerPanel({ question }: { question: CivicsQuestion }) {
  const override = question.answerKey
    ? answerOverrides[question.answerKey]
    : undefined
  const unresolved =
    question.answerType !== 'static' && override?.status !== 'verified'
  const answers =
    question.answerType === 'static'
      ? question.acceptedAnswers
      : (override?.answers ?? [])
  const verificationDate = override?.verifiedOn
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${override.verifiedOn}T00:00:00Z`))
    : null

  return (
    <section
      className={`answer-panel ${unresolved ? 'answer-local' : ''}`}
      aria-label="Revealed answer"
    >
      <p className="eyebrow">
        {unresolved
          ? question.answerType === 'location-dependent'
            ? 'YOUR LOCAL ANSWER'
            : 'CURRENT ANSWER'
          : 'ACCEPTED ANSWERS'}
      </p>
      {unresolved ? (
        <>
          <h2>
            {question.answerType === 'location-dependent'
              ? 'This one depends on where you live.'
              : 'Check the current answer.'}
          </h2>
          <p>
            {override?.guidance ??
              'Use the official source to find and confirm your answer.'}
          </p>
          <a
            className="lookup-link"
            href={override?.sourceUrl ?? question.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Find your answer <Icon name="external" />
          </a>
          <p className="connection-note">
            Opens an official website. Internet connection needed.
          </p>
        </>
      ) : (
        <>
          <p className="answer-instruction">
            {question.requiredAnswers > 1
              ? `Your answer should include ${question.requiredAnswers} items.`
              : answers.length > 1
                ? 'Any one of these answers is accepted.'
                : 'The official accepted answer:'}
          </p>
          <ul className="accepted-answers">
            {answers.map((answer, index) => (
              <li key={`${index}-${answer}`}>{answer}</li>
            ))}
          </ul>
        </>
      )}
      {question.notes && question.notes.length > 0 && (
        <div className="answer-notes">
          {question.notes.map((note, index) => (
            <p key={index}>{note}</p>
          ))}
        </div>
      )}
      {verificationDate && (
        <p className="verification-note">
          Current answer · Verified {verificationDate}
        </p>
      )}
      {!unresolved && (
        <a
          className="answer-source"
          href={override?.sourceUrl ?? question.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {override ? 'Official answer source' : 'USCIS study materials'}
          <Icon name="external" />
        </a>
      )}
    </section>
  )
}

function Study({ onHome }: { onHome: () => void }) {
  const [order, setOrder] = useState(() => [...questions])
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const question = order[index]

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [question.id])

  function navigate(nextIndex: number) {
    setIndex(nextIndex)
    setRevealed(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function toggleShuffle() {
    setOrder(shuffled ? [...questions] : shuffledCopy(questions))
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
        <span className="eyebrow">STUDY</span>
      </div>
      <section className="study-sheet" aria-label="Study question">
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
        <div className="question-body">
          <div className="question-category">
            <span className="eyebrow">{question.category}</span>
            <span className="question-number">
              NO. {String(question.number).padStart(3, '0')}
            </span>
          </div>
          <h1 className="question-title" ref={headingRef} tabIndex={-1}>
            {question.question}
          </h1>
          <p className="recall-hint">Think of your answer, then reveal.</p>
          <button
            className={`button reveal-button ${revealed ? 'is-revealed' : 'button-primary'}`}
            onClick={() => setRevealed(!revealed)}
            aria-expanded={revealed}
            aria-controls="answer-panel"
          >
            {revealed ? 'Hide answer' : 'Show answer'}
            <Icon name={revealed ? 'book' : 'arrow-right'} />
          </button>
          <div id="answer-panel" hidden={!revealed}>
            {revealed && <AnswerPanel question={question} />}
          </div>
        </div>
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
              Finish studying
              <Icon name="arrow-right" />
            </button>
          )}
        </div>
      </section>
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
        <h2>No saved progress</h2>
        <p>Study history isn’t saved. Reloading starts a new session.</p>
      </section>
      <div className="source-details">
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
  const brandRef = useRef<HTMLDivElement>(null)

  function goTo(next: Screen) {
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (next === 'home') brandRef.current?.querySelector('button')?.focus()
  }

  useEffect(() => {
    document.title =
      screen === 'home'
        ? 'The Patriot App'
        : `${screen === 'study' ? 'Study' : 'Help & Sources'} — The Patriot App`
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
      {screen === 'home' && <Home onStudy={() => goTo('study')} />}
      {screen === 'study' && <Study onHome={() => goTo('home')} />}
      {screen === 'help' && <Help onHome={() => goTo('home')} />}
    </div>
  )
}
