import { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!token || !currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
