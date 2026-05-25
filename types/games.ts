export type GameType =
  | 'SIMPLE_QUIZ'
  | 'DRAG_DROP'
  | 'MATCHING'
  | 'PATTERN'
  | 'ODD_ONE_OUT'
  | 'MATCHSTICK'
  | 'CATEGORY_SORT'
  | 'SEQUENCE_REPEAT'
  | 'READ_REMEMBER'

export type MediaType = 'text' | 'image' | 'audio' | 'video'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface MediaContent {
  type: MediaType
  value: string
  alt?: string
}

export interface GameConfig {
  timeLimitSeconds?: number
  shuffleOptions?: boolean
  showInstantFeedback?: boolean
  difficulty?: Difficulty
}

export interface GameResult {
  score: number
  maxScore: number
  correctCount: number
  incorrectCount: number
  timeElapsedSeconds: number
  questionCount: number
}

export interface GameEngineProps<T = unknown> {
  data: T
  config: GameConfig
  onComplete: (result: GameResult) => void
}

export interface QuizOption {
  id: string
  content: MediaContent
  isCorrect: boolean
}

/* ---- SimpleQuiz ---- */

export interface SimpleQuizQuestion {
  question: MediaContent
  options: QuizOption[]
  explanation?: string
}

export interface SimpleQuizData {
  questions: SimpleQuizQuestion[]
}

/* ---- DragDrop ---- */

export interface DragDropItem {
  id: string
  content: MediaContent
}

export interface DragDropZone {
  id: string
  label: MediaContent
  acceptsItemId: string
}

export interface DragDropRound {
  items: DragDropItem[]
  zones: DragDropZone[]
}

export interface DragDropData {
  rounds: DragDropRound[]
}

/* ---- Matching ---- */

export interface MatchingPair {
  id: string
  left: MediaContent
  right: MediaContent
}

export interface MatchingData {
  pairs: MatchingPair[]
}

/* ---- Pattern ---- */

export interface PatternQuestion {
  sequence: MediaContent[]
  missingIndex: number
  options: QuizOption[]
  allowTextInput?: boolean
}

export interface PatternData {
  questions: PatternQuestion[]
}

/* ---- OddOneOut ---- */

export interface OddOneOutQuestion {
  items: Array<{ id: string; content: MediaContent; isOdd: boolean }>
  explanation?: string
}

export interface OddOneOutData {
  questions: OddOneOutQuestion[]
}

/* ---- Matchstick (hidden in UI) ---- */

export interface MatchstickSegmentDef {
  id: string
  x1: number; y1: number; x2: number; y2: number
  active: boolean
  movable: boolean
}

export interface MatchstickData {
  prompt: string
  segments: MatchstickSegmentDef[]
  allowedMoves: number
  solutionSegmentIds: string[]
  hint?: string
}

/* ---- CategorySort ---- */

export interface CategorySortData {
  categories: Array<{ id: string; label: string; color: string }>
  items: Array<{ id: string; content: MediaContent; categoryId: string }>
  timePerItemSeconds: number
}

/* ---- SequenceRepeat ---- */

export interface SequenceRepeatData {
  tileCount: number
  tileColors: string[]
  startLength: number
  maxLength: number
  displaySpeedMs: number
}

/* ---- ReadRemember ---- */

export interface ReadRememberData {
  studyContent: MediaContent
  displayDurationSeconds?: number
  questions: Array<{
    id: string
    questionText: string
    options: Array<{ id: string; text: string; isCorrect: boolean }>
  }>
}

/* ---- Union ---- */

export type AnyGameData =
  | SimpleQuizData
  | DragDropData
  | MatchingData
  | PatternData
  | OddOneOutData
  | MatchstickData
  | CategorySortData
  | SequenceRepeatData
  | ReadRememberData