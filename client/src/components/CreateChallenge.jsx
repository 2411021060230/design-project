
import { useState } from "react";
import { api } from "../api.js";

const emptyQuestion = () => ({
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
});

export default function CreateChallenge() {
  const [subject, setSubject] = useState("Physics");
  const [grade, setGrade] = useState(10);
  const [difficulty, setDifficulty] = useState("easy");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(50);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateQuestion(index, field, value) {
    setQuestions((previous) =>
      previous.map((question, i) =>
        i === index ? { ...question, [field]: value } : question
      )
    );
  }

  function updateOption(questionIndex, optionIndex, value) {
    setQuestions((previous) =>
      previous.map((question, i) =>
        i === questionIndex
          ? {
              ...question,
              options: question.options.map((option, j) =>
                j === optionIndex ? value : option
              ),
            }
          : question
      )
    );
  }

  function addQuestion() {
    if (questions.length >= 20) return;
    setQuestions((previous) => [...previous, emptyQuestion()]);
  }

  function removeQuestion(index) {
    if (questions.length <= 1) return;
    setQuestions((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setSaving(true);

      const response = await api("/challenges", {
        method: "POST",
        body: {
          subject,
          grade: Number(grade),
          difficulty,
          title: title.trim(),
          description: description.trim(),
          xpReward: Number(xpReward),
          questions: questions.map((question) => ({
            text: question.text.trim(),
            options: question.options.map((option) => option.trim()),
            correctIndex: Number(question.correctIndex),
            explanation: question.explanation.trim(),
          })),
        },
      });

      setMessage(`Challenge "${title}" created successfully!`);

      setTitle("");
      setDescription("");
      setQuestions([emptyQuestion()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card">
      <h2>Create New Challenge</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Subject
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Maths">Maths</option>
            </select>
          </label>

          <label>
            Grade
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
            >
              <option value={8}>Grade 8</option>
              <option value={9}>Grade 9</option>
              <option value={10}>Grade 10</option>
            </select>
          </label>

          <label>
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>

          <label>
            XP Reward
            <input
              type="number"
              min="10"
              max="200"
              value={xpReward}
              onChange={(e) => setXpReward(e.target.value)}
              required
            />
          </label>
        </div>

        <label>
          Challenge Title
          <input
            type="text"
            minLength={3}
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Newton's Laws"
            required
          />
        </label>

        <label>
          Description
          <textarea
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this challenge"
          />
        </label>

        <h3>Questions</h3>

        {questions.map((question, questionIndex) => (
          <div className="card" key={questionIndex}>
            <h3>Question {questionIndex + 1}</h3>

            <label>
              Question Text
              <input
                type="text"
                minLength={3}
                maxLength={300}
                value={question.text}
                onChange={(e) =>
                  updateQuestion(questionIndex, "text", e.target.value)
                }
                required
              />
            </label>

            {question.options.map((option, optionIndex) => (
              <label key={optionIndex}>
                Option {optionIndex + 1}
                <input
                  type="text"
                  maxLength={150}
                  value={option}
                  onChange={(e) =>
                    updateOption(
                      questionIndex,
                      optionIndex,
                      e.target.value
                    )
                  }
                  required
                />
              </label>
            ))}

            <label>
              Correct Answer
              <select
                value={question.correctIndex}
                onChange={(e) =>
                  updateQuestion(
                    questionIndex,
                    "correctIndex",
                    Number(e.target.value)
                  )
                }
              >
                {question.options.map((_, optionIndex) => (
                  <option key={optionIndex} value={optionIndex}>
                    Option {optionIndex + 1}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Answer Explanation
              <textarea
                maxLength={400}
                value={question.explanation}
                onChange={(e) =>
                  updateQuestion(
                    questionIndex,
                    "explanation",
                    e.target.value
                  )
                }
              />
            </label>

            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(questionIndex)}
              >
                Remove Question
              </button>
            )}
          </div>
        ))}

        <div className="nav-row">
          <button
            type="button"
            onClick={addQuestion}
            disabled={questions.length >= 20}
          >
            + Add Question
          </button>

          <button
            type="submit"
            className="primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Create Challenge"}
          </button>
        </div>

        {message && <p className="notice ok">{message}</p>}
        {error && <p className="notice error">{error}</p>}
      </form>
    </section>
  );
}
