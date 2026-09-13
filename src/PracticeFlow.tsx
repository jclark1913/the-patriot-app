import { useEffect, useRef, useState } from 'react'
import { questions } from './data'
import { Icon } from './components/Icon'
import { QuestionContent } from './components/QuestionContent'
import {
  CIVICS_PASSING_SCORE,
  CIVICS_TEST_COUNT,
  getPracticeScore,
  parseQuestionCount,
} from './practice'
import type { PracticeAction, PracticeSession } from './practice'

function PracticeSetup({ onStart }: { onStart: (count: number) => void }) {
  const [value, setValue] = useState(String(CIVICS_TEST_COUNT))
  const headingRef = useRef<HTMLHeadingElement>(null)
  const count = parseQuestionCount(value)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section className="practice-panel" aria-labelledby="practice-title">
      <h1 id="practice-title" ref={headingRef} tabIndex={-1}>
        Practice test
      </h1>
      <p className="practice-description">
        Choose how many questions to practice.
      </p>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (count !== null) onStart(count)
        }}
      >
        <label htmlFor="question-count">Number of questions</label>
        <div
          className="count-presets"
          role="group"
          aria-label="Quick question counts"
        >
          {[CIVICS_TEST_COUNT, questions.length].map((preset) => (
            <button
              key={preset}
              type="button"
              className="count-preset"
              aria-pressed={count === preset}
              onClick={() => setValue(String(preset))}
            >
              {preset === questions.length
                ? `All ${preset}`
                : `${preset} questions`}
            </button>
          ))}
        </div>
        <input
          id="question-count"
          name="questionCount"
          type="number"
          inputMode="numeric"
          min={1}
          max={questions.length}
          step={1}
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={count === null}
          aria-describedby={
            count === null
              ? 'count-error'
              : count === CIVICS_TEST_COUNT
                ? 'count-hint practice-passing-score'
                : 'count-hint'
          }
        />
        {count === null ? (
          <p className="count-error" id="count-error" role="alert">
            Enter a whole number from 1 to {questions.length}.
          </p>
        ) : (
          <p className="count-hint" id="count-hint">
            1–{questions.length} questions, chosen at random. Each appears once.
          </p>
        )}
        {count === CIVICS_TEST_COUNT && (
          <p className="passing-score-note" id="practice-passing-score">
            Passing score: {CIVICS_PASSING_SCORE} of {CIVICS_TEST_COUNT}{' '}
            correct.
          </p>
        )}
        <p className="session-note">
          Your score is only kept for this session.
        </p>
        <button
          className="button button-primary practice-start"
          type="submit"
          disabled={count === null}
        >
          Start practice <Icon name="arrow-right" />
        </button>
      </form>
    </section>
  )
}

function PracticeResults({
  session,
  onRestart,
  onHome,
}: {
  session: PracticeSession
  onRestart: () => void
  onHome: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const score = getPracticeScore(session)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section
      className="practice-panel practice-results"
      aria-labelledby="results-title"
    >
      <h1 id="results-title" ref={headingRef} tabIndex={-1}>
        Practice complete
      </h1>
      <p className="practice-description">
        {score.completed} of {score.total} questions completed
      </p>
      {score.passed !== null && (
        <div
          className={`practice-outcome ${score.passed ? 'is-passed' : 'is-not-passed'}`}
        >
          <h2>{score.passed ? 'Practice passed' : 'Practice not passed'}</h2>
          <p>
            Passing score: {CIVICS_PASSING_SCORE} of {CIVICS_TEST_COUNT}{' '}
            correct.
          </p>
        </div>
      )}
      <dl className="practice-score">
        <div className="score-percentage">
          <dt>Accuracy</dt>
          <dd>{score.percentage}%</dd>
        </div>
        <div>
          <dt>Correct</dt>
          <dd>{score.correct}</dd>
        </div>
        <div>
          <dt>Incorrect</dt>
          <dd>{score.incorrect}</dd>
        </div>
      </dl>
      <p className="session-note">Your score is only kept for this session.</p>
      <div className="result-actions">
        <button className="button button-primary" onClick={onRestart}>
          Start another practice <Icon name="arrow-right" />
        </button>
        <button className="button button-secondary" onClick={onHome}>
          Home
        </button>
      </div>
    </section>
  )
}

export function PracticeFlow({
  session,
  onStart,
  onAction,
  onHome,
  onRestart,
  starredIds,
  onToggleStar,
}: {
  session: PracticeSession | null
  onStart: (count: number) => void
  onAction: (action: PracticeAction) => void
  onHome: () => void
  onRestart: () => void
  starredIds: readonly string[]
  onToggleStar: (questionId: string) => void
}) {
  const question = session?.questions[session.grades.length]
  const position = session?.grades.length ?? 0
  const isSetup = session === null

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [position, isSetup])

  return (
    <main id="main-content" className="study-main practice-main">
      <div className="study-toolbar">
        {(!session || question) && (
          <button className="text-button" onClick={onHome}>
            <Icon name="arrow-left" />
            {question ? 'End practice' : 'Home'}
          </button>
        )}
        <span className="eyebrow">PRACTICE</span>
      </div>
      {!session ? (
        <PracticeSetup onStart={onStart} />
      ) : !question ? (
        <PracticeResults
          session={session}
          onRestart={onRestart}
          onHome={onHome}
        />
      ) : (
        <section
          className="study-sheet"
          aria-label="Practice question"
          key={question.id}
        >
          <div className="study-position">
            <p>
              Question <strong>{position + 1}</strong> of{' '}
              {session.questions.length}
            </p>
          </div>
          <progress
            className="question-progress"
            value={position + 1}
            max={session.questions.length}
            aria-label="Question position"
          />
          <QuestionContent
            question={question}
            starred={starredIds.includes(question.id)}
            onToggleStar={() => onToggleStar(question.id)}
            revealed={session.revealed}
            onToggleReveal={() =>
              onAction({ type: 'toggle-answer', questionId: question.id })
            }
          />
          {session.revealed && (
            <div
              className="practice-grading"
              role="group"
              aria-label="Grade your answer"
            >
              <p>Was your answer correct?</p>
              <div className="grade-buttons">
                <button
                  className="button grade-incorrect"
                  onClick={() =>
                    onAction({
                      type: 'grade',
                      questionId: question.id,
                      correct: false,
                    })
                  }
                >
                  Incorrect
                </button>
                <button
                  className="button grade-correct"
                  onClick={() =>
                    onAction({
                      type: 'grade',
                      questionId: question.id,
                      correct: true,
                    })
                  }
                >
                  Correct
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
