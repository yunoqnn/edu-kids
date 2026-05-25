/** XP required to reach a given level (level 1 = 100, level 2 = 200, ...) */
export function xpForLevel(level: number): number {
  return level * 100
}

/** Total XP required to have reached the START of a given level */
export function totalXpForLevel(level: number): number {
  /* sum of 100 + 200 + ... + (level-1)*100 */
  return ((level - 1) * level * 100) / 2
}

/** Given total accumulated XP, return the current level */
export function levelFromXp(xpTotal: number): number {
  let level = 1
  while (xpTotal >= totalXpForLevel(level + 1)) {
    level++
  }
  return level
}

/** XP into current level and XP needed for next level */
export function xpProgress(xpTotal: number): {
  level: number
  xpIntoLevel: number
  xpNeeded: number
  pct: number
} {
  const level = levelFromXp(xpTotal)
  const start = totalXpForLevel(level)
  const needed = xpForLevel(level)     /* xp span of current level */
  const into = xpTotal - start
  return { level, xpIntoLevel: into, xpNeeded: needed, pct: Math.min(into / needed, 1) * 100 }
}

/** XP reward for an exercise with N questions */
export function xpRewardForQuestions(questionCount: number): number {
  return questionCount * 10
}

/** Stars reward for an exercise with N questions (1 star per question) */
export function starsRewardForQuestions(questionCount: number): number {
  return questionCount
}
