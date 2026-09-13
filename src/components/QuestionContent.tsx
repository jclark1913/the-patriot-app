import { useEffect, useRef } from 'react'
import type { CivicsQuestion } from '../data'
import { AnswerPanel } from './AnswerPanel'
import { Icon } from './Icon'

export function QuestionContent({
  question,
  revealed,
  onToggleReveal,
}: {
  question: CivicsQuestion
  revealed: boolean
  onToggleReveal: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [question.id])

  return (
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
        onClick={onToggleReveal}
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
  )
}
