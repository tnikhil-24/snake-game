export const COLS = 28
export const ROWS = 20
export const CELL_SIZE = 24

export const BASE_TICK_MS = 140
export const TICK_STEP_MS = 4
export const MIN_TICK_MS = 60

export const COLORS = {
  bg: '#2e3440',
  border: '#434c5e',
  text: '#d8dee9',
  textMuted: '#4c566a',
  head: '#88c0d0',
}

export const DEFAULT_SEGMENT_COLOR = COLORS.textMuted

export const STATUS_CODES = [
  { text: '200', color: '#a3be8c' },
  { text: '201', color: '#a3be8c' },
  { text: '204', color: '#a3be8c' },
  { text: '301', color: '#ebcb8b' },
  { text: '302', color: '#ebcb8b' },
  { text: '304', color: '#ebcb8b' },
  { text: '400', color: '#d08770' },
  { text: '403', color: '#d08770' },
  { text: '404', color: '#d08770' },
  { text: '429', color: '#d08770' },
  { text: '500', color: '#bf616a' },
  { text: '502', color: '#bf616a' },
  { text: '503', color: '#bf616a' },
]

export function tickIntervalForScore(score) {
  return Math.max(MIN_TICK_MS, BASE_TICK_MS - score * TICK_STEP_MS)
}

export const HIGH_SCORE_KEY = 'code-snake-high-score'
