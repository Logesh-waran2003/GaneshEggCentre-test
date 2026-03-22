import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";
import { useSales } from "../../api/transactions";

export const Route = createFileRoute("/sales/")({
  beforeLoad: requireAuth,
  component: SalesList,
});

function SalesList() {
  const { token, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const { data: sales } = useSales(token, selectedDate);

  const totalAmount = sales.reduce((s: number, t: any) => s + t.amount, 0);
  const totalCash = sales.reduce((s: number, t: any) => s + (t.cashCollected ?? 0), 0);

  const dateInputValue = new Date(selectedDate).toISOString().split("T")[0];

  return (
    <div className="bg-gray-50 pb-24">
      <div className="p-4 max-w-md mx-auto">
        <header className="flex items-center gap-4 py-4">
          <Link to="/" className="p-2 rounded-2xl hover:bg-gray-100">
            <ArrowLeft className="size-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-indigo-950">Sales</h1>
        </header>

        {/* Date picker */}
        <div className="mb-4">
          <input
            type="date"
            value={dateInputValue}
            onChange={(e) => {
              const d = new Date(e.target.value);
              d.setHours(0, 0, 0, 0);
              setSelectedDate(d.getTime());
            }}
            className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Summary */}
        {sales.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Sales</p>
              <p className="font-bold text-gray-900">{sales.length}</p>
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

        {/* List */}
        <div className="space-y-3">
          {sales.map((sale: any) => {
            const creditAmount = sale.amount - (sale.cashCollected ?? 0);
            return (
              <Link key={sale._id} to="/sales/$saleId" params={{ saleId: sale._id as string }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {sale.contact ? (
                          <User className="size-4 text-indigo-500 shrink-0" />
                        ) : (
                          <ShoppingBag className="size-4 text-emerald-500 shrink-0" />
                        )}
                        <p className="font-bold text-gray-900">
                          {sale.contact?.name ?? "Walk-in Sale"}
                        </p>
                      </div>
                      <p className="font-black text-indigo-700">₹{sale.amount.toLocaleString()}</p>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex gap-3">
                        {sale.cashCollected > 0 && (
                          <span className="text-emerald-600 font-medium">Cash ₹{sale.cashCollected}</span>
                        )}
                        {creditAmount > 0 && (
                          <span className="text-amber-600 font-medium">Credit ₹{creditAmount}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && sale.creator && (
                          <span className="text-gray-400">{sale.creator.name}</span>
                        )}
                        <Badge className="bg-gray-100 text-gray-600 text-[10px]">
                          {sale.items?.length ?? 0} item{sale.items?.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>

                    {sale.description && (
                      <p className="text-xs text-gray-400 mt-1 italic">{sale.description}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {sales.length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
              <ShoppingBag className="size-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No sales on this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
