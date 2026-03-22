import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { ArrowLeft, Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";
import { useProducts } from "../../api/products";
import { useListActiveEmployees } from "../../api/users";
import { useCreateTrip } from "../../api/trips";
import { Product } from "../../types/product";
import { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/trips/new")({
  beforeLoad: requireAuth,
  component: NewTrip,
});

interface TripItem {
  productId: Id<"products">;
  productName: string;
  loadedQtyTrays: string;
  loadedQtyLoose: string;
}

function NewTrip() {
  const { token } = useAuth();

  if (!token) return null;
  const { data: products } = useProducts();
  const { data: users } = useListActiveEmployees();
  const createTrip = useCreateTrip();
  const router = useRouter();

  const [items, setItems] = useState<TripItem[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Id<"users">[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employees = users.filter((u) => u.role === "EMPLOYEE");
  const addedProductIds = new Set(items.map((i) => i.productId));
  const availableProducts = products.filter((p: Product) => !addedProductIds.has(p._id));

  const addProduct = (product: Product) => {
    setItems([...items, {
      productId: product._id,
      productName: product.name,
      loadedQtyTrays: "",
      loadedQtyLoose: "",
    }]);
  };

  const removeProduct = (productId: Id<"products">) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const updateItem = (productId: Id<"products">, field: "loadedQtyTrays" | "loadedQtyLoose", value: string) => {
    setItems(items.map((i) => i.productId === productId ? { ...i, [field]: value } : i));
  };

  const toggleEmployee = (userId: Id<"users">) => {
    setSelectedEmployees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (items.length === 0 || selectedEmployees.length === 0) {
      alert("Please add at least one product and select employees");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTrip({
        token: token!,
        employees: selectedEmployees,
        products: items.map((i) => ({
          productId: i.productId,
          loadedQtyTrays: Number(i.loadedQtyTrays) || 0,
          loadedQtyLoose: Number(i.loadedQtyLoose) || 0,
        })),
      });
      router.navigate({ to: "/trips" });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold text-indigo-950">New Sale Trip</h1>
        </header>

        <section className="space-y-6">
          {/* Products */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
              Products
            </label>

            {items.length > 0 && (
              <div className="space-y-3 mb-3">
                {items.map((item) => (
                  <Card key={item.productId} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-900">{item.productName}</span>
                        <button onClick={() => removeProduct(item.productId)}>
                          <X className="size-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                            Trays
                          </label>
                          <Input
                            type="number"
                            value={item.loadedQtyTrays}
                            onChange={(e) => updateItem(item.productId, "loadedQtyTrays", e.target.value)}
                            className="h-12 bg-gray-50 border-none font-bold"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                            Loose
                          </label>
                          <Input
                            type="number"
                            value={item.loadedQtyLoose}
                            onChange={(e) => updateItem(item.productId, "loadedQtyLoose", e.target.value)}
                            className="h-12 bg-gray-50 border-none font-bold"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {availableProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {availableProducts.map((p: Product) => (
                  <Button
                    key={p._id}
                    variant="outline"
                    className="h-14 rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                    onClick={() => addProduct(p)}
                  >
                    <Plus className="size-4 mr-2" />
                    {p.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Employees */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
              Employees
            </label>
            <div className="space-y-2">
              {employees.map((emp) => (
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
