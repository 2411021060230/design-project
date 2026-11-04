import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { api } from "../api.js";
import AnimatedNumber from "../components/AnimatedNumber.jsx";
import Confetti from "../components/Confetti.jsx";
import { sfx } from "../sound.js";

export default function QuizPage() {
  const { slug, topicId } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({});
  const [hints, setHints] = useState({});
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());

  // Find the topic's challenge, then load its questions
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await api(
          `/challenges?subject=${encodeURIComponent(slug)}&topic=${encodeURIComponent(topicId)}`
        );
        const first = list.data.challenges[0];
        if (!first) throw new Error("This topic has no challenge yet.");
        const detail = await api(`/challenges/${encodeURIComponent(first.id)}`);
        if (active) setChallenge(detail.data.challenge);
      } catch (err) {
        if (active) setLoadError(err.message);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, topicId]);

  if (!challenge) {
    return loadError ? (
      <section className="card">
        <p className="notice error">{loadError}</p>
        <Link to={`/subjects/${slug}`}>Back to topics</Link>
      </section>
    ) : (
      <div className="loading">Loading the challenge...</div>
    );
  }

  const questions = challenge.questions;
  const current = questions[index];
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  function choose(choiceIndex) {
    sfx.click();
    setAnswers((previous) => ({ ...previous, [current.id]: choiceIndex }));
  }

  function go(step) {
    setDirection(step);
    setIndex((i) => Math.min(questions.length - 1, Math.max(0, i + step)));
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await api("/attempts", {
        method: "POST",
        body: {
          challengeId: challenge.id,
          answers: questions.map((q) => ({ questionId: q.id, selectedIndex: answers[q.id] })),
          hintsUsed: Object.keys(hints).length,
          durationSeconds: Math.min(86400, Math.round((Date.now() - startedAt.current) / 1000)),
        },
      });
      setResult(response);
      if (response.data.attempt.passed) sfx.win();
      else sfx.bad();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setHints({});
    setIndex(0);
    setResult(null);
    startedAt.current = Date.now();
  }

  if (result) {
    return <ResultView response={result} slug={slug} onRetry={retry} />;
  }

  return (
    <section className="quiz-wrap">
      <div className="card">
        <Link to={`/subjects/${slug}`} className="link-back">← Back to topics</Link>
        <h2>{challenge.title}</h2>
        <p className="hint">{challenge.description}</p>

        <div className="quiz-progress">
          <motion.div
            className="quiz-progress-fill"
            animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="hint">Question {index + 1} of {questions.length}</p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            className="question-card"
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25 }}
          >
            <h3>{current.prompt}</h3>
            <div className="choices">
              {current.choices.map((choice, j) => (
                <motion.button
                  key={j}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={answers[current.id] === j ? "choice-btn selected" : "choice-btn"}
                  onClick={() => choose(j)}
                >
                  {choice}
                </motion.button>
              ))}
            </div>

            {hints[current.id] ? (
              <motion.p className="hint-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Hint: {current.hint}
              </motion.p>
            ) : (
              <button
                className="link"
                onClick={() => setHints((h) => ({ ...h, [current.id]: true }))}
              >
                <Lightbulb size={16} /> Show hint
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && <p className="notice error">{submitError}</p>}

        <div className="nav-row">
          <button className="tab" onClick={() => go(-1)} disabled={index === 0}>
            Previous
          </button>
          {index < questions.length - 1 ? (
            <button className="primary" onClick={() => go(1)}>Next</button>
          ) : (
            <button className="primary" onClick={submit} disabled={!allAnswered || submitting}>
              {submitting ? "Submitting..." : "Submit answers"}
            </button>
          )}
        </div>
        {index === questions.length - 1 && !allAnswered && (
          <p className="hint">Answer every question before you submit.</p>
        )}
      </div>
    </section>
  );
}

function ResultView({ response, slug, onRetry }) {
  const attempt = response.data.attempt;
  const badges = response.data.newBadges || [];

  return (
    <section className="quiz-wrap">
      {attempt.passed && <Confetti />}

      <motion.div
        className="card result-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
      >
        <h2>{attempt.passed ? "Well done!" : "Keep going"}</h2>
        <p className="big-score">
          <AnimatedNumber value={attempt.percent} />%
        </p>
        <p>{attempt.correctCount} of {attempt.totalQuestions} correct</p>
        <p className={`notice ${attempt.passed ? "ok" : "error"}`}>{response.message}</p>
        <p>
          XP earned <strong><AnimatedNumber value={attempt.xpAwarded} /></strong> · Points earned{" "}
          <strong><AnimatedNumber value={attempt.pointsAwarded} /></strong>
        </p>
        {badges.length > 0 && <p>New badges: <strong>{badges.map((b) => b.name).join(", ")}</strong></p>}
        <div className="nav-row">
          <button className="primary" onClick={onRetry}>Try again</button>
          <Link className="tab btn" to={`/subjects/${slug}`}>Back to topics</Link>
        </div>
      </motion.div>

      <div className="card">
        <h3>Review</h3>
        <ol className="review-list">
          {response.data.review.map((item, i) => (
            <li key={item.questionId} className={item.isCorrect ? "right" : "wrong"}>
              <strong>{i + 1}. {item.prompt}</strong>
              <p>
                {item.isCorrect ? "Correct." : "Not quite."} Your answer:{" "}
                {item.selectedIndex === null ? "no answer" : item.choices[item.selectedIndex]}
              </p>
              {!item.isCorrect && (
                <>
                  <p>Correct answer: <strong>{item.choices[item.correctIndex]}</strong></p>
                  <p className="hint">{item.explanation}</p>
                </>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
