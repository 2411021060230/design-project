
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLessons() {
      try {
        setLoading(true);
        setError("");

        const response = await api("/lessons");
        setLessons(response.data.lessons || []);
        setSubjects(response.data.subjects || []);
      } catch (err) {
        setError(err.message || "Failed to load lessons.");
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, []);

  const filteredLessons =
    subject === "All"
      ? lessons
      : lessons.filter((lesson) => lesson.subject === subject);

  return (
    <section className="card">
      <h1>Learning Lessons</h1>
      <p>Explore interactive lessons and earn XP!</p>

      <div style={{ margin: "20px 0" }}>
        <label htmlFor="subject-filter">Filter by subject: </label>
        <select
          id="subject-filter"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="All">All Subjects</option>
          {subjects.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading lessons...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && filteredLessons.length === 0 && (
        <p>No lessons available for this subject.</p>
      )}

      {!loading && !error && filteredLessons.map((lesson) => (
        <div
          key={lesson.id}
          className="card"
          style={{ marginBottom: "15px", padding: "15px" }}
        >
          <h3>{lesson.title}</h3>
          <p>{lesson.summary}</p>
          <p>
            <strong>Subject:</strong> {lesson.subject} |
            <strong> Grade:</strong> {lesson.grade}
          </p>
          <p>
            <strong>XP Reward:</strong> {lesson.xpReward}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {lesson.completed ? "Completed" : "Not Completed"}
          </p>

          <Link to={`/lessons/${lesson.id}`}>
            {lesson.completed ? "Review Lesson" : "Start Lesson"}
          </Link>
        </div>
      ))}
    </section>
  );
}
