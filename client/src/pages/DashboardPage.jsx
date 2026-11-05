
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Trophy,
  BookOpen,
  Users,
  Leaf,
  Target,
  Award,
  BarChart3,
} from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import TeacherDashboard from "./TeacherDashboard.jsx";

export default function DashboardPage() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    const [stats, classes] = await Promise.all([
      api("/stats/me"),
      api("/classes"),
    ]);

    setData({
      stats: stats.data,
      classes: classes.data.classes || [],
    });
  }, []);

  useEffect(() => {
    if (isStudent) {
      load().catch((err) => setError(err.message));
    }
  }, [isStudent, load]);

  async function joinClass(event) {
    event.preventDefault();
    setNotice(null);

    try {
      const response = await api("/classes/join", {
        method: "POST",
        body: { joinCode: joinCode.trim() },
      });

      setNotice({
        ok: true,
        text: response.message,
      });

      setJoinCode("");
      await load();
    } catch (err) {
      setNotice({
        ok: false,
        text: err.message,
      });
    }
  }

  if (!isStudent) {
    return <TeacherDashboard />;
  }

  if (error) {
    return <p className="notice error">{error}</p>;
  }

  if (!data) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  const { stats, classes } = data;

  const levelPercent = Math.min(
    100,
    Math.round(
      (stats.xpIntoLevel / stats.xpForNextLevel) * 100
    )
  );

  return (
    <>
      <motion.section
        className="card hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <p className="hint">Welcome back</p>
          <h1>{user.name}</h1>
          <p>
            Level <strong>{stats.level}</strong> ·{" "}
            {stats.xpIntoLevel} of {stats.xpForNextLevel} XP
            toward the next level
          </p>
        </div>

        <div className="bar level-bar">
          <motion.div
            className="bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${levelPercent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </motion.section>

      <section className="stats">
        <div className="stat">
          <Star size={22} />
          <span className="big">{stats.level}</span>
          <span className="hint">Level</span>
        </div>

        <div className="stat">
          <Trophy size={22} />
          <span className="big">{stats.xp}</span>
          <span className="hint">Total XP</span>
        </div>

        <div className="stat">
          <Target size={22} />
          <span className="big">{stats.attempts}</span>
          <span className="hint">Quiz Attempts</span>
        </div>

        <div className="stat">
          <BarChart3 size={22} />
          <span className="big">{stats.avgPercent}%</span>
          <span className="hint">Average Score</span>
        </div>
      </section>

      <section className="card">
        <h2>Learning Progress</h2>

        <div className="stats">
          <div className="stat">
            <BookOpen size={22} />
            <span className="big">
              {stats.lessonsCompleted}
            </span>
            <span className="hint">Lessons Completed</span>
          </div>

          <div className="stat">
            <Leaf size={22} />
            <span className="big">{stats.ecoActions}</span>
            <span className="hint">Eco Actions</span>
          </div>

          <div className="stat">
            <Award size={22} />
            <span className="big">
              {stats.approvedMissions}
            </span>
            <span className="hint">Approved Missions</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Achievements</h2>

        {stats.badges.length === 0 ? (
          <p className="hint">
            No badges earned yet. Complete learning activities
            to unlock achievements.
          </p>
        ) : (
          <div className="badge-grid">
            {stats.badges.map((badge) => (
              <div
                key={badge.code}
                className="badge earned"
              >
                <Trophy size={22} />
                <strong>{badge.name}</strong>
                <span className="hint">
                  {badge.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Recent Quiz Performance</h2>

        {stats.recent.length === 0 ? (
          <p className="hint">
            No quiz attempts yet.
          </p>
        ) : (
          <ul className="list">
            {stats.recent.map((attempt, index) => (
              <li key={index}>
                <strong>{attempt.title}</strong>
                <span>{attempt.percent}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2><Users size={22} /> My Classes</h2>

        <form
          onSubmit={joinClass}
          className="inline"
        >
          <input
            type="text"
            placeholder="Enter class join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            maxLength={12}
            required
          />

          <button
            type="submit"
            className="primary"
          >
            Join Class
          </button>
        </form>

        {notice && (
          <p className={`notice ${notice.ok ? "ok" : "error"}`}>
            {notice.text}
          </p>
        )}

        {classes.length === 0 ? (
          <p className="hint">
            You have not joined any classes yet.
          </p>
        ) : (
          <ul className="list">
            {classes.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong>
                <span className="hint">
                  {c.studentCount} students
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
