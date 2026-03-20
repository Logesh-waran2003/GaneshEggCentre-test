import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  username: string;
  name: string;
  role: "ADMIN" | "EMPLOYEE";
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => 
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  );

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );

  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  const login = async (username: string, password: string) => {
    const result = await loginMutation({ username, password });
    setToken(result.token);
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", result.token);
    }
  };

  const logout = async () => {
    if (token) {
      await logoutMutation({ token });
    }
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      window.location.href = "/login";
    }
  };

  // Sync role to localStorage so requireAdmin() can check it synchronously
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user_role", currentUser.role);
    }
  }, [currentUser]);

  const isLoading = token !== null && currentUser === undefined;

  // Session expired on server — clear local token and redirect to login
  useEffect(() => {
    if (token !== null && currentUser === null && !isLoading) {
      setToken(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      window.location.href = "/login";
    }
  }, [token, currentUser, isLoading]);

  return (
    <AuthContext.Provider value={{ currentUser: currentUser ?? null, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
