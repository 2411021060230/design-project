import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, Target, Trophy, X } from "lucide-react";
import AnimatedNumber from "../../components/AnimatedNumber.jsx";
import Confetti from "../../components/Confetti.jsx";
import { playTone, sfx } from "../../sound.js";

// The shared game frame. Every game uses it, so the controls always work the same way.
// Phases: intro -> countdown -> playing (or paused) -> won or lost.
const DIFFICULTIES = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export default function GameShell({ game, onExit }) {
  const [phase, setPhase] = useState("intro");
  const [difficulty, setDifficulty] = useState("beginner");
  const [count, setCount] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0); // changing this restarts the game scene from scratch
  const [timeLeft, setTimeLeft] = useState(null);

  const limit = game.timeLimit?.[difficulty] ?? null;
  const Scene = game.Scene;

  // Countdown: 3, 2, 1, then play
  useEffect(() => {
    if (phase !== "countdown") return undefined;
    if (count === 0) {
      setPhase("playing");
      return undefined;
    }
    playTone(520, 0.1);
    const timer = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(timer);
  }, [phase, count]);

  // Round clock. It stops while the game is paused.
  useEffect(() => {
    if (phase !== "playing" || timeLeft === null) return undefined;
    if (timeLeft <= 0) {
      setPhase("lost");
      return undefined;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  // Victory and game-over sounds
  useEffect(() => {
    if (phase === "won") sfx.win();
    if (phase === "lost") sfx.bad();
  }, [phase]);

  function startRound() {
    setScore(0);
    setTimeLeft(limit);
    setCount(3);
    setPhase("countdown");
  }

  function restart() {
    setRound((r) => r + 1);
    startRound();
  }

  // Scores can go up or down (hints cost points), but never below zero
  function onScore(points) {
    setScore((s) => Math.max(0, s + points));
  }

  function onEnd(won) {
    setPhase(won ? "won" : "lost");
  }

  const running = phase === "playing" || phase === "paused" || phase === "countdown";

  return (
    <div className="game">
      <header className="game-header">
        <div className="game-title">
          <h1>{game.title}</h1>
          <p className="hint">{game.tagline}</p>
        </div>
        <div className="game-stats">
          <div className="pill">
            <Trophy size={16} /> Score <strong><AnimatedNumber value={score} /></strong>
          </div>
          {limit !== null && running && <div className="pill">Time {timeLeft ?? limit}s</div>}
        </div>
        <div className="game-controls">
          {phase === "playing" && (
            <button className="icon-btn" aria-label="Pause" onClick={() => setPhase("paused")}>
              <Pause size={18} />
            </button>
          )}
          {phase === "paused" && (
            <button className="icon-btn" aria-label="Resume" onClick={() => setPhase("playing")}>
              <Play size={18} />
            </button>
          )}
          <button className="icon-btn" aria-label="Restart" onClick={restart}>
            <RotateCcw size={18} />
          </button>
          <button className="icon-btn" aria-label="Exit game" onClick={onExit}>
            <X size={18} />
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.section
            key="intro"
            className="card intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <h2><Target size={20} /> Objectives</h2>
            <ul>
              {game.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>

            <h3>Choose a level</h3>
            <div className="difficulty">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  className={difficulty === d.id ? "tab active" : "tab"}
                  onClick={() => setDifficulty(d.id)}
                >
                  {d.label}
                  {game.timeLimit?.[d.id] ? ` (${game.timeLimit[d.id]}s)` : ""}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="primary big-btn"
              onClick={startRound}
            >
              Start game
            </motion.button>
            <p className="hint">
              Scores are shown here but not saved to your account yet. Saving game results comes with the game
              session backend.
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {phase !== "intro" && (
        <div className="game-stage">
          <Scene
            key={round}
            difficulty={difficulty}
            paused={phase !== "playing"}
            onScore={onScore}
            onEnd={onEnd}
          />

          {phase === "countdown" && (
            <motion.div
              key={`count-${count}`}
              className="countdown"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {count > 0 ? count : "Go!"}
            </motion.div>
          )}

          {phase === "paused" && <div className="overlay">Paused</div>}

          {(phase === "won" || phase === "lost") && (
            <>
              {phase === "won" && <Confetti />}
              <motion.section
                className="card result-card"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 16 }}
              >
                <h2>{phase === "won" ? "Victory!" : "Game over"}</h2>
                <p>
                  {limit !== null && timeLeft <= 0 && phase === "lost" ? "Time is up. " : ""}
                  Final score: <strong><AnimatedNumber value={score} /></strong>
                </p>
                <div className="nav-row">
                  <button className="primary" onClick={restart}>Play again</button>
                  <button className="tab" onClick={() => setPhase("intro")}>Change level</button>
                  <button className="tab" onClick={onExit}>Exit</button>
                </div>
              </motion.section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
