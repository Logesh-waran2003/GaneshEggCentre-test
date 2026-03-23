import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";
import { usePurchases } from "../../api/transactions";
import { CalendarPicker } from "../../components/ui/CalendarPicker";

export const Route = createFileRoute("/purchases/")({
  beforeLoad: requireAuth,
  component: PurchasesList,
});

function PurchasesList() {
  const { token, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const { data: purchases } = usePurchases(token, selectedDate);

  const totalAmount = purchases.reduce((s: number, t: any) => s + t.amount, 0);
  const totalCash = purchases.reduce((s: number, t: any) => s + (t.cashCollected ?? 0), 0);

  return (
    <div className="bg-gray-50 pb-24">
      <div className="p-4 max-w-md mx-auto">
        <header className="flex items-center gap-4 py-4">
          <Link to="/" className="p-2 rounded-2xl hover:bg-gray-100">
            <ArrowLeft className="size-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-indigo-950">Purchases</h1>
        </header>

        <div className="mb-4">
          <CalendarPicker value={selectedDate} onChange={setSelectedDate} />
        </div>

        {purchases.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Count</p>
              <p className="font-bold text-gray-900">{purchases.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Total</p>
              <p className="font-bold text-indigo-700">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Cash</p>
              <p className="font-bold text-emerald-600">₹{totalCash.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {purchases.map((purchase: any) => (
            <Link key={purchase._id} to="/purchases/$purchaseId" params={{ purchaseId: purchase._id as string }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <PackageOpen className="size-4 text-green-500 shrink-0" />
                      <p className="font-bold text-gray-900">
                        {purchase.contact?.name ?? "Unknown Vendor"}
                      </p>
                    </div>
                    <p className="font-black text-indigo-700">₹{purchase.amount.toLocaleString()}</p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex gap-3">
                      {purchase.cashCollected > 0 && (
                        <span className="text-emerald-600 font-medium">Cash ₹{purchase.cashCollected}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && purchase.creator && (
                        <span className="text-gray-400">{purchase.creator.name}</span>
                      )}
                      <Badge className="bg-gray-100 text-gray-600 text-[10px]">
                        {purchase.items?.length ?? 0} item{purchase.items?.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>

                  {purchase.description && (
                    <p className="text-xs text-gray-400 mt-1 italic break-words">{purchase.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}

          {purchases.length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
              <PackageOpen className="size-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No purchases on this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
