
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Trophy } from "lucide-react";
import { api } from "../api.js";

export default function SubjectPage() {
  const { slug } = useParams();

  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const subject = {
    physics: "Physics",
    chemistry: "Chemistry",
    biology: "Biology",
    maths: "Maths",
  }[slug];

  useEffect(() => {
    if (!subject) {
      setError("Subject not found.");
      setLoading(false);
      return;
    }

    let active = true;

    async function loadChallenges() {
      try {
        setLoading(true);
        setError("");

        const response = await api(
          `/challenges?subject=${encodeURIComponent(subject)}`
        );

        if (active) {
          setChallenges(response.data.challenges || []);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadChallenges();

    return () => {
      active = false;
    };
  }, [subject]);

  if (loading) {
    return <div className="loading">Loading challenges...</div>;
  }

  if (error) {
    return (
      <section className="card">
        <p className="notice error">{error}</p>
        <Link to="/">Back to Dashboard</Link>
      </section>
    );
  }

  return (
    <>
      <section className="card">
        <Link to="/" className="link-back">
          ← Back to Dashboard
        </Link>

        <h1>{subject}</h1>
        <p className="hint">
          Complete challenges to earn XP and unlock badges.
        </p>
      </section>

      <section className="card">
        <h2>Available Challenges</h2>

        {challenges.length === 0 ? (
          <p className="hint">
            No challenges available for this subject yet.
          </p>
        ) : (
          <div className="subject-grid">
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                className="card"
                whileHover={{ y: -3 }}
              >
                <BookOpen size={24} />

                <h3>{challenge.title}</h3>

                <p className="hint">
                  {challenge.description}
                </p>

                <p>Grade: {challenge.grade}</p>
                <p>Difficulty: {challenge.difficulty}</p>
                <p>Questions: {challenge.questionCount}</p>

                <p>
                  <Trophy size={16} />
                  {" "}{challenge.xpReward} XP available
                </p>

                {challenge.bestPercent !== null && (
                  <p>
                    Best Score: {challenge.bestPercent}%
                  </p>
                )}

                <Link
                  className="primary btn"
                  to={`/subjects/${slug}/topics/${challenge.id}`}
                >
                  Start Challenge
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
