import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";
import { useTripDetails, useCompleteTrip, useApproveStartTrip, useApproveEndTrip, useTripExpenses, useTripProfitability, useAddTripExpense, useDeleteTripExpense } from "../../api/trips";
import { useListActiveEmployees } from "../../api/users";
import { TripExpenseCard } from "../../components/trips/TripExpenseCard";
import { TripProfitability } from "../../components/trips/TripProfitability";
import { TripActions } from "../../components/trips/TripActions";
import { InlineSelect } from "../../components/shared/InlineSelect";
import { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/trips/$tripId")({
  beforeLoad: requireAuth,
  component: TripDetails,
});

function TripDetails() {
  const { tripId } = Route.useParams();
  const { token, currentUser } = useAuth();
  
  if (!token) return null;
  const { data: trip } = useTripDetails(token, tripId as Id<"saleTrips">);
  const { data: tripExpenses } = useTripExpenses(tripId as Id<"saleTrips">);
  const { data: profitability } = useTripProfitability(tripId as Id<"saleTrips">);
  const { data: allEmployees } = useListActiveEmployees();
  const completeTrip = useCompleteTrip();
  const approveStart = useApproveStartTrip();
  const approveEnd = useApproveEndTrip();
  const addTripExpense = useAddTripExpense();
  const deleteTripExpense = useDeleteTripExpense();
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
  const isAssigned = currentUser?._id ? trip.employees.includes(currentUser._id) : false;

  const handleApproveStart = async () => {
    try {
      await approveStart({ token: token!, tripId: tripId as Id<"saleTrips"> });
      router.invalidate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleComplete = async () => {
    try {
      await completeTrip({
        token: token!,
        tripId: tripId as Id<"saleTrips">,
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
      await approveEnd({ token: token!, tripId: tripId as Id<"saleTrips"> });
      router.invalidate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseEmployee) {
      alert("Please select an employee");
      return;
    }
    try {
      await addTripExpense({
        token: token!,
        tripId: tripId as Id<"saleTrips">,
        amount: parseFloat(expenseAmount),
        description: expenseDescription,
        employeeId: expenseEmployee as Id<"users">,
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
      await deleteTripExpense({ token: token!, expenseId: expenseId as Id<"tripExpenses"> });
    }
  };

  const statusColors = {
    PENDING_APPROVAL: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-purple-100 text-purple-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="bg-gray-50 pb-24">
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
          </CardContent>
        </Card>

        <TripProfitability profitability={profitability} />

        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Expenses</h2>
          {tripExpenses.length === 0 ? (
            <p className="text-sm text-gray-500">No expenses yet</p>
          ) : (
            <div className="space-y-2">
              {tripExpenses.map((expense: any) => (
                <TripExpenseCard
                  key={expense._id}
                  expense={expense}
                  onDelete={handleDeleteExpense}
                  canDelete={isAdmin || isAssigned}
                />
              ))}
            </div>
          )}
        </section>

        <TripActions
          status={trip.status}
          isAdmin={isAdmin}
          isAssigned={isAssigned}
          onApproveStart={handleApproveStart}
          onComplete={() => setShowCompleteModal(true)}
          onApproveEnd={handleApproveEnd}
          onAddExpense={() => setShowExpenseModal(true)}
        />

        <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Trip</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Returned Trays
                  </label>
                  <Input
                    type="number"
                    value={returnedTrays}
                    onChange={(e) => setReturnedTrays(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Returned Loose
                  </label>
                  <Input
                    type="number"
                    value={returnedLoose}
                    onChange={(e) => setReturnedLoose(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-red-500 uppercase mb-1 block">
                    Damaged Trays
                  </label>
                  <Input
                    type="number"
                    value={damagedTrays}
                    onChange={(e) => setDamagedTrays(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-red-500 uppercase mb-1 block">
                    Damaged Loose
                  </label>
                  <Input
                    type="number"
                    value={damagedLoose}
                    onChange={(e) => setDamagedLoose(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleComplete}>Complete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Amount
                </label>
                <Input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Description
                </label>
                <Input
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Employee
                </label>
                <InlineSelect
                  value={expenseEmployee}
                  onChange={setExpenseEmployee}
                  placeholder="Select employee"
                  options={trip.employees.map((empId: string) => {
                    const emp = allEmployees.find((e) => e._id === empId);
                    return { value: empId, label: emp?.name ?? empId };
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
