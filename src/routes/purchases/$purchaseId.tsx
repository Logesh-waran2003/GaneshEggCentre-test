import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";
import { usePurchases } from "../../api/transactions";

export const Route = createFileRoute("/purchases/$purchaseId")({
  beforeLoad: requireAuth,
  component: PurchaseDetail,
});

function PurchaseDetail() {
  const { purchaseId } = Route.useParams();
  const { token, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const { data: purchases } = usePurchases(token, undefined);
  const purchase = purchases.find((p: any) => p._id === purchaseId);

  if (!purchase) {
    return (
      <div className="bg-gray-50 pb-24">
        <div className="p-4 max-w-md mx-auto">
          <header className="flex items-center gap-4 py-4">
            <Link to="/purchases" className="p-2 rounded-2xl hover:bg-gray-100">
              <ArrowLeft className="size-6 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-indigo-950">Purchase Details</h1>
          </header>
          <p className="text-gray-400 text-sm text-center py-12">Purchase not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-24">
      <div className="p-4 max-w-md mx-auto">
        <header className="flex items-center gap-4 py-4">
          <Link to="/purchases" className="p-2 rounded-2xl hover:bg-gray-100">
            <ArrowLeft className="size-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-indigo-950">Purchase Details</h1>
        </header>

        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-100">
                <PackageOpen className="size-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{purchase.contact?.name ?? "Unknown Vendor"}</p>
                {purchase.contact?.phone && (
                  <p className="text-xs text-gray-500">{purchase.contact.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="font-black text-indigo-700">₹{purchase.amount.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Cash</p>
                <p className="font-black text-emerald-600">₹{(purchase.cashCollected ?? 0).toLocaleString()}</p>
              </div>
            </div>

            {isAdmin && purchase.creator && (
              <p className="text-xs text-gray-400 mt-3">
                Recorded by <span className="font-medium text-gray-600">{purchase.creator.name}</span>
                {" · "}{new Date(purchase.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </CardContent>
        </Card>

        <section className="mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Items</h2>
          <div className="space-y-2">
            {purchase.items.map((item: any) => (
              <Card key={item._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{item.product?.name ?? "Unknown"}</p>
                      <p className="text-xs text-gray-500">
                        {item.qtyTrays}T + {item.qtyLoose}L · ₹{item.rateApplied}/egg
                      </p>
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-700">
                      ₹{((item.qtyTrays * (item.product?.eggsPerTray ?? 30) + item.qtyLoose) * item.rateApplied).toFixed(0)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {purchase.description && (
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Remarks</h2>
            <p className="text-sm text-gray-600 ml-1">{purchase.description}</p>
          </section>
        )}
      </div>
    </div>
  );
}
