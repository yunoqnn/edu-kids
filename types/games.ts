export type GameType =
  | 'SIMPLE_QUIZ'
  | 'DRAG_DROP'
  | 'MATCHING'
  | 'PATTERN'
  | 'ODD_ONE_OUT'
  | 'MATCHSTICK'
  | 'CATEGORY_SORT'
  | 'SEQUENCE_REPEAT'
  | 'SOUND_MEMORY'
  | 'READ_REMEMBER'

export type MediaType = 'text' | 'image' | 'audio'

export interface MediaContent {
  type: MediaType
  value: string
  alt?: string
}

export interface GameConfig {
  timeLimitSeconds?: number
  shuffleOptions?: boolean
  showInstantFeedback?: boolean
}

export interface GameResult {
  score: number
  maxScore: number
  correctCount: number
  incorrectCount: number
  timeElapsedSeconds: number
}

export interface GameEngineProps<T = unknown> {
  data: T
  config: GameConfig
  onComplete: (result: GameResult) => void
}

/* ---- Per-game data shapes ---- */

export interface QuizOption {
  id: string
  content: MediaContent
  isCorrect: boolean
}

export interface SimpleQuizData {
  question: MediaContent
  options: QuizOption[]
  explanation?: string
}

export interface DragDropItem {
  id: string
  content: MediaContent
}

export interface DragDropZone {
  id: string
  label: MediaContent
  acceptsItemId: string
}

export interface DragDropData {
  items: DragDropItem[]
  zones: DragDropZone[]
}

export interface MatchingPair {
  id: string
  left: MediaContent
  right: MediaContent
}

export interface MatchingData {
  pairs: MatchingPair[]
}

export interface PatternData {
  sequence: MediaContent[]
  missingIndex: number
  options: QuizOption[]
}

export interface OddOneOutData {
  items: Array<{ id: string; content: MediaContent; isOdd: boolean }>
  explanation?: string
}

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

export interface CategorySortData {
  categories: Array<{ id: string; label: string; color: string }>
  items: Array<{ id: string; content: MediaContent; categoryId: string }>
  timePerItemSeconds: number
}

export interface SequenceRepeatData {
  tileCount: number
  tileColors: string[]
  startLength: number
  maxLength: number
  displaySpeedMs: number
}

export interface SoundMemoryData {
  pairs: Array<{
    id: string
    audio: string
    match: MediaContent
  }>
}

export interface ReadRememberData {
  studyContent: MediaContent
  displayDurationSeconds?: number
  questions: Array<{
    id: string
    questionText: string
    options: Array<{ id: string; text: string; isCorrect: boolean }>
  }>
}

export type AnyGameData =
  | SimpleQuizData | DragDropData | MatchingData | PatternData
  | OddOneOutData | MatchstickData | CategorySortData
  | SequenceRepeatData | SoundMemoryData | ReadRememberData