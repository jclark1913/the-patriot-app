export interface CivicsQuestion {
  id: string
  number: number
  question: string
  acceptedAnswers: string[]
  category: string
  answerType: 'static' | 'current' | 'location-dependent'
  answerKey?: string
  /** Number of facts requested, even when one official example contains them all. */
  requiredAnswers: number
  sourceUrl: string
  notes?: string[]
}

export interface AnswerOverride {
  answers: string[]
  status: 'verified' | 'unresolved'
  verifiedOn: string | null
  sourceUrl: string
  location?: string
  guidance?: string
}
