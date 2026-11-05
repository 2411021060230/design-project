import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Lock } from "lucide-react";
import { api } from "../api.js";
import { GAMES } from "../games/registry.js";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } };

export default function SubjectPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    setError("");
    api(`/subjects/${encodeURIComponent(slug)}/topics`)
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) return <section className="card"><p className="notice error">{error}</p><Link to="/">Back to home</Link></section>;
  if (!data) return <div className="loading">Loading topics...</div>;

  const { subject, topics } = data;
  const games = Object.values(GAMES).filter((game) => game.subject === slug);

  return (
    <>
      <section className={`card subject-header subject-${subject.slug}`}>
        <Link to="/" className="link-back">← Back to home</Link>
        <h1>{subject.name}</h1>
        <p className="hint">{subject.description}</p>
      </section>

      <section className="card">
        <h2>Topics</h2>
        <motion.ol className="topic-list" variants={container} initial="hidden" animate="show">
          {topics.map((topic) => {
            const locked = topic.status === "locked";
            return (
              <motion.li key={topic.id} variants={item} className={`topic-card ${topic.status}`}>
                <div>
                  <h3>{topic.title}</h3>
                  <p className="hint">{topic.world} · {topic.description}</p>
                  {topic.status === "completed" && <span className="done">Completed</span>}
                  {locked && (
                    <p className="lock">
                      <Lock size={14} /> {topic.lockedReason}
                    </p>
                  )}
                </div>
                {!locked && (
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Link className="primary btn" to={`/subjects/${slug}/topics/${topic.id}`}>
                      {topic.status === "completed" ? "Play again" : "Start"}
                    </Link>
                  </motion.div>
                )}
              </motion.li>
            );
          })}
        </motion.ol>
      </section>

      <section className="card">
        <h2>Games</h2>
        {games.length === 0 ? (
          <p className="hint">No games in this subject yet.</p>
        ) : (
          <div className="game-list">
            {games.map((game) => (
              <motion.div key={game.id} whileHover={{ y: -3 }}>
                <Link to={`/games/${game.id}`} className="game-card">
                  <Gamepad2 size={26} />
                  <strong>{game.title}</strong>
                  <span className="hint">{game.tagline}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
