import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { useCreateContact } from "../../api/contacts";
import { cn } from "../../lib/utils";

export function ContactForm({ onClose }: { onClose: () => void }) {
  const createContact = useCreateContact();
  const [name, setName] = useState("");
  const [type, setType] = useState<"vendor" | "customer">("customer");
  const [phone, setPhone] = useState("");
  const [adjustment, setAdjustment] = useState("0");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact({ name, type, phone: phone || undefined, priceAdjustment: parseFloat(adjustment) || 0 });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create contact");
    }
  };

  return (
    <Card className="border-indigo-100 shadow-xl shadow-indigo-50 animate-in slide-in-from-top duration-300">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-indigo-900 mb-4">Add New Contact</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-4">
            {(["customer", "vendor"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-all capitalize", type === t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500")}
              >
                {t}
              </button>
            ))}
          </div>
          <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-tight ml-1">Price Adjustment (e.g. +0.20 or -0.10)</label>
            <Input type="number" step="0.01" placeholder="0.00" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} />
          </div>
          <Button type="submit" variant="premium" className="w-full">Create Contact</Button>
        </form>
      </CardContent>
    </Card>
  );
}
