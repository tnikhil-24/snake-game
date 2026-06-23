import { useEffect, useRef, useState } from 'react'
import {
  COLS,
  ROWS,
  CELL_SIZE,
  COLORS,
  HIGH_SCORE_KEY,
  tickIntervalForScore,
} from '../game/constants'
import { createInitialState, nextDirection, step, DIRECTIONS } from '../game/engine'
import './SnakeGame.css'

const KEY_DIRECTIONS = {
  ArrowUp: DIRECTIONS.UP,
  ArrowDown: DIRECTIONS.DOWN,
  ArrowLeft: DIRECTIONS.LEFT,
  ArrowRight: DIRECTIONS.RIGHT,
  w: DIRECTIONS.UP,
  s: DIRECTIONS.DOWN,
  a: DIRECTIONS.LEFT,
  d: DIRECTIONS.RIGHT,
}

const CANVAS_WIDTH = COLS * CELL_SIZE
const CANVAS_HEIGHT = ROWS * CELL_SIZE

function readHighScore() {
  const stored = Number(localStorage.getItem(HIGH_SCORE_KEY))
  return Number.isFinite(stored) ? stored : 0
}

function generatePid() {
  return 1000 + Math.floor(Math.random() * 9000)
}

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const gameStateRef = useRef(createInitialState())
  const queuedDirectionRef = useRef(null)
  const phaseRef = useRef('start')
  const tickTimeoutRef = useRef(null)
  const actionsRef = useRef(null)

  const [phase, setPhase] = useState('start')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(readHighScore)
  const [pid, setPid] = useState(generatePid)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  function clearTick() {
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current)
      tickTimeoutRef.current = null
    }
  }

  function scheduleTick() {
    const delay = tickIntervalForScore(gameStateRef.current.score)
    tickTimeoutRef.current = setTimeout(() => {
      const current = gameStateRef.current
      const direction = nextDirection(current.direction, queuedDirectionRef.current)
      queuedDirectionRef.current = null
      const result = step({ ...current, direction })
      gameStateRef.current = result

      if (result.gameOver) {
        setPhase('gameover')
        setHighScore((prev) => {
          if (result.score <= prev) return prev
          localStorage.setItem(HIGH_SCORE_KEY, String(result.score))
          return result.score
        })
        return
      }

      setScore(result.score)
      scheduleTick()
    }, delay)
  }

  function startGame() {
    clearTick()
    gameStateRef.current = createInitialState()
    queuedDirectionRef.current = null
    setScore(0)
    setPid(generatePid())
    setPhase('playing')
    scheduleTick()
  }

  function pauseGame() {
    clearTick()
    setPhase('paused')
  }

  function resumeGame() {
    setPhase('playing')
    scheduleTick()
  }

  useEffect(() => clearTick, [])

  actionsRef.current = { startGame, pauseGame, resumeGame }

  useEffect(() => {
    function onKeyDown(e) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const { startGame: start, pauseGame: pause, resumeGame: resume } = actionsRef.current

      if (key === ' ') {
        e.preventDefault()
        if (phaseRef.current === 'start' || phaseRef.current === 'gameover') start()
        return
      }

      if (key === 'Escape' || key === 'p') {
        if (phaseRef.current === 'playing') pause()
        else if (phaseRef.current === 'paused') resume()
        return
      }

      const direction = KEY_DIRECTIONS[key]
      if (direction) {
        e.preventDefault()
        if (phaseRef.current === 'playing') queuedDirectionRef.current = direction
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let rafId

    function draw() {
      const { snake, food } = gameStateRef.current
      const blinkOn = Math.floor(performance.now() / 400) % 2 === 0

      ctx.fillStyle = COLORS.bg
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.font = `bold ${CELL_SIZE * 0.55}px "Fira Code", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = food.token.color
      ctx.fillText(
        food.token.text,
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
      )

      snake.forEach((segment, index) => {
        const isHead = index === 0
        if (isHead && phaseRef.current === 'playing' && !blinkOn) return

        const x = segment.x * CELL_SIZE
        const y = segment.y * CELL_SIZE
        ctx.fillStyle = isHead ? COLORS.head : segment.color
        const barWidth = isHead ? 3 : 2
        ctx.fillRect(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.12, barWidth, CELL_SIZE * 0.76)
      })

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="snake-game">
      <div className="snake-game__window" style={{ width: CANVAS_WIDTH }}>
        <div className="snake-game__titlebar">
          <div className="snake-game__dots">
            <span className="snake-game__dot snake-game__dot--red" />
            <span className="snake-game__dot snake-game__dot--yellow" />
            <span className="snake-game__dot snake-game__dot--green" />
          </div>
          <span className="snake-game__path">~/proc/snake.connection</span>
          <span className="snake-game__hud">
            PID {pid} &middot; score {score} &middot; best {highScore}
          </span>
        </div>

        <div className="snake-game__board" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

          {phase === 'start' && (
            <div className="snake-game__overlay">
              <h1>$ ./snake --run</h1>
              <p>arrow keys / wasd to move</p>
              <p>press space to start</p>
            </div>
          )}

          {phase === 'paused' && (
            <div className="snake-game__overlay">
              <h1>process suspended (SIGSTOP)</h1>
              <p>press esc or p to resume</p>
            </div>
          )}

          {phase === 'gameover' && (
            <div className="snake-game__overlay snake-game__overlay--crash">
              <h1>Segmentation fault (core dumped)</h1>
              <p>score: {score}</p>
              <p>best: {highScore}</p>
              <p>press space to restart</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
