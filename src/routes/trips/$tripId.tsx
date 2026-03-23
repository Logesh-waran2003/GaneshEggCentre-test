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
import { toast } from "sonner";
import { parseError } from "../../lib/parseError";
import { useTripDetails, useCompleteTrip, useApproveStartTrip, useApproveEndTrip, useTripExpenses, useTripProfitability, useAddTripExpense, useDeleteTripExpense } from "../../api/trips";
import { useListActiveEmployees } from "../../api/users";
import { TripExpenseCard } from "../../components/trips/TripExpenseCard";
import { TripProfitability } from "../../components/trips/TripProfitability";
import { TripActions } from "../../components/trips/TripActions";
import { InlineSelect } from "../../components/shared/InlineSelect";
import { Id } from "../../../convex/_generated/dataModel";
import { TripProduct } from "../../types/trip";

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

  // Per-product return state: { [productId]: { returnedTrays, returnedLoose, damagedTrays, damagedLoose } }
  const [returns, setReturns] = useState<Record<string, { rt: string; rl: string; dt: string; dl: string }>>({});
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseEmployee, setExpenseEmployee] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";
  const isAssigned = currentUser?._id ? trip.employees.includes(currentUser._id) : false;

  const tripProducts: TripProduct[] = trip.tripProducts ?? [];

  const handleApproveStart = async () => {
    try {
      await approveStart({ token: token!, tripId: tripId as Id<"saleTrips"> });
      router.invalidate();
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const handleComplete = async () => {
    try {
      await completeTrip({
        token: token!,
        tripId: tripId as Id<"saleTrips">,
        returns: tripProducts.map((tp) => {
          const r = returns[tp.productId] ?? { rt: "0", rl: "0", dt: "0", dl: "0" };
          return {
            productId: tp.productId,
            returnedQtyTrays: Number(r.rt) || 0,
            returnedQtyLoose: Number(r.rl) || 0,
            damagedQtyTrays: Number(r.dt) || 0,
            damagedQtyLoose: Number(r.dl) || 0,
          };
        }),
      });
      setShowCompleteModal(false);
      router.invalidate();
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const handleApproveEnd = async () => {
    try {
      await approveEnd({ token: token!, tripId: tripId as Id<"saleTrips"> });
      router.invalidate();
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const handleAddExpense = async () => {
    if (!expenseEmployee) {
      toast.warning("Please select an employee");
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
      toast.error(parseError(err));
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm("Delete this expense?")) {
      await deleteTripExpense({ token: token!, expenseId: expenseId as Id<"tripExpenses"> });
    }
  };

  const setReturn = (productId: string, field: "rt" | "rl" | "dt" | "dl", value: string) => {
    setReturns((prev) => {
      const current = prev[productId] ?? { rt: "", rl: "", dt: "", dl: "" };
      return { ...prev, [productId]: { ...current, [field]: value } };
    });
  };

  const statusColors = {
    PENDING_APPROVAL: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-purple-100 text-purple-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
  };

  const productNames = tripProducts.map((tp) => tp.productName).join(", ");

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
              <h2 className="text-xl font-black">{productNames || "No products"}</h2>
              <Badge className={statusColors[trip.status as keyof typeof statusColors]}>
                {trip.status.replace("_", " ")}
              </Badge>
            </div>

            {/* Per-product quantity rows */}
            <div className="space-y-3">
              {tripProducts.map((tp) => (
                <div key={tp.productId} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{tp.productName}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Loaded</p>
                      <p className="font-bold">{tp.loadedQtyTrays}T + {tp.loadedQtyLoose}L</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Sold</p>
                      <p className="font-bold">{tp.soldQtyTrays}T + {tp.soldQtyLoose}L</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Returned</p>
                      <p className="font-bold">{tp.returnedQtyTrays}T + {tp.returnedQtyLoose}L</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Damaged</p>
                      <p className="font-bold text-red-600">{tp.damagedQtyTrays}T + {tp.damagedQtyLoose}L</p>
                    </div>
                  </div>
                </div>
              ))}
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

        {/* Complete Trip Modal — per-product returns */}
        <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Trip</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {tripProducts.map((tp) => {
                const r = returns[tp.productId] ?? { rt: "", rl: "", dt: "", dl: "" };
                return (
                  <div key={tp.productId}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{tp.productName}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Returned Trays</label>
                        <Input type="number" value={r.rt} onChange={(e) => setReturn(tp.productId, "rt", e.target.value)} placeholder="0" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Returned Loose</label>
                        <Input type="number" value={r.rl} onChange={(e) => setReturn(tp.productId, "rl", e.target.value)} placeholder="0" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-red-500 uppercase mb-1 block">Damaged Trays</label>
                        <Input type="number" value={r.dt} onChange={(e) => setReturn(tp.productId, "dt", e.target.value)} placeholder="0" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-red-500 uppercase mb-1 block">Damaged Loose</label>
                        <Input type="number" value={r.dl} onChange={(e) => setReturn(tp.productId, "dl", e.target.value)} placeholder="0" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompleteModal(false)}>Cancel</Button>
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
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Amount</label>
                <Input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                <Input value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Employee</label>
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
              <Button variant="outline" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
              <Button onClick={handleAddExpense}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
