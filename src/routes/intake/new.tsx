import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { useContacts } from "../../api/contacts";
import { useProducts } from "../../api/products";
import { useCreateTransaction } from "../../api/transactions";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";
import { Contact } from "../../types/contact";
import { Product } from "../../types/product";
import { VendorSelector } from "../../components/intake/VendorSelector";
import { IntakeItemCard } from "../../components/intake/IntakeItemCard";
import { IntakeSummary } from "../../components/intake/IntakeSummary";

export const Route = createFileRoute("/intake/new")({
  beforeLoad: requireAuth,
  component: NewIntake,
});

function NewIntake() {
  const { token } = useAuth();
  const { data: contacts } = useContacts("vendor");
  const { data: products } = useProducts();
  const createTransaction = useCreateTransaction();
  const router = useRouter();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cashCollectedEnabled, setCashCollectedEnabled] = useState(false);
  const [cashCollected, setCashCollected] = useState("");

  const filteredContacts = useMemo(
    () => contacts.filter((c: Contact) => c.name.toLowerCase().includes(search.toLowerCase())),
    [contacts, search],
  );

  const totalAmount = items.reduce((acc, item) => {
    const totalEggs = item.qtyTrays * item.product.eggsPerTray + item.qtyLoose;
    return acc + totalEggs * item.rateApplied;
  }, 0);

  const addItem = (product: Product) => {
    setItems([...items, { product, qtyTrays: 0, qtyLoose: 0, rateApplied: 0 }]);
  };

  const updateItem = (index: number, field: string, value: number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedContact) {
      alert("Please select a supplier");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const cashAmount = cashCollectedEnabled ? Number(cashCollected) || 0 : 0;

    setIsSubmitting(true);
    try {
      await createTransaction({
        token: token!,
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
        cashCollected: cashAmount > 0 ? cashAmount : undefined,
      });

      router.navigate({ to: "/" });
    } catch (err) {
      console.error(err);
      alert("Failed to record intake");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col pb-48">
      <div className="p-4 safe-area-inset max-w-md mx-auto w-full flex-1">
        <header className="flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild className="rounded-2xl">
            <Link to="/">
              <ArrowLeft className="size-6 text-gray-600" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-indigo-950">Record Intake</h1>
        </header>

        <VendorSelector
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          contacts={filteredContacts}
          search={search}
          onSearchChange={setSearch}
        />

        {selectedContact && (
          <>
            <section className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
                Items
              </label>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <IntakeItemCard
                    key={index}
                    item={item}
                    index={index}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
                  Add Product
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {products
                    .filter((p: Product) => !items.some((i) => i.product._id === p._id))
                    .map((product: Product) => (
                      <Button
                        key={product._id}
                        variant="outline"
                        className="h-16 rounded-2xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all"
                        onClick={() => addItem(product)}
                      >
                        <Plus className="size-4 mr-2" />
                        {product.name}
                      </Button>
                    ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {selectedContact && items.length > 0 && (
        <IntakeSummary
          totalAmount={totalAmount}
          cashCollectedEnabled={cashCollectedEnabled}
          cashCollected={cashCollected}
          onCashCollectedEnabledChange={setCashCollectedEnabled}
          onCashCollectedChange={setCashCollected}
          onSubmit={handleSave}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
