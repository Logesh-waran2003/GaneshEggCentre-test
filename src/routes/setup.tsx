import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { requireAdmin } from "../lib/auth";
import { useTodayRates, useSetDailyRate } from "../api/rates";
import { useProducts } from "../api/products";
import { Rate } from "../types/rate";
import { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/setup")({
  beforeLoad: requireAdmin,
  component: Setup,
});

function Setup() {
  const { data: rates } = useTodayRates();
  const { data: products } = useProducts();
  const setDailyRate = useSetDailyRate();
  const router = useRouter();

  const [productRates, setProductRates] = useState<
    Record<string, { neccPerEgg: string; perEgg: string; perTray: string }>
  >(() => {
    const initial: Record<string, { neccPerEgg: string; perEgg: string; perTray: string }> = {};
    products.forEach((product) => {
      const rate = rates.find((r: Rate) => r.productId === product._id);
      initial[product._id] = {
        neccPerEgg: rate?.neccRatePerEgg?.toString() || "",
        perEgg: rate?.ratePerEgg?.toString() || "",
        perTray: rate?.ratePerTray?.toString() || "",
      };
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      for (const product of products) {
        const rate = productRates[product._id];
        if (rate?.perEgg && rate?.perTray) {
          await setDailyRate({
            productId: product._id as Id<"products">,
            neccRatePerEgg: rate.neccPerEgg ? Number(rate.neccPerEgg) : undefined,
            ratePerEgg: Number(rate.perEgg),
            ratePerTray: Number(rate.perTray),
          });
        }
      }
      router.navigate({ to: "/" });
    } catch (err) {
      console.error(err);
      alert("Failed to save rates");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto">
      <header className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl">
          <Link to="/">
            <ArrowLeft className="size-6 text-gray-600" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-indigo-950">Morning Routine</h1>
      </header>

      <Card className="border-indigo-100 shadow-xl shadow-indigo-50 overflow-visible">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-indigo-900 flex items-center gap-2">
            Set Today's Board Rates
          </CardTitle>
          <p className="text-gray-500 text-sm">
            Default prices for all transactions today.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            {products.map((product) => (
              <div key={product._id} className="space-y-3 pb-4 border-b border-gray-100 last:border-0">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  {product.name}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">NECC Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">₹</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={productRates[product._id]?.neccPerEgg || ""}
                        onChange={(e) => {
                          const neccPerEgg = e.target.value;
                          setProductRates((prev) => {
                            const cur = prev[product._id] ?? { neccPerEgg: "", perEgg: "", perTray: "" };
                            return { ...prev, [product._id]: { ...cur, neccPerEgg } };
                          });
                        }}
                        className="pl-7 font-bold text-indigo-950 h-12"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Selling Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">₹</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={productRates[product._id]?.perEgg || ""}
                        onChange={(e) => {
                          const perEgg = e.target.value;
                          const perTray = perEgg ? (Number(perEgg) * product.eggsPerTray).toFixed(2) : "";
                          setProductRates((prev) => {
                            const cur = prev[product._id] ?? { neccPerEgg: "", perEgg: "", perTray: "" };
                            return { ...prev, [product._id]: { ...cur, perEgg, perTray } };
                          });
                        }}
                        className="pl-7 font-bold text-indigo-950 h-12"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Per Tray</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">₹</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={productRates[product._id]?.perTray || ""}
                        onChange={(e) => {
                          const perTray = e.target.value;
                          setProductRates((prev) => {
                            const cur = prev[product._id] ?? { neccPerEgg: "", perEgg: "", perTray: "" };
                            return { ...prev, [product._id]: { ...cur, perTray } };
                          });
                        }}
                        className="pl-7 font-bold text-indigo-950 h-12"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>
                {(() => {
                  const r = productRates[product._id];
                  const margin = r?.neccPerEgg && r?.perEgg ? Number(r.perEgg) - Number(r.neccPerEgg) : null;
                  return margin !== null ? (
                    <p className={`text-xs font-bold mt-1 ${margin >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      Margin: {margin >= 0 ? "+" : ""}₹{margin.toFixed(2)}/egg
                    </p>
                  ) : null;
                })()}
              </div>
            ))}

            <div className="pt-4 sticky bottom-4">
              <Button
                type="submit"
                size="xl"
                variant="premium"
                className="w-full shadow-indigo-200"
                disabled={isSaving}
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="size-6 mr-2" /> Finish Daily Setup
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-gray-400 text-xs px-8">
          Rates set here will pre-fill all sales and purchases. You can override
          them for specific customers.
        </p>
      </div>
    </div>
  );
}
