import { answerOverrides } from '../data'
import type { CivicsQuestion } from '../data'
import { Icon } from './Icon'

export function AnswerPanel({ question }: { question: CivicsQuestion }) {
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
