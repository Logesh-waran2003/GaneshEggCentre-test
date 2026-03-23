import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentStock } from "../api/inventory";
import { useAdjustStock } from "../api/inventory";
import { useState } from "react";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { requireAuth } from "../lib/auth";
import { StockCard } from "../components/inventory/StockCard";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { parseError } from "../lib/parseError";
import { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/inventory")({
  beforeLoad: requireAuth,
  component: Inventory,
});

function Inventory() {
  const { data: products } = useCurrentStock();
  const adjustStock = useAdjustStock();
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [productId, setProductId] = useState("");
  const [adjustTrays, setAdjustTrays] = useState("");
  const [adjustLoose, setAdjustLoose] = useState("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setIsSaving(true);
    try {
      await adjustStock({
        token: token!,
        productId: productId as Id<"products">,
        adjustTrays: Number(adjustTrays) || 0,
        adjustLoose: Number(adjustLoose) || 0,
        reason,
      });
      setShowModal(false);
      setProductId("");
      setAdjustTrays("");
      setAdjustLoose("");
      setReason("");
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 p-4 pb-32 safe-area-inset">
      <div className="max-w-md mx-auto">
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

        <div className="space-y-3 mb-6">
          {products.map((product) => (
            <StockCard key={product._id} {...product} />
          ))}
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-6 rounded-xl text-base font-semibold shadow-lg shadow-indigo-200"
        >
          Adjust Stock
        </Button>

        <Sheet open={showModal} onOpenChange={setShowModal}>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>Adjust Stock</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Trays (+ add / - remove)</label>
                <Input
                  type="number"
                  value={adjustTrays}
                  onChange={(e) => setAdjustTrays(e.target.value)}
                  placeholder="0"
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Loose eggs (+ add / - remove)</label>
                <Input
                  type="number"
                  value={adjustLoose}
                  onChange={(e) => setAdjustLoose(e.target.value)}
                  placeholder="0"
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Reason</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Breakage, correction..."
                  required
                  className="h-12"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Saving..." : "Apply Adjustment"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
