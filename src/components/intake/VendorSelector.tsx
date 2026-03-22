import { Search, UserCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Contact } from "../../types/contact";

interface VendorSelectorProps {
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact | null) => void;
  contacts: Contact[];
  search: string;
  onSearchChange: (search: string) => void;
  showBalance?: boolean;
}

export function VendorSelector({
  selectedContact,
  onSelectContact,
  contacts,
  search,
  onSearchChange,
  showBalance = true,
}: VendorSelectorProps) {
  return (
    <section className="mb-6">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
        Supplier
      </label>
      {!selectedContact ? (
        <div>
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              placeholder="Search supplier..."
              className="pl-12 bg-white border-none shadow-sm h-12 rounded-2xl"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {contacts.map((c) => (
              <button
                key={c._id}
                className="w-full p-4 text-left bg-white rounded-2xl shadow-sm hover:bg-green-50 flex items-center gap-3 transition-colors"
                onClick={() => {
                  onSelectContact(c);
                  onSearchChange("");
                }}
              >
                <UserCircle className="size-8 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{c.name}</div>
                  {showBalance && (
                    <div className="text-xs text-gray-500">
                      Balance: ₹{c.currentBalance.toFixed(2)}
                    </div>
                  )}
                </div>
              </button>
            ))}
            {contacts.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">No suppliers found</p>
            )}
          </div>
        </div>
      ) : (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCircle className="size-10 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900">{selectedContact.name}</div>
                {showBalance && (
                  <div className="text-xs text-gray-600">
                    Balance: ₹{selectedContact.currentBalance.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectContact(null)}
              className="text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              Change
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
