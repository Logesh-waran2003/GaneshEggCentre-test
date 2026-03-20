import { Search, UserCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Contact } from "../../types/contact";

interface CustomerSelectorProps {
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact | null) => void;
  contacts: Contact[];
  search: string;
  onSearchChange: (search: string) => void;
}

export function CustomerSelector({
  selectedContact,
  onSelectContact,
  contacts,
  search,
  onSearchChange,
}: CustomerSelectorProps) {
  if (selectedContact) {
    return (
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <UserCircle className="size-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedContact.name}</p>
                <p className="text-xs text-gray-500">
                  Balance: ₹{selectedContact.currentBalance.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectContact(null)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Change
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 bg-white"
        />
      </div>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto">
        {contacts.map((contact) => (
          <Card
            key={contact._id}
            className="cursor-pointer hover:border-indigo-300 transition-colors"
            onClick={() => onSelectContact(contact)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-xs text-gray-500">
                    Balance: ₹{contact.currentBalance.toFixed(2)}
                  </p>
                </div>
                {contact.priceAdjustment !== 0 && (
                  <span className="text-xs font-medium text-indigo-600">
                    {contact.priceAdjustment > 0 ? "+" : ""}
                    ₹{contact.priceAdjustment}/egg
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
