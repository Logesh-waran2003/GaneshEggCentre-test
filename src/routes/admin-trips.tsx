import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Truck, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { requireAdmin } from "../lib/auth";
import { useTodayTrips, useApproveStartTrip, useApproveEndTrip } from "../api/trips";
import { TripWithDetails } from "../types/trip";
import { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/admin-trips")({
  beforeLoad: requireAdmin,
  component: AdminTrips,
});

function AdminTrips() {
  const { token } = useAuth();
  const { data: trips } = useTodayTrips(token!);
  const approveStart = useApproveStartTrip();
  const approveEnd = useApproveEndTrip();

  const pendingApproval = (trips ?? []).filter((t: TripWithDetails) => t.status === "PENDING_APPROVAL");
  const inProgress = (trips ?? []).filter((t: TripWithDetails) => t.status === "IN_PROGRESS");
  const completed = (trips ?? []).filter((t: TripWithDetails) => t.status === "COMPLETED");

  const handleApproveStart = async (tripId: Id<"saleTrips">) => {
    try {
      await approveStart({ token: token!, tripId });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleApproveEnd = async (tripId: Id<"saleTrips">) => {
    try {
      await approveEnd({ token: token!, tripId });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="bg-gray-50 pb-24">
      <div className="p-4 max-w-2xl mx-auto">
        <header className="py-4">
          <h1 className="text-2xl font-bold text-indigo-950">Trip Management</h1>
          <p className="text-gray-600 text-sm">Approve and monitor sale trips</p>
        </header>

        {pendingApproval.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-amber-700">Pending Approval</h2>
            <div className="space-y-3">
              {pendingApproval.map((trip: any) => (
                <Card key={trip._id} className="border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">
                          {trip.tripProducts?.map((tp: any) => tp.productName).join(", ") || "No products"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {trip.employeeDetails?.map((e: any) => e?.name).join(", ")}
                        </p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">
                        Loaded: <span className="font-bold">
                          {trip.tripProducts?.reduce((s: number, tp: any) => s + tp.loadedQtyTrays, 0) ?? 0}T
                          {" + "}
                          {trip.tripProducts?.reduce((s: number, tp: any) => s + tp.loadedQtyLoose, 0) ?? 0}L
                        </span>
                      </p>
                      <Button size="sm" variant="premium" onClick={() => handleApproveStart(trip._id)}>
                        <CheckCircle className="size-4 mr-1" /> Approve Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {inProgress.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-blue-700">In Progress</h2>
            <div className="space-y-3">
              {inProgress.map((trip: any) => (
                <Card key={trip._id} className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">
                          {trip.tripProducts?.map((tp: any) => tp.productName).join(", ") || "No products"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {trip.employeeDetails?.map((e: any) => e?.name).join(", ")}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Loaded</p>
                        <p className="font-bold">
                          {trip.tripProducts?.reduce((s: number, tp: any) => s + tp.loadedQtyTrays, 0) ?? 0}T
                          {" + "}
                          {trip.tripProducts?.reduce((s: number, tp: any) => s + tp.loadedQtyLoose, 0) ?? 0}L
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Sold</p>
                        <p className="font-bold">
                          {trip.tripProducts?.reduce((s: number, tp: any) => s + tp.soldQtyTrays, 0) ?? 0}T
                          {" + "}
                          {trip.tripProducts?.reduce((s: number, tp: any) => s + tp.soldQtyLoose, 0) ?? 0}L
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Cash</p>
                        <p className="font-bold text-emerald-600">₹{trip.totalCashCollected}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-purple-700">Awaiting Final Approval</h2>
            <div className="space-y-3">
              {completed.map((trip: any) => (
                <Card key={trip._id} className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">
                          {trip.tripProducts?.map((tp: any) => tp.productName).join(", ") || "No products"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {trip.employeeDetails?.map((e: any) => e?.name).join(", ")}
                        </p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">Completed</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-gray-500 text-xs">Sold</p>
                        <p className="font-bold">
                          {trip.tripProducts?.reduce((s: number, tp: any) => s + tp.soldQtyTrays, 0) ?? 0}T
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Returned</p>
                        <p className="font-bold">
                          {trip.tripProducts?.reduce((s: number, tp: any) => s + tp.returnedQtyTrays, 0) ?? 0}T
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Damaged</p>
                        <p className="font-bold text-red-600">
                          {trip.tripProducts?.reduce((s: number, tp: any) => s + tp.damagedQtyTrays, 0) ?? 0}T
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Cash</p>
                        <p className="font-bold text-emerald-600">₹{trip.totalCashCollected}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="premium"
                      className="w-full"
                      onClick={() => handleApproveEnd(trip._id)}
                    >
                      <CheckCircle className="size-4 mr-1" /> Approve & Close
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {(trips ?? []).length === 0 && (
          <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
            <Truck className="size-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm font-medium">No trips today</p>
          </div>
        )}
      </div>
    </div>
  );
}
