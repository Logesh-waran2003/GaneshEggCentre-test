import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Plus, Truck, Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";
import { useTodayTrips } from "../../api/trips";
import { TripWithDetails } from "../../types/trip";

export const Route = createFileRoute("/trips/")({
  beforeLoad: requireAuth,
  component: TripsList,
});

function TripsList() {
  const { token } = useAuth();
  
  if (!token) return null;
  const { data: trips } = useTodayTrips(token);

  const statusColors = {
    PENDING_APPROVAL: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-purple-100 text-purple-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="bg-gray-50 pb-24">
      <div className="p-4 max-w-md mx-auto">
        <header className="py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-950">Sale Trips</h1>
          <Button asChild size="sm" variant="premium">
            <Link to="/trips/new">
              <Plus className="size-4 mr-1" /> New Trip
            </Link>
          </Button>
        </header>

        <div className="space-y-3">
          {(trips ?? []).map((trip: TripWithDetails) => (
            <Link key={trip._id} to="/trips/$tripId" params={{ tripId: trip._id as string }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="size-5 text-indigo-600" />
                      <h3 className="font-bold text-lg">
                        {trip.tripProducts?.map((tp) => tp.productName).join(", ") || "No products"}
                      </h3>
                    </div>
                    <Badge className={statusColors[trip.status as keyof typeof statusColors]}>
                      {trip.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Loaded</p>
                      <p className="font-bold">
                        {trip.tripProducts?.reduce((s, tp) => s + tp.loadedQtyTrays, 0) ?? 0}T
                        {" + "}
                        {trip.tripProducts?.reduce((s, tp) => s + tp.loadedQtyLoose, 0) ?? 0}L
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Sold</p>
                      <p className="font-bold">
                        {trip.tripProducts?.reduce((s, tp) => s + tp.soldQtyTrays, 0) ?? 0}T
                        {" + "}
                        {trip.tripProducts?.reduce((s, tp) => s + tp.soldQtyLoose, 0) ?? 0}L
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                    <Users className="size-4" />
                    {trip.employeeDetails?.map(e => e?.name).join(", ")}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {(trips ?? []).length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
              <Truck className="size-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No trips today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
