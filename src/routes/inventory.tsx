import { createFileRoute, Link } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Package, CheckCircle2, AlertCircle, X, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/inventory")({
  component: Inventory,
});

function Inventory() {
  const { data: products } = useSuspenseQuery(
    convexQuery(api.inventory.getCurrentStock, {}),
  );
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-gray-50 p-4 pb-32 safe-area-inset">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 py-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-indigo-950">Inventory</h1>
            <p className="text-gray-500 text-sm">Current Stock Levels</p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-2xl">
            <Package className="text-indigo-600 size-6" />
          </div>
        </header>

        {/* Stock Cards */}
        <div className="space-y-3 mb-6">
          {products.map((product) => (
            <Card key={product._id} className="border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  {product.name}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-indigo-600 text-xs font-medium mb-1 uppercase tracking-wider">
                      Trays
                    </p>
                    <p className="text-3xl font-bold text-indigo-950">
                      {product.currentStockQtyTrays}
                    </p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3">
                    <p className="text-violet-600 text-xs font-medium mb-1 uppercase tracking-wider">
                      Loose Eggs
                    </p>
                    <p className="text-3xl font-bold text-violet-950">
                      {product.currentStockQtyLoose}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stock Check Button */}
        <Button
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-6 rounded-xl text-base font-semibold shadow-lg shadow-indigo-200"
        >
          Perform Stock Check
        </Button>

        {/* Stock Check Modal */}
        <AnimatePresence>
          {showModal && (
            <StockCheckModal
              products={products}
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StockCheckModal({
  products,
  onClose,
}: {
  products: Array<{
    _id: Id<"products">;
    name: string;
    currentStockQtyTrays: number;
    currentStockQtyLoose: number;
  }>;
  onClose: () => void;
}) {
  const [checkType, setCheckType] = useState<"MORNING" | "EVENING" | null>(
    null,
  );
  const [counts, setCounts] = useState<
    Record<string, { trays: number; loose: number; remarks: string }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const performCheck = useMutation(api.inventory.performStockCheck);

  const handleSubmit = async () => {
    if (!checkType) return;

    setIsSubmitting(true);
    try {
      const checks = products.map((p) => ({
        productId: p._id,
        physicalQtyTrays: counts[p._id]?.trays || 0,
        physicalQtyLoose: counts[p._id]?.loose || 0,
        remarks: counts[p._id]?.remarks || undefined,
      }));

      await performCheck({ type: checkType, checks });
      onClose();
    } catch (error) {
      console.error("Failed to submit stock check", error);
      alert("Failed to submit stock check");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVariance = (productId: string, field: "trays" | "loose") => {
    const product = products.find((p) => p._id === productId);
    if (!product || !counts[productId]) return 0;
    const physical = counts[productId][field];
    const system =
      field === "trays"
        ? product.currentStockQtyTrays
        : product.currentStockQtyLoose;
    return physical - system;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Stock Check</h2>
            <p className="text-xs text-gray-500 mt-1">
              Verify physical counts match system records
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Check Type Selection */}
          {!checkType && (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm mb-4">
                Enter physical counts to sync system inventory with actual
                stock. Any variances will be recorded and inventory will be
                updated.
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
          )}

          {/* Input Form */}
          {checkType && (
            <>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                <p className="text-indigo-700 text-sm font-semibold">
                  {checkType} CHECK - Enter Physical Counts
                </p>
              </div>

              {products.map((product) => {
                const varianceTrays = getVariance(product._id, "trays");
                const varianceLoose = getVariance(product._id, "loose");
                const hasInput = counts[product._id];
                const hasVariance =
                  hasInput && (varianceTrays !== 0 || varianceLoose !== 0);

                return (
                  <Card key={product._id} className="border-gray-200 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <h3 className="text-gray-900 font-semibold">
                        {product.name}
                      </h3>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block font-medium">
                            System Trays
                          </label>
                          <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-700 font-semibold">
                            {product.currentStockQtyTrays}
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block font-medium">
                            Physical Trays
                          </label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            min="0"
                            value={counts[product._id]?.trays || ""}
                            onChange={(e) =>
                              setCounts((prev) => ({
                                ...prev,
                                [product._id]: {
                                  ...prev[product._id],
                                  trays: Number(e.target.value) || 0,
                                },
                              }))
                            }
                            onWheel={(e) => {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }}
                            className="border-gray-200 text-gray-900 font-semibold h-10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block font-medium">
                            System Loose
                          </label>
                          <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-700 font-semibold">
                            {product.currentStockQtyLoose}
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs mb-1 block font-medium">
                            Physical Loose
                          </label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            min="0"
                            value={counts[product._id]?.loose || ""}
                            onChange={(e) =>
                              setCounts((prev) => ({
                                ...prev,
                                [product._id]: {
                                  ...prev[product._id],
                                  loose: Number(e.target.value) || 0,
                                },
                              }))
                            }
                            onWheel={(e) => {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }}
                            className="border-gray-200 text-gray-900 font-semibold h-10"
                          />
                        </div>
                      </div>

                      {/* Remarks */}
                      <div>
                        <label className="text-gray-500 text-xs mb-1 block font-medium">
                          Remarks (optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Breakage, theft, counting error"
                          value={counts[product._id]?.remarks || ""}
                          onChange={(e) =>
                            setCounts((prev) => ({
                              ...prev,
                              [product._id]: {
                                ...prev[product._id],
                                remarks: e.target.value,
                              },
                            }))
                          }
                          className="border-gray-200 text-gray-900 text-sm"
                        />
                      </div>

                      {/* Variance Display */}
                      {hasVariance && (
                        <div
                          className={`flex items-center gap-2 p-3 rounded-lg ${
                            varianceTrays === 0 && varianceLoose === 0
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          {varianceTrays === 0 && varianceLoose === 0 ? (
                            <>
                              <CheckCircle2 className="size-5 text-green-600" />
                              <span className="text-green-700 text-sm font-semibold">
                                Perfect Match ✓
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="size-5 text-red-600" />
                              <span className="text-red-700 text-sm font-medium">
                                Variance:{" "}
                                {varianceTrays !== 0 &&
                                  `${varianceTrays > 0 ? "+" : ""}${varianceTrays} trays`}
                                {varianceTrays !== 0 &&
                                  varianceLoose !== 0 &&
                                  ", "}
                                {varianceLoose !== 0 &&
                                  `${varianceLoose > 0 ? "+" : ""}${varianceLoose} loose`}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-5 rounded-xl text-base font-semibold shadow-lg"
              >
                {isSubmitting ? "Saving..." : "Submit Stock Check"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
