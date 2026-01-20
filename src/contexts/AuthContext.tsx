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
      window.location.href = "/login";
    }
  };

  const isLoading = token !== null && currentUser === undefined;

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
