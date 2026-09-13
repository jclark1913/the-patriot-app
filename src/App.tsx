import { useEffect, useRef, useState } from 'react'
import { answerOverrides, bankMetadata, questions } from './data'
import type { CivicsQuestion } from './data'
import { Icon } from './components/Icon'
import { shuffledCopy } from './study'

type Screen = 'home' | 'study' | 'help'

function Brand({ onHome }: { onHome: () => void }) {
  return (
    <button className="brand" onClick={onHome} aria-label="Patriot home">
      <span className="brand-mark">
        <Icon name="star" />
      </span>
      <span>
        patriot<span className="brand-dot">.</span>
      </span>
    </button>
  )
}

function ChapterArtwork() {
  return (
    <div className="chapter-art" aria-hidden="true">
      <div className="art-circle" />
      <div className="art-caption">YOUR NEXT CHAPTER</div>
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
          We the
          <br />
          learners.
        </span>
        <div className="paper-bottom">
          <span>ONE QUESTION AT A TIME</span>
          <span>01</span>
        </div>
      </div>
      <span className="art-spark spark-one">✳</span>
      <Icon name="star" className="art-spark spark-two" />
    </div>
  )
}

function Home({
  onStudy,
  onHelp,
}: {
  onStudy: () => void
  onHelp: () => void
}) {
  return (
    <main id="main-content" className="home-main">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="little-line" />
            2025 CIVICS TEST · ENGLISH
          </p>
          <h1 id="home-title">
            A little practice.
            <br />A big step <em>forward.</em>
          </h1>
          <p className="hero-description">
            Your next chapter starts with what you know. Get comfortable with
            the civics questions, one at a time.
          </p>
          <button
            className="button button-primary hero-button"
            onClick={onStudy}
          >
            Start studying <Icon name="arrow-right" />
          </button>
          <p className="hero-footnote">
            No sign-up. No pressure. Just practice.
          </p>
        </div>
        <ChapterArtwork />
      </section>
      <section className="study-intro" aria-labelledby="study-intro-title">
        <div className="intro-title">
          <span className="eyebrow">SMALL STEPS. REAL CONFIDENCE.</span>
          <h2 id="study-intro-title">Make yourself familiar.</h2>
        </div>
        <ol className="learning-steps">
          <li>
            <span className="step-number">01</span>
            <div>
              <h3>Read & recall</h3>
              <p>
                Give yourself a moment. <br />
                Say your answer out loud.
              </p>
            </div>
          </li>
          <li>
            <span className="step-number">02</span>
            <div>
              <h3>Reveal the answer</h3>
              <p>
                Check the official answers. <br />A little clearer each time.
              </p>
            </div>
          </li>
          <li>
            <span className="step-number">03</span>
            <div>
              <h3>Keep going</h3>
              <p>
                Take the next question. <br />
                Move at your own pace.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <div className="source-strip">
        <span>
          <Icon name="book" />
          {questions.length} official questions · 2025 edition
        </span>
        <button className="text-button" onClick={onHelp}>
          About the questions <Icon name="arrow-right" />
        </button>
      </div>
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
        <span className="eyebrow">STUDY AT YOUR PACE</span>
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
          <p className="recall-hint">
            Take a moment. Say your answer out loud.
          </p>
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
      <p className="study-bottom-note">
        One question at a time. You’ve got this.
      </p>
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
      <p className="eyebrow">A LITTLE CONTEXT</p>
      <h1 ref={headingRef} tabIndex={-1}>
        Your next chapter,
        <br />
        with good information.
      </h1>
      <section>
        <h2>Official questions. Your own pace.</h2>
        <p>
          Patriot brings together the {questions.length} English questions from
          the 2025 USCIS civics study materials. Read a question, say your
          answer, then reveal the accepted answers.
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
        <h2>Some answers change.</h2>
        <p>
          Questions about current leaders include a verification date and an
          official source. Questions about your state or representative link to
          official directories so you can find your own answer. Those websites
          require an Internet connection.
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
        <h2>A fresh start each time.</h2>
        <p>
          There’s no account and no saved study history. A fresh launch or page
          reload starts over.
        </p>
      </section>
      <div className="source-details">
        <p>{bankMetadata.sourceEdition}</p>
        <p>Question data: {bankMetadata.version}</p>
        <p>
          Patriot is an independent civics study aid, not affiliated with or
          endorsed by USCIS or the Department of Homeland Security. Confirm
          current and local answers before your interview.
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
        ? 'Patriot — Civics, made simple'
        : `${screen === 'study' ? 'Study' : 'Help & Sources'} — Patriot`
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
      {screen === 'home' && (
        <Home onStudy={() => goTo('study')} onHelp={() => goTo('help')} />
      )}
      {screen === 'study' && <Study onHome={() => goTo('home')} />}
      {screen === 'help' && <Help onHome={() => goTo('home')} />}
      <footer className="site-footer">
        <span>CIVICS, MADE SIMPLE.</span>
        <span>YOUR NEXT CHAPTER STARTS HERE.</span>
      </footer>
    </div>
  )
}
