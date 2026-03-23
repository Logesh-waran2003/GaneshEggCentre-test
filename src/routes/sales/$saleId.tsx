import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ArrowLeft, ShoppingBag, User, Pencil, Check, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";
import { useSales, useUpdateSale, useDeleteSale } from "../../api/transactions";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { parseError } from "../../lib/parseError";

export const Route = createFileRoute("/sales/$saleId")({
  beforeLoad: requireAuth,
  component: SaleDetail,
});

function SaleDetail() {
  const { saleId } = Route.useParams();
  const { token, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const navigate = useNavigate();

  const { data: sales } = useSales(token, undefined);
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();

  const sale = sales.find((s: any) => s._id === saleId);

  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!sale) {
    return (
      <div className="bg-gray-50 pb-24">
        <div className="p-4 max-w-md mx-auto">
          <header className="flex items-center gap-4 py-4">
            <Link to="/sales" className="p-2 rounded-2xl hover:bg-gray-100">
              <ArrowLeft className="size-6 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-indigo-950">Sale Details</h1>
          </header>
          <p className="text-gray-400 text-sm text-center py-12">Sale not found</p>
        </div>
      </div>
    );
  }

  const creditAmount = sale.amount - (sale.cashCollected ?? 0);
  const canEdit = isAdmin || sale.createdBy === currentUser?._id;

  const handleSaveRemarks = async () => {
    try {
      await updateSale({
        token: token!,
        transactionId: saleId as Id<"transactions">,
        description: remarks || undefined,
      });
      setEditingRemarks(false);
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSale({ token: token!, transactionId: saleId as Id<"transactions"> });
      navigate({ to: "/sales" });
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const startEdit = () => {
    setRemarks(sale.description ?? "");
    setEditingRemarks(true);
  };

  return (
    <div className="bg-gray-50 pb-24">
      <div className="p-4 max-w-md mx-auto">
        <header className="flex items-center gap-4 py-4">
          <Link to="/sales" className="p-2 rounded-2xl hover:bg-gray-100">
            <ArrowLeft className="size-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-indigo-950 flex-1">Sale Details</h1>
          {isAdmin && !confirmDelete && (
            <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-2xl hover:bg-red-50 text-red-400">
              <Trash2 className="size-5" />
            </button>
          )}
          {isAdmin && confirmDelete && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500 font-medium">Delete?</span>
              <button onClick={handleDelete} className="p-1.5 rounded-xl bg-red-100 text-red-600">
                <Check className="size-4" />
              </button>
              <button onClick={() => setConfirmDelete(false)} className="p-1.5 rounded-xl bg-gray-100 text-gray-500">
                <X className="size-4" />
              </button>
            </div>
          )}
        </header>

        {/* Customer + amount */}
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${sale.contact ? "bg-indigo-100" : "bg-emerald-100"}`}>
                {sale.contact
                  ? <User className="size-5 text-indigo-600" />
                  : <ShoppingBag className="size-5 text-emerald-600" />
                }
              </div>
              <div>
                <p className="font-bold text-gray-900">{sale.contact?.name ?? "Walk-in Sale"}</p>
                {sale.contact?.phone && (
                  <p className="text-xs text-gray-500">{sale.contact.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="font-black text-indigo-700">₹{sale.amount.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Cash</p>
                <p className="font-black text-emerald-600">₹{(sale.cashCollected ?? 0).toLocaleString()}</p>
              </div>
              <div className={`rounded-xl p-3 ${creditAmount > 0 ? "bg-amber-50" : "bg-gray-50"}`}>
                <p className="text-xs text-gray-500 mb-1">Credit</p>
                <p className={`font-black ${creditAmount > 0 ? "text-amber-600" : "text-gray-400"}`}>
                  ₹{creditAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {isAdmin && sale.creator && (
              <p className="text-xs text-gray-400 mt-3">
                Recorded by <span className="font-medium text-gray-600">{sale.creator.name}</span>
                {" · "}{new Date(sale.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <section className="mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Items</h2>
          <div className="space-y-2">
            {sale.items.map((item: any) => (
              <Card key={item._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{item.product?.name ?? "Unknown"}</p>
                      <p className="text-xs text-gray-500">
                        {item.qtyTrays}T + {item.qtyLoose}L · ₹{item.rateApplied}/egg
                        {item.breakageQty > 0 && (
                          <span className="text-red-500 ml-2">Breakage: {item.breakageQty}</span>
                        )}
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

        {/* Remarks */}
        <section className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Remarks</h2>
            {canEdit && !editingRemarks && (
              <button onClick={startEdit} className="text-indigo-600 p-1">
                <Pencil className="size-4" />
              </button>
            )}
          </div>
          {editingRemarks ? (
            <div className="flex gap-2">
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add remarks..."
                className="flex-1"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSaveRemarks}>
                <Check className="size-4 text-emerald-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setEditingRemarks(false)}>
                <X className="size-4 text-gray-400" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-600 ml-1">
              {sale.description || <span className="text-gray-400 italic">No remarks</span>}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
