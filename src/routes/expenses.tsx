import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { ArrowLeft, Plus, Trash2, Receipt } from "lucide-react";
import { useState } from "react";
import { useExpenses, useCreateExpense, useDeleteExpense } from "../api/expenses";
import { useListActiveEmployees } from "../api/users";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "../contexts/AuthContext";
import { useFeature } from "../hooks/useFeature";
import { requireAuth } from "../lib/auth";
import { InlineSelect } from "../components/shared/InlineSelect";

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

  const { data: expenses } = useExpenses(token!, filterEmployee ? (filterEmployee as Id<"users">) : undefined);
  const { data: users } = useListActiveEmployees();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();

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
        employeeId: selectedEmployee ? (selectedEmployee as Id<"users">) : undefined,
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

  const todayTotal = (expenses ?? [])
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

      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <InlineSelect
            value={filterEmployee}
            onChange={setFilterEmployee}
            options={[
              { value: "", label: "All Employees" },
              ...users.map((u) => ({ value: u._id, label: u.name })),
            ]}
          />
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="h-12 rounded-2xl shrink-0"
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
                <InlineSelect
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  options={[
                    { value: "", label: "General Expense" },
                    ...users.map((u) => ({ value: u._id, label: u.name })),
                  ]}
                />
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
        {(expenses ?? []).length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <Receipt className="size-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No expenses yet</p>
              <p className="text-sm text-gray-400 mt-1">Click + to add your first expense</p>
            </CardContent>
          </Card>
        ) : (
          (expenses ?? []).map((expense) => {
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
