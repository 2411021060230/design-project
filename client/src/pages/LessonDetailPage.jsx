
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";

export default function LessonDetailPage() {
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        setError("");
        setResult(null);
        setAnswers({});
        setRevealed({});

        const response = await api(`/lessons/${lessonId}`);
        setLesson(response.data.lesson);
      } catch (err) {
        setError(err.message || "Failed to load lesson.");
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  async function completeLesson() {
    try {
      setSubmitting(true);
      setError("");

      const response = await api(
        `/lessons/${lessonId}/complete`,
        { method: "POST" }
      );

      setResult(response.data);

      setLesson((previous) => ({
        ...previous,
        completed: true,
      }));
    } catch (err) {
      setError(err.message || "Failed to complete lesson.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Loading lesson...</p>;
  }

  if (!lesson) {
    return <p>{error || "Lesson not found."}</p>;
  }

  return (
    <section className="card">
      <Link to="/lessons">← Back to Lessons</Link>

      <h1>{lesson.title}</h1>
      <p>{lesson.summary}</p>

      <p>
        {lesson.subject} | Grade {lesson.grade} |
        XP Reward: {lesson.xpReward}
      </p>

      {lesson.blocks?.map((block, index) => (
        <div
          key={index}
          className="card"
          style={{
            padding: "16px",
            marginTop: "16px",
          }}
        >
          {block.type === "text" && (
            <>
              <h3>{block.title}</h3>
              <p>{block.body}</p>
            </>
          )}

          {block.type === "check" && (
            <>
              <h3>{block.question}</h3>

              {block.options?.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  style={{
                    display: "block",
                    margin: "8px 0",
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    checked={answers[index] === optionIndex}
                    onChange={() =>
                      setAnswers((previous) => ({
                        ...previous,
                        [index]: optionIndex,
                      }))
                    }
                  />
                  {" "}
                  {option}
                </label>
              ))}

              {answers[index] !== undefined && (
                <p>
                  {answers[index] === block.correctIndex
                    ? "Correct answer!"
                    : "Try again."}
                  {" "}
                  {answers[index] === block.correctIndex &&
                    block.explanation}
                </p>
              )}
            </>
          )}

          {block.type === "reveal" && (
            <>
              <h3>{block.prompt}</h3>

              <button
                type="button"
                onClick={() =>
                  setRevealed((previous) => ({
                    ...previous,
                    [index]: !previous[index],
                  }))
                }
              >
                {revealed[index]
                  ? "Hide Answer"
                  : "Reveal Answer"}
              </button>

              {revealed[index] && (
                <p>{block.answer}</p>
              )}
            </>
          )}

          {block.type === "sim" && (
            <>
              <h3>
                {block.title || "Interactive Simulation"}
              </h3>

              <p>Simulation: {block.sim}</p>

              <p>
                Simulation integration is coming next.
              </p>
            </>
          )}
        </div>
      ))}

      <div style={{ marginTop: "24px" }}>
        {lesson.completed ? (
          <p>Lesson Completed!</p>
        ) : (
          <button
            type="button"
            onClick={completeLesson}
            disabled={submitting}
          >
            {submitting
              ? "Completing..."
              : "Complete Lesson"}
          </button>
        )}
      </div>

      {result && (
        <div
          className="card"
          style={{ marginTop: "16px" }}
        >
          <h2>Lesson Completed!</h2>

          <p>XP Earned: {result.xpEarned}</p>

          <p>Total XP: {result.totalXp}</p>

          <p>Current Level: {result.level}</p>

          {result.newBadges?.length > 0 && (
            <p>
              New Badges:{" "}
              {result.newBadges
                .map((badge) =>
                  typeof badge === "string"
                    ? badge
                    : badge.name ||
                      badge.title ||
                      "Badge"
                )
                .join(", ")}
            </p>
          )}
        </div>
      )}

      {error && (
        <p role="alert">{error}</p>
      )}

      {lesson.challengeId && (
        <p>
          Related quiz available after the lesson.
        </p>
      )}
    </section>
  );
}
