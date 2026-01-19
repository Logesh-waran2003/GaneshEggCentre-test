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

export const Route = createFileRoute("/sales/new")({
  component: NewSale,
});

function NewSale() {
  const { data: contacts } = useSuspenseQuery(
    convexQuery(api.contacts.getContacts, { type: "customer" }),
  );
  const { data: rates } = useSuspenseQuery(
    convexQuery(api.rates.getTodayRates, {}),
  );
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.getProducts, {}),
  );
  const createTransaction = useMutation(api.transactions.createTransaction);

  const router = useRouter();

  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [remarks, setRemarks] = useState("");
  const [cashCollectedEnabled, setCashCollectedEnabled] = useState(false);
  const [cashCollected, setCashCollected] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredContacts = useMemo(
    () =>
      contacts.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [contacts, search],
  );

  const addItem = (product: any) => {
    const productRate = rates.find((r: any) => r.productId === product._id);

    const ratePerEgg = productRate?.ratePerEgg || 0;
    const ratePerTray = productRate?.ratePerTray || 0;

    const adjustment = selectedContact?.priceAdjustment || 0;

    setItems([
      ...items,
      {
        product,
        qtyTrays: 0,
        qtyLoose: 0,
        ratePerEgg: ratePerEgg + adjustment,
        ratePerTray: ratePerTray + adjustment * product.eggsPerTray,
        breakage: 0,
      },
    ]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const totalAmount = items.reduce((acc, item) => {
    const trayAmount = item.qtyTrays * item.ratePerTray;
    const looseAmount = item.qtyLoose * item.ratePerEgg;
    return acc + trayAmount + looseAmount;
  }, 0);

  const handleSave = async () => {
    if (!selectedContact) {
      setErrorMessage("Please select a customer");
      setShowError(true);
      return;
    }
    if (items.length === 0) {
      setErrorMessage("Please add at least one item");
      setShowError(true);
      return;
    }

    const cashAmount = cashCollectedEnabled ? Number(cashCollected) || 0 : 0;
    const creditAmount = totalAmount - cashAmount;

    // Show confirmation for credit or overpayment
    if (creditAmount > 0) {
      setConfirmationMessage(
        `Mark ₹${creditAmount.toLocaleString()} as credit?`,
      );
      setShowConfirmation(true);
      return;
    } else if (creditAmount < 0) {
      setConfirmationMessage(
        `Customer paid ₹${Math.abs(creditAmount).toLocaleString()} extra. This will be added to their credit balance. Continue?`,
      );
      setShowConfirmation(true);
      return;
    }

    // If no credit/overpayment, proceed directly
    await submitSale();
  };

  const submitSale = async () => {
    const cashAmount = cashCollectedEnabled ? Number(cashCollected) || 0 : 0;

    setIsSubmitting(true);
    try {
      await createTransaction({
        contactId: selectedContact._id,
        type: "SALE",
        amount: totalAmount,
        date: Date.now(),
        description: remarks || undefined,
        cashCollected: cashAmount > 0 ? cashAmount : undefined,
        items: items.map((item) => ({
          productId: item.product._id,
          qtyTrays: Number(item.qtyTrays) || 0,
          qtyLoose: Number(item.qtyLoose) || 0,
          rateApplied: Number(item.ratePerEgg) || 0,
          breakageQty: Number(item.breakage) || 0,
        })),
      });
      router.navigate({ to: "/" });
    } catch (err) {
      console.error("Transaction error:", err);
      const errorMsg = (err as Error).message;
      // Extract the actual error from Convex error format
      const match = errorMsg.match(/Uncaught Error: (.+?)(?:\n|$)/);
      const displayError = match ? match[1] : errorMsg;
      setErrorMessage(displayError);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-48">
      <div className="p-4 safe-area-inset max-w-md mx-auto w-full flex-1">
        <header className="flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild className="rounded-2xl">
            <Link to="/">
              <ArrowLeft className="size-6 text-gray-600" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-indigo-950">Record Sale</h1>
        </header>

        {/* Customer Selection */}
        <section className="mb-6">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
            Customer
          </label>
          {!selectedContact ? (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <Input
                placeholder="Search customer..."
                className="pl-12 bg-white border-none shadow-sm h-16 rounded-2xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                  {filteredContacts.map((c: any) => (
                    <button
                      key={c._id}
                      className="w-full p-4 text-left border-b border-gray-50 last:border-0 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                      onClick={() => {
                        setSelectedContact(c);
                        setSearch("");
                      }}
                    >
                      <UserCircle className="size-6 text-gray-400" />
                      <div>
                        <p className="font-bold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-100">
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
                      {selectedContact.currentBalance.toLocaleString()}
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

        {/* Items Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block ml-1">
              Items
            </label>
            <div className="flex flex-wrap gap-2">
              {products.map((p: any) => (
                <Button
                  key={p._id}
                  size="sm"
                  variant="outline"
                  className="rounded-full bg-white text-indigo-600 border-indigo-100 shadow-sm px-4"
                  onClick={() => addItem(p)}
                >
                  + {p.name}
                </Button>
              ))}
            </div>
          </div>

          {items.map((item: any, idx: number) => (
            <Card
              key={idx}
              className="bg-white border-gray-100 shadow-sm relative overflow-visible"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-indigo-950 font-black text-xl uppercase tracking-tighter">
                      {item.product.name} Egg
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Stock: {item.product.currentStockQtyTrays} trays,{" "}
                      {item.product.currentStockQtyLoose} loose
                    </p>
                  </div>
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
                      className="h-12 bg-gray-50 border-none font-bold text-lg"
                      placeholder="0"
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
                      className="h-12 bg-gray-50 border-none font-bold text-lg"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Rate Per Tray
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.ratePerTray}
                      onChange={(e) =>
                        updateItem(idx, "ratePerTray", e.target.value)
                      }
                      className="h-12 bg-gray-50 border-none font-bold text-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Rate Per Egg
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.ratePerEgg}
                      onChange={(e) =>
                        updateItem(idx, "ratePerEgg", e.target.value)
                      }
                      className="h-12 bg-gray-50 border-none font-bold text-indigo-600"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
                      Breakage (Loose Eggs)
                    </label>
                    <Input
                      type="number"
                      value={item.breakage}
                      onChange={(e) =>
                        updateItem(idx, "breakage", e.target.value)
                      }
                      className="h-12 bg-red-50/50 border-none font-bold text-red-600"
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">
                Add items to start recording sale
              </p>
            </div>
          )}
        </section>

        {/* Summary */}
        {items.length > 0 && (
          <>
            {/* Remarks */}
            <section className="mt-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
                Remarks (Optional)
              </label>
              <Input
                placeholder="Add notes about this sale..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="bg-white border-gray-200 h-12"
              />
            </section>

            {/* Cash Collected */}
            <section className="mt-6">
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cashCollectedEnabled}
                  onChange={(e) => {
                    setCashCollectedEnabled(e.target.checked);
                    if (e.target.checked) {
                      setCashCollected(totalAmount.toString());
                    }
                  }}
                  className="size-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-bold text-gray-700">
                  Cash Collected
                </span>
              </label>
              {cashCollectedEnabled && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cashCollected}
                    onChange={(e) => setCashCollected(e.target.value)}
                    onFocus={(e) =>
                      e.target.addEventListener(
                        "wheel",
                        (evt) => evt.preventDefault(),
                        { passive: false },
                      )
                    }
                    className="bg-white border-gray-200 h-14 text-lg font-bold"
                    placeholder="0"
                  />
                  {Number(cashCollected) < totalAmount && (
                    <p className="text-sm text-amber-600 font-medium ml-1">
                      Credit: ₹
                      {(totalAmount - Number(cashCollected)).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="mt-6 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Total Amount
                </p>
                <p className="text-3xl font-black text-indigo-950">
                  ₹{totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  Status
                </p>
                <p className="text-sm font-bold text-gray-600">
                  {cashCollectedEnabled && Number(cashCollected) >= totalAmount
                    ? "Paid"
                    : "Credit"}
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Sticky Footer - Thumb Zone */}
      <footer className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-40">
        <div className="max-w-md mx-auto grid grid-cols-1 gap-2">
          <Button
            size="xl"
            variant="premium"
            className="w-full shadow-2xl shadow-indigo-200"
            disabled={isSubmitting || !selectedContact || items.length === 0}
            onClick={handleSave}
          >
            {isSubmitting ? (
              "Recording..."
            ) : (
              <>
                <Check className="size-6 mr-2" /> Finish & Record Sale
              </>
            )}
          </Button>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Confirm Sale
            </h3>
            <p className="text-gray-600 mb-6">{confirmationMessage}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                variant="premium"
                className="flex-1"
                onClick={submitSale}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-red-600 mb-3">Error</h3>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <Button
              variant="premium"
              className="w-full"
              onClick={() => setShowError(false)}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Removed unused local cn
