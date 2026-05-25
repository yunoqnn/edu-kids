'use client'

import { useState } from 'react'
import { SimpleQuizEngine }    from '@/components/games/engines/SimpleQuizEngine'
import { DragDropEngine }       from '@/components/games/engines/DragDropEngine'
import { MatchingEngine }       from '@/components/games/engines/MatchingEngine'
import { PatternEngine }        from '@/components/games/engines/PatternEngine'
import { OddOneOutEngine }      from '@/components/games/engines/OddOneOutEngine'
import { CategorySortEngine }   from '@/components/games/engines/CategorySortEngine'
import { SequenceRepeatEngine } from '@/components/games/engines/SequenceRepeatEngine'
import { ReadRememberEngine }   from '@/components/games/engines/ReadRememberEngine'
import { GameResultScreen }     from '@/components/games/core/GameResult'
import type { GameResult }      from '@/types/games'

const SAMPLES = {
  SIMPLE_QUIZ: {
    data: {
      questions: [
        {
          question: { type: 'text' as const, value: 'Монгол улсын нийслэл хот аль нь вэ?' },
          options: [
            { id: '1', content: { type: 'text' as const, value: 'Дархан' },      isCorrect: false },
            { id: '2', content: { type: 'text' as const, value: 'Улаанбаатар' }, isCorrect: true  },
            { id: '3', content: { type: 'text' as const, value: 'Эрдэнэт' },     isCorrect: false },
            { id: '4', content: { type: 'text' as const, value: 'Чойбалсан' },   isCorrect: false },
          ],
          explanation: 'Улаанбаатар нь Монгол улсын нийслэл юм.',
        },
        {
          question: { type: 'text' as const, value: '5 + 3 = ?' },
          options: [
            { id: 'a', content: { type: 'text' as const, value: '6' },  isCorrect: false },
            { id: 'b', content: { type: 'text' as const, value: '7' },  isCorrect: false },
            { id: 'c', content: { type: 'text' as const, value: '8' },  isCorrect: true  },
            { id: 'd', content: { type: 'text' as const, value: '9' },  isCorrect: false },
          ],
        },
      ],
    },
    config: { showInstantFeedback: true, shuffleOptions: false },
  },

  DRAG_DROP: {
    data: {
      rounds: [
        {
          items: [
            { id: 'i1', content: { type: 'text' as const, value: 'Нохой' } },
            { id: 'i2', content: { type: 'text' as const, value: 'Муур' } },
            { id: 'i3', content: { type: 'text' as const, value: 'Загас' } },
          ],
          zones: [
            { id: 'z1', label: { type: 'text' as const, value: 'Гэрийн тэжээвэр' }, acceptsItemId: 'i1' },
            { id: 'z2', label: { type: 'text' as const, value: 'Муурлаг' },          acceptsItemId: 'i2' },
            { id: 'z3', label: { type: 'text' as const, value: 'Усны амьтан' },      acceptsItemId: 'i3' },
          ],
        },
        {
          items: [
            { id: 'j1', content: { type: 'text' as const, value: 'Алим' } },
            { id: 'j2', content: { type: 'text' as const, value: 'Морь' } },
          ],
          zones: [
            { id: 'w1', label: { type: 'text' as const, value: 'Жимс' },   acceptsItemId: 'j1' },
            { id: 'w2', label: { type: 'text' as const, value: 'Амьтан' }, acceptsItemId: 'j2' },
          ],
        },
      ],
    },
    config: {},
  },

  MATCHING: {
    data: {
      pairs: [
        { id: 'p1', left: { type: 'text' as const, value: '1 + 1' }, right: { type: 'text' as const, value: '2' } },
        { id: 'p2', left: { type: 'text' as const, value: '2 + 3' }, right: { type: 'text' as const, value: '5' } },
        { id: 'p3', left: { type: 'text' as const, value: '4 + 4' }, right: { type: 'text' as const, value: '8' } },
        { id: 'p4', left: { type: 'text' as const, value: '3 + 6' }, right: { type: 'text' as const, value: '9' } },
      ],
    },
    config: { timeLimitSeconds: 60 },
  },

  PATTERN: {
    data: {
      questions: [
        {
          sequence: [
            { type: 'text' as const, value: '2' },
            { type: 'text' as const, value: '4' },
            { type: 'text' as const, value: '?' },
            { type: 'text' as const, value: '8' },
            { type: 'text' as const, value: '10' },
          ],
          missingIndex: 2,
          options: [
            { id: 'o1', content: { type: 'text' as const, value: '5' }, isCorrect: false },
            { id: 'o2', content: { type: 'text' as const, value: '6' }, isCorrect: true  },
            { id: 'o3', content: { type: 'text' as const, value: '7' }, isCorrect: false },
            { id: 'o4', content: { type: 'text' as const, value: '3' }, isCorrect: false },
          ],
          allowTextInput: true,
        },
      ],
    },
    config: {},
  },

  ODD_ONE_OUT: {
    data: {
      questions: [
        {
          items: [
            { id: 'x1', content: { type: 'text' as const, value: 'Алим' },    isOdd: false },
            { id: 'x2', content: { type: 'text' as const, value: 'Банана' },  isOdd: false },
            { id: 'x3', content: { type: 'text' as const, value: 'Морковь' }, isOdd: true  },
            { id: 'x4', content: { type: 'text' as const, value: 'Үзэм' },   isOdd: false },
          ],
          explanation: 'Морковь нь хүнсний ногоо, бусад нь жимс.',
        },
        {
          items: [
            { id: 'y1', content: { type: 'text' as const, value: 'Нохой' }, isOdd: false },
            { id: 'y2', content: { type: 'text' as const, value: 'Муур' },  isOdd: false },
            { id: 'y3', content: { type: 'text' as const, value: 'Загас' }, isOdd: false },
            { id: 'y4', content: { type: 'text' as const, value: 'Машин' }, isOdd: true  },
          ],
          explanation: 'Машин нь амьд биш.',
        },
      ],
    },
    config: {},
  },

  CATEGORY_SORT: {
    data: {
      categories: [
        { id: 'c1', label: 'Амьтан',  color: '#F26A6A' },
        { id: 'c2', label: 'Ургамал', color: '#7DD3A7' },
        { id: 'c3', label: 'Хоол',    color: '#FFC93C' },
      ],
      items: [
        { id: 'it1', content: { type: 'text' as const, value: 'Нохой' },   categoryId: 'c1' },
        { id: 'it2', content: { type: 'text' as const, value: 'Цэцэг' },   categoryId: 'c2' },
        { id: 'it3', content: { type: 'text' as const, value: 'Будаа' },   categoryId: 'c3' },
        { id: 'it4', content: { type: 'text' as const, value: 'Баавгай' }, categoryId: 'c1' },
        { id: 'it5', content: { type: 'text' as const, value: 'Мод' },     categoryId: 'c2' },
        { id: 'it6', content: { type: 'text' as const, value: 'Талх' },    categoryId: 'c3' },
      ],
      timePerItemSeconds: 6,
    },
    config: { timeLimitSeconds: 60 },
  },

  SEQUENCE_REPEAT: {
    data: {
      tileCount: 4,
      tileColors: ['#F26A6A', '#7CC5F2', '#7DD3A7', '#FFC93C'],
      startLength: 2,
      maxLength: 8,
      displaySpeedMs: 700,
    },
    config: {},
  },

  READ_REMEMBER: {
    data: {
      studyContent: {
        type: 'text' as const,
        value: 'Монгол улс нь Төв Азид оршдог. Нийслэл нь Улаанбаатар хот юм. Монгол улсын далбааны өнгө нь улаан, цэнхэр, улаан гурван зурвас бөгөөд дунд нь соёмбо байдаг.',
      },
      displayDurationSeconds: 0,
      questions: [
        {
          id: 'q1',
          questionText: 'Монгол улс хаана оршдог вэ?',
          options: [
            { id: 'a1', text: 'Зүүн Азид',  isCorrect: false },
            { id: 'a2', text: 'Төв Азид',   isCorrect: true  },
            { id: 'a3', text: 'Өмнөд Азид', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          questionText: 'Монгол улсын нийслэл хот?',
          options: [
            { id: 'b1', text: 'Дархан',      isCorrect: false },
            { id: 'b2', text: 'Улаанбаатар', isCorrect: true  },
            { id: 'b3', text: 'Эрдэнэт',     isCorrect: false },
          ],
        },
      ],
    },
    config: {},
  },
}

type GameKey = keyof typeof SAMPLES

const LABELS: Record<GameKey, string> = {
  SIMPLE_QUIZ:     '1. Энгийн асуулт',
  DRAG_DROP:       '2. Чирж тавих',
  MATCHING:        '3. Хос тааруулах',
  PATTERN:         '4. Дараалал',
  ODD_ONE_OUT:     '5. Өөр нэгийг ол',
  CATEGORY_SORT:   '6. Ангилаарай',
  SEQUENCE_REPEAT: '7. Дараалал давтах',
  READ_REMEMBER:   '8. Уншиж санаарай',
}

export default function TestPage() {
  const [selected, setSelected] = useState<GameKey | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [key, setKey] = useState(0)

  const handleComplete = (r: GameResult) => setResult(r)
  const handleReset = () => { setResult(null); setKey((k) => k + 1) }
  const handleBack = () => { setSelected(null); setResult(null); setKey((k) => k + 1) }

  if (result && selected) {
    return (
      <GameResultScreen result={result} title={LABELS[selected]} xpEarned={0} starsEarned={0} leveledUp={false} newLevel={1} onPlayAgain={handleReset} />
    )
  }

  if (selected) {
    const s = SAMPLES[selected]
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const props = { key, data: s.data as any, config: s.config, onComplete: handleComplete }
    return (
      <div className="relative">
        <button onClick={handleBack}
          className="fixed top-4 left-4 z-50 bg-stone-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-stone-900 flex items-center gap-2">
          ← Буцах
        </button>
        {selected === 'SIMPLE_QUIZ'     && <SimpleQuizEngine    {...props} />}
        {selected === 'DRAG_DROP'       && <DragDropEngine       {...props} />}
        {selected === 'MATCHING'        && <MatchingEngine        {...props} />}
        {selected === 'PATTERN'         && <PatternEngine         {...props} />}
        {selected === 'ODD_ONE_OUT'     && <OddOneOutEngine       {...props} />}
        {selected === 'CATEGORY_SORT'   && <CategorySortEngine    {...props} />}
        {selected === 'SEQUENCE_REPEAT' && <SequenceRepeatEngine  {...props} />}
        {selected === 'READ_REMEMBER'   && <ReadRememberEngine    {...props} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">Тоглоом тест</h1>
          <p className="text-stone-400 text-sm">Тоглоом сонгоод шалгана уу</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(LABELS) as GameKey[]).map((k) => (
            <button key={k} onClick={() => setSelected(k)}
              className="bg-white border-2 border-stone-200 rounded-2xl p-5 text-left hover:border-violet-400 hover:bg-violet-50 active:scale-95 transition-all">
              <div className="font-bold text-stone-700 text-sm">{LABELS[k]}</div>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-stone-400 mt-6">localhost:3000/test</p>
      </div>
    </div>
  )
}