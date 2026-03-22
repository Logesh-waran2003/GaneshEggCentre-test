import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentStock } from "../api/inventory";
import { useState } from "react";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { requireAdmin } from "../lib/auth";
import { StockCard } from "../components/inventory/StockCard";
import { StockCheckForm } from "../components/inventory/StockCheckForm";

export const Route = createFileRoute("/inventory")({
  beforeLoad: requireAdmin,
  component: Inventory,
});

function Inventory() {
  const { data: products } = useCurrentStock();
  const [showModal, setShowModal] = useState(false);

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
          Perform Stock Check
        </Button>

        <Sheet open={showModal} onOpenChange={setShowModal}>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>Stock Check</SheetTitle>
            </SheetHeader>
            <StockCheckForm products={products} onClose={() => setShowModal(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
