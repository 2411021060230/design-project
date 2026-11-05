
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Trophy,
  Plus,
  Copy,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import CreateChallenge from "../components/CreateChallenge.jsx";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadClasses = useCallback(async () => {
    try {
      setError("");
      const response = await api("/classes");
      setClasses(response.data.classes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!selectedId) {
      setAnalytics(null);
      setLeaderboard([]);
      return;
    }

    let active = true;

    async function loadDetails() {
      setAnalytics(null);
      setLeaderboard([]);

      try {
        setError("");
        const [a, l] = await Promise.all([
          api(`/classes/${selectedId}/analytics`),
          api(`/classes/${selectedId}/leaderboard`),
        ]);

        if (active) {
          setAnalytics(a.data);
          setLeaderboard(l.data.leaderboard || []);
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [selectedId]);

  async function createClass(event) {
    event.preventDefault();

    if (className.trim().length < 2) {
      setError("Class name must have at least 2 characters.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response = await api("/classes", {
        method: "POST",
        body: { name: className.trim() },
      });

      setMessage(
        `Class "${response.data.classRoom.name}" created successfully!`
      );

      setClassName("");
      await loadClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Join code copied successfully.");
    } catch {
      setError("Could not copy. Please select the code manually.");
    }
  }

  const totalStudents = classes.reduce(
    (sum, c) => sum + (c.studentCount || 0),
    0
  );

  return (
    <div>
      <motion.section
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Teacher Dashboard</h1>
        <p className="hint">
          Welcome, {user?.name || "Teacher"}!
          Manage your classes and monitor student learning.
        </p>
      </motion.section>

      <section className="stats">
        <div className="stat">
          <BookOpen size={24} />
          <span className="big">{classes.length}</span>
          <span className="hint">Total Classes</span>
        </div>

        <div className="stat">
          <Users size={24} />
          <span className="big">{totalStudents}</span>
          <span className="hint">Class Enrollments</span>
        </div>

        <div className="stat">
          <Trophy size={24} />
          <span className="big">{leaderboard.length}</span>
          <span className="hint">Leaderboard Entries</span>
        </div>
      </section>

      <section className="card">
        <h2><Plus size={20} /> Create New Class</h2>

        <form onSubmit={createClass} className="inline">
          <input
            type="text"
            placeholder="Enter class name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            minLength={2}
            maxLength={80}
            required
          />

          <button
            type="submit"
            className="primary"
            disabled={creating}
          >
            {creating ? "Creating..." : "Create Class"}
          </button>
        </form>

        {message && <p className="notice ok">{message}</p>}
        {error && <p className="notice error">{error}</p>}
      </section>

      <section className="card">
        <h2>My Classes</h2>

        <button onClick={loadClasses} type="button">
          <RefreshCw size={16} /> Refresh
        </button>

        {loading ? (
          <p>Loading classes...</p>
        ) : classes.length === 0 ? (
          <p className="hint">
            No classes yet. Create your first class above.
          </p>
        ) : (
          <div className="subject-grid">
            {classes.map((c) => (
              <div className="card" key={c.id}>
                <h3>{c.name}</h3>

                <p>
                  <Users size={16} /> {c.studentCount} students
                </p>

                <p>
                  Join Code: <strong>{c.joinCode}</strong>
                </p>

                <button
                  type="button"
                  onClick={() => copyCode(c.joinCode)}
                >
                  <Copy size={16} /> Copy Code
                </button>

                <button
                  type="button"
                  className="primary"
                  onClick={() => setSelectedId(c.id)}
                >
                  <BarChart3 size={16} /> View Analytics
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      <CreateChallenge />

      {selectedId && (
        <section className="card">
          <h2>Class Analytics</h2>

          {!analytics ? (
            <p>Loading analytics...</p>
          ) : (
            <>
              <h3>{analytics.classRoom.name}</h3>

              <div className="stats">
                <div className="stat">
                  <strong>{analytics.summary.studentCount}</strong>
                  <span>Students</span>
                </div>

                <div className="stat">
                  <strong>{analytics.summary.totalXp}</strong>
                  <span>Total XP</span>
                </div>

                <div className="stat">
                  <strong>{analytics.summary.totalAttempts}</strong>
                  <span>Quiz Attempts</span>
                </div>

                <div className="stat">
                  <strong>{analytics.summary.avgPercent}%</strong>
                  <span>Average Score</span>
                </div>
              </div>

              <h3>Student Performance</h3>

              {analytics.students.length === 0 ? (
                <p className="hint">No students enrolled yet.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table width="100%" cellPadding="12">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Level</th>
                        <th>XP</th>
                        <th>Attempts</th>
                        <th>Avg Score</th>
                        <th>Eco Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {analytics.students.map((s) => (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td>{s.level}</td>
                          <td>{s.xp}</td>
                          <td>{s.attempts}</td>
                          <td>{s.avgPercent}%</td>
                          <td>{s.ecoActions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3>Leaderboard</h3>

              {leaderboard.length === 0 ? (
                <p className="hint">No leaderboard entries yet.</p>
              ) : (
                <ul className="list">
                  {leaderboard.map((s) => (
                    <li key={s.id}>
                      <strong>#{s.rank} {s.name}</strong>
                      <span>{s.xp} XP</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
