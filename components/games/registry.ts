import type { GameType, GameEngineProps, AnyGameData } from '@/types/games'
import type { ComponentType } from 'react'

import { SimpleQuizEngine }     from './engines/SimpleQuizEngine'
import { DragDropEngine }        from './engines/DragDropEngine'
import { MatchingEngine }        from './engines/MatchingEngine'
import { PatternEngine }         from './engines/PatternEngine'
import { OddOneOutEngine }       from './engines/OddOneOutEngine'
import { MatchstickEngine }      from './engines/MatchstickEngine'
import { CategorySortEngine }    from './engines/CategorySortEngine'
import { SequenceRepeatEngine }  from './engines/SequenceRepeatEngine'
import { ReadRememberEngine }    from './engines/ReadRememberEngine'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const GAME_REGISTRY: Record<GameType, ComponentType<GameEngineProps<any>>> = {
  SIMPLE_QUIZ:     SimpleQuizEngine,
  DRAG_DROP:       DragDropEngine,
  MATCHING:        MatchingEngine,
  PATTERN:         PatternEngine,
  ODD_ONE_OUT:     OddOneOutEngine,
  MATCHSTICK:      MatchstickEngine,  /* hidden in UI, kept for existing data */
  CATEGORY_SORT:   CategorySortEngine,
  SEQUENCE_REPEAT: SequenceRepeatEngine,
  READ_REMEMBER:   ReadRememberEngine,
}

export const GAME_LABELS: Record<GameType, string> = {
  SIMPLE_QUIZ:     'Test',
  DRAG_DROP:       'Drag and Drop',
  MATCHING:        'Matching',
  PATTERN:         'Pattern',
  ODD_ONE_OUT:     'Odd One Out',
  MATCHSTICK:      'Matchstick Puzzle',
  CATEGORY_SORT:   'Category Sort',
  SEQUENCE_REPEAT: 'Sequence Repeat',
  READ_REMEMBER:   'Read and Remember',
}

/* Active game types visible to content creators */
export const ACTIVE_GAME_TYPES: GameType[] = [
  'SIMPLE_QUIZ',
  'DRAG_DROP',
  'MATCHING',
  'PATTERN',
  'ODD_ONE_OUT',
  'CATEGORY_SORT',
  'SEQUENCE_REPEAT',
  'READ_REMEMBER',
]