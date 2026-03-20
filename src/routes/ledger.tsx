import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Banknote,
  Search,
  ChevronRight,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { requireAuth } from "../lib/auth";
import { useAuth } from "../contexts/AuthContext";
import { useContacts } from "../api/contacts";
import { useCreateTransaction } from "../api/transactions";
import { Contact } from "../types/contact";

export const Route = createFileRoute("/ledger")({
  beforeLoad: requireAuth,
  component: Ledger,
});

function Ledger() {
  const { token } = useAuth();
  const { data: contacts } = useContacts();
  const createTransaction = useCreateTransaction();

  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI">("Cash");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedContacts = contacts
    .filter((c: Contact) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a: Contact, b: Contact) => b.currentBalance - a.currentBalance);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !paymentAmount) return;

    setIsSubmitting(true);
    try {
      await createTransaction({
        token: token!,
        contactId: selectedContact._id,
        type: "PAYMENT_IN",
        amount: parseFloat(paymentAmount),
        date: Date.now(),
        description: remarks || `${paymentMode} payment received`,
      });
      setSelectedContact(null);
      setPaymentAmount("");
      setRemarks("");
    } catch (err) {
      console.error(err);
      alert("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto pb-48">
      <header className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl">
          <Link to="/">
            <ArrowLeft className="size-6 text-gray-600" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-indigo-950">Ledger (Khata)</h1>
      </header>

      {/* Summary Stat */}
      <Card className="bg-emerald-600 text-white border-none shadow-xl shadow-emerald-100">
        <CardContent className="p-6">
          <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">
            Total Outstanding
          </p>
          <div className="flex justify-between items-end">
            <h2 className="text-4xl font-black">
              ₹
              {contacts
                .reduce(
                  (acc: number, c: any) =>
                    acc + (c.currentBalance > 0 ? c.currentBalance : 0),
                  0,
                )
                .toLocaleString()}
            </h2>
            <Wallet className="size-10 text-white/20 mb-1" />
          </div>
        </CardContent>
      </Card>

      {!selectedContact ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              placeholder="Search ledger..."
              className="pl-12 bg-white border-none shadow-sm h-14 rounded-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            {sortedContacts.map((contact: Contact) => (
              <Card
                key={contact._id}
                className="border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer overflow-visible"
                onClick={() => setSelectedContact(contact)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                      {contact.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {contact.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {contact.phone || "No phone"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-black text-lg leading-none",
                          contact.currentBalance > 0
                            ? "text-red-500"
                            : "text-emerald-500",
                        )}
                      >
                        ₹{Math.abs(contact.currentBalance).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">
                        {contact.currentBalance > 0 ? "DUE" : "CREDIT"}
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="animate-in fade-in zoom-in duration-300 flex flex-col gap-6 flex-1">
            <Card className="border-indigo-100 shadow-xl shadow-indigo-100 mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto mb-2 text-indigo-600 font-bold"
                      onClick={() => setSelectedContact(null)}
                    >
                      <ArrowLeft className="size-4 mr-1" /> Back to list
                    </Button>
                    <h2 className="text-2xl font-black text-indigo-950">
                      {selectedContact.name}
                    </h2>
                    <p className="text-gray-500 font-medium">
                      Outstanding:{" "}
                      <span className="text-red-500 font-bold">
                        ₹{selectedContact.currentBalance.toLocaleString()}
                      </span>
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="p-0 h-auto text-indigo-500 font-bold mt-1"
                    >
                      <Link
                        to="/contacts/$contactId"
                        params={{ contactId: selectedContact._id as string }}
                      >
                        View Full History →
                      </Link>
                    </Button>
                  </div>
                  <div className="size-14 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl">
                    {selectedContact.name[0]}
                  </div>
                </div>

                <form
                  id="payment-form"
                  onSubmit={handleRecordPayment}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">
                        ₹
                      </span>
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="h-24 pl-12 text-4xl font-black text-emerald-600 bg-gray-50 border-none rounded-3xl"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          id: "Cash",
                          icon: Banknote,
                          color: "text-emerald-500",
                          bg: "bg-emerald-50",
                        },
                        {
                          id: "UPI",
                          icon: CreditCard,
                          color: "text-blue-500",
                          bg: "bg-blue-50",
                        },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPaymentMode(mode.id as "Cash" | "UPI")}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2",
                            paymentMode === mode.id
                              ? "border-indigo-600 bg-white shadow-lg"
                              : "border-transparent bg-gray-50",
                          )}
                        >
                          <mode.icon
                            className={cn(
                              "size-6",
                              mode.id === paymentMode
                                ? "text-indigo-600"
                                : mode.color,
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs font-bold",
                              paymentMode === mode.id
                                ? "text-indigo-600"
                                : "text-gray-500",
                            )}
                          >
                            {mode.id}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">
                      Remarks (Optional)
                    </label>
                    <Input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="h-12 bg-gray-50 border-none rounded-2xl"
                      placeholder="Add notes..."
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <footer className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-40">
            <div className="max-w-md mx-auto">
              <Button
                type="submit"
                form="payment-form"
                size="xl"
                variant="premium"
                className="w-full shadow-emerald-200 h-16 text-lg"
                disabled={isSubmitting || !paymentAmount}
              >
                {isSubmitting ? (
                  "Recording..."
                ) : (
                  <>
                    <Check className="size-6 mr-2" /> Record Payment
                  </>
                )}
              </Button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
