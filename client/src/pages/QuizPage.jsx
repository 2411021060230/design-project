
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api.js";

export default function QuizPage() {
  const { slug, topicId } = useParams();

  const [challenge, setChallenge] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadChallenge() {
      try {
        setLoading(true);
        setError("");
        setChallenge(null);
        setAnswers({});
        setIndex(0);
        setResult(null);

        const response = await api(
          `/challenges/${encodeURIComponent(topicId)}`
        );

        if (active) {
          setChallenge(response.data.challenge);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadChallenge();

    return () => {
      active = false;
    };
  }, [topicId]);

  function chooseAnswer(choiceIndex) {
    setAnswers((previous) => ({
      ...previous,
      [index]: choiceIndex,
    }));
  }

  async function submitQuiz() {
    if (!challenge || submitting) return;

    const selectedAnswers = challenge.questions.map(
      (_, questionIndex) => answers[questionIndex]
    );

    if (selectedAnswers.some((answer) => answer === undefined)) {
      setError("Please answer every question.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api(
        `/challenges/${encodeURIComponent(challenge.id)}/attempt`,
        {
          method: "POST",
          body: {
            answers: selectedAnswers,
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function retryQuiz() {
    setAnswers({});
    setIndex(0);
    setResult(null);
    setError("");
  }

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (!challenge) {
    return (
      <section className="card">
        <p className="notice error">{error || "Challenge not found."}</p>
        <Link to={`/subjects/${slug}`}>Back to challenges</Link>
      </section>
    );
  }

  if (result) {
    const percentage = Math.round(
      (result.score / result.total) * 100
    );

    return (
      <section className="quiz-wrap">
        <motion.div
          className="card result-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2>Quiz Completed!</h2>

          <h1>{percentage}%</h1>

          <p>
            Correct Answers: {result.score} / {result.total}
          </p>

          <p>XP Earned: {result.xpEarned}</p>
          <p>Total XP: {result.totalXp}</p>
          <p>Current Level: {result.level}</p>

          {result.newBadges?.length > 0 && (
            <div>
              <h3>New Badges</h3>
              {result.newBadges.map((badge, i) => (
                <p key={i}>
                  {typeof badge === "string"
                    ? badge
                    : badge.name || badge.code}
                </p>
              ))}
            </div>
          )}

          <h3>Answer Review</h3>

          <ol className="review-list">
            {result.review.map((review, i) => (
              <li
                key={i}
                className={review.isCorrect ? "right" : "wrong"}
              >
                <strong>
                  {challenge.questions[i].text}
                </strong>

                <p>
                  Your Answer:{" "}
                  {challenge.questions[i].options[review.yourIndex]}
                </p>

                <p>
                  {review.isCorrect
                    ? "Correct!"
                    : `Correct Answer: ${
                        challenge.questions[i].options[
                          review.correctIndex
                        ]
                      }`}
                </p>

                {review.explanation && (
                  <p className="hint">{review.explanation}</p>
                )}
              </li>
            ))}
          </ol>

          <div className="nav-row">
            <button className="primary" onClick={retryQuiz}>
              Try Again
            </button>

            <Link className="tab btn" to={`/subjects/${slug}`}>
              Back to Challenges
            </Link>

            <Link className="tab btn" to="/">
              Dashboard
            </Link>
          </div>
        </motion.div>
      </section>
    );
  }

  const questions = challenge.questions;
  const current = questions[index];

  const allAnswered = questions.every(
    (_, questionIndex) => answers[questionIndex] !== undefined
  );

  return (
    <section className="quiz-wrap">
      <div className="card">
        <Link to={`/subjects/${slug}`} className="link-back">
          ← Back to Challenges
        </Link>

        <h2>{challenge.title}</h2>
        <p className="hint">{challenge.description}</p>

        <p>
          Question {index + 1} of {questions.length}
        </p>

        <div className="quiz-progress">
          <motion.div
            className="quiz-progress-fill"
            animate={{
              width: `${((index + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <h3>{current.text}</h3>

        <div className="choices">
          {current.options.map((option, choiceIndex) => (
            <button
              key={choiceIndex}
              type="button"
              className={
                answers[index] === choiceIndex
                  ? "choice-btn selected"
                  : "choice-btn"
              }
              onClick={() => chooseAnswer(choiceIndex)}
            >
              {option}
            </button>
          ))}
        </div>

        {error && <p className="notice error">{error}</p>}

        <div className="nav-row">
          <button
            className="tab"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            Previous
          </button>

          {index < questions.length - 1 ? (
            <button
              className="primary"
              onClick={() => setIndex((i) => i + 1)}
            >
              Next
            </button>
          ) : (
            <button
              className="primary"
              disabled={!allAnswered || submitting}
              onClick={submitQuiz}
            >
              {submitting ? "Submitting..." : "Submit Answers"}
            </button>
          )}
        </div>

        {!allAnswered && index === questions.length - 1 && (
          <p className="hint">
            Answer all questions before submitting.
          </p>
        )}
      </div>
    </section>
  );
}
