import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";

export const Route = createFileRoute("/trips/new")({
  beforeLoad: requireAuth,
  component: NewTrip,
});

function NewTrip() {
  const { token } = useAuth();
  
  if (!token) return null;
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.getProducts, {})
  );
  const { data: users } = useSuspenseQuery(
    convexQuery(api.users.listUsers, { token: token! })
  );
  const createTrip = useMutation(api.saleTrips.createTrip);
  const router = useRouter();

  const [productId, setProductId] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [loadedTrays, setLoadedTrays] = useState("");
  const [loadedLoose, setLoadedLoose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employees = users.filter((u: any) => u.role === "EMPLOYEE" && u.isActive);

  const toggleEmployee = (userId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!productId || selectedEmployees.length === 0 || !loadedTrays) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTrip({
        token: token!,
        productId: productId as any,
        employees: selectedEmployees as any,
        loadedQtyTrays: Number(loadedTrays),
        loadedQtyLoose: Number(loadedLoose) || 0,
      });
      router.navigate({ to: "/trips" });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold text-indigo-950">New Sale Trip</h1>
        </header>

        <section className="space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
              Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full h-14 bg-white border-none rounded-2xl shadow-sm px-4 font-bold"
            >
              <option value="">Select product</option>
              {products.map((p: any) => (
                <option key={p._id} value={p._id}>
                  {p.name} Egg (Stock: {p.currentStockQtyTrays}T + {p.currentStockQtyLoose}L)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
              Employees
            </label>
            <div className="space-y-2">
              {employees.map((emp: any) => (
                <Card
                  key={emp._id}
                  className={`cursor-pointer transition-all ${
                    selectedEmployees.includes(emp._id)
                      ? "bg-indigo-50 border-indigo-300"
                      : "bg-white"
                  }`}
                  onClick={() => toggleEmployee(emp._id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-bold">{emp.name}</span>
                    {selectedEmployees.includes(emp._id) && (
                      <Check className="size-5 text-indigo-600" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
              Loaded Quantity
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                  Trays
                </label>
                <Input
                  type="number"
                  value={loadedTrays}
                  onChange={(e) => setLoadedTrays(e.target.value)}
                  className="h-14 bg-white border-none font-bold text-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                  Loose
                </label>
                <Input
                  type="number"
                  value={loadedLoose}
                  onChange={(e) => setLoadedLoose(e.target.value)}
                  className="h-14 bg-white border-none font-bold text-lg"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <Button
            size="xl"
            variant="premium"
            className="w-full"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Creating..." : <><Check className="size-6 mr-2" /> Create Trip</>}
          </Button>
        </div>
      </footer>
    </div>
  );
}
