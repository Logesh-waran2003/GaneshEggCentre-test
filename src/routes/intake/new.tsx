import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { ArrowLeft, Check, Search, UserCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/intake/new")({
  component: NewIntake,
});

function NewIntake() {
  const { data: contacts } = useSuspenseQuery(
    convexQuery(api.contacts.getContacts, { type: "vendor" })
  );
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.getProducts, {})
  );
  const createTransaction = useMutation(api.transactions.createTransaction);

  const router = useRouter();

  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCash, setIsCash] = useState(false);

  const filteredContacts = useMemo(
    () =>
      contacts.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [contacts, search]
  );

  const addItem = (product: any) => {
    setItems([...items, { product, qtyTrays: 0, qtyLoose: 0, rateApplied: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const totalAmount = items.reduce((acc, item) => {
    const totalEggs = item.qtyTrays * 30 + item.qtyLoose;
    return acc + totalEggs * item.rateApplied;
  }, 0);

  const handleSave = async () => {
    if (!selectedContact) {
      alert("Please select a supplier");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Record Purchase
      await createTransaction({
        contactId: selectedContact._id,
        type: "PURCHASE",
        amount: totalAmount,
        date: Date.now(),
        items: items.map((item) => ({
          productId: item.product._id,
          qtyTrays: Number(item.qtyTrays),
          qtyLoose: Number(item.qtyLoose),
          rateApplied: Number(item.rateApplied),
          breakageQty: 0,
        })),
      });

      // 2. If Cash, record payment out immediately
      if (isCash) {
        await createTransaction({
          contactId: selectedContact._id,
          type: "PAYMENT_OUT",
          amount: totalAmount,
          date: Date.now(),
          description: "Cash payment for purchase",
        });
      }

      router.navigate({ to: "/" });
    } catch (err) {
      console.error(err);
      alert("Failed to record intake");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <div className="p-4 safe-area-inset max-w-md mx-auto w-full flex-1">
        <header className="flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild className="rounded-2xl">
            <Link to="/">
              <ArrowLeft className="size-6 text-gray-600" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-indigo-950">Record Intake</h1>
        </header>

        {/* Supplier Selection */}
        <section className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">
            Supplier / Poultry Farm
          </label>
          {!selectedContact ? (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <Input
                placeholder="Search supplier..."
                className="pl-12 bg-white border-none shadow-sm h-16 rounded-2xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50">
                  {filteredContacts.map((c: any) => (
                    <button
                      key={c._id}
                      className="w-full p-4 text-left border-b border-gray-50 last:border-0 hover:bg-amber-50 flex items-center gap-3"
                      onClick={() => {
                        setSelectedContact(c);
                        setSearch("");
                      }}
                    >
                      <UserCircle className="size-6 text-gray-400" />
                      <div>
                        <p className="font-bold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">Supplier</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card className="bg-amber-500 text-white border-none shadow-lg shadow-amber-100 italic-none">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <UserCircle className="size-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">
                      {selectedContact.name}
                    </h3>
                    <p className="text-white/70 text-sm font-medium">
                      Balance: ₹
                      {Math.abs(
                        selectedContact.currentBalance
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => setSelectedContact(null)}
                >
                  Change
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Payment Status */}
        <section className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">
            Payment Status
          </label>
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setIsCash(false)}
              className={cn(
                "py-3 font-bold text-sm rounded-xl transition-all",
                !isCash ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"
              )}
            >
              Credit (Pay Later)
            </button>
            <button
              onClick={() => setIsCash(true)}
              className={cn(
                "py-3 font-bold text-sm rounded-xl transition-all",
                isCash ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500"
              )}
            >
              Cash (Paid Now)
            </button>
          </div>
        </section>

        {/* Items Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block ml-1">
              Egg Varieties Received
            </label>
            <div className="flex gap-2">
              {products.map((p: any) => (
                <Button
                  key={p._id}
                  size="sm"
                  variant="outline"
                  className="rounded-full bg-white text-amber-600 border-amber-100 shadow-sm"
                  onClick={() => addItem(p)}
                >
                  + Add {p.name}
                </Button>
              ))}
            </div>
          </div>

          {items.map((item: any, idx: number) => (
            <Card
              key={idx}
              className="bg-white border-gray-100 shadow-sm overflow-visible"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-indigo-950 font-black text-xl tracking-tighter uppercase">
                    {item.product.name} Egg
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-400"
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  >
                    ×
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Trays
                    </label>
                    <Input
                      type="number"
                      value={item.qtyTrays}
                      onChange={(e) =>
                        updateItem(idx, "qtyTrays", e.target.value)
                      }
                      className="h-12 bg-gray-50 border-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Loose
                    </label>
                    <Input
                      type="number"
                      value={item.qtyLoose}
                      onChange={(e) =>
                        updateItem(idx, "qtyLoose", e.target.value)
                      }
                      className="h-12 bg-gray-50 border-none font-bold"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                    Purchase Rate (Per Egg)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.rateApplied}
                    onChange={(e) =>
                      updateItem(idx, "rateApplied", e.target.value)
                    }
                    className="h-12 bg-gray-50 border-none font-bold text-amber-600"
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Summary */}
        {items.length > 0 && (
          <section className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                Total Cost
              </p>
              <p className="text-3xl font-black text-indigo-950">
                ₹{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Post-Balance
              </p>
              <p className="text-sm font-bold text-gray-600">
                {isCash ? "Paid in Full" : "Added to Ledger"}
              </p>
            </div>
          </section>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <Button
            size="xl"
            variant="premium"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-200"
            disabled={isSubmitting || !selectedContact || items.length === 0}
            onClick={handleSave}
          >
            {isSubmitting ? (
              "Recording..."
            ) : (
              <>
                <Check className="size-6 mr-2" /> Complete Intake
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
