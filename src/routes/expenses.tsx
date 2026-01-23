import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { ArrowLeft, Plus, Trash2, Receipt } from "lucide-react";
import { useState } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../contexts/AuthContext";
import { useFeature } from "../hooks/useFeature";
import { requireAuth } from "../lib/auth";

export const Route = createFileRoute("/expenses")({
  beforeLoad: requireAuth,
  component: Expenses,
});

function Expenses() {
  const { token, currentUser } = useAuth();
  const canDeleteAny = useFeature("deleteAnyExpense");
  const canDeleteOwn = useFeature("deleteOwnExpense");
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: expenses } = useSuspenseQuery(
    convexQuery(api.expenses.listExpenses, {
      token: token!,
      employeeId: filterEmployee || undefined,
    })
  );
  const { data: users } = useSuspenseQuery(
    convexQuery(api.users.listUsers, { token: token! })
  );
  const createExpense = useMutation(api.expenses.createExpense);
  const deleteExpense = useMutation(api.expenses.deleteExpense);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const selectedDate = new Date(date);
      selectedDate.setHours(12, 0, 0, 0);
      
      await createExpense({
        token: token!,
        amount: parseFloat(amount),
        date: selectedDate.getTime(),
        description,
        employeeId: selectedEmployee || undefined,
      });
      setAmount("");
      setDate(new Date().toISOString().split('T')[0]);
      setDescription("");
      setSelectedEmployee("");
      setShowForm(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm("Delete this expense?")) return;
    
    try {
      await deleteExpense({ token: token!, expenseId: expenseId as any });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const todayTotal = expenses
    .filter((e) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return e.date >= today.getTime();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto min-h-screen pb-32">
      <header className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl">
          <Link to="/">
            <ArrowLeft className="size-6 text-gray-600" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-indigo-950">Expenses</h1>
      </header>

      <Card className="bg-rose-600 text-white border-none shadow-xl">
        <CardContent className="p-6">
          <p className="text-rose-100 text-sm font-medium uppercase tracking-wider mb-1">
            Today's Expenses
          </p>
          <div className="flex justify-between items-end">
            <h2 className="text-4xl font-black">₹{todayTotal.toLocaleString()}</h2>
            <Receipt className="size-10 text-white/20 mb-1" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="flex-1 h-12 px-4 rounded-2xl border-none bg-white shadow-sm"
        >
          <option value="">All Employees</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="h-12 rounded-2xl"
        >
          <Plus className="size-5" />
        </Button>
      </div>

      {showForm && (
        <Card className="border-indigo-100 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 rounded-2xl"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1 mb-2">
                  Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 rounded-2xl"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1 mb-2">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12 rounded-2xl"
                  placeholder="What was this for?"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1 mb-2">
                  Employee (Optional)
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl border-none bg-gray-50"
                >
                  <option value="">General Expense</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 rounded-2xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="h-12 rounded-2xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <Receipt className="size-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No expenses yet</p>
              <p className="text-sm text-gray-400 mt-1">Click + to add your first expense</p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => {
            const canDelete = canDeleteAny || (canDeleteOwn && expense.employeeId === currentUser?._id);
            return (
          <Card key={expense._id} className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(expense.date).toLocaleDateString()} •{" "}
                    {expense.employeeName || "General"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-black text-rose-600">
                    ₹{expense.amount.toLocaleString()}
                  </p>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(expense._id)}
                      className="size-8"
                    >
                      <Trash2 className="size-4 text-gray-400" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}))
        }
      </div>
    </div>
  );
}
