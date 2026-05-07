import type { GameType, GameEngineProps, AnyGameData } from '@/types/games'
import type { ComponentType } from 'react'

import { SimpleQuizEngine }    from './engines/SimpleQuizEngine'
import { DragDropEngine }      from './engines/DragDropEngine'
import { MatchingEngine }      from './engines/MatchingEngine'
import { PatternEngine }       from './engines/PatternEngine'
import { OddOneOutEngine }     from './engines/OddOneOutEngine'
import { MatchstickEngine }    from './engines/MatchstickEngine'
import { CategorySortEngine }  from './engines/CategorySortEngine'
import { SequenceRepeatEngine } from './engines/SequenceRepeatEngine'
import { SoundMemoryEngine }   from './engines/SoundMemoryEngine'
import { ReadRememberEngine }  from './engines/ReadRememberEngine'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GAME_REGISTRY: Record<GameType, ComponentType<GameEngineProps<any>>> = {
  SIMPLE_QUIZ:     SimpleQuizEngine,
  DRAG_DROP:       DragDropEngine,
  MATCHING:        MatchingEngine,
  PATTERN:         PatternEngine,
  ODD_ONE_OUT:     OddOneOutEngine,
  MATCHSTICK:      MatchstickEngine,
  CATEGORY_SORT:   CategorySortEngine,
  SEQUENCE_REPEAT: SequenceRepeatEngine,
  SOUND_MEMORY:    SoundMemoryEngine,
  READ_REMEMBER:   ReadRememberEngine,
}

export const GAME_LABELS: Record<GameType, string> = {
  SIMPLE_QUIZ:     'Энгийн асуулт',
  DRAG_DROP:       'Чирж тавих',
  MATCHING:        'Хос тааруулах',
  PATTERN:         'Дараалал',
  ODD_ONE_OUT:     'Өөр нэгийг ол',
  MATCHSTICK:      'Шүдэнзний бодлого',
  CATEGORY_SORT:   'Ангилаарай',
  SEQUENCE_REPEAT: 'Дараалал давтах',
  SOUND_MEMORY:    'Дуу санах',
  READ_REMEMBER:   'Уншиж санаарай',
}
