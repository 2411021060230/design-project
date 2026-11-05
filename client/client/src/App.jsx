import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { useAuth } from "./auth.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SubjectPage from "./pages/SubjectPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import GamePage from "./pages/GamePage.jsx";

// Pages that need a logged-in user. Everyone else is sent to the login page.
function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="loading">Loading your adventure...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user, ready } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route
          path="/login"
          element={ready && user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route path="/" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/subjects/:slug" element={<Protected><SubjectPage /></Protected>} />
        <Route path="/subjects/:slug/topics/:topicId" element={<Protected><QuizPage /></Protected>} />
        <Route path="/games/:gameId" element={<Protected><GamePage /></Protected>} />
        <Route path="*" element={<section className="card"><h2>Page not found</h2><a href="/">Go home</a></section>} />
      </Routes>
    </Layout>
  );
}
