import { COLS, ROWS, STATUS_CODES, DEFAULT_SEGMENT_COLOR } from './constants'

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

function isOpposite(a, b) {
  return a.x === -b.x && a.y === -b.y
}

function randomEmptyCell(occupied) {
  let cell
  do {
    cell = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (occupied.some((seg) => seg.x === cell.x && seg.y === cell.y))
  return cell
}

export function spawnFood(snake) {
  const cell = randomEmptyCell(snake)
  const token = STATUS_CODES[Math.floor(Math.random() * STATUS_CODES.length)]
  return { ...cell, token }
}

export function createInitialState() {
  const startY = Math.floor(ROWS / 2)
  const startX = Math.floor(COLS / 2)
  const snake = [
    { x: startX, y: startY, color: DEFAULT_SEGMENT_COLOR },
    { x: startX - 1, y: startY, color: DEFAULT_SEGMENT_COLOR },
    { x: startX - 2, y: startY, color: DEFAULT_SEGMENT_COLOR },
  ]
  return {
    snake,
    direction: DIRECTIONS.RIGHT,
    food: spawnFood(snake),
    score: 0,
  }
}

export function nextDirection(current, requested) {
  if (!requested || isOpposite(current, requested)) return current
  return requested
}

export function step(state) {
  const { snake, direction, food, score } = state
  const head = snake[0]
  const newHead = { x: head.x + direction.x, y: head.y + direction.y, color: head.color }

  const hitWall = newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS
  if (hitWall) {
    return { ...state, gameOver: true }
  }

  const willGrow = newHead.x === food.x && newHead.y === food.y
  if (willGrow) newHead.color = food.token.color
  const bodyToCheck = willGrow ? snake : snake.slice(0, -1)
  const hitSelf = bodyToCheck.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
  if (hitSelf) {
    return { ...state, gameOver: true }
  }

  const newSnake = [newHead, ...snake]
  if (!willGrow) newSnake.pop()

  return {
    snake: newSnake,
    direction,
    food: willGrow ? spawnFood(newSnake) : food,
    score: willGrow ? score + 1 : score,
    gameOver: false,
  }
}
