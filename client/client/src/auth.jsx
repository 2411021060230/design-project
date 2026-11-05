import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // On first load, reuse the login cookie if the user is still logged in
  useEffect(() => {
    api("/auth/me")
      .then((data) => setUser(data.data.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    setUser(data.data.user);
  }, []);

  const register = useCallback(async (fields) => {
    const data = await api("/auth/register", { method: "POST", body: fields });
    setUser(data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // The session may already be gone. Either way, show the login page.
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
