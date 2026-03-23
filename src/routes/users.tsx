import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { parseError } from "../lib/parseError";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Id } from "../../convex/_generated/dataModel";
import { requireFeature } from "../lib/auth";
import {
  Users as UsersIcon,
  ShieldCheck,
  PlusCircle,
  X,
  User,
} from "lucide-react";
import { useListUsers, useCreateUser, useToggleUserActive } from "../api/users";

export const Route = createFileRoute("/users")({
  beforeLoad: requireFeature("userManagement"),
  component: UsersPage,
});

function UsersPage() {
  const { token, currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EMPLOYEE">("EMPLOYEE");

  const { data: users } = useListUsers(token!);
  const createUser = useCreateUser();
  const toggleActive = useToggleUserActive();

  if (currentUser?.role !== "ADMIN") {
    // Better access denied UI
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
        <ShieldCheck className="size-16 text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-500 mt-2">
          You need administrator privileges to view this page.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await createUser({ token, username, password, name, role });
      setUsername("");
      setPassword("");
      setName("");
      setRole("EMPLOYEE");
      setShowForm(false);
    } catch (err: any) {
      toast.error(parseError(err));
    }
  };

  const handleToggle = async (userId: Id<"users">) => {
    if (!token) return;
    await toggleActive({ token, userId });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 overflow-y-auto">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white px-6 pt-12 pb-24 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 size-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 size-64 bg-violet-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-4 shadow-lg ring-4 ring-white/10">
            <UsersIcon className="size-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            User Management
          </h1>
          <p className="text-indigo-100 font-medium">
            Manage team access & roles
          </p>
        </div>
      </div>

      <div className="px-5 -mt-16 relative z-20 flex flex-col gap-6">
        {/* Actions / Form Toggle */}
        {!showForm && (
          <Button
            size="xl"
            className="bg-white text-indigo-600 hover:bg-gray-50 shadow-lg border-0 rounded-2xl h-14 text-base font-bold w-full"
            onClick={() => setShowForm(true)}
          >
            <PlusCircle className="mr-2 size-5" /> Add New Employee
          </Button>
        )}

        {/* Create User Form */}
        {showForm && (
          <Card className="border-none shadow-xl shadow-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-indigo-950 flex items-center gap-2">
                  <User className="size-5 text-indigo-500" />
                  New User Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0 rounded-full"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    Full Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Ramesh Kumar"
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-all h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                      Username
                    </label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="e.g. ramesh"
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-all h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-all h-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                    Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`cursor-pointer rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${
                        role === "EMPLOYEE"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                          : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                      }`}
                      onClick={() => setRole("EMPLOYEE")}
                    >
                      <div
                        className={`size-4 rounded-full border flex items-center justify-center ${
                          role === "EMPLOYEE"
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-gray-300"
                        }`}
                      >
                        {role === "EMPLOYEE" && (
                          <div className="size-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-semibold text-sm">Employee</span>
                    </div>

                    <div
                      className={`cursor-pointer rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${
                        role === "ADMIN"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                          : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                      }`}
                      onClick={() => setRole("ADMIN")}
                    >
                      <div
                        className={`size-4 rounded-full border flex items-center justify-center ${
                          role === "ADMIN"
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-gray-300"
                        }`}
                      >
                        {role === "ADMIN" && (
                          <div className="size-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-semibold text-sm">Admin</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-200 mt-2"
                >
                  Create User Account
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Users Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {users.map((user) => (
            <Card
              key={user._id}
              className="border-none shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden bg-white rounded-2xl"
            >
              <CardContent className="p-5 flex flex-col gap-4">
                {/* Header: Name and Role */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      {user.name}
                    </h3>
                    <p className="text-gray-400 text-xs font-medium tracking-wide mt-1">
                      @{user.username}
                    </p>
                  </div>
                  <Badge
                    className={
                      user.role === "ADMIN"
                        ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 px-3 py-1 text-[10px]"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-100 px-3 py-1 text-[10px]"
                    }
                  >
                    {user.role}
                  </Badge>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-50" />

                {/* Status and Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-2 rounded-full ${user.isActive ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-gray-300"}`}
                    />
                    <span className="text-sm font-medium text-gray-600">
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(user._id)}
                    className={`h-9 px-4 text-xs font-semibold rounded-xl border-2 ${
                      user.isActive
                        ? "border-gray-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                        : "border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 bg-emerald-50/50"
                    }`}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
