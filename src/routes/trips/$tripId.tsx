import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";

export const Route = createFileRoute("/trips/$tripId")({
  beforeLoad: requireAuth,
  component: TripDetails,
});

function TripDetails() {
  const { tripId } = Route.useParams();
  const { token, currentUser } = useAuth();
  
  if (!token) return null;
  const { data: trip } = useSuspenseQuery(
    convexQuery(api.saleTrips.getTripDetails, { token: token!, tripId: tripId as any })
  );
  const { data: tripExpenses } = useSuspenseQuery(
    convexQuery(api.tripExpenses.getTripExpenses, { tripId: tripId as any })
  );
  const { data: profitability } = useSuspenseQuery(
    convexQuery(api.tripExpenses.getTripProfitability, { tripId: tripId as any })
  );
  const completeTrip = useMutation(api.saleTrips.completeTrip);
  const approveStart = useMutation(api.saleTrips.approveStartTrip);
  const approveEnd = useMutation(api.saleTrips.approveEndTrip);
  const addTripExpense = useMutation(api.tripExpenses.addTripExpense);
  const deleteTripExpense = useMutation(api.tripExpenses.deleteTripExpense);
  const router = useRouter();

  const [returnedTrays, setReturnedTrays] = useState("");
  const [returnedLoose, setReturnedLoose] = useState("");
  const [damagedTrays, setDamagedTrays] = useState("");
  const [damagedLoose, setDamagedLoose] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseEmployee, setExpenseEmployee] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";
  const isAssigned = trip.employees.includes(currentUser?._id);

  const handleApproveStart = async () => {
    try {
      await approveStart({ token: token!, tripId: tripId as any });
      router.invalidate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleComplete = async () => {
    try {
      await completeTrip({
        token: token!,
        tripId: tripId as any,
        returnedQtyTrays: Number(returnedTrays) || 0,
        returnedQtyLoose: Number(returnedLoose) || 0,
        damagedQtyTrays: Number(damagedTrays) || 0,
        damagedQtyLoose: Number(damagedLoose) || 0,
      });
      setShowCompleteModal(false);
      router.invalidate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleApproveEnd = async () => {
    try {
      await approveEnd({ token: token!, tripId: tripId as any });
      router.invalidate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleAddExpense = async () => {
    try {
      await addTripExpense({
        token: token!,
        tripId: tripId as any,
        amount: parseFloat(expenseAmount),
        description: expenseDescription,
        employeeId: expenseEmployee as any,
      });
      setExpenseAmount("");
      setExpenseDescription("");
      setExpenseEmployee("");
      setShowExpenseModal(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm("Delete this expense?")) {
      await deleteTripExpense({ token: token!, expenseId: expenseId as any });
    }
  };

  const statusColors = {
    PENDING_APPROVAL: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-purple-100 text-purple-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="p-4 max-w-md mx-auto">
        <header className="flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild className="rounded-2xl">
            <Link to="/trips">
              <ArrowLeft className="size-6 text-gray-600" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-indigo-950">Trip Details</h1>
        </header>

        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-black">{trip.product?.name} Egg</h2>
              <Badge className={statusColors[trip.status as keyof typeof statusColors]}>
                {trip.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Loaded</p>
                <p className="font-bold">{trip.loadedQtyTrays}T + {trip.loadedQtyLoose}L</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Sold</p>
                <p className="font-bold">{trip.soldQtyTrays}T + {trip.soldQtyLoose}L</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Returned</p>
                <p className="font-bold">{trip.returnedQtyTrays}T + {trip.returnedQtyLoose}L</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Damaged</p>
                <p className="font-bold text-red-600">{trip.damagedQtyTrays}T + {trip.damagedQtyLoose}L</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">Cash Collected</p>
              <p className="text-2xl font-black text-emerald-600">₹{trip.totalCashCollected.toLocaleString()}</p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">Expenses</p>
              <p className="text-2xl font-black text-rose-600">₹{profitability.totalExpenses.toLocaleString()}</p>
            </div>

            <div className="mt-4 pt-4 border-t bg-indigo-50 -mx-5 -mb-5 px-5 pb-5 rounded-b-lg">
              <p className="text-xs text-gray-500">Profit</p>
              <p className="text-3xl font-black text-indigo-600">₹{profitability.profit.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {trip.status === "IN_PROGRESS" && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Expenses</h3>
              {isAssigned && (
                <Button onClick={() => setShowExpenseModal(true)} size="sm" variant="outline">
                  <Plus className="size-4 mr-1" /> Add
                </Button>
              )}
            </div>
            {tripExpenses.length === 0 ? (
              <p className="text-sm text-gray-500">No expenses yet</p>
            ) : (
              tripExpenses.map((expense: any) => (
                <Card key={expense._id} className="mb-2">
                  <CardContent className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.employeeName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-rose-600">₹{expense.amount.toLocaleString()}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="size-8"
                      >
                        <Trash2 className="size-4 text-gray-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {trip.status === "IN_PROGRESS" && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Sales</h3>
              {isAssigned && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/sales/new" search={{ tripId: trip._id }}>
                    <Plus className="size-4 mr-1" /> Add Sale
                  </Link>
                </Button>
              )}
            </div>
            {trip.sales?.map((sale: any) => (
              <Card key={sale._id} className="mb-2">
                <CardContent className="p-3">
                  <p className="font-bold">{sale.contact?.name}</p>
                  <p className="text-sm text-gray-600">₹{sale.amount.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {trip.status === "PENDING_APPROVAL" && isAdmin && (
          <Button onClick={handleApproveStart} variant="premium" className="w-full">
            Approve & Start Trip
          </Button>
        )}

        {trip.status === "IN_PROGRESS" && isAssigned && (
          <Button onClick={() => setShowCompleteModal(true)} variant="premium" className="w-full">
            Complete Trip
          </Button>
        )}

        {trip.status === "COMPLETED" && isAdmin && (
          <Button onClick={handleApproveEnd} variant="premium" className="w-full">
            Approve & Close Trip
          </Button>
        )}
      </div>

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold mb-4">Complete Trip</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Returned Quantity</label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Trays"
                    value={returnedTrays}
                    onChange={(e) => setReturnedTrays(e.target.value)}
                    className="h-12"
                  />
                  <Input
                    type="number"
                    placeholder="Loose"
                    value={returnedLoose}
                    onChange={(e) => setReturnedLoose(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-red-500 uppercase mb-2 block">Damaged Quantity</label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Trays"
                    value={damagedTrays}
                    onChange={(e) => setDamagedTrays(e.target.value)}
                    className="h-12 bg-red-50"
                  />
                  <Input
                    type="number"
                    placeholder="Loose"
                    value={damagedLoose}
                    onChange={(e) => setDamagedLoose(e.target.value)}
                    className="h-12 bg-red-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </Button>
              <Button variant="premium" className="flex-1" onClick={handleComplete}>
                <Check className="size-4 mr-1" /> Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold mb-4">Add Expense</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Amount</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Description</label>
                <Input
                  placeholder="What was this for?"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Employee</label>
                <select
                  value={expenseEmployee}
                  onChange={(e) => setExpenseEmployee(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl border bg-gray-50"
                >
                  <option value="">Select employee</option>
                  {trip.employeeDetails?.map((emp: any) => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowExpenseModal(false)}>
                Cancel
              </Button>
              <Button variant="premium" className="flex-1" onClick={handleAddExpense}>
                <Check className="size-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
