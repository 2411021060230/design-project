import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SHOTS_PER_ROUND,
  WIN_HITS,
  flightTime,
  positionAt,
  rangeFor,
  randomTarget,
  scoreShot,
} from "../../game-engine/projectile.js";
import { sfx } from "../../sound.js";

// Motion Lab scene: launch a ball so it lands on the flag.
const WIDTH = 640;
const HEIGHT = 300;
const MARGIN = 28;
const GROUND = HEIGHT - 30;
const WORLD_METRES = 100; // the canvas shows 100 m from left to right
const SCALE = (WIDTH - 2 * MARGIN) / WORLD_METRES;
const HINT_COST = 5;
const HINTS = [
  "The range is found with: range = speed squared x sin(2 x angle) / 9.8. Try the numbers shown on screen.",
  "Range grows with the square of speed. Doubling the speed makes the ball go about four times as far.",
  "For one speed, 45 degrees gives the longest range. Angles that add up to 90, such as 30 and 60, give the same range.",
];

const toX = (metres) => MARGIN + metres * SCALE;
const toY = (metres) => GROUND - metres * SCALE;

// Draws the whole scene: sky, ground, distance markers, flag, cannon, path, ball and landing mark
function drawScene(canvas, { angle, target, ball = null, path = [], landing = null }) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, "#bfe8d6");
  sky.addColorStop(1, "#f3fbf7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, GROUND);

  ctx.fillStyle = "#5b8f5a";
  ctx.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND);

  ctx.fillStyle = "#17322b";
  ctx.font = "12px system-ui, sans-serif";
  for (let m = 0; m <= WORLD_METRES; m += 10) {
    ctx.fillRect(toX(m), GROUND, 1, 6);
    ctx.fillText(String(m), toX(m) - 6, GROUND + 20);
  }

  // Target flag
  ctx.strokeStyle = "#7c2d12";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(toX(target), toY(0));
  ctx.lineTo(toX(target), toY(0) - 46);
  ctx.stroke();
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(toX(target), toY(0) - 46);
  ctx.lineTo(toX(target) + 18, toY(0) - 40);
  ctx.lineTo(toX(target), toY(0) - 34);
  ctx.closePath();
  ctx.fill();

  // Cannon barrel shows the chosen angle
  const theta = (angle * Math.PI) / 180;
  ctx.strokeStyle = "#17322b";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(0));
  ctx.lineTo(toX(0) + 26 * Math.cos(theta), toY(0) - 26 * Math.sin(theta));
  ctx.stroke();

  // Path so far
  ctx.fillStyle = "rgba(15, 118, 110, 0.55)";
  path.forEach((p) => {
    ctx.beginPath();
    ctx.arc(toX(p.x), toY(p.y), 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  if (ball) {
    ctx.fillStyle = "#0f766e";
    ctx.beginPath();
    ctx.arc(toX(ball.x), toY(ball.y), 8, 0, Math.PI * 2);
    ctx.fill();
  }

  if (landing !== null) {
    const x = toX(landing);
    const y = toY(0);
    ctx.strokeStyle = "#b42318";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 6);
    ctx.lineTo(x + 6, y + 6);
    ctx.moveTo(x + 6, y - 6);
    ctx.lineTo(x - 6, y + 6);
    ctx.stroke();
  }
}

// Plain-language feedback after each shot
function feedbackFor(result, landedAt) {
  const off = Math.abs(result.miss).toFixed(1);
  if (result.hit) {
    return {
      type: "good",
      text: `On target! The ball landed ${landedAt.toFixed(1)} m away, ${off} m from the flag. +${result.points} points.`,
    };
  }
  if (result.miss < 0) {
    return {
      type: "bad",
      text: `Too short. It landed ${landedAt.toFixed(1)} m, ${off} m before the flag. Use more speed, or an angle nearer 45 degrees.`,
    };
  }
  return {
    type: "bad",
    text: `Too far. It landed ${landedAt.toFixed(1)} m, ${off} m past the flag. Use less speed.`,
  };
}

export default function MotionLabScene({ difficulty, paused, onScore, onEnd }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const timersRef = useRef([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused; // the animation loop reads this, so pausing freezes the ball

  const [speed, setSpeed] = useState(20);
  const [angle, setAngle] = useState(45);
  const [target, setTarget] = useState(() => randomTarget(difficulty));
  const [shot, setShot] = useState(0);
  const [hits, setHits] = useState(0);
  const [flying, setFlying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [landing, setLanding] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hintsShown, setHintsShown] = useState(0);

  // Timers and the animation loop are cleared when the scene closes, so nothing runs after exit
  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Draw the still scene whenever the settings change and no ball is in the air
  useEffect(() => {
    if (!flying) drawScene(canvasRef.current, { angle, target, landing });
  }, [angle, target, landing, flying]);

  function later(fn, ms) {
    timersRef.current.push(setTimeout(fn, ms));
  }

  function landShot(landedAt, shotTarget) {
    const result = scoreShot(landedAt, shotTarget, difficulty);
    const newShot = shot + 1;
    const newHits = hits + (result.hit ? 1 : 0);

    setLanding(landedAt);
    setFlying(false);
    setFeedback(feedbackFor(result, landedAt));
    setShot(newShot);
    setHits(newHits);
    onScore(result.points);
    if (result.hit) sfx.good();
    else sfx.bad();

    if (newShot >= SHOTS_PER_ROUND) {
      later(() => onEnd(newHits >= WIN_HITS), 1800);
    } else {
      setWaiting(true);
      later(() => {
        setTarget(randomTarget(difficulty));
        setLanding(null);
        setWaiting(false);
      }, 1800);
    }
  }

  function launch() {
    if (flying || waiting || paused || shot >= SHOTS_PER_ROUND) return;
    sfx.click();
    setFlying(true);
    setFeedback(null);
    setLanding(null);

    const shotTarget = target;
    const duration = flightTime(speed, angle);
    const path = [];
    let elapsed = 0;
    let last = performance.now();

    const frame = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current) elapsed += dt;

      const ball = positionAt(speed, angle, Math.min(elapsed, duration));
      path.push(ball);
      drawScene(canvasRef.current, { angle, target: shotTarget, ball, path });

      if (elapsed < duration) {
        frameRef.current = requestAnimationFrame(frame);
      } else {
        landShot(rangeFor(speed, angle), shotTarget);
      }
    };
    frameRef.current = requestAnimationFrame(frame);
  }

  function showHint() {
    if (hintsShown >= HINTS.length) return;
    onScore(-HINT_COST);
    setHintsShown((h) => h + 1);
  }

  const busy = flying || waiting || paused;

  return (
    <div className="motion-lab">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="lab-canvas"
        role="img"
        aria-label="Launch area with the ball path and the target flag"
      />

      <div className="lab-status">
        <span>Shot {Math.min(shot + 1, SHOTS_PER_ROUND)} of {SHOTS_PER_ROUND}</span>
        <span>Hits {hits} (need {WIN_HITS})</span>
        <span>Target: {target} m</span>
      </div>

      <div className="lab-controls">
        <label>
          Speed: <strong>{speed} m/s</strong>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={speed}
            disabled={busy}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
        </label>
        <label>
          Angle: <strong>{angle} degrees</strong>
          <input
            type="range"
            min="5"
            max="85"
            step="1"
            value={angle}
            disabled={busy}
            onChange={(event) => setAngle(Number(event.target.value))}
          />
        </label>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="primary"
          onClick={launch}
          disabled={busy || shot >= SHOTS_PER_ROUND}
        >
          Launch
        </motion.button>
        <button className="tab" onClick={showHint} disabled={busy || hintsShown >= HINTS.length}>
          Hint (-{HINT_COST} points)
        </button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.p
            key={shot}
            className={`feedback ${feedback.type}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {feedback.text}
          </motion.p>
        )}
      </AnimatePresence>

      {hintsShown > 0 && (
        <ul className="hints">
          {HINTS.slice(0, hintsShown).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
