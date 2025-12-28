import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Phone, Search, UserCircle, Plus } from "lucide-react";
import { useState } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/contacts")({
  component: Contacts,
});

function Contacts() {
  const { data: contacts } = useSuspenseQuery(
    convexQuery(api.contacts.getContacts, {})
  );
  const createContact = useMutation(api.contacts.createContact);

  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"vendor" | "customer">("customer");
  const [newPhone, setNewPhone] = useState("");
  const [newAdjustment, setNewAdjustment] = useState("0");

  const filteredContacts = contacts.filter(
    (c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact({
        name: newName,
        type: newType,
        phone: newPhone || undefined,
        priceAdjustment: parseFloat(newAdjustment) || 0,
      });
      setNewName("");
      setNewPhone("");
      setNewAdjustment("0");
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create contact");
    }
  };

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-2xl">
            <Link to="/">
              <ArrowLeft className="size-6 text-gray-600" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-indigo-950">Contacts</h1>
        </div>
        <Button
          size="icon"
          variant="premium"
          className="rounded-2xl shadow-indigo-100"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus
            className={cn(
              "size-6 transition-transform",
              isAdding ? "rotate-45" : ""
            )}
          />
        </Button>
      </header>

      {isAdding && (
        <Card className="border-indigo-100 shadow-xl shadow-indigo-50 animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-indigo-900 mb-4">
              Add New Contact
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => setNewType("customer")}
                  className={cn(
                    "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                    newType === "customer"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500"
                  )}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setNewType("vendor")}
                  className={cn(
                    "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                    newType === "vendor"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500"
                  )}
                >
                  Vendor
                </button>
              </div>
              <Input
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-tight ml-1">
                  Price Adjustment (e.g. +0.20 or -0.10)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAdjustment}
                  onChange={(e) => setNewAdjustment(e.target.value)}
                />
              </div>
              <Button type="submit" variant="premium" className="w-full">
                Create Contact
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <Input
          placeholder="Search contacts..."
          className="pl-12 bg-white border-gray-100 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredContacts.map((contact: any) => (
          <Link
            key={contact._id}
            to="/contacts/$contactId"
            params={{ contactId: contact._id }}
          >
            <Card className="border-gray-50 shadow-sm overflow-visible hover:border-indigo-200 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "size-12 rounded-2xl flex items-center justify-center",
                      contact.type === "vendor"
                        ? "bg-amber-100"
                        : "bg-indigo-100"
                    )}
                  >
                    <UserCircle
                      className={cn(
                        "size-7",
                        contact.type === "vendor"
                          ? "text-amber-600"
                          : "text-indigo-600"
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">
                        {contact.name}
                      </h3>
                      <Badge
                        variant={
                          contact.type === "vendor" ? "warning" : "secondary"
                        }
                      >
                        {contact.type}
                      </Badge>
                    </div>
                    {contact.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="size-3" /> {contact.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 tracking-tighter uppercase mb-0.5">
                    Balance
                  </p>
                  <p
                    className={cn(
                      "font-black text-lg leading-none",
                      contact.currentBalance > 0
                        ? "text-red-500"
                        : "text-emerald-500"
                    )}
                  >
                    ₹{Math.abs(contact.currentBalance).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {contact.currentBalance > 0 ? "You're Owed" : "You Owe"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filteredContacts.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <UserCircle className="size-12 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 font-medium">No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
