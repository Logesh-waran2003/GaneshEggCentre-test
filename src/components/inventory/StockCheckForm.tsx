import { useState } from "react";
import { toast } from "sonner";
import { parseError } from "../../lib/parseError";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { VarianceDisplay } from "./VarianceDisplay";
import { usePerformStockCheck } from "../../api/inventory";
import type { Id } from "../../../convex/_generated/dataModel";

interface Product {
  _id: Id<"products">;
  name: string;
  currentStockQtyTrays: number;
  currentStockQtyLoose: number;
}

interface StockCheckFormProps {
  products: Product[];
  onClose: () => void;
}

type CheckType = "MORNING" | "EVENING";
type Counts = Record<string, { trays: number; loose: number; remarks: string }>;

export function StockCheckForm({ products, onClose }: StockCheckFormProps) {
  const [checkType, setCheckType] = useState<CheckType | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const performCheck = usePerformStockCheck();

  const updateCount = (id: string, field: "trays" | "loose" | "remarks", value: number | string) => {
    setCounts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const getVariance = (productId: string, field: "trays" | "loose") => {
    const product = products.find((p) => p._id === productId);
    if (!product || !counts[productId]) return 0;
    const system = field === "trays" ? product.currentStockQtyTrays : product.currentStockQtyLoose;
    return (counts[productId][field] as number) - system;
  };

  const handleSubmit = async () => {
    if (!checkType) return;
    setIsSubmitting(true);
    try {
      await performCheck({
        type: checkType,
        checks: products.map((p) => ({
          productId: p._id,
          physicalQtyTrays: counts[p._id]?.trays || 0,
          physicalQtyLoose: counts[p._id]?.loose || 0,
          remarks: counts[p._id]?.remarks || undefined,
        })),
      });
      onClose();
    } catch (error) {
      console.error("Failed to submit stock check", error);
      toast.error(parseError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-24">
        {!checkType ? (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm mb-4">
              Enter physical counts to sync system inventory with actual stock. Any variances will be recorded and inventory will be updated.
            </p>
            <button
              onClick={() => setCheckType("MORNING")}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-semibold transition-all shadow-md"
            >
              Morning Check
            </button>
            <button
              onClick={() => setCheckType("EVENING")}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-4 rounded-xl font-semibold transition-all shadow-md"
            >
              Evening Check
            </button>
          </div>
        ) : (
          <>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <p className="text-indigo-700 text-sm font-semibold">{checkType} CHECK — Enter Physical Counts</p>
            </div>

            {products.map((product) => {
              const varianceTrays = getVariance(product._id, "trays");
              const varianceLoose = getVariance(product._id, "loose");
              const hasInput = !!counts[product._id];
              const hasVariance = hasInput && (varianceTrays !== 0 || varianceLoose !== 0);

              return (
                <Card key={product._id} className="border-gray-200 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-gray-900 font-semibold">{product.name}</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-500 text-xs mb-1 block font-medium">System Trays</label>
                        <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-700 font-semibold">{product.currentStockQtyTrays}</div>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs mb-1 block font-medium">Physical Trays</label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          min="0"
                          value={counts[product._id]?.trays || ""}
                          onChange={(e) => updateCount(product._id, "trays", Number(e.target.value) || 0)}
                          onWheel={(e) => { e.preventDefault(); e.currentTarget.blur(); }}
                          className="border-gray-200 text-gray-900 font-semibold h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-500 text-xs mb-1 block font-medium">System Loose</label>
                        <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-700 font-semibold">{product.currentStockQtyLoose}</div>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs mb-1 block font-medium">Physical Loose</label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          min="0"
                          value={counts[product._id]?.loose || ""}
                          onChange={(e) => updateCount(product._id, "loose", Number(e.target.value) || 0)}
                          onWheel={(e) => { e.preventDefault(); e.currentTarget.blur(); }}
                          className="border-gray-200 text-gray-900 font-semibold h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-500 text-xs mb-1 block font-medium">Remarks (optional)</label>
                      <Input
                        type="text"
                        placeholder="e.g., Breakage, theft, counting error"
                        value={counts[product._id]?.remarks || ""}
                        onChange={(e) => updateCount(product._id, "remarks", e.target.value)}
                        className="border-gray-200 text-gray-900 text-sm"
                      />
                    </div>

                    {hasVariance && (
                      <VarianceDisplay varianceTrays={varianceTrays} varianceLoose={varianceLoose} />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>

      {checkType && (
        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-5 rounded-xl text-base font-semibold shadow-lg"
          >
            {isSubmitting ? "Saving..." : "Submit Stock Check"}
          </Button>
        </div>
      )}
    </div>
  );
}
