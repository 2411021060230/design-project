import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Atom, Cpu, Dna, FlaskConical, Leaf, Lock, Star, Trophy, Flame } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import AnimatedNumber from "../components/AnimatedNumber.jsx";

const SUBJECT_ICONS = {
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  "computer-science": Cpu,
  "eco-action": Leaf,
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function Stat({ icon: Icon, label, value }) {
  return (
    <motion.div className="stat" variants={item} whileHover={{ y: -3 }}>
      <Icon size={20} />
      <span className="big">
        <AnimatedNumber value={value} />
      </span>
      <span className="hint">{label}</span>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isStudent = user.role === "student";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    const [progress, classes, subjects, badges] = await Promise.all([
      api("/progress/me"),
      api("/classes"),
      api("/subjects"),
      api("/badges/me"),
    ]);
    setData({
      progress: progress.data,
      classes: classes.data.classes,
      subjects: subjects.data.subjects,
      badges: badges.data.badges,
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
      const response = await api("/classes/join", { method: "POST", body: { joinCode } });
      setNotice({ ok: true, text: response.message });
      setJoinCode("");
      await load();
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    }
  }

  if (!isStudent) {
    return (
      <section className="card">
        <h1>Teacher dashboard</h1>
        <p className="hint">
          The teacher dashboard with class analytics is part of a later stage. For now, manage classes on the
          classic page at http://localhost:5000.
        </p>
      </section>
    );
  }

  if (error) return <p className="notice error">{error}</p>;
  if (!data) return <div className="loading">Loading your dashboard...</div>;

  const { summary, subjects: subjectProgress } = data.progress;
  const levelPercent = Math.min(100, Math.round((summary.xpIntoLevel / summary.xpPerLevel) * 100));
  const completionFor = (slug) =>
    subjectProgress.find((p) => p.subject.slug === slug)?.completionPercent ?? 0;

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
            Level <strong>{summary.level}</strong> · {summary.xpIntoLevel} of {summary.xpPerLevel} XP to the next level
          </p>
        </div>
        <div className="bar level-bar">
          <motion.div
            className="bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${levelPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.section>

      <motion.section className="stats" variants={container} initial="hidden" animate="show">
        <Stat icon={Star} label="Level" value={summary.level} />
        <Stat icon={Trophy} label="XP" value={summary.totalXp} />
        <Stat icon={Star} label="Points" value={summary.totalPoints} />
        <Stat icon={Flame} label="Day streak" value={summary.currentStreak} />
      </motion.section>

      <section className="card">
        <h2>Subjects</h2>
        <motion.div className="subject-grid" variants={container} initial="hidden" animate="show">
          {data.subjects.map((subject) => {
            const Icon = SUBJECT_ICONS[subject.slug] || Star;
            const percent = completionFor(subject.slug);
            return (
              <motion.div key={subject.id} variants={item}>
                <Link to={`/subjects/${subject.slug}`} className={`subject-card subject-${subject.slug}`}>
                  <Icon size={28} />
                  <strong>{subject.name}</strong>
                  <span className="hint">{subject.description}</span>
                  <div className="bar small">
                    <motion.div
                      className="bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.9 }}
                    />
                  </div>
                  <span className="hint">{percent}% complete</span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
        {data.subjects.length === 0 && (
          <p className="hint">No subjects yet. Run the seed script on the server to load the course content.</p>
        )}
      </section>

      <section className="card">
        <h2>Achievements</h2>
        <motion.div className="badge-grid" variants={container} initial="hidden" animate="show">
          {data.badges.map((badge) => (
            <motion.div
              key={badge.id}
              variants={item}
              className={badge.earned ? "badge earned" : "badge"}
              title={badge.description}
            >
              {badge.earned ? <Trophy size={22} /> : <Lock size={22} />}
              <strong>{badge.name}</strong>
              <span className="hint">{badge.description}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="card">
        <h2>Classes</h2>
        <form onSubmit={joinClass} className="inline">
          <input
            placeholder="Join code"
            required
            maxLength={12}
            aria-label="Join code"
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
          />
          <button className="primary" type="submit">Join class</button>
        </form>
        {notice && <p className={`notice ${notice.ok ? "ok" : "error"}`}>{notice.text}</p>}
        {data.classes.length === 0 ? (
          <p className="hint">You have not joined a class yet.</p>
        ) : (
          <ul className="list">
            {data.classes.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong>
                <span className="hint">{c.memberCount} members</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
