import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { getSession, logout as logoutRequest } from "../services/PortalAdminService";

interface AdminUser {
  id: string | number;
  email: string;
  role: string;
  must_change_password?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  usuario: AdminUser | null;
  setAuthUser: (user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<AdminUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const isAuthenticated = usuario !== null;

  useEffect(() => {
    let isMounted = true;

    getSession()
      .then((data) => {
        if (!isMounted) return;

        if (data.user?.role === "ADMIN") {
          setUsuario(data.user);
          localStorage.setItem("admin_auth_user", JSON.stringify(data.user));
          return;
        }

        setUsuario(null);
        localStorage.removeItem("admin_auth_user");
      })
      .catch(() => {
        if (!isMounted) return;
        setUsuario(null);
        localStorage.removeItem("admin_auth_user");
      })
      .finally(() => {
        if (isMounted) setIsCheckingSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setAuthUser = useCallback((user: AdminUser) => {
    setUsuario(user);
    localStorage.setItem("admin_auth_user", JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    logoutRequest().catch(() => {
      // Si el backend no responde, igual limpiamos la sesión local.
    });
    setUsuario(null);
    localStorage.removeItem("admin_auth_user");
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isCheckingSession, usuario, setAuthUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
