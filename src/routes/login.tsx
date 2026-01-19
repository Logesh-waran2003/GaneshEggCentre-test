import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Eye, EyeOff, Store } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-600 to-violet-700 safe-area-inset relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/30 rounded-full blur-3xl opacity-60"></div>
      </div>

      <Card className="w-full max-w-sm bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-[2rem] relative z-10 overflow-hidden ring-1 ring-white/20">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardHeader className="pt-10 pb-2 text-center flex flex-col items-center">
          <div className="bg-gradient-to-br from-indigo-100 to-white w-20 h-20 rounded-3xl shadow-inner flex items-center justify-center mb-5 border border-indigo-50 transform rotate-3">
            <Store className="size-10 text-indigo-600 transform -rotate-3" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            Ganesh Egg Centre
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">
            Wholesale & Supply Management
          </p>
        </CardHeader>
        <CardContent className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Enter your username"
                className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-100 rounded-xl transition-all font-medium text-gray-900 px-4"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-100 rounded-xl transition-all font-medium text-gray-900 px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all text-base mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login Access"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-white/50 text-[10px] font-medium tracking-widest uppercase relative z-10">
        Secure Wholesale System
      </p>
    </div>
  );
}
