import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../auth.jsx";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    teacherInviteCode: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.section
      className="card auth"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <h1>{mode === "login" ? "Welcome back" : "Start your adventure"}</h1>

      <div className="tabs">
        <button className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")}>
          Log in
        </button>
        <button className={mode === "register" ? "tab active" : "tab"} onClick={() => setMode("register")}>
          Sign up
        </button>
      </div>

      <form onSubmit={submit} className="stack">
        {mode === "register" && (
          <label>
            Full name
            <input required minLength={2} maxLength={60} value={form.name} onChange={update("name")} />
          </label>
        )}
        <label>
          Email
          <input type="email" required value={form.email} onChange={update("email")} />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={mode === "register" ? 8 : 1}
            value={form.password}
            onChange={update("password")}
          />
        </label>
        {mode === "register" && (
          <>
            <label>
              I am a
              <select value={form.role} onChange={update("role")}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </label>
            {form.role === "teacher" && (
              <label>
                Teacher invite code
                <input value={form.teacherInviteCode} onChange={update("teacherInviteCode")} />
              </label>
            )}
          </>
        )}

        {error && <p className="notice error" role="alert">{error}</p>}

        <motion.button whileTap={{ scale: 0.97 }} className="primary" disabled={busy} type="submit">
          {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </motion.button>
      </form>

      <p className="hint">
        Demo teacher: demo.teacher@example.com / DemoTeacher-2026
        <br />
        Demo student: demo.student1@example.com / DemoStudent-2026
      </p>
    </motion.section>
  );
}
