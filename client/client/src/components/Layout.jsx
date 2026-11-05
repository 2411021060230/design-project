import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LogOut, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "../auth.jsx";
import { sfx, setSoundOn, soundOn } from "../sound.js";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("gl-theme") || "light");
  const [sound, setSound] = useState(soundOn);

  // Apply the theme to the whole page and remember the choice in this browser
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("gl-theme", theme);
  }, [theme]);

  function toggleSound() {
    const next = !sound;
    setSoundOn(next);
    setSound(next);
    if (next) sfx.click();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">Gamified Learning</Link>
        {user && (
          <nav className="nav-links">
            <NavLink to="/" end>
              <Home size={18} /> <span>Home</span>
            </NavLink>
          </nav>
        )}
        <div className="top-actions">
          <button
            className="icon-btn"
            aria-label="Switch between light and dark theme"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            className="icon-btn"
            aria-label={sound ? "Turn sound effects off" : "Turn sound effects on"}
            onClick={toggleSound}
          >
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          {user && (
            <>
              <span className="who">{user.name}</span>
              <button className="icon-btn" aria-label="Log out" onClick={logout}>
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="page"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
