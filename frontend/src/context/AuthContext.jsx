import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const loadUser = async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
