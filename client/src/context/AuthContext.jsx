import { createContext, useEffect, useState } from "react";

import { loginRequest, meRequest } from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("library_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await meRequest();
        setUser(response.user);
      } catch (_error) {
        localStorage.removeItem("library_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  async function login(credentials) {
    const response = await loginRequest(credentials);
    localStorage.setItem("library_token", response.token);
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem("library_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
