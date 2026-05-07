import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  usuario: AdminUser | null;
  setAuthUser: (user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem("admin_auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = usuario !== null;

  const setAuthUser = useCallback((user: AdminUser) => {
    setUsuario(user);
    localStorage.setItem("admin_auth_user", JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem("admin_auth_user");
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, usuario, setAuthUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
