import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useContacts } from "../../api/contacts";
import { useTodayRates } from "../../api/rates";
import { useProducts } from "../../api/products";
import { useCreateTransaction } from "../../api/transactions";
import { useAuth } from "../../contexts/AuthContext";
import { requireAuth } from "../../lib/auth";
import { Contact } from "../../types/contact";
import { CustomerSelector } from "../../components/sales/CustomerSelector";
import { SaleItemList } from "../../components/sales/SaleItemList";
import { SaleSummary } from "../../components/sales/SaleSummary";
import { SaleErrorDialog } from "../../components/sales/SaleConfirmDialog";
import { ContactForm } from "../../components/contacts/ContactForm";

export const Route = createFileRoute("/sales/new")({
  beforeLoad: requireAuth,
  component: NewSale,
  validateSearch: (search: Record<string, unknown>) => ({
    tripId: search.tripId as string | undefined,
    walkIn: (search.walkIn === "true" || search.walkIn === true) ? true : undefined,
  }),
});

function NewSale() {
  const { token, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const searchParams = Route.useSearch();
  const { data: contacts } = useContacts("customer");
  const { data: rates } = useTodayRates();
  const { data: products } = useProducts();
  const createTransaction = useCreateTransaction();
  const router = useRouter();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [remarks, setRemarks] = useState("");
  const [cashCollectedEnabled, setCashCollectedEnabled] = useState(false);
  const [cashCollected, setCashCollected] = useState("");
  const [showNewContact, setShowNewContact] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select walk-in if ?walkIn=true
  useEffect(() => {
    if (searchParams.walkIn) handleWalkIn();
  }, []);

  const filteredContacts = useMemo(
    () => contacts.filter((c: Contact) => c.name.toLowerCase().includes(search.toLowerCase())),
    [contacts, search],
  );

  const totalAmount = useMemo(
    () => items.reduce((acc, item) => acc + item.qtyTrays * item.ratePerTray + item.qtyLoose * item.ratePerEgg, 0),
    [items],
  );

  const addItem = (product: any) => {
    const productRate = rates.find((r: any) => r.productId === product._id);
    const adjustment = selectedContact?.priceAdjustment || 0;
    setItems([...items, {
      product,
      qtyTrays: 0,
      qtyLoose: 0,
      ratePerEgg: (productRate?.ratePerEgg || 0) + adjustment,
      ratePerTray: (productRate?.ratePerTray || 0) + adjustment * product.eggsPerTray,
      breakage: 0,
    }]);
  };

  const updateItem = (index: number, field: string, value: number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSelectContact = (contact: Contact | null) => {
    setSelectedContact(contact);
    setIsWalkIn(false);
  };

  const handleWalkIn = () => {
    setSelectedContact(null);
    setIsWalkIn(true);
    setCashCollectedEnabled(true);
  };

  const handleSubmit = async () => {
    if (!selectedContact && !isWalkIn) return;
    setIsSubmitting(true);
    try {
      const cashAmount = isWalkIn ? totalAmount : (cashCollectedEnabled ? Number(cashCollected) || 0 : 0);
      await createTransaction({
        token: token!,
        contactId: selectedContact?._id,
        type: "SALE",
        amount: totalAmount,
        date: Date.now(),
        description: remarks || undefined,
        cashCollected: cashAmount > 0 ? cashAmount : undefined,
        salesTripId: searchParams.tripId as any,
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
      const errorMsg = (err as Error).message;
      const match = errorMsg.match(/Uncaught Error: (.+?)(?:\n|$)/);
      setErrorMessage(match ? match[1] : errorMsg);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col pb-48">
      <div className="p-4 safe-area-inset max-w-md mx-auto w-full flex-1">
        <header className="flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild className="rounded-2xl">
            <Link to="/"><ArrowLeft className="size-6 text-gray-600" /></Link>
          </Button>
          <h1 className="text-2xl font-bold text-indigo-950 flex-1">
            {isWalkIn ? "Walk-in Sale" : "Record Sale"}
          </h1>
          {!selectedContact && !isWalkIn && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl"
              onClick={() => setShowNewContact(true)}
              title="Add new customer"
            >
              <UserPlus className="size-5 text-indigo-600" />
            </Button>
          )}
        </header>

        {showNewContact ? (
          <div className="mb-4">
            <ContactForm onClose={() => setShowNewContact(false)} />
          </div>
        ) : (
          <CustomerSelector
            selectedContact={selectedContact}
            onSelectContact={handleSelectContact}
            contacts={filteredContacts}
            search={search}
            onSearchChange={setSearch}
            showBalance={isAdmin}
            isWalkIn={isWalkIn}
            onWalkIn={handleWalkIn}
          />
        )}

        {(selectedContact || isWalkIn) && (
          <>
            <SaleItemList
              items={items}
              products={products}
              onUpdate={updateItem}
              onRemove={removeItem}
              onAdd={addItem}
            />

            <section className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
                Remarks (Optional)
              </label>
              <Input
                placeholder="Add any notes..."
                className="bg-white border-none shadow-sm h-12 rounded-2xl"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </section>
          </>
        )}
      </div>

      {(selectedContact || isWalkIn) && items.length > 0 && (
        <SaleSummary
          totalAmount={totalAmount}
          cashCollectedEnabled={isWalkIn ? true : cashCollectedEnabled}
          cashCollected={isWalkIn ? totalAmount.toFixed(2) : cashCollected}
          onCashCollectedEnabledChange={isWalkIn ? () => {} : setCashCollectedEnabled}
          onCashCollectedChange={isWalkIn ? () => {} : setCashCollected}
          isWalkIn={isWalkIn}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <SaleErrorDialog
        open={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
      />
    </div>
  );
}
